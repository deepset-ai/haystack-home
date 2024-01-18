---
layout: blog-post
title: Announcing the AstraDB Haystack Integration
description: Learn how to use the new AstraDB integrations for Haystack 2.0 in your RAG pipelines.
featured_image: thumbnail.jpg
images: ["TBD"]
featured_image_caption: 
toc: True
date: 2024-01-18
last_updated:  2024-01-18
authors:
  - Tilde Thurium
tags: ["Embeddings", "Haystack 2.0", "Vector Database"]
cookbook: astradb_haystack_integrations.ipynb
---	
The Haystack extension family is growing so fast, it's hard to keep up! Our last addition is the AstraDB extension by [Datastax](https://datastax.com/). It's an open source package that helps you use AstraDB as a vector database for your Haystack pipelines.

Let's learn about the benefits of AstraDB and how to combine it with Haystack.

### Benefits of AstraDB

DataStax Astra DB is a serverless vector database built on [Apache Cassandra](https://cassandra.apache.org/_/index.html). What makes Astra DB special?

- Interoperability with Cassandra's open source ecosystem and tooling. 
- Astra DB a supports variety of different embedding models. One Astra database instance can have multiple `collections` with different vector sizes. This makes it easy to test different embedding models and find the best one for your use case.
- It's serverless. What does that mean for a database? You don't have to manage individual instances, or deal with cumbersome upgrading or scaling. All of that is taken care of for you behind the scenes.
- Enterprise scalability. AstraDB can be deployed across the major cloud provides (AWS, GCP, or Azure) across multiple regions depending on your needs.
- As of the time of this writing, there's a free tier available so you can try it without putting down a credit card.

### Creating your Astra DB database
To ensure these instructions remain up to date, we're going to point you to the Astra DB docs to explain how to create a database.

Follow the first step in this [this tutorial to create a free Astra DB database](https://docs.datastax.com/en/astra-serverless/docs/manage/db/manage-create.html) Make a note of your credentials - you'll need your database ID, application token, keyspace, and database region to use the Haystack extension.

[Follow these steps to create a collection](https://docs.datastax.com/en/astra/astra-db-vector/databases/manage-collections.html). Save the name of your collection since you'll need this as well. 

Choose the number of dimensions that matches the [embedding model](https://haystack.deepset.ai/blog/what-is-text-vectorization-in-nlp) you plan on using. For this example we'll use a 384-dimension model, [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).

### How to use the AstraDB Integration

First, you need to install it:

```bash
pip install astra-haystack sentence-transformers
```

Remember earlier when I mentioned you were going to need your credentials? I hope you saved them. If not, that's okay, you can go back to the Astra console and grab them.

> Note: if you were running this code in production, you'd want to save these as environment variables to keep things nice and secure.

```python
from getpass import getpass

OPENAI_API_KEY = getpass("Enter your openAI key:")
ASTRA_DB_ID = getpass("Enter your Astra database ID:")
ASTRA_DB_APPLICATION_TOKEN = getpass("Enter your Astra application token (e.g.AstraCS:xxx ):")
ASTRA_DB_REGION = getpass("Enter your AstraDB Region: ")
ASTRA_DB_COLLECTION_NAME = getpass("enter your Astra collection name:")
ASTRA_DB_KEYSPACE_NAME = getpass("Enter your Astra keyspace name:")
```

