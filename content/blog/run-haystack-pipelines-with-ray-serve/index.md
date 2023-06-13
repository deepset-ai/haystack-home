---
layout: blog-post
title: Run Haystack pipelines in production with Ray Serve
description: A guide to scale Haystack pipelines for production with Ray Serve
featured_image: thumbnail.png
images: ["blog/run-haystack-pipelines-with-ray-serve/thumbnail.png"]
toc: True
date: 2023-06-13
last_updated:  2023-06-13
authors:
  - Massimiliano Pippi
---

[Ray Serve](https://docs.ray.io/en/latest/serve/index.html) is a library built on top of the Ray framework for building online inference APIs. Serve is designed to be framework-agnostic, and while its simple design lets you quickly integrate pretty much any Python logic you need to deploy, building up complex inference services is still possible and straightforward.

[Haystack pipelines](https://docs.haystack.deepset.ai/docs/pipelines) can be quite complex, but even the simpler ones consist of multiple components, which in turn might rely on different models and technologies - this aspect make them a good benchmark to test out Ray Serve’s capabilities.

## Serve a Retriever - Reader QA pipeline

### Prepare a set of documents

Let’s begin by serving locally a Haystack pipeline that’s simple but non-trivial: a question-answering system working on an existing set of documents. For simplicity, we’ll use a Docker image running Elasticsearch and populated with a set of documents that can be queried right ahead. So before we start, let’s run the image:

```docker
docker run -p 9200:9200 -p 9300:9300 -d deepset/elasticsearch-countries-and-capitals:latest

```

The Elasticsearch instance will accept connections on `localhost` through the port `9200`.

### Run the Haystack pipeline

Haystack pipelines can be defined through Python code or a yaml definition that is eventually and transparently converted into Python code. We’ll use the latter format, so open an editor and save the following definition in a file called `pipeline.yml`

```yaml
version: ignore

# define all the building-blocks for a Pipeline
components:    
  - name: DocumentStore
    type: ElasticsearchDocumentStore
    params:
      host: localhost

  - name: Retriever
    type: DensePassageRetriever
    params:
      document_store: DocumentStore
      top_k: 5

  - name: Reader
    type: FARMReader
    params:
      model_name_or_path: deepset/roberta-base-squad2
      context_window_size: 1000
      return_no_answer: true

pipelines:
  - name: query
    nodes:
    - name: Retriever
      inputs: [Query]
    - name: Reader
      inputs: [Retriever]

```

To perform a query, we need a bit of Python code to read the yaml configuration above and tell Haystack to run the resulting pipeline:

```python
from pathlib import Path

from haystack import Pipeline

config = Path("pipeline.yml")
pipeline = Pipeline.load_from_yaml(config, "query")
answer = pipeline.run("What is the capital of France?")

print(f"Answer: {answer}")

```

As you can see, each time we want to make a question we need to rebuild the pipeline and call the `run` method - let’s make an inference service out of this and query it over HTTP.

### Run the Haystack pipeline through Ray Serve

A Ray Serve deployment looks exactly like a regular HTTP server from the caller perspective, and to provide an “ingress” endpoint the bare minimum requirement is writing a Python class similar to the following:

```python
@serve.deployment
class MinimalIngress:
  async def __call__(self, request: Request) -> str:
      name = await request.json()["name"]
      return f"Hello {name}"

```

The presence of an `async def __call__` method is the only contract we need to fulfil in order to spawn a Ray Serve deployment. To create a deployment that will run a Haystack pipeline, let’s create a file called `[capitals.py](<http://capitals.py>)` and add the following code:

```python
from pathlib import Path

from ray import serve
from starlette.requests import Request
from haystack import Pipeline

@serve.deployment
class HaystackQA:
    def __init__(self):
        # Load the pipeline from file and store it in self._pipeline
				# so we can reuse it every time __call__ is invoked.
				config = Path("pipeline.yml")
        self._pipeline = Pipeline.load_from_yaml(config, "query")

    async def __call__(self, request: Request) -> str:
        query: str = str(await request.body())

        res = self._pipeline.run(query=query)
        answers = res.get("answers", [])
        if answers:
            # Return the first answer
            return answers[0].answer
        return ""

haystack_deployment = HaystackQA.bind()

```

A couple of things to note about the code above:

-   We added a `__init__` method where we initialize the pipeline once and for the whole lifetime of the deployment.
-   Every class decorated with `@serve.deployment` gets a `bind` method that tells Ray Serve to attach our `HaystackQA` class to a deployment object that we name `haystack_deployment`. In a moment, when we will start the server process, Ray Serve will pick up the value of this variable.

The content of the Python file `[capitals.py](<http://capitals.py>)` is now all we need to “serve” our deployment. Ray Serve can be run from Python directly, but for this example we’ll show how to start the process from the command line, which is closer to what we would do in a production use case. From a shell where the Python environment containing `ray` is active, you can just run:

```bash
serve run capitals:haystack_deployment

```

You should see several log lines scrolling down in the shell, and if everything went well, a final message `Deployed Serve app successfully.` will tell us that the deployment is ready to accept connections - we can make a query now. We will use `curl` but really any HTTP client will work the same. From the command line:

```bash
curl -X POST -d "What is the capital of Italy?" <http://localhost:8000> 

```

It might take a while to get a response the very first time, while Haystack downloads the model locally, but in the end you should see the response `Rome`.

## Scale the deployment

What we did so far doesn’t look much different from putting a `pipeline.run()` call behind a REST API, but Ray Serve shines when it’s time to put our pipeline in production. For example, let’s say we want to scale our `HaystackQA` horizontally to serve multiple requests at once. All we need to do is to change the Python code like this:

```python
@serve.deployment(num_replicas=3)  # this is the only line to change!
class HaystackQA:
    def __init__(self):
			...

```

We can now stop the server and restart it with the same `serve run` command: that’s it, we know have 3 instances of our `HaystackQA` deployment as you can see from the Ray control panel running at [`http://127.0.0.1:8265/#/actors`](http://127.0.0.1:8265/#/actors)

In case we want to adapt the number of deployments to the current traffic so we can optimize costs, Ray Serve offers autoscaling out of the box. All we need to change is again the `@serve.deployment` decorator like this:

```python
@serve.deployment(
    autoscaling_config={
        "min_replicas": 1,
        "initial_replicas": 2,
        "max_replicas": 5,
        "downscale_delay_s": 30,
    }
)
class HaystackQA:
    def __init__(self):
			...

```

The `autoscaling_config` parameters are self-explanatory and the [docs](https://docs.ray.io/en/latest/serve/scaling-and-resource-allocation.html#autoscaling-config-parameters) are very helpful in detailing the logic behind that. In this case we tell Ray Serve that we want to scale up our deployment to up to 5 deployment replicas and scale down to at least 1. We also want to start with 2 replicas and downscale if there’s no activity for 30 seconds. Once again you can observe how this works behind the scenes by starting the server and looking at the dashboard on [`http://127.0.0.1:8265/#/actors`](http://127.0.0.1:8265/#/actors).

## What’s next

The deployment strategy we introduced in this article is ok for many use cases ranging from trying out Haystack to demo applications and small POCs, but close readers will note the limit of scaling up and down a whole Haystack pipeline: certain nodes of a pipeline might benefit more than others of horizontal scaling and redundancy, can we do that with Ray Serve? The answer is yes, and we’ll see in an upcoming article how we can split a pipeline into multiple deployments that can be then managed by Ray Serve with different strategies