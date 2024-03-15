---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/11_Pipelines.ipynb
toc: True
title: "How to Use Pipelines"
lastmod: "2023-07-03"
level: "beginner"
weight: 40
description: Learn about the many ways which you can route queries through the nodes in a pipeline.
category: "QA"
aliases: ['/tutorials/pipelines']
download: "/downloads/11_Pipelines.ipynb"
completion_time: False
created_at: 2021-08-12
---
    


In this tutorial, you will learn how the `Pipeline` connects the different components in Haystack. Whether you are using a Reader, Summarizer
or Retriever (or 2), the `Pipeline` class will help you build a Directed Acyclic Graph (DAG) that
determines how to route the output of one component into the input of another.



## Preparing the Colab Environment

- [Enable GPU Runtime](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)


## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,inference]
```

### Enabling Telemetry
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(11)
```

## Logging

We configure how logging messages should be displayed and which log level should be used before importing Haystack.
Example log message:
INFO - haystack.utils.preprocessing -  Converting data/tutorial1/218_Olenna_Tyrell.txt
Default log level in basicConfig is WARNING so the explicit parameter is not necessary but can be changed easily:


```python
import logging

logging.basicConfig(format="%(levelname)s - %(name)s -  %(message)s", level=logging.WARNING)
logging.getLogger("haystack").setLevel(logging.INFO)
```

## Initializing the DocumentStore

A DocumentStore stores the Documents that a system uses to retrieve or find answers to your questions. In this tutorial, you'll use the `InMemoryDocumentStore`.

Let's initialize the DocumentStore.


```python
from haystack.document_stores import InMemoryDocumentStore

document_store = InMemoryDocumentStore(use_bm25=True)
```

## Fetching and Writing Documents

Let's fetch the txt files (in this case, pages from the Game of Thrones wiki) and prepare them so that they can be indexed into the DocumentStore:


```python

```


```python
from haystack.utils import fetch_archive_from_http, convert_files_to_docs, clean_wiki_text

# Download and prepare data - 517 Wikipedia articles for Game of Thrones
doc_dir = "data/tutorial11"
s3_url = "https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-qa/datasets/documents/wiki_gameofthrones_txt11.zip"
fetch_archive_from_http(url=s3_url, output_dir=doc_dir)

# convert files to dicts containing documents that can be indexed to our datastore
got_docs = convert_files_to_docs(dir_path=doc_dir, clean_func=clean_wiki_text, split_paragraphs=True)
document_store.delete_documents()
document_store.write_documents(got_docs)
```


```python
from haystack.nodes import BM25Retriever, EmbeddingRetriever, FARMReader

bm25_retriever = BM25Retriever()

from haystack.pipelines import DocumentSearchPipeline
from haystack.utils import print_documents

p_retrieval = DocumentSearchPipeline(bm25_retriever)
# res = p_retrieval.run(query="Who is the father of Arya Stark?", params={"Retriever": {"top_k": 10}})
# print_documents(res, max_text_len=200)
```

## Initializing Core Components

Here we initialize the core components that we will be gluing together using the `Pipeline` class.
Initialize a `BM25Retriever`, an `EmbeddingRetriever`, and a `FARMReader`.
You can combine these components to create a classic Retriever-Reader pipeline that is designed
to perform Open Domain Question Answering.


```python
from haystack.nodes import BM25Retriever, EmbeddingRetriever, FARMReader

# Initialize Sparse Retriever
bm25_retriever = BM25Retriever(document_store=document_store)

# Initialize embedding Retriever
embedding_retriever = EmbeddingRetriever(
    document_store=document_store, embedding_model="sentence-transformers/multi-qa-mpnet-base-dot-v1"
)
document_store.update_embeddings(embedding_retriever, update_existing_embeddings=False)

# Initialize Reader
reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2")
```

## Prebuilt Pipelines

Haystack features many prebuilt pipelines that cover common tasks. The most used one is `ExtractiveQAPipeline`.
Now, initialize the ExtractiveQAPipeline and run it with a query:


