---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/34_Extractive_QA_Pipeline.ipynb
toc: True
title: "Build an Extractive QA Pipeline"
lastmod: "2024-03-12"
level: "beginner"
weight: 15
description: Learn how to build a Haystack pipeline that uses an extractive model to display where the answer to your query is.
category: "QA"
aliases: []
download: "/downloads/34_Extractive_QA_Pipeline.ipynb"
completion_time: 10 min
created_at: 2024-02-09
---
    


- **Level**: Beginner
- **Time to complete**: 15 minutes
- **Components Used**: [`ExtractiveReader`](https://docs.haystack.deepset.ai/v2.0/docs/extractivereader), [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore), [`InMemoryEmbeddingRetriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever), [`DocumentWriter`](https://docs.haystack.deepset.ai/v2.0/docs/documentwriter), [`SentenceTransformersDocumentEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder), [`SentenceTransformersTextEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformerstextembedder)
- **Goal**: After completing this tutorial, you'll have learned how to build a Haystack pipeline that uses an extractive model to display where the answer to your query is.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).



## Overview

What is extractive question answering? So glad you asked! The short answer is that extractive models pull verbatim answers out of text. It's good for use cases where accuracy is paramount, and you need to know exactly where in the text that the answer came from. If you want additional context, here's [a deep dive on extractive versus generative language models](https://haystack.deepset.ai/blog/generative-vs-extractive-models).

In this tutorial you'll create a Haystack pipeline that extracts answers to questions, based on the provided documents.

To get data into the extractive pipeline, you'll also build an indexing pipeline to ingest the [Wikipedia pages of Seven Wonders of the Ancient World dataset](https://en.wikipedia.org/wiki/Wonders_of_the_World).

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/logging)

#Installation



```python
!pip install haystack-ai accelerate sentence-transformers datasets
```

Knowing you’re using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/enabling-telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(34)
```

## Load data into the `DocumentStore`

Before you can use this data in the extractive pipeline, you'll use an indexing pipeline to fetch it, process it, and load it into the document store.


The data has already been cleaned and preprocessed, so turning it into Haystack `Documents` is fairly straightfoward.

Using an `InMemoryDocumentStore` here keeps things simple. However, this general approach would work with [any document store that Haystack 2.0 supports](https://docs.haystack.deepset.ai/v2.0/docs/document-store).

The `SentenceTransformersDocumentEmbedder` transforms each `Document` into a vector. Here we've used [`sentence-transformers/multi-qa-mpnet-base-dot-v1`](https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-dot-v1). You can substitute any embedding model you like, as long as you use the same one in your extractive pipeline.

Lastly, the `DocumentWriter` writes the vectorized documents to the `DocumentStore`.



```python
from datasets import load_dataset
from haystack import Document
from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.readers import ExtractiveReader
from haystack.components.embedders import SentenceTransformersDocumentEmbedder
from haystack.components.writers import DocumentWriter


dataset = load_dataset("bilgeyucel/seven-wonders", split="train")

documents = [Document(content=doc["content"], meta=doc["meta"]) for doc in dataset]

model = "sentence-transformers/multi-qa-mpnet-base-dot-v1"

document_store = InMemoryDocumentStore()

indexing_pipeline = Pipeline()

indexing_pipeline.add_component(instance=SentenceTransformersDocumentEmbedder(model=model), name="embedder")
indexing_pipeline.add_component(instance=DocumentWriter(document_store=document_store), name="writer")
indexing_pipeline.connect("embedder.documents", "writer.documents")

indexing_pipeline.run({"documents": documents})
```

## Build an Extractive QA Pipeline

Your extractive QA pipeline will consist of three components: an embedder, retriever, and reader.

- The `SentenceTransformersTextEmbedder` turns a query into a vector, usaing the same embedding model defined above.

- Vector search allows the retriever to efficiently return relevant documents from the document store. Retrievers are tightly coupled with document stores; thus, you'll use an `InMemoryEmbeddingRetriever`to go with the `InMemoryDocumentStore`.

- The `ExtractiveReader` returns answers to that query, as well as their location in the source document, and a confidence score.



```python
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.readers import ExtractiveReader
from haystack.components.embedders import SentenceTransformersTextEmbedder


retriever = InMemoryEmbeddingRetriever(document_store=document_store)
reader = ExtractiveReader()
reader.warm_up()

extractive_qa_pipeline = Pipeline()

extractive_qa_pipeline.add_component(instance=SentenceTransformersTextEmbedder(model=model), name="embedder")
extractive_qa_pipeline.add_component(instance=retriever, name="retriever")
extractive_qa_pipeline.add_component(instance=reader, name="reader")

extractive_qa_pipeline.connect("embedder.embedding", "retriever.query_embedding")
extractive_qa_pipeline.connect("retriever.documents", "reader.documents")
```

Try extracting some answers.


```python
query = "Who was Pliny the Elder?"
extractive_qa_pipeline.run(
    data={"embedder": {"text": query}, "retriever": {"top_k": 3}, "reader": {"query": query, "top_k": 2}}
)
```

## `ExtractiveReader`: a closer look

Here's an example answer:
```python
[ExtractedAnswer(query='Who was Pliny the Elder?', score=0.8306006193161011, data='Roman writer', document=Document(id=bb2c5f3d2e2e2bf28d599c7b686ab47ba10fbc13c07279e612d8632af81e5d71, content: 'The Roman writer Pliny the Elder, writing in the first century AD, argued that the Great Pyramid had...', meta: {'url': 'https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza', '_split_id': 16}
```

The confidence score ranges from 0 to 1. Higher scores mean the model has more confidence in the answer's relevance.

The Reader sorts the answers based on their probability scores, with higher probability listed first. You can limit the number of answers the Reader returns in the optional `top_k` parameter.

By default, the Reader sets a `no_answer=True` parameter. This param returns an `ExtractedAnswer` with no text, and the probability that none of the returned answers are correct.

```python
ExtractedAnswer(query='Who was Pliny the Elder?', score=0.04606167031102615, data=None, document=None, context=None, document_offset=None, context_offset=None, meta={})]}}
```

`.0.04606167031102615` means the model is fairly confident the provided answers are correct in this case. You can disable this behavio and return only answers by setting the `no_answer` param to `False` when initializing your `ExtractiveReader`.


## Wrapping it up

If you've been following along, now you know how to build an extractive question answering pipeline with Haystack 2.0. 🎉 Thanks for reading!


If you liked this tutorial, there's more to learn about Haystack 2.0:
- [Classifying Documents & Queries by Language](https://haystack.deepset.ai/tutorials/32_classifying_documents_and_queries_by_language)
-  [Generating Structured Output with Loop-Based Auto-Correction](https://haystack.deepset.ai/tutorials/28_structured_output_with_loop)
- [Preprocessing Different File Types](https://haystack.deepset.ai/tutorials/30_file_type_preprocessing_index_pipeline)

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=extractive_qa_tutorial).
