---
layout: tutorial
featured: True
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/26_Hybrid_Retrieval.ipynb
toc: True
title: "Creating a Hybrid Retrieval Pipeline"
lastmod: "2024-03-12"
level: "intermediate"
weight: 63
description: Learn how to combine Retrievers to enhance retrieval
category: "QA"
aliases: ['/tutorials/hybrid-retrieval']
download: "/downloads/26_Hybrid_Retrieval.ipynb"
completion_time: 15 min
created_at: 2023-10-10
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Nodes Used**: `EmbeddingRetriever`, `BM25Retriever`, `JoinDocuments`, `SentenceTransformersRanker` and `InMemoryDocumentStore`
- **Goal**: After completing this tutorial, you will have learned about creating your first hybrid retrieval and when it's useful.

> This tutorial is based on Haystack 1.x. If you're using Haystack 2.0 and would like to follow the updated version of this tutorial, check out [Creating a Hybrid Pipeline](https://haystack.deepset.ai/tutorials/33_hybrid_retrieval). 
>
> For more information on Haystack 2.0, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release).

## Overview


**Hybrid Retrieval** merges dense and sparse vectors together to deliver the best of both search methods. Generally speaking, dense vectors excel at understanding the context of the query, whereas sparse vectors excel at keyword matches.

There are many cases when a simple sparse retrieval like BM25 performs better than a dense retrieval (for example in a specific domain like healthcare) because a dense encoder model needs to be trained on data. For more details about Hybrid Retrieval, check out [Blog Post: Hybrid Document Retrieval](https://haystack.deepset.ai/blog/hybrid-retrieval).

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install "datasets>=2.6.1"
pip install farm-haystack[inference]
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(26)
```

## Creating a Hybrid Retrieval Pipeline

### 1) Initialize the DocumentStore and Clean Documents


You'll start creating a hybrid pipeline by initializing a DocumentStore and preprocessing documents before storing them in the DocumentStore.

You will use the PubMed Abstracts as Documents. There are a lot of datasets from PubMed on Hugging Face Hub; you will use [anakin87/medrag-pubmed-chunk](https://huggingface.co/datasets/anakin87/medrag-pubmed-chunk) in this tutorial.

Initialize `InMemoryDocumentStore` and don't forget to set `use_bm25=True` and the dimension of your embeddings in `embedding_dim`:


```python
from datasets import load_dataset
from haystack.document_stores import InMemoryDocumentStore

dataset = load_dataset("anakin87/medrag-pubmed-chunk", split="train")

document_store = InMemoryDocumentStore(use_bm25=True, embedding_dim=384)
```

You can create your document list with a simple for loop.
The data has 3 features:
* *pmid*
* *title*
* *content*: the abstract
* *contents*: abstract + title

For searching, you will use the *contents* feature. The other features will be stored as metadata, and you will use them to have a **pretty print** of the search results.



```python
from haystack.schema import Document

docs = []
for doc in dataset:
    docs.append(
        Document(content=doc["contents"], meta={"title": doc["title"], "abstract": doc["content"], "pmid": doc["id"]})
    )
```

The PreProcessor class is designed to help you clean and split text into sensible units.

> To learn about the preprocessing step, check out [Tutorial: Preprocessing Your Documents](https://haystack.deepset.ai/tutorials/08_preprocessing).




```python
from haystack.nodes import PreProcessor

preprocessor = PreProcessor(
    clean_empty_lines=True,
    clean_whitespace=True,
    clean_header_footer=True,
    split_by="word",
    split_length=512,
    split_overlap=32,
    split_respect_sentence_boundary=True,
)
```


```python
docs_to_index = preprocessor.process(docs)
```

### 2) Initialize the Retrievers

Initialize a sparse retriever using [BM25](https://docs.haystack.deepset.ai/docs/retriever#bm25-recommended) and a dense retriever using a [sentence-transformers model](https://docs.haystack.deepset.ai/docs/retriever#embedding-retrieval-recommended).


```python
from haystack.nodes import EmbeddingRetriever, BM25Retriever

sparse_retriever = BM25Retriever(document_store=document_store)
dense_retriever = EmbeddingRetriever(
    document_store=document_store,
    embedding_model="sentence-transformers/all-MiniLM-L6-v2",
    use_gpu=True,
    scale_score=False,
)
```

### 3) Write Documents and Update Embeddings

Write documents to the DocumentStore, first by deleting any remaining documents and then calling `write_documents()`. The `update_embeddings()` method uses the given retriever to create an embedding for each document.


```python
document_store.delete_documents()
document_store.write_documents(docs_to_index)
document_store.update_embeddings(retriever=dense_retriever)
```

### 4) Initialize JoinDocuments and Ranker

While exploring hybrid search, we needed a way to combine the results of BM25 and dense vector search into a single ranked list. It may not be obvious how to combine them:

* Different retrievers use incompatible score types, like BM25 and cosine similarity.
* Documents may come from single or multiple sources at the same time. There should be a way to deal with duplicates in the final ranking.

The merging and ranking of the documents from different retrievers is an open problem, however, Haystack offers several methods in [`JoinDocuments`](https://docs.haystack.deepset.ai/docs/join_documents). Here, you will use the simplest, `concatenate`, and pass the task to the ranker.

Use a [re-ranker based on a cross-encoder](https://docs.haystack.deepset.ai/docs/ranker#sentencetransformersranker) that scores the relevancy of all candidates for the given search query.
For more information about the `Ranker`, check the Haystack [docs](https://docs.haystack.deepset.ai/docs/ranker).


```python
from haystack.nodes import JoinDocuments, SentenceTransformersRanker

join_documents = JoinDocuments(join_mode="concatenate")
rerank = SentenceTransformersRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-6-v2")
```

### 5) Create the Hybrid Retrieval Pipeline

With a Haystack `Pipeline`, you can connect your building blocks into a search pipeline. Under the hood, `Pipelines` are Directed Acyclic Graphs (DAGs) that you can easily customize for your own use cases.
You can learn more about Pipelines in the [docs](https://docs.haystack.deepset.ai/docs/pipelines).


```python
from haystack.pipelines import Pipeline

pipeline = Pipeline()
pipeline.add_node(component=sparse_retriever, name="SparseRetriever", inputs=["Query"])
pipeline.add_node(component=dense_retriever, name="DenseRetriever", inputs=["Query"])
pipeline.add_node(component=join_documents, name="JoinDocuments", inputs=["SparseRetriever", "DenseRetriever"])
pipeline.add_node(component=rerank, name="ReRanker", inputs=["JoinDocuments"])
```

### Generating a Pipeline Diagram

With any Pipeline, whether prebuilt or custom constructed, you can save a diagram showing how all the components are connected. For example, the hybrid pipeline should look like this:


```python
# Uncomment the following to generate the images
# !apt install libgraphviz-dev
# !pip install pygraphviz

# pipeline.draw("pipeline_hybrid.png")
```

## Trying Out the Hybrid Pipeline

Search an article with Hybrid Retrieval. If you want to see all the steps, enable `debug=True` in `JoinDocuments`'s `params`.


```python
prediction = pipeline.run(
    query="apnea in infants",
    params={
        "SparseRetriever": {"top_k": 10},
        "DenseRetriever": {"top_k": 10},
        "JoinDocuments": {"top_k_join": 15},  # comment for debug
        # "JoinDocuments": {"top_k_join": 15, "debug":True}, #uncomment for debug
        "ReRanker": {"top_k": 5},
    },
)
```

Create a function to print a kind of *search page*.


```python
def pretty_print_results(prediction):
    for doc in prediction["documents"]:
        print(doc.meta["title"], "\t", doc.score)
        print(doc.meta["abstract"])
        print("\n", "\n")
```


```python
pretty_print_results(prediction)
```
