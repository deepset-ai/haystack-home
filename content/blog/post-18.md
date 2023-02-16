---
layout: blog-post
title: Lorem Ipsum Dolor Sit Amet Consectetur
description: Lorem ipsum dolor sit amet consectetur, adipisicing elit. Excepturi voluptas fuga repellat unde amet architecto, voluptate quas vitae tempora et.
featured_image: /images/contributor-cafe.png
toc: True
date: 2023-02-09
last_updated: 2023-02-09
authors:
  - Jane Doe
  - John Doe
# canonical_url:
# opengraph images
# images: [""]
---

## Overview

Learn how to build a question answering system using Haystack's DocumentStore, Retriever, and Reader. Your system will use Game of Thrones files and will be able to answer questions like "Who is the father of Arya Stark?". But you can use it to run on any other set of documents, such as your company's internal wikis or a collection of financial reports.

To help you get started quicker, we simplified certain steps in this tutorial. For example, Document preparation and pipeline initialization are handled by ready-made classes that replace lines of initialization code. But don't worry! This doesn't affect how well the question answering system performs.

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:

```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab]
```

Set the logging level to INFO:

```python
import logging

logging.basicConfig(format="%(levelname)s - %(name)s -  %(message)s", level=logging.WARNING)
logging.getLogger("haystack").setLevel(logging.INFO)
```

## Initializing the DocumentStore

We'll start creating our question answering system by initializing a DocumentStore. A DocumentStore stores the Documents that the question answering system uses to find answers to your questions. In this tutorial, we're using the `InMemoryDocumentStore`, which is the simplest DocumentStore to get started with. It requires no external dependencies and it's a good option for smaller projects and debugging. But it doesn't scale up so well to larger Document collections, so it's not a good choice for production systems. To learn more about the DocumentStore and the different types of external databases that we support, see [DocumentStore](https://docs.haystack.deepset.ai/docs/document_store).

Let's initialize the the DocumentStore:

```python
from haystack.document_stores import InMemoryDocumentStore

document_store = InMemoryDocumentStore(use_bm25=True)
```

The DocumentStore is now ready. Now it's time to fill it with some Documents.