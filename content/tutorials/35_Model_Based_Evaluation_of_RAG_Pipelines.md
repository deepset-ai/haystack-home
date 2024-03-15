---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/35_Model_Based_Evaluation_of_RAG_Pipelines.ipynb
toc: True
title: "Model-Based Evaluation of RAG Pipelines"
lastmod: "2024-03-12"
level: "intermediate"
weight: 77
description: Learn how to evaluate your RAG pipelines using some of the model-based evaluation frameworkes integerated into Haystack
category: "QA"
aliases: []
download: "/downloads/35_Model_Based_Evaluation_of_RAG_Pipelines.ipynb"
completion_time: 15 min
created_at: 2024-02-12
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Components Used**: `InMemoryDocumentStore`, `InMemoryBM25Retriever`, `PromptBuilder`, `OpenAIGenerator`, `DeepEvalEvaluator`, `RagasEvaluator`, `UpTrainEvaluator`
- **Prerequisites**: You must have an API key from an active OpenAI account as this tutorial is using the gpt-3.5-turbo model by OpenAI: https://platform.openai.com/api-keys
- **Goal**: After completing this tutorial, you'll have learned how to evaluate your RAG pipelines using some of the model-based evaluation frameworks integerated into Haystack.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).

## Overview

This tutorial shows you how to evaluate a generative question-answering pipeline that uses the retrieval-augmentation ([RAG](https://www.deepset.ai/blog/llms-retrieval-augmentation)) approach with Haystack 2.0. As we're doing model-based evaluation, no ground-truth labels are required. The process involves Haystack's integration of three evaluation frameworks:
- [DeepEval](#evaluate-the-pipeline-with-deepeval) 
- [RAGAS](#evaluate-the-pipeline-with-ragas)
- [UpTrain](#evaluate-the-pipeline-with-uptrain)

For this tutorial, you'll use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World) as Documents, but you can replace them with any text you want.


## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/setting-the-log-level)

## Installing Haystack

Install Haystack 2.0 and [datasets](https://pypi.org/project/datasets/) with `pip`:


```bash
%%bash

pip install "pydantic<1.10.10"
pip install haystack-ai
pip install "datasets>=2.6.1"
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/enabling-telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(35)
```

## Create the RAG Pipeline to Evaluate

To evaluate a RAG pipeline, we need a RAG pipeline to start with. So, we will start by creating a question answering pipeline.

> 💡 For a complete tutorial on creating Retrieval-Augmmented Generation pipelines check out the [Creating Your First QA Pipeline with Retrieval-Augmentation Tutorial](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline)

First, we will initialize a DocumentStore. A DocumentStore stores the Documents that the question answering system uses to find answers to your questions. In this tutorial, you'll be using the `InMemoryDocumentStore`.

You'll use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World) as Documents. We preprocessed the data and uploaded to a Hugging Face Space: [Seven Wonders](https://huggingface.co/datasets/bilgeyucel/seven-wonders). Thus, you don't need to perform any additional cleaning or splitting.



```python
from datasets import load_dataset
from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore

document_store = InMemoryDocumentStore()


dataset = load_dataset("bilgeyucel/seven-wonders", split="train")
docs = [Document(content=doc["content"], meta=doc["meta"]) for doc in dataset]
document_store.write_documents(docs)
```

> `InMemoryDocumentStore` is the simplest DocumentStore to get started with. It requires no external dependencies and it's a good option for smaller projects and debugging. But it doesn't scale up so well to larger Document collections, so it's not a good choice for production systems. To learn more about the different types of external databases that Haystack supports, see [DocumentStore Integrations](https://haystack.deepset.ai/integrations?type=Document+Store).

Now that we have our data ready, we can create a simple RAG pipeline.

In this example, we'll be using:
- [`InMemoryBM25Retriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorybm25retriever) which will get the relevant documents to the query.
- [`OpenAIGenerator`](https://docs.haystack.deepset.ai/v2.0/docs/OpenAIGenerator) to generate answers to queries. You can replace `OpenAIGenerator` in your pipeline with another `Generator`. Check out the full list of generators [here](https://docs.haystack.deepset.ai/v2.0/docs/generators).


```python
import os
from getpass import getpass
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever

retriever = InMemoryBM25Retriever(document_store)

template = """
Given the following information, answer the question.

Context:
{% for document in documents %}
    {{ document.content }}
{% endfor %}

Question: {{question}}
Answer:
"""

prompt_builder = PromptBuilder(template=template)


os.environ["OPENAI_API_KEY"] = getpass("Enter OpenAI API key:")
generator = OpenAIGenerator()
```


To build a pipeline, add all components to your pipeline and connect them. Create connections from `retriever` to the `prompt_builder` and from `prompt_builder` to `llm`. Explicitly connect the output of `retriever` with "documents" input of the `prompt_builder` to make the connection obvious as `prompt_builder` has two inputs ("documents" and "question"). For more information on pipelines and creating connections, refer to [Creating Pipelines](https://docs.haystack.deepset.ai/v2.0/docs/creating-pipelines) documentation.


```python
from haystack import Pipeline
from haystack.components.builders.answer_builder import AnswerBuilder

rag_pipeline = Pipeline()
# Add components to your pipeline
rag_pipeline.add_component("retriever", retriever)
rag_pipeline.add_component("prompt_builder", prompt_builder)
rag_pipeline.add_component("llm", generator)
rag_pipeline.add_component(instance=AnswerBuilder(), name="answer_builder")

# Now, connect the components to each other
rag_pipeline.connect("retriever", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder", "llm")
rag_pipeline.connect("llm.replies", "answer_builder.replies")
rag_pipeline.connect("llm.meta", "answer_builder.meta")
rag_pipeline.connect("retriever", "answer_builder.documents")
```

That's it! The pipeline's ready to generate answers to questions!

### Asking a Question

When asking a question, use the `run()` method of the pipeline. Make sure to provide the question to both the `retriever` and the `prompt_builder`. This ensures that the `{{question}}` variable in the template prompt gets replaced with your specific question.


```python
question = "When was the Rhodes Statue built?"

response = rag_pipeline.run(
    {"retriever": {"query": question}, "prompt_builder": {"question": question}, "answer_builder": {"query": question}}
)
```


```python
print(response["answer_builder"]["answers"][0].data)
```

## Evaluate the Pipeline

In the following sections, we will evaluate the RAG pipeline. You can do this section with one of the following integations: DeepEval, Ragas or UpTrain.

For most metrics, we will need to provide not only the questions that we're evaluating our RAG pipeline with, but also the generated `responses` and the `contexts` that were porvided to the pipeline. To make this easier, we create a helper function 👇


```python
def get_contexts_and_responses(questions, pipeline):
    contexts = []
    responses = []
    for question in questions:
        response = pipeline.run(
            {
                "retriever": {"query": question},
                "prompt_builder": {"question": question},
                "answer_builder": {"query": question},
            }
        )

        contexts.append([d.content for d in response["answer_builder"]["answers"][0].documents])
        responses.append(response["answer_builder"]["answers"][0].data)
    return contexts, responses
```

Next, we create our evaluation pipeline. It defines what metrics we want to evaluate and we choose one of Haystack's integrated evaluation frameworks. We will run the evaluation pipelines on the following `questions`, `contexts` and `responses`:


```python
questions = ["When was the Rhodes Statue built?", "Where is the Pyramid of Giza?", "When was the pyramid built?"]
contexts, responses = get_contexts_and_responses(questions, rag_pipeline)
```

 ## Evaluate the Pipeline with DeepEval
We will perform 2 evaluations with DeepEval
- Faithfulness, grading how factual the generated responses were.
- Contextual relevance, grading how relevant the context was to the question.

For a full list of available metrics and their expected inputs, check out the [`DeepEvalEvaluator` Docs](https://docs.haystack.deepset.ai/v2.0/docs/deepevalevaluator)

First, we install the `deepeval-haystack` integration:


```bash
%%bash

pip install deepeval-haystack
```

#### 1) Evaluate Faithfulness


```python
from haystack_integrations.components.evaluators.deepeval import DeepEvalEvaluator, DeepEvalMetric

faithfulness_evaluator = Pipeline()
evaluator = DeepEvalEvaluator(metric=DeepEvalMetric.FAITHFULNESS, metric_params={"model": "gpt-4"})
faithfulness_evaluator.add_component("evaluator", evaluator)
```


```python
evaluation_results = faithfulness_evaluator.run(
    {"evaluator": {"questions": questions, "contexts": contexts, "responses": responses}}
)
print(evaluation_results["evaluator"]["results"])
```

#### 2) Evaluate Contextual Relevance


```python
contextual_relevance_evaluator = Pipeline()
evaluator = DeepEvalEvaluator(metric=DeepEvalMetric.CONTEXTUAL_RELEVANCE, metric_params={"model": "gpt-4"})
contextual_relevance_evaluator.add_component("evaluator", evaluator)
```


```python
evaluation_results = contextual_relevance_evaluator.run(
    {"evaluator": {"questions": questions, "contexts": contexts, "responses": responses}}
)
print(evaluation_results["evaluator"]["results"])
```

## Evaluate the Pipeline with Ragas

Here, we're using the Haystack Ragas integration. We will perform 2 evaluations:

- Context Utilization, grading to what extent the generated answer uses the provided context.
- Aspect critique, grading generated answers based on custom aspects on a binary scale.

For a full list of available metrics and their expected inputs, check out our [`RagasEvaluator` Docs](https://docs.haystack.deepset.ai/v2.0/docs/ragasevalutor).

First, we install the `ragas-haystack` integration.


```bash
%%bash

pip install ragas-haystack
```

#### 1) Evaluate Context Utilizaton


```python
from haystack import Pipeline
from haystack_integrations.components.evaluators.ragas import RagasEvaluator, RagasMetric

context_utilization_pipeline = Pipeline()
evaluator = RagasEvaluator(metric=RagasMetric.CONTEXT_UTILIZATION)
context_utilization_pipeline.add_component("evaluator", evaluator)
```


```python
evaluation_results = context_utilization_pipeline.run(
    {"evaluator": {"questions": questions, "contexts": contexts, "responses": responses}}
)
print(evaluation_results["evaluator"]["results"])
```

#### 2) Evaluate Aspect Critique
A `RagasEvaluator` that uses the `ASPECT_CRITIQUE` metric expects to be initialized with the `name`, `definition` and optionally the `strictness` of the aspect to critique the reponse with.


```python
from haystack import Pipeline
from haystack_integrations.components.evaluators.ragas import RagasEvaluator, RagasMetric

aspect_critique_pipeline = Pipeline()
evaluator = RagasEvaluator(
    metric=RagasMetric.ASPECT_CRITIQUE,
    metric_params={
        "name": "maliciousness",
        "definition": "Is the submission intends to harm, deceive, or exploit users?",
        "strictness": 2,
    },
)
aspect_critique_pipeline.add_component("evaluator", evaluator)
```


```python
evaluation_results = aspect_critique_pipeline.run(
    {"evaluator": {"questions": questions, "contexts": contexts, "responses": responses}}
)
print(evaluation_results["evaluator"]["results"])
```

## Evaluate the Pipeline with UpTrain

Here, we're using the Haystack UpTrain integration. We will perform 2 evaluations:

- Context Relevance, grading how relevant the context is to the question specified
- Critique language, grading language aspects such as fluency, politeness, grammar, and coherence

For a full list of available metrics and their expected inputs, check out our [`UpTrainEvaluator` Docs](https://docs.haystack.deepset.ai/v2.0/docs/uptrainevaluator).

First, we install the `uptrain-haystack` integration.


```bash
%%bash

pip install uptrain-haystack
```

#### 1) Evaluate Context Relevance


```python
from haystack import Pipeline
from haystack_integrations.components.evaluators.uptrain import UpTrainEvaluator, UpTrainMetric

evaluator = UpTrainEvaluator(metric=UpTrainMetric.CONTEXT_RELEVANCE, api="openai")

context_relevance_evaluator_pipeline = Pipeline()
context_relevance_evaluator_pipeline.add_component("evaluator", evaluator)
```

Next, we can evaluate the context relevance of a RAG pipeline with multiple questions. The context relevance metric expects 2 inputs that should be provided from the RAG pipeline we are evaluating:

- questions
- contexts


```python
evaluation_results = context_relevance_evaluator_pipeline.run(
    {"evaluator": {"questions": questions, "contexts": contexts}}
)
print(evaluation_results["evaluator"]["results"])
```

#### 2) Critique Tone

An evaluator that uses the `CRITIQUE_TONE` metric expects to be initialized with an `llm_persona`. This is the persona the generative model being assessed was expected to follow, for example `methodical teacher`, `helpful chatbot`, or here simply `informative`.


```python
from haystack_integrations.components.evaluators.uptrain import UpTrainEvaluator, UpTrainMetric

evaluator = UpTrainEvaluator(
    metric=UpTrainMetric.CRITIQUE_TONE, api="openai", metric_params={"llm_persona": "informative"}
)

critique_tone_pipeline = Pipeline()
critique_tone_pipeline.add_component("evaluator", evaluator)
```

Next, we can critique the tone of the results of a RAG pipeline. This metric expects 1 input that should be provided from the RAG pipeline we are evaluating:

- responses


```python
evaluation_results = critique_tone_pipeline.run({"evaluator": {"responses": responses}})
print(evaluation_results["evaluator"]["results"])
```

## What's next

🎉 Congratulations! You've learned how to evaluate a RAG pipeline with model-based evaluation frameworks and without any labeling efforts.

If you liked this tutorial, you may also enjoy:
- [Serializing Haystack Pipelines](https://haystack.deepset.ai/tutorials/29_serializing_pipelines)
-  [Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline)

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=moel_based_evaluation). Thanks for reading!
