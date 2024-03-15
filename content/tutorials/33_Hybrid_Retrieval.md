---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/33_Hybrid_Retrieval.ipynb
toc: True
title: "Creating a Hybrid Retrieval Pipeline"
lastmod: "2024-03-12"
level: "intermediate"
weight: 56
description: Learn how to combine keyword-based retrieval and dense retrieval to enhance retrieval
category: "QA"
aliases: []
download: "/downloads/33_Hybrid_Retrieval.ipynb"
completion_time: 15 min
created_at: 2024-02-13
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Components Used**: [`DocumentSplitter`](https://docs.haystack.deepset.ai/v2.0/docs/documentsplitter), [`SentenceTransformersDocumentEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder), [`DocumentJoiner`](https://docs.haystack.deepset.ai/v2.0/docs/documentjoiner), [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore), [`InMemoryBM25Retriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorybm25retriever), [`InMemoryEmbeddingRetriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever), and [`TransformersSimilarityRanker`](https://docs.haystack.deepset.ai/v2.0/docs/transformerssimilarityranker)
- **Prerequisites**: None
- **Goal**: After completing this tutorial, you will have learned about creating a hybrid retrieval and when it's useful.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).

## Overview

**Hybrid Retrieval** combines keyword-based and embedding-based retrieval techniques, leveraging the strengths of both approaches. In essence, dense embeddings excel in grasping the contextual nuances of the query, while keyword-based methods excel in matching keywords.

There are many cases when a simple keyword-based approaches like BM25 performs better than a dense retrieval (for example in a specific domain like healthcare) because a dense model needs to be trained on data. For more details about Hybrid Retrieval, check out [Blog Post: Hybrid Document Retrieval](https://haystack.deepset.ai/blog/hybrid-retrieval).

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/setting-the-log-level)

## Installing Haystack

Install Haystack 2.0 and other required packages with `pip`:


```bash
%%bash

pip install haystack-ai
pip install "datasets>=2.6.1"
pip install "sentence-transformers>=2.2.0"
pip install accelerate
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(33)
```

## Initializing the DocumentStore

You'll start creating your question answering system by initializing a DocumentStore. A DocumentStore stores the Documents that your system uses to find answers to your questions. In this tutorial, you'll be using the [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore).


```python
from haystack.document_stores.in_memory import InMemoryDocumentStore

document_store = InMemoryDocumentStore()
```

> `InMemoryDocumentStore` is the simplest DocumentStore to get started with. It requires no external dependencies and it's a good option for smaller projects and debugging. But it doesn't scale up so well to larger Document collections, so it's not a good choice for production systems. To learn more about the different types of external databases that Haystack supports, see [DocumentStore Integrations](https://haystack.deepset.ai/integrations?type=Document+Store&version=2.0).

## Fetching and Processing Documents

As Documents, you will use the PubMed Abstracts. There are a lot of datasets from PubMed on Hugging Face Hub; you will use [anakin87/medrag-pubmed-chunk](https://huggingface.co/datasets/anakin87/medrag-pubmed-chunk) in this tutorial.

Then, you will create Documents from the dataset with a simple for loop.
Each data point in the PubMed dataset has 4 features:
* *pmid*
* *title*
* *content*: the abstract
* *contents*: abstract + title

For searching, you will use the *contents* feature. The other features will be stored as metadata, and you will use them to have a **pretty print** of the search results or for [metadata filtering](https://docs.haystack.deepset.ai/v2.0/docs/metadata-filtering).


```python
from datasets import load_dataset
from haystack import Document

dataset = load_dataset("anakin87/medrag-pubmed-chunk", split="train")

docs = []
for doc in dataset:
    docs.append(
        Document(content=doc["contents"], meta={"title": doc["title"], "abstract": doc["content"], "pmid": doc["id"]})
    )
```

## Indexing Documents with a Pipeline

Create a pipeline to store the data in the document store with their embedding. For this pipeline, you need a [DocumentSplitter](https://docs.haystack.deepset.ai/v2.0/docs/documentsplitter) to split documents into chunks of 512 words, [SentenceTransformersDocumentEmbedder](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder) to create document embeddings for dense retrieval and [DocumentWriter](https://docs.haystack.deepset.ai/v2.0/docs/documentwriter) to write documents to the document store.

As an embedding model, you will use [BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) on Hugging Face. Feel free to test other models on Hugging Face or use another [Embedder](https://docs.haystack.deepset.ai/v2.0/docs/embedders) to switch the model provider.

> If this step takes too long for you, replace the embedding model with a smaller model such as `sentence-transformers/all-MiniLM-L6-v2` or `sentence-transformers/all-mpnet-base-v2`. Make sure that the `split_length` is updated according to your model's token limit.


```python
from haystack.components.writers import DocumentWriter
from haystack.components.embedders import SentenceTransformersDocumentEmbedder
from haystack.components.preprocessors.document_splitter import DocumentSplitter
from haystack import Pipeline
from haystack.utils import ComponentDevice

document_splitter = DocumentSplitter(split_by="word", split_length=512, split_overlap=32)
document_embedder = SentenceTransformersDocumentEmbedder(
    model="BAAI/bge-small-en-v1.5", device=ComponentDevice.from_str("cuda:0")
)
document_writer = DocumentWriter(document_store)

indexing_pipeline = Pipeline()
indexing_pipeline.add_component("document_splitter", document_splitter)
indexing_pipeline.add_component("document_embedder", document_embedder)
indexing_pipeline.add_component("document_writer", document_writer)

indexing_pipeline.connect("document_splitter", "document_embedder")
indexing_pipeline.connect("document_embedder", "document_writer")

indexing_pipeline.run({"document_splitter": {"documents": docs}})
```

Documents are stored in `InMemoryDocumentStore` with their embeddings, now it's time for creating the hybrid retrieval pipeline ✅

## Creating a Pipeline for Hybrid Retrieval

Hybrid retrieval refers to the combination of multiple retrieval methods to enhance overall performance. In the context of search systems, a hybrid retrieval pipeline executes both traditional keyword-based search and dense vector search, later ranking the results with a cross-encoder model. This combination allows the search system to leverage the strengths of different approaches, providing more accurate and diverse results.

Here are the required steps for a hybrid retrieval pipeline:

### 1) Initialize Retrievers and the Embedder

Initialize a [InMemoryEmbeddingRetriever](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever) and [InMemoryBM25Retriever](https://docs.haystack.deepset.ai/v2.0/docs/inmemorybm25retriever) to perform both dense and keyword-based retrieval. For dense retrieval, you also need a [SentenceTransformersTextEmbedder](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformerstextembedder) that computes the embedding of the search query by using the same embedding model `BAAI/bge-small-en-v1.5` that was used in the indexing pipeline:


```python
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever, InMemoryEmbeddingRetriever
from haystack.components.embedders import SentenceTransformersTextEmbedder

text_embedder = SentenceTransformersTextEmbedder(
    model="BAAI/bge-small-en-v1.5", device=ComponentDevice.from_str("cuda:0")
)
embedding_retriever = InMemoryEmbeddingRetriever(document_store)
bm25_retriever = InMemoryBM25Retriever(document_store)
```

### 2) Join Retrieval Results

Haystack offers several joining methods in [`DocumentJoiner`](https://docs.haystack.deepset.ai/v2.0/docs/documentjoiner) to be used for different use cases such as `merge` and `reciprocal_rank_fusion`. In this example, you will use the default `concatenate` mode to join the documents coming from two Retrievers as the [Ranker](https://docs.haystack.deepset.ai/v2.0/docs/rankers) will be the main component to rank the documents for relevancy.


```python
from haystack.components.joiners import DocumentJoiner

document_joiner = DocumentJoiner()
```

### 3) Rank the Results

Use the [TransformersSimilarityRanker](https://docs.haystack.deepset.ai/v2.0/docs/transformerssimilarityranker) that scores the relevancy of all retrieved documents for the given search query by using a cross encoder model. In this example, you will use [BAAI/bge-reranker-base](https://huggingface.co/BAAI/bge-reranker-base) model to rank the retrieved documents but you can replace this model with other cross-encoder models on Hugging Face.


```python
from haystack.components.rankers import TransformersSimilarityRanker

ranker = TransformersSimilarityRanker(model="BAAI/bge-reranker-base")
```

### 4) Create the Hybrid Retrieval Pipeline

Add all initialized components to your pipeline and connect them.


```python
from haystack import Pipeline

hybrid_retrieval = Pipeline()
hybrid_retrieval.add_component("text_embedder", text_embedder)
hybrid_retrieval.add_component("embedding_retriever", embedding_retriever)
hybrid_retrieval.add_component("bm25_retriever", bm25_retriever)
hybrid_retrieval.add_component("document_joiner", document_joiner)
hybrid_retrieval.add_component("ranker", ranker)

hybrid_retrieval.connect("text_embedder", "embedding_retriever")
hybrid_retrieval.connect("bm25_retriever", "document_joiner")
hybrid_retrieval.connect("embedding_retriever", "document_joiner")
hybrid_retrieval.connect("document_joiner", "ranker")
```

### 5) Visualize the Pipeline (Optional)

To understand how you formed a hybrid retrieval pipeline, use [draw()](https://docs.haystack.deepset.ai/v2.0/docs/drawing-pipeline-graphs) method of the pipeline. If you're running this notebook on Google Colab, the generate file will be saved in "Files" section on the sidebar.


```python
hybrid_retrieval.draw("hybrid-retrieval.png")
```

## Testing the Hybrid Retrieval

Pass the query to `text_embedder`, `bm25_retriever` and `ranker` and run the retrieval pipeline:



```python
query = "apnea in infants"

result = hybrid_retrieval.run(
    {"text_embedder": {"text": query}, "bm25_retriever": {"query": query}, "ranker": {"query": query}}
)
```

### Pretty Print the Results
Create a function to print a kind of *search page*.


```python
def pretty_print_results(prediction):
    for doc in prediction["documents"]:
        print(doc.meta["title"], "\t", doc.score)
        print(doc.meta["abstract"])
        print("\n", "\n")
```


```python
pretty_print_results(result["ranker"])
```

## What's next

🎉 Congratulations! You've create a hybrid retrieval pipeline!

If you'd like to use this retrieval method in a RAG pipeline, check out [Tutorial: Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline) to learn about the next steps.

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=tutorial&utm_medium=hybrid-retrieval) or [join Haystack discord community](https://discord.gg/haystack).

Thanks for reading!
