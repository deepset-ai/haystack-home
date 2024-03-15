---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/06_Better_Retrieval_via_Embedding_Retrieval.ipynb
toc: True
title: "Better Retrieval with Embedding Retrieval"
lastmod: "2024-03-12"
level: "intermediate"
weight: 55
description: Use Transformer based dense Retrievers to improve your system’s performance.
category: "QA"
aliases: ['/tutorials/embedding-retrieval']
download: "/downloads/06_Better_Retrieval_via_Embedding_Retrieval.ipynb"
completion_time: False
created_at: 2022-03-08
---
    


> This tutorial is based on Haystack 1.x. If you're using Haystack 2.0 and would like to follow the updated version of this tutorial, check out [Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline) and [Build an Extractive QA Pipeline](https://haystack.deepset.ai/tutorials/34_extractive_qa_pipeline). 
>
> For more information on Haystack 2.0, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release).

### Importance of Retrievers

The Retriever has a huge impact on the performance of our overall search pipeline.


### Different types of Retrievers
#### Sparse
Family of algorithms based on counting the occurrences of words (bag-of-words) resulting in very sparse vectors with length = vocab size.

**Examples**: BM25, TF-IDF

**Pros**: Simple, fast, well explainable

**Cons**: Relies on exact keyword matches between query and text
 

#### Dense
These retrievers use neural network models to create "dense" embedding vectors. Within this family, there are two different approaches:

a) Single encoder: Use a **single model** to embed both the query and the passage.
b) Dual-encoder: Use **two models**, one to embed the query and one to embed the passage.

**Examples**: REALM, DPR, Sentence-Transformers

**Pros**: Captures semantic similarity instead of "word matches" (for example, synonyms, related topics).

