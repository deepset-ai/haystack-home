---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/31_Metadata_Filtering.ipynb
toc: True
title: "Filtering Documents with Metadata"
lastmod: "2024-03-12"
level: "beginner"
weight: 6
description: Learn how to filter down to specific documents at retrieval time using metadata
category: "QA"
aliases: []
download: "/downloads/31_Metadata_Filtering.ipynb"
completion_time: 5 min
created_at: 2024-01-30
---
    


- **Level**: Beginner
- **Time to complete**: 5 minutes
- **Components Used**: [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore), [`InMemoryBM25Retriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorybm25retriever)
- **Prerequisites**: None
- **Goal**: Filter documents in a document store based on given metadata

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).

## Overview

**📚 Useful Documentation: [Metadata Filtering](https://docs.haystack.deepset.ai/v2.0/docs/metadata-filtering)**

Although new retrieval techniques are great, sometimes you just know that you want to perform search on a specific group of documents in your document store. This can be anything from all the documents that are related to a specific _user_, or that were published after a certain _date_ and so on. Metadata filtering is very useful in these situations. In this tutorial, we will create a few simple documents containing information about Haystack, where the metadata includes information on what version of Haystack the information relates to. We will then do metadata filtering to make sure we are answering the question based only on information about Haystack 2.0.


## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/logging)

## Installing Haystack

Install Haystack 2.0 with `pip`:


```bash
%%bash

pip install haystack-ai
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/enabling-telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(31)
```

## Preparing Documents

First, let's prepare some documents. Below, we're manually creating 3 simple documents with `meta` attached. We're then writing these documents to an `InMemoryDocumentStore`, but you can [use any of the available document stores](https://docs.haystack.deepset.ai/v2.0/docs/choosing-a-document-store) instead such as OpenSearch, Chroma, Pinecone and more.. (Note that not all of them have options to store in memory and may require extra setup).

> ⭐️ For more information on how to write documents into different document stores, you can follow our tutorial on indexing different file types.


```python
from datetime import datetime

from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever

documents = [
    Document(
        content="Use pip to install a basic version of Haystack's latest release: pip install farm-haystack. All the core Haystack components live in the haystack repo. But there's also the haystack-extras repo which contains components that are not as widely used, and you need to install them separately.",
        meta={"version": 1.15, "date": datetime(2023, 3, 30)},
    ),
    Document(
        content="Use pip to install a basic version of Haystack's latest release: pip install farm-haystack[inference]. All the core Haystack components live in the haystack repo. But there's also the haystack-extras repo which contains components that are not as widely used, and you need to install them separately.",
        meta={"version": 1.22, "date": datetime(2023, 11, 7)},
    ),
    Document(
        content="Use pip to install only the Haystack 2.0 code: pip install haystack-ai. The haystack-ai package is built on the main branch which is an unstable beta version, but it's useful if you want to try the new features as soon as they are merged.",
        meta={"version": 2.0, "date": datetime(2023, 12, 4)},
    ),
]
document_store = InMemoryDocumentStore(bm25_algorithm="BM25Plus")
document_store.write_documents(documents=documents)
```

## Building a Document Search Pipeline

As an example, below we are building a simple document search pipeline that simply has a retriever. However, you can also change this pipeline to do more, such as generating answers to questions or more.


```python
from haystack import Pipeline

pipeline = Pipeline()
pipeline.add_component(instance=InMemoryBM25Retriever(document_store=document_store), name="retriever")
```

## Do Metadata Filtering

Finally, ask a question by filtering the documents to `"version" > 1.21`.

To see what kind of comparison operators you can use for your metadata, including logical comparistons such as `NOT`, `AND` and so on, check out the [Metadata Filtering documentation](https://docs.haystack.deepset.ai/v2.0/docs/metadata-filtering#comparison)


```python
query = "Haystack installation"
pipeline.run(data={"retriever": {"query": query, "filters": {"field": "meta.version", "operator": ">", "value": 1.21}}})
```

As a final step, let's see how we can add logical operators to our filters. This time, we are asking for retrieved documents to be filtered to `version > 1.21` _AND_ we're also asking their `date` to be later than November 7th 2023.


```python
query = "Haystack installation"
pipeline.run(
    data={
        "retriever": {
            "query": query,
            "filters": {
                "operator": "AND",
                "conditions": [
                    {"field": "meta.version", "operator": ">", "value": 1.21},
                    {"field": "meta.date", "operator": ">", "value": datetime(2023, 11, 7)},
                ],
            },
        }
    }
)
```

## What's next

🎉 Congratulations! You've filtered retrieved documents with metadata!

If you liked this tutorial, you may also enjoy:
- [Serializing Haystack Pipelines](https://haystack.deepset.ai/tutorials/29_serializing_pipelines)
-  [Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline)

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=tutorial&utm_medium=metadata_filtering). Thanks for reading!