```python
from haystack.pipelines import ExtractiveQAPipeline
from haystack.utils import print_answers

p_extractive_premade = ExtractiveQAPipeline(reader=reader, retriever=bm25_retriever)
res = p_extractive_premade.run(
    query="Who is the father of Arya Stark?", params={"Retriever": {"top_k": 10}, "Reader": {"top_k": 5}}
)
print_answers(res, details="minimum")
```

If you want to just do the retrieval step, you can use a DocumentSearchPipeline:


```python
from haystack.pipelines import DocumentSearchPipeline
from haystack.utils import print_documents

p_retrieval = DocumentSearchPipeline(embedding_retriever)
res = p_retrieval.run(query="Who is the father of Arya Stark?", params={"Retriever": {"top_k": 10}})
print_documents(res, max_text_len=200)
```

Haystack features prebuilt pipelines to do:
- document search (DocumentSearchPipeline),
- document search with summarization (SearchSummarizationPipeline)
- FAQ style QA (FAQPipeline)
- translated search (TranslationWrapperPipeline)
To find out more about these pipelines, have a look at our [documentation](https://docs.haystack.deepset.ai/docs/pipelines).


## Generating a Pipeline Diagram

With any Pipeline, whether prebuilt or custom constructed,
you can save a diagram showing how all the components are connected.

![image](https://github.com/deepset-ai/haystack/blob/main/docs/img/retriever-reader-pipeline.png?raw=true)


```python
# Uncomment the following to generate the images
# !apt install libgraphviz-dev
# !pip install pygraphviz

# p_extractive_premade.draw("pipeline_extractive_premade.png")
# p_retrieval.draw("pipeline_retrieval.png")
```

## Custom Extractive QA Pipeline

If you need a custom pipeline for your task or add extra nodes to a pipeline, you can create a pipeline from scratch instead of using a prebuilt one.

Now, try to rebuild the ExtractiveQAPipeline using the generic Pipeline class.
You can do this by adding the building blocks as shown in the graph.


```python
from haystack.pipelines import Pipeline

# Custom built extractive QA pipeline
p_extractive = Pipeline()
p_extractive.add_node(component=bm25_retriever, name="Retriever", inputs=["Query"])
p_extractive.add_node(component=reader, name="Reader", inputs=["Retriever"])

# Now we can run it
res = p_extractive.run(query="Who is the father of Arya Stark?", params={"Retriever": {"top_k": 10}})
print_answers(res, details="minimum")

# Uncomment the following to generate the pipeline image
# p_extractive.draw("pipeline_extractive.png")
```

## Combining Retrievers Using a Custom Pipeline

Pipelines offer a very simple way to ensemble together different components.
In this example, you'll combine the power of an `EmbeddingRetriever`
with the keyword based `BM25Retriever`.
See our [documentation](https://docs.haystack.deepset.ai/docs/retriever#deeper-dive-vector-based-vs-keyword-based) to understand why
you might want to combine a dense and sparse retriever.

![image](https://github.com/deepset-ai/haystack/blob/main/docs/img/tutorial11_custompipelines_pipeline_ensemble.png?raw=true)

Here you'll use a `JoinDocuments` node to merge the predictions from each retriever:


```python
from haystack.nodes import JoinDocuments

# Create ensembled pipeline
p_ensemble = Pipeline()
p_ensemble.add_node(component=bm25_retriever, name="BM25Retriever", inputs=["Query"])
p_ensemble.add_node(component=embedding_retriever, name="EmbeddingRetriever", inputs=["Query"])
p_ensemble.add_node(
    component=JoinDocuments(join_mode="concatenate"), name="JoinResults", inputs=["BM25Retriever", "EmbeddingRetriever"]
)
p_ensemble.add_node(component=reader, name="Reader", inputs=["JoinResults"])

# Uncomment the following to generate the pipeline image
# p_ensemble.draw("pipeline_ensemble.png")

# Run pipeline
res = p_ensemble.run(
    query="Who is the father of Arya Stark?", params={"EmbeddingRetriever": {"top_k": 5}, "BM25Retriever": {"top_k": 5}}
)
print_answers(res, details="minimum")
```

## Custom Nodes

Nodes are relatively simple objects
and we encourage our users to design their own if they don't see one that fits their use case

The only requirements are:
- Create a class that inherits `BaseComponent`.
- Add a method run() to your class. Add the mandatory and optional arguments it needs to process. These arguments must be passed as input to the pipeline, inside `params`, or output by preceding nodes.
- Add processing logic inside the run() (e.g. reformatting the query).
- Return a tuple that contains your output data (for the next node)
and the name of the outgoing edge (by default "output_1" for nodes that have one output)
- Add a class attribute outgoing_edges = 1 that defines the number of output options from your node. You only need a higher number here if you have a decision node (see below).

Here is a template for a custom node:


```python
from haystack import BaseComponent
from typing import Optional, List


class CustomNode(BaseComponent):
    outgoing_edges = 1

    def run(self, query: str, my_optional_param: Optional[int]):
        # process the inputs
        output = {"my_output": ...}
        return output, "output_1"

    def run_batch(self, queries: List[str], my_optional_param: Optional[int]):
        # process the inputs
        output = {"my_output": ...}
        return output, "output_1"
```

## Decision Nodes

Decision Nodes help you route your data so that only certain branches of your `Pipeline` are run.
One popular use case for such query classifiers is routing keyword queries to Elasticsearch and questions to EmbeddingRetriever + Reader.
With this approach you keep optimal speed and simplicity for keywords while going deep with transformers when it's most helpful.

![image](https://github.com/deepset-ai/haystack/blob/main/docs/img/tutorial11_decision_nodes_pipeline_classifier.png?raw=true)

Though this looks very similar to the ensembled pipeline shown above,
the key difference is that only one of the retrievers is run for each request.
By contrast both retrievers are always run in the ensembled approach.

Below, we define a very naive `QueryClassifier` and show how to use it:


```python
class CustomQueryClassifier(BaseComponent):
    outgoing_edges = 2

    def run(self, query: str):
        if "?" in query:
            return {}, "output_2"
        else:
            return {}, "output_1"

    def run_batch(self, queries: List[str]):
        split = {"output_1": {"queries": []}, "output_2": {"queries": []}}
        for query in queries:
            if "?" in query:
                split["output_2"]["queries"].append(query)
            else:
                split["output_1"]["queries"].append(query)

        return split, "split"


# Here we build the pipeline
p_classifier = Pipeline()
p_classifier.add_node(component=CustomQueryClassifier(), name="QueryClassifier", inputs=["Query"])
p_classifier.add_node(component=bm25_retriever, name="BM25Retriever", inputs=["QueryClassifier.output_1"])
p_classifier.add_node(component=embedding_retriever, name="EmbeddingRetriever", inputs=["QueryClassifier.output_2"])
p_classifier.add_node(component=reader, name="QAReader", inputs=["BM25Retriever", "EmbeddingRetriever"])
# Uncomment the following to generate the pipeline image
# p_classifier.draw("pipeline_classifier.png")

# Run only the dense retriever on the full sentence query
res_1 = p_classifier.run(query="Who is the father of Arya Stark?")
print("Embedding Retriever Results" + "\n" + "=" * 15)
print_answers(res_1)

# Run only the sparse retriever on a keyword based query
res_2 = p_classifier.run(query="Arya Stark father")
print("BM25Retriever Results" + "\n" + "=" * 15)
print_answers(res_2)
```

## Evaluation Nodes

We have also designed a set of nodes that can be used to evaluate the performance of a system.
Have a look at our [tutorial](https://haystack.deepset.ai/tutorials/05_evaluation) to get hands on with the code and learn more about Evaluation Nodes!

## Debugging Pipelines

You can print out debug information from nodes in your pipelines in a few different ways.


```python
# 1) You can set the `debug` attribute of a given node.
bm25_retriever.debug = True

# 2) You can provide `debug` as a parameter when running your pipeline
result = p_classifier.run(query="Who is the father of Arya Stark?", params={"BM25Retriever": {"debug": True}})

# 3) You can provide the `debug` paramter to all nodes in your pipeline
result = p_classifier.run(query="Who is the father of Arya Stark?", params={"debug": True})

result["_debug"]
```

## Conclusion

The possibilities are endless with the `Pipeline` class and we hope that this tutorial will inspire you
to build custom pipelines that really work for your use case!
