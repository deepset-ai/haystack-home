---
layout: blog-post
title: 'Hosted or self-hosted RAG? Full flexibility with NVIDIA NIM integration in Haystack 2.0'
description: New integrations with microservices from the NVIDIA AI Enterprise software platform, including NVIDIA NIM and NeMo Retriever, now allow you to iterate even faster across your RAG development cycle
toc: True
date: 2024-03-17
last_updated: 2024-03-17
authors:
  - Malte Pietsch
tags: ["Haystack 2.0", "Integration"]
---

## Iteration speed across design options matters

Retrieval-augmented generation (RAG) is one of the most common architectures today for
building LLM applications. With RAG you can very quickly build a prototype that is tailored to your use case by connecting the LLM to the relevant data sources.

Once you have your first prototype up and running, you typically iterate a lot on your pipeline design before you go live in production: switching embedding models or generative LLMs, adding rerankers, or leveraging the metadata of your documents. 

We often see our users iterate fifty or more times before settling on the design that meets their requirements. Besides optimizing the answer quality, users often have additional requirements like costs, latency or data privacy that determines their target architecture and deployment strategy for going to production.

Two crucial features are needed to support rapid prototyping during RAG development: the flexibility to experiment with many different models and features, and the ability to quickly switch between them.

Both are at the heart of our design for Haystack 2.0. New integrations with microservices from the NVIDIA AI Enterprise software platform, including NVIDIA NIM and NeMo Retriever, now allow you to iterate even faster across your RAG development cycle and give you full flexibility with deployment options: - Visit [NVIDIA API Catalog](https://ai.nvidia.com)to quickly experiment with the latest GPU-accelerated generative AI models on NVIDIA-hosted API endpoints. And then switch easily to self-hosted NVIDIA NIM microservice containers that can run in your own VPC or self-hosted cloud. [Learn more about taking RAG applications from pilot to production in this NVIDIA blog](https://developer.nvidia.com/blog/how-to-take-a-rag-application-from-pilot-to-production-in-four-steps/).

## What is NVIDIA NIM?

NVIDIA NIM is a set of easy-to-use microservices designed to speed up generative AI deployment in enterprises. Supporting a wide range of leading community and proprietary AI models, hosted on NVIDIA API catalog, NIM ensures seamless, scalable AI inferencing, whether on-premises or in the cloud, leveraging industry-standard APIs.

To get started, developers can visit the NVIDIA API catalog to interact with GPU-accelerated generative AI models directly from a web browser. The API catalog interface generates application code for every interaction. Developers can paste this code into their own applications to interact with the model endpoints programmatically. When ready
to deploy, NVIDIA AI Enterprise subscribers can export the model to a downloadable NVIDIA NIM container and run it anywhere. This gives developers ownership to their customizations and full control of their IP and AI application. 

## Use NVIDIA AI with Haystack 2.0

Now we’ll walk through the nitty-gritty details of how to build a RAG pipeline with Haystack and
hosted NVIDIA APIs. You will build two [Haystack pipelines](https://docs.haystack.deepset.ai/docs/pipelines): an indexing pipeline to create and store documents, and a RAG pipeline to query those documents.

In order for this code to work, you will need an [NVIDIA API key](https://org.ngc.nvidia.com/setup). Set it as an environment variable, `NVIDIA_API_KEY`.

First: install the Haystack NVIDIA connector:

```bash
pip install nvidia-haystack
```
Next, build an indexing pipeline. This example uses one of NVIDIA’s embedding models to turn
documents into vectors, and adds them to the `document_store`-

```python
from haystack_integrations.components.generators.nvidia import NvidiaGenerator
from haystack_integrations.components.embedders.nvidia import NvidiaEmbeddingModel, NvidiaDocumentEmbedder

from haystack import Pipeline
from haystack.dataclasses import Document
from haystack.components.writers import DocumentWriter
from haystack.document_stores.in_memory import InMemoryDocumentStore

documents = [
    Document(content="My name is Jean and I live in Paris."),
    Document(content="My name is Mark and I live in Berlin."),
    Document(content="My name is Giorgio and I live in Rome.")]

document_store = InMemoryDocumentStore()

document_embedder = NvidiaDocumentEmbedder(model="nvolveqa_40k")
writer = DocumentWriter(document_store=document_store)

indexing_pipeline = Pipeline()
indexing_pipeline.add_component(instance=document_embedder, name="document_embedder")
indexing_pipeline.add_component(instance=writer, name="writer")

indexing_pipeline.connect("document_embedder.documents", "writer.documents")
indexing_pipeline.run(data={"document_embedder":{"documents": documents}})

# Calling filter with no arguments will print the contents of the document store
document_store.filter_documents({})
```

Create a RAG pipeline to query the data.

```python
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.builders import PromptBuilder
from haystack_integrations.components.generators.nvidia import NvidiaGenerator
from haystack_integrations.components.embedders.nvidia import NvidiaEmbeddingModel, NvidiaTextEmbedder

prompt = """ Answer the query, based on the
content in the documents.
If you can't answer based on the given documents, say so.


Documents:
{% for doc in documents %}
 {{doc.content}}
{% endfor %}


Query: {{query}}
"""

text_embedder = NvidiaTextEmbedder(model="playground_nvolveqa_40k")
retriever = InMemoryEmbeddingRetriever(document_store=document_store)
prompt_builder = PromptBuilder(template=prompt)
generator = NvidiaGenerator(model="playground_nv_llama2_rlhf_70b")

rag_pipeline = Pipeline()

rag_pipeline.add_component(instance=text_embedder, name="text_embedder")
rag_pipeline.add_component(instance=retriever, name="retriever")
rag_pipeline.add_component(instance=prompt_builder, name="prompt_builder")
rag_pipeline.add_component(instance=generator, name="generator")

rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
rag_pipeline.connect("retriever.documents", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder", "generator")

question = "Who lives in Rome?"
result = rag_pipeline.run(data={"text_embedder":{"text": question},
                           	                                      "prompt_builder":{"query": question}})
print(result)
# {'text_embedder': {'meta': {'usage': {'prompt_tokens': 10, 'total_tokens': 10}}}, 'generator': {'replies': [Giorgio], 'meta': [{'role': 'assistant', 'finish_reason': 'stop'}], 'usage': {'completion_tokens': 3, 'prompt_tokens': 101, 'total_tokens': 104}}}

```

The pipeline example above uses the API catalog endpoint for LLM inference and embedding. Switching from the API catalog endpoint to a self-hosted NIM microservice only requires the small addition of an `api_url` init
parameter to the embedder and generator.

```python
document_embedder = NvidiaDocumentEmbedder(model="nvolveqa_40k", api_url="<container_endpoint_url>")

text_embedder = NvidiaTextEmbedder(model="nvolveqa_40k", api_url="<container_endpoint_url>")

generator = NvidiaGenerator(model="mixtral_8x7b", api_url="<container_endpoint_url>")


generator.warm_up()

result = generator.run(prompt="When was the Golden Gate Bridge built?")
# The Golden Gate Bridge was built in 1937 and was completed and opened to the public on May 28, 1937... 
```
Using the NVIDIA Haystack connector, Deepset customers can apply the benefits of GPU-acceleration to their RAG
applications quickly and easily.

## Wrapping it up
- Want to learn more about Haystack 2.0? Get started with our [tutorials](https://haystack.deepset.ai/tutorials[), [cookbooks](https://github.com/deepset-ai/haystack-cookbook/), and
[blog posts](https://haystack.deepset.ai/blog).
- Have more questions? [Join our community on Discord](https://discord.com/invite/VBpFzsgRVF) or [sign up for our monthly newsletter](https://landing.deepset.ai/haystack-community-updates).
- Want to learn more about NVIDIA NIM and how to run the containers? Be on the lookout
for a more in-depth technical blog about how to use NIM with Haystack.