**Cons**: Computationally more heavy to use, initial training of the model (though this is less of an issue nowadays as many pre-trained models are available and most of the time, it's not needed to train the model).


### Embedding Retrieval

In this Tutorial, we use an `EmbeddingRetriever` with [Sentence Transformers](https://www.sbert.net/index.html) models.

These models are trained to embed similar sentences close to each other in a shared embedding space.

Some models have been fine-tuned on massive Information Retrieval data and can be used to retrieve documents based on a short query (for example, `multi-qa-mpnet-base-dot-v1`). There are others that are more suited to semantic similarity tasks where you are trying to find the most similar documents to a given document (for example, `all-mpnet-base-v2`). There are even models that are multilingual (for example, `paraphrase-multilingual-mpnet-base-v2`). For a good overview of different models with their evaluation metrics, see the [Pretrained Models](https://www.sbert.net/docs/pretrained_models.html#) in the Sentence Transformers documentation.



## Preparing the Colab Environment

- [Enable GPU Runtime](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)


## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,faiss,inference]
```

### Enabling Telemetry 
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(6)
```

## Logging

We configure how logging messages should be displayed and which log level should be used before importing Haystack.
Example log message:
INFO - haystack.utils.preprocessing -  Converting data/tutorial1/218_Olenna_Tyrell.txt
Default log level in basicConfig is WARNING so the explicit parameter is not necessary but can be changed easily:


```python
import logging

logging.basicConfig(format="%(levelname)s - %(name)s -  %(message)s", level=logging.WARNING)
logging.getLogger("haystack").setLevel(logging.INFO)
```

## Initializing the DocumentStore

FAISS is a library for efficient similarity search on a cluster of dense vectors.
The `FAISSDocumentStore` uses a SQL(SQLite in-memory be default) database under-the-hood
to store the document text and other meta data. The vector embeddings of the text are
indexed on a FAISS Index that later is queried for searching answers.
The default flavour of FAISSDocumentStore is "Flat" but can also be set to "HNSW" for
faster search at the expense of some accuracy. Just set the faiss_index_factor_str argument in the constructor.
For more info on which suits your use case: https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index


```python
from haystack.document_stores import FAISSDocumentStore

document_store = FAISSDocumentStore(sql_url="sqlite:///", faiss_index_factory_str="Flat")
```

### Option 2: Milvus

> As of version 1.15, MilvusDocumentStore has been deprecated in Haystack. It is deleted from the haystack repository as of version 1.17 and moved to [haystack-extras](https://github.com/deepset-ai/haystack-extras/tree/main). For more details, check out [Deprecation of MilvusDocumentStore](https://github.com/deepset-ai/haystack/discussions/4785).

Milvus is an open source database library that is also optimized for vector similarity searches like FAISS.
Like FAISS it has both a "Flat" and "HNSW" mode but it outperforms FAISS when it comes to dynamic data management.
It does require a little more setup, however, as it is run through Docker and requires the setup of some config files.
See [their docs](https://milvus.io/docs/v1.0.0/milvus_docker-cpu.md) for more details.


```python
# Milvus cannot be run on Colab, so this cell is commented out.
# To run Milvus you need Docker (versions below 2.0.0) or a docker-compose (versions >= 2.0.0), neither of which is available on Colab.
# See Milvus' documentation for more details: https://milvus.io/docs/install_standalone-docker.md

# !pip install farm-haystack[milvus]==1.16.1

# from haystack.utils import launch_milvus
# from haystack.document_stores import MilvusDocumentStore

# launch_milvus()
# document_store = MilvusDocumentStore()
```

## Cleaning and Writing Documents

Similarly to the previous tutorials, we download, convert and write some Game of Thrones articles to our DocumentStore.


```python
from haystack.utils import clean_wiki_text, convert_files_to_docs, fetch_archive_from_http


# Let's first get some files that we want to use
doc_dir = "data/tutorial6"
s3_url = "https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-qa/datasets/documents/wiki_gameofthrones_txt6.zip"
fetch_archive_from_http(url=s3_url, output_dir=doc_dir)

# Convert files to dicts
docs = convert_files_to_docs(dir_path=doc_dir, clean_func=clean_wiki_text, split_paragraphs=True)

# Now, let's write the dicts containing documents to our DB.
document_store.write_documents(docs)
```

## Initializing the Retriever

**Here:** We use an `EmbeddingRetriever`.

**Alternatives:**

- `BM25Retriever` with custom queries (for example, boosting) and filters
- `DensePassageRetriever` which uses two encoder models, one to embed the query and one to embed the passage, and then compares the embedding for retrieval
- `TfidfRetriever` in combination with a SQL or InMemory DocumentStore for simple prototyping and debugging


```python
from haystack.nodes import EmbeddingRetriever

retriever = EmbeddingRetriever(
    document_store=document_store, embedding_model="sentence-transformers/multi-qa-mpnet-base-dot-v1"
)
# Important:
# Now that we initialized the Retriever, we need to call update_embeddings() to iterate over all
# previously indexed documents and update their embedding representation.
# While this can be a time consuming operation (depending on the corpus size), it only needs to be done once.
# At query time, we only need to embed the query and compare it to the existing document embeddings, which is very fast.
document_store.update_embeddings(retriever)
```

## Initializing the Reader

Similar to previous tutorials we now initalize our Reader.

Here we use a FARMReader with the [*deepset/roberta-base-squad2*](https://huggingface.co/deepset/roberta-base-squad2) model.


```python
from haystack.nodes import FARMReader

reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=True)
```

## Initializing the Pipeline

With a Haystack `Pipeline` you can stick together your building blocks to a search pipeline.
Under the hood, `Pipelines` are Directed Acyclic Graphs (DAGs) that you can easily customize for your own use cases.
To speed things up, Haystack also comes with a few predefined Pipelines. One of them is the `ExtractiveQAPipeline` that combines a retriever and a reader to answer our questions.
You can learn more about `Pipelines` in the [docs](https://docs.haystack.deepset.ai/docs/pipelines).


```python
from haystack.pipelines import ExtractiveQAPipeline

pipe = ExtractiveQAPipeline(reader, retriever)
```

## Asking a Question

We use the pipeline `run()` method to ask a question. With the `run()` method, you can configure how many candidates the Reader and Retriever shall return. The higher top_k for Retriever, the better (but also the slower) your answers.


```python
prediction = pipe.run(
    query="Who created the Dothraki vocabulary?", params={"Retriever": {"top_k": 10}, "Reader": {"top_k": 5}}
)
```


```python
from haystack.utils import print_answers


print_answers(prediction, details="minimum")
```
