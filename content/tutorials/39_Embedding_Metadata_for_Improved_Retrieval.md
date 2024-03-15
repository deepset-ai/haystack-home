---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/39_Embedding_Metadata_for_Improved_Retrieval.ipynb
toc: True
title: "Embedding Metadata for Improved Retrieval"
lastmod: "2024-03-12"
level: "beginner"
weight: 8
description: Learn how to embed metadata while indexing, to improve the quality of retrieval results
category: "QA"
aliases: []
download: "/downloads/39_Embedding_Metadata_for_Improved_Retrieval.ipynb"
completion_time: 10 min
created_at: 2024-02-20
---
    



- **Level**: Intermediate
- **Time to complete**: 10 minutes
- **Components Used**: [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore), [`InMemoryEmbeddingRetriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever), [`SentenceTransformersDocumentEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder), [`SentenceTransformersTextEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformerstextembedder)
- **Goal**: After completing this tutorial, you'll have learned how to embed metadata information while indexing documents, to improve retrieval.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).

> ⚠️ Note of caution: The method showcased in this tutorial is not always the right approach for all types of metadata. This method works best when the embedded metadata is meaningful. For example, here we're showcasing embedding the "title" meta field, which can also provide good context for the embedding model.

## Overview

While indexing documents into a document store, we have 2 options: embed the text for that document or embed the text alongside some meaningful metadata. In some cases, embedding meaningful metadata alongside the contents of a document may improve retrieval down the line. 

In this tutorial, we will see how we can embed metadata as well as the text of a document. We will fetch various pages from Wikipedia and index them into an `InMemoryDocumentStore` with metadata information that includes their title, and URL. Next, we will see how retrieval with and without this metadata.

## Setup
### Prepare the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/setting-the-log-level)

### Install Haystack

Install Haystack 2.0 and other required packages with `pip`:


```bash
%%bash

pip install haystack-ai wikipedia sentence-transformers
```

### Enable Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(39)
```

## Indexing Documents with Metadata

Create a pipeline to store the small example dataset in the [InMemoryDocumentStore](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore) with their embeddings. We will use [SentenceTransformersDocumentEmbedder](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder) to generate embeddings for your Documents and write them to the document store with the [DocumentWriter](https://docs.haystack.deepset.ai/v2.0/docs/documentwriter).

After adding these components to your pipeline, connect them and run the pipeline.

> 💡 The `InMemoryDocumentStore` is the simplest document store to run tutorials with and comes with no additional requirements. This can be changed to any of the other available document stores such as **Weaviate, AstraDB, Qdrant, Pinecone and more**. Check out the [full list of document stores](https://haystack.deepset.ai/integrations?type=Document+Store) with instructions on how to run them. 

First, we'll create a helper function that can create indexing pipelines. We will optionally provide this function with `meta_fields_to_embed`. If provided, the `SentenceTransformersDocumentEmbedder` will be initialized with metadata to embed alongside the content of the document.

For example, the embedder below will be embedding the "url" field as well as the contents of documents:

```python
from haystack.components.embedders import SentenceTransformersTextEmbedder

embedder = SentenceTransformersDocumentEmbedder(meta_fields_to_embed=["url"])
```


```python
from haystack import Pipeline
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.components.embedders import SentenceTransformersDocumentEmbedder
from haystack.components.writers import DocumentWriter
from haystack.document_stores.types import DuplicatePolicy
from haystack.utils import ComponentDevice


def create_indexing_pipeline(document_store, metadata_fields_to_embed=None):
    document_cleaner = DocumentCleaner()
    document_splitter = DocumentSplitter(split_by="sentence", split_length=2)
    document_embedder = SentenceTransformersDocumentEmbedder(
        model="thenlper/gte-large",
        meta_fields_to_embed=metadata_fields_to_embed,
        device=ComponentDevice.from_str("cuda:0"),
    )
    document_writer = DocumentWriter(document_store=document_store, policy=DuplicatePolicy.OVERWRITE)

    indexing_pipeline = Pipeline()
    indexing_pipeline.add_component("cleaner", document_cleaner)
    indexing_pipeline.add_component("splitter", document_splitter)
    indexing_pipeline.add_component("embedder", document_embedder)
    indexing_pipeline.add_component("writer", document_writer)

    indexing_pipeline.connect("cleaner", "splitter")
    indexing_pipeline.connect("splitter", "embedder")
    indexing_pipeline.connect("embedder", "writer")

    return indexing_pipeline
```

Next, we can index our documents from various wikipedia articles. We will create 2 indexing pipelines:

- The `indexing_pipeline`: which indexes only the contents of the documents. We will index these documents into `document_store`.
- The `indexing_with_metadata_pipeline`: which indexes meta fields alongside the contents of the documents. We will index these documents into `document_store_with_embedded_metadata`.


```python
import wikipedia
from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore

some_bands = """The Beatles,The Cure""".split(",")

raw_docs = []

for title in some_bands:
    page = wikipedia.page(title=title, auto_suggest=False)
    doc = Document(content=page.content, meta={"title": page.title, "url": page.url})
    raw_docs.append(doc)

document_store = InMemoryDocumentStore(embedding_similarity_function="cosine")
document_store_with_embedded_metadata = InMemoryDocumentStore(embedding_similarity_function="cosine")

indexing_pipeline = create_indexing_pipeline(document_store=document_store)
indexing_with_metadata_pipeline = create_indexing_pipeline(
    document_store=document_store_with_embedded_metadata, metadata_fields_to_embed=["title"]
)

indexing_pipeline.run({"cleaner": {"documents": raw_docs}})
indexing_with_metadata_pipeline.run({"cleaner": {"documents": raw_docs}})
```

## Comparing Retrieval With and Without Embedded Metadata

As a final step, we will be creating a retrieval pipeline that will have 2 retrievers:
- First: retrieving from the `document_store`, where we have not embedded metadata.
- Second: retrieving from the `document_store_with_embedded_metadata`, where we have embedded metadata.

We will then be able to compare the results and see if embedding metadata has helped with retrieval in this case.

> 💡 Here, we are using the `InMemoryEmbeddintRetriever` because we used the `InMemoryDocumentStore` above. If you're using another document store, change this to use the accompanying embedding retriever for the document store you are using. Check out the [Embedders Documentation](https://docs.haystack.deepset.ai/v2.0/docs/embedders) for a full list


```python
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever

retrieval_pipeline = Pipeline()
retrieval_pipeline.add_component("text_embedder", SentenceTransformersTextEmbedder(model="thenlper/gte-large"))
retrieval_pipeline.add_component(
    "retriever", InMemoryEmbeddingRetriever(document_store=document_store, scale_score=False, top_k=3)
)
retrieval_pipeline.add_component(
    "retriever_with_embeddings",
    InMemoryEmbeddingRetriever(document_store=document_store_with_embedded_metadata, scale_score=False, top_k=3),
)

retrieval_pipeline.connect("text_embedder", "retriever")
retrieval_pipeline.connect("text_embedder", "retriever_with_embeddings")
```

Let's run the pipeline and compare the results from `retriever` and `retirever_with_embeddings`. Below you'll see 3 documents returned by each retriever, ranked by relevance.

Notice that with the question "Have the Beatles ever been to Bangor?", the first pipeline is not returning relevant documents, but the second one is. Here, the `meta` field "title" is helpful, because as it turns out, the document that contains the information about The Beatles visiting Bangor does not contain a reference to "The Beatles". But, by embedding metadata, the embedding model is able to retrieve the right document.


```python
result = retrieval_pipeline.run({"text_embedder": {"text": "Have the Beatles ever been to Bangor?"}})

print("Retriever Results:\n")
for doc in result["retriever"]["documents"]:
    print(doc)

print("Retriever with Embeddings Results:\n")
for doc in result["retriever_with_embeddings"]["documents"]:
    print(doc)
```

## What's next

🎉 Congratulations! You've embedded metadata while indexing, to improve the results of retrieval!

If you liked this tutorial, there's more to learn about Haystack 2.0:
- [Creating a Hybrid Retrieval Pipeline](https://haystack.deepset.ai/tutorials/33_hybrid_retrieval)
- [Building Fallbacks to Websearch with Conditional Routing](https://haystack.deepset.ai/tutorials/36_building_fallbacks_with_conditional_routing)
- [Model-Based Evaluation of RAG Pipelines](https://haystack.deepset.ai/tutorials/35_model_based_evaluation_of_rag_pipelines)

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=tutorial&utm_medium=embedding-metadata) or [join Haystack discord community](https://discord.gg/haystack).

Thanks for reading!
