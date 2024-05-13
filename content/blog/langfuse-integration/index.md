---
layout: blog-post
title: 'Monitor and trace your Haystack pipelines with Langfuse'
description: With the new Langfuse integration, it's easier than ever to have visibility into how your pipelines are performing.
featured_image: thumbnail.png
images: ["blog/langfuse-integration/thumbnail.png"]
alt_image:  
toc: True
date: 2024-05-13
last_updated: 2024-05-13
authors:
  - Tilde Thurium
tags: ["Monitoring", "Generative AI", "Tracing"]
cookbook: langfuse_integration.ipynb
---

Getting your LLM application into production is a huge milestone, but that's only the beginning. It's critical to monitor how your pipeline is performing in the real world. With the new [Haystack Langfuse integration](https://haystack.deepset.ai/integrations/langfuse), it's now easier than ever to have visibility into your pipelines. In this post, we'll explain more about Langfuse, and demonstrate how to trace an end to end request to a Haystack pipeline.

### What is Langfuse? 

Langfuse is an open source LLM engineering platform. It offers a ton of features to help you understand how your LLM application is performing.

### Features
- Easy integration with Haystack pipelines
- Capture the full context of the execution
- Track model usage and cost
- Collect user feedback
- Identify low-quality outputs
- Build fine-tuning and testing datasets
- Open source 

## Getting started

In order to use this integration, you'll need to [sign up for a Langfuse account](https://langfuse.com/). See [the Langfuse docs for the most up-to-date information](https://langfuse.com/docs) about features and pricing.

### Prerequisites

First, [sign up for an account on the Langfuse website](https://langfuse.com/). 

On the Langfuse dashboard, make a note of your `LANGFUSE_SECRET_KEY` and `LANGFUSE_PUBLIC_KEY`.  Set them as environment variables. While you're at it, set the `HAYSTACK_CONTENT_TRACING_ENABLED` environment variable to `true` in order to enable Haystack tracing in your pipeline.

The following code examples also require an `OPENAI_API_KEY` environment variable to be set. Haystack is model-agnostic and you can use [any model provider we support](https://docs.haystack.deepset.ai/docs/generators), by changing the generator in the code samples below.

### Installation 

To install the integration run the following command in your terminal:
```bash
pip install langfuse-haystack
```
To use Langfuse in a pipeline you'll need a few additional dependencies:

```bash
pip install sentence-transformers datasets
```

## Using Langfuse in a RAG pipeline
```python
from datasets import load_dataset
from haystack import Document, Pipeline
from haystack.components.builders import PromptBuilder
from haystack.components.embedders import SentenceTransformersDocumentEmbedder, SentenceTransformersTextEmbedder
from haystack.components.generators import OpenAIGenerator
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack_integrations.components.connectors.langfuse import LangfuseConnector


def get_pipeline(document_store: InMemoryDocumentStore):
    retriever = InMemoryEmbeddingRetriever(document_store=document_store, top_k=2)

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

    basic_rag_pipeline = Pipeline()
    # Add components to your pipeline
    basic_rag_pipeline.add_component("tracer", LangfuseConnector("Basic RAG Pipeline"))
    basic_rag_pipeline.add_component(
        "text_embedder", SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
    )
    basic_rag_pipeline.add_component("retriever", retriever)
    basic_rag_pipeline.add_component("prompt_builder", prompt_builder)
    basic_rag_pipeline.add_component("llm", OpenAIGenerator(model="gpt-3.5-turbo", generation_kwargs={"n": 2}))

    # Now, connect the components to each other
    # NOTE: the tracer component doesn't need to be connected to anything in order to work
    basic_rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
    basic_rag_pipeline.connect("retriever", "prompt_builder.documents")
    basic_rag_pipeline.connect("prompt_builder", "llm")

    return basic_rag_pipeline

document_store = InMemoryDocumentStore()
dataset = load_dataset("bilgeyucel/seven-wonders", split="train")
embedder = SentenceTransformersDocumentEmbedder("sentence-transformers/all-MiniLM-L6-v2")
embedder.warm_up()
docs_with_embeddings = embedder.run([Document(**ds) for ds in dataset]).get("documents") or []  # type: ignore
document_store.write_documents(docs_with_embeddings)

pipeline = get_pipeline(document_store)
question = "What does Rhodes Statue look like?"
response = pipeline.run({"text_embedder": {"text": question}, "prompt_builder": {"question": question}})
# {'tracer': {'name': 'Basic RAG Pipeline', 'trace_url': 'https://cloud.langfuse.com/trace/3d52b8cc-87b6-4977-8927-5e9f3ff5b1cb'}, 'llm': {'replies': ['The Rhodes Statue was described as being about 105 feet tall, with iron tie bars and brass plates forming the skin. It was built on a white marble pedestal near the Rhodes harbour entrance. The statue was filled with stone blocks as construction progressed.', 'The Rhodes Statue was described as being about 32 meters (105 feet) tall, built with iron tie bars, brass plates for skin, and filled with stone blocks. It stood on a 15-meter-high white marble pedestal near the Rhodes harbor entrance.'], 'meta': [{'model': 'gpt-3.5-turbo-0125', 'index': 0, 'finish_reason': 'stop', 'usage': {'completion_tokens': 100, 'prompt_tokens': 453, 'total_tokens': 553}}, {'model': 'gpt-3.5-turbo-0125', 'index': 1, 'finish_reason': 'stop', 'usage': {'completion_tokens': 100, 'prompt_tokens': 453, 'total_tokens': 553}}]}}

```

## Using Langfuse in a RAG pipeline with chat