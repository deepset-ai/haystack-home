---
layout: blog-post
title: Announcing the Astra DB Haystack Integration
description: Learn how to use the new Astra DB integrations for Haystack 2.0 in your RAG pipelines.
featured_image: thumbnail.png
images: ["blog/astradb-haystack-integration/thumbnail.png"]
alt_image: The logos for Haystack and Astra DB hang out on a blue background in front of some people tending to pipelines, and inexplicably a giant lightbulb.
toc: True
date: 2024-01-19
last_updated:  2024-01-19
authors:
  - Tilde Thurium
tags: ["Embeddings", "Haystack 2.0", "Vector Database"]
cookbook: astradb_haystack_integration.ipynb
---
The Haystack extension family is growing so fast, it's hard to keep up! Our latest addition is the Astra DB extension by [Datastax](https://datastax.com/). It's an open source package that helps you use Astra DB as a vector database for your Haystack pipelines.

Let's learn about the benefits of Astra DB and how to use it with Haystack.

### Benefits of Astra DB

DataStax Astra DB is a serverless vector database built on [Apache Cassandra](https://cassandra.apache.org/_/index.html). What makes Astra DB special?

- **Interoperability** with Cassandra's open source ecosystem and tooling. 
- Astra DB **supports a variety of different embedding models**. One Astra database instance can have multiple `collections` with different vector sizes. This makes it easy to test different embedding models and find the best one for your use case.
- **It's serverless**. What does that mean for a database? You don't have to manage individual instances, or deal with cumbersome upgrading or scaling. All of that is taken care of for you behind the scenes.
- **Enterprise scalability**. Astra DB can be deployed across the major cloud providers (AWS, GCP, or Azure) and across multiple regions depending on your needs.
- At the time of this writing, **there's a free tier available** so you can try it without a credit card.

### Create your Astra DB database
To ensure these instructions remain up to date, we're going to point you to the Astra DB docs to explain how to create a database.

1. [Create a free Astra DB database](https://docs.datastax.com/en/astra/astra-db-vector/databases/create-database.html#create-vector-database). Make a note of your credentials - you'll need your Astra API endpoint and Astra application token  to use the Haystack extension.
2. Choose the number of dimensions that matches the [embedding model](https://haystack.deepset.ai/blog/what-is-text-vectorization-in-nlp) you plan on using. For this example we'll use a 384-dimension model, [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).
3. [Create a collection](https://docs.datastax.com/en/astra/astra-db-vector/databases/manage-collections.html#create-collection) with the same number of dimensions as your embedding model. Save the name of your collection since you'll need this as well. 

### Get started with the Astra DB Haystack Integration

First, install the integration:

```bash
pip install astra-haystack sentence-transformers
```

Remember earlier when I mentioned you were going to need your credentials? I hope you saved them. If not, that's okay, you can go back to the [Astra Portal](https://astra.datastax.com/) and grab them.

> Note: if you were running this code in production, you'd want to save these as environment variables to keep things nice and secure.

```python
from getpass import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass("Enter your openAI key:")
os.environ["ASTRA_DB_API_ENDPOINT"] = getpass("Enter your Astra API Endpoint:")
os.environ["ASTRA_DB_APPLICATION_TOKEN"] = getpass("Enter your Astra application token (e.g.AstraCS:xxx ):")
```

## Using the Astra DocumentStore in an index pipeline 
Next, we'll make a Haystack pipeline, create some embeddings from documents, and add them into the [`AstraDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/astradocumentstore).

```python
import logging

from haystack import Document, Pipeline

from haystack.components.embedders import SentenceTransformersDocumentEmbedder, SentenceTransformersTextEmbedder
from haystack.components.writers import DocumentWriter
from haystack.document_stores.types import DuplicatePolicy
from haystack_integrations.document_stores.astra import AstraDocumentStore

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"

# Make sure ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN environment variables are set before proceeding

# embedding_dim is the number of dimensions the embedding model supports.
document_store = AstraDocumentStore(
    duplicates_policy=DuplicatePolicy.SKIP,
    embedding_dimension=384,
)


# Add Documents
documents = [
    Document(content="There are over 7,000 languages spoken around the world today."),
    Document(
        content="Elephants have been observed to behave in a way that indicates"
        " a high level of self-awareness, such as recognizing themselves in mirrors."
    ),
    Document(
        content="In certain parts of the world, like the Maldives, Puerto Rico, "
        "and San Diego, you can witness the phenomenon of bioluminescent waves."
    ),
]
index_pipeline = Pipeline()
index_pipeline.add_component(
    instance=SentenceTransformersDocumentEmbedder(model=embedding_model_name),
    name="embedder",
)
index_pipeline.add_component(instance=DocumentWriter(document_store=document_store, policy=DuplicatePolicy.SKIP), name="writer")
index_pipeline.connect("embedder.documents", "writer.documents")

index_pipeline.run({"embedder": {"documents": documents}})

print(document_store.count_documents())
```
If all has gone well, there should be 3 documents. 🎉

## Use the `AstraEmbeddingRetriever` in a Haystack RAG pipeline

In Haystack, every `DocumentStore` is tightly coupled with the `Retriever` that fetches from it. Astra DB is no exception. Here we'll create a RAG pipeline, where the [`AstraEmbeddingRetriever`](https://docs.haystack.deepset.ai/v2.0/docs/astraretriever) will fetch documents relevant to our query.

```python
from haystack.components.builders.answer_builder import AnswerBuilder
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack.components.generators import OpenAIGenerator
from haystack_integrations.components.retrievers.astra import AstraEmbeddingRetriever

prompt_template = """
                Given these documents, answer the question.
                Documents:
                {% for doc in documents %}
                    {{ doc.content }}
                {% endfor %}
                Question: {{question}}
                Answer:
                """

rag_pipeline = Pipeline()
rag_pipeline.add_component(
    instance=SentenceTransformersTextEmbedder(model=embedding_model_name),
    name="embedder",
)
rag_pipeline.add_component(instance=AstraEmbeddingRetriever(document_store=document_store), name="retriever")
rag_pipeline.add_component(instance=PromptBuilder(template=prompt_template), name="prompt_builder")
rag_pipeline.add_component(instance=OpenAIGenerator(), name="llm")
rag_pipeline.add_component(instance=AnswerBuilder(), name="answer_builder")
rag_pipeline.connect("embedder", "retriever")
rag_pipeline.connect("retriever", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder", "llm")
rag_pipeline.connect("llm.replies", "answer_builder.replies")
rag_pipeline.connect("llm.meta", "answer_builder.meta")
rag_pipeline.connect("retriever", "answer_builder.documents")

# Run the pipeline
question = "How many languages are there in the world today?"
result = rag_pipeline.run(
    {
        "embedder": {"text": question},
        "retriever": {"top_k": 2},
        "prompt_builder": {"question": question},
        "answer_builder": {"query": question},
    }
)

print(result)
```
The output should look like this:
```bash
{'answer_builder': {'answers': [GeneratedAnswer(data='There are over 7,000 languages spoken around the world today.', query='How many languages are there in the world today?', documents=[Document(id=cfe93bc1c274908801e6670440bf2bbba54fad792770d57421f85ffa2a4fcc94, content: 'There are over 7,000 languages spoken around the world today.', score: 0.9267925, embedding: vector of size 384), Document(id=6f20658aeac3c102495b198401c1c0c2bd71d77b915820304d4fbc324b2f3cdb, content: 'Elephants have been observed to behave in a way that indicates a high level of self-awareness, such ...', score: 0.5357444, embedding: vector of size 384)], meta={'model': 'gpt-3.5-turbo-0613', 'index': 0, 'finish_reason': 'stop', 'usage': {'completion_tokens': 14, 'prompt_tokens': 83, 'total_tokens': 97}})]}}
```

## Wrapping it up

If you've gotten this far, now you know how to use Astra DB as a data source for your Haystack pipeline. To learn more about Haystack, [join us on Discord](https://discord.gg/QMP5jgMH) or [sign up for our monthly newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=astradb-haystack-notebook).
