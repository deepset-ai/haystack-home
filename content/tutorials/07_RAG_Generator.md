---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "1.17.2"
haystack_2: False
hidden: True
sitemap_exclude: True
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/07_RAG_Generator.ipynb
toc: True
title: "Generative QA with RAGenerator"
lastmod: "2023-08-03"
level: "intermediate"
weight: 60
description: Try out a generative model in place of the extractive Reader.
category: "QA"
aliases: []
download: "/downloads/07_RAG_Generator.ipynb"
completion_time: False
created_at: 2021-08-12
---
    


> As of version 1.16, `RAGenerator` has been deprecated in Haystack and completely removed from Haystack as of v1.18. We recommend following the tutorial on [Creating a Generative QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/22_pipeline_with_promptnode) instead. For more details about this deprecation, check out [our announcement](https://github.com/deepset-ai/haystack/discussions/4816) on Github.

While extractive QA highlights the span of text that answers a query,
generative QA can return a novel text answer that it has composed.
In this tutorial, you will learn how to set up a generative system using the
[RAG model](https://arxiv.org/abs/2005.11401) which conditions the
answer generator on a set of retrieved documents.


## Preparing the Colab Environment

- [Enable GPU Runtime](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)


## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,faiss]==1.17.2
```

### Enabling Telemetry 
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(7)
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

## Fetching and Cleaning Documents

Let's download a csv containing some sample text and preprocess the data.



```python
import pandas as pd
from haystack.utils import fetch_archive_from_http

# Download sample
doc_dir = "data/tutorial7/"
s3_url = "https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-qa/datasets/small_generator_dataset.csv.zip"
fetch_archive_from_http(url=s3_url, output_dir=doc_dir)

# Create dataframe with columns "title" and "text"
df = pd.read_csv(f"{doc_dir}/small_generator_dataset.csv", sep=",")
# Minimal cleaning
df.fillna(value="", inplace=True)

print(df.head())
```

We can cast our data into Haystack Document objects.
Alternatively, we can also just use dictionaries with "text" and "meta" fields


```python
from haystack import Document

# Use data to initialize Document objects
titles = list(df["title"].values)
texts = list(df["text"].values)
documents = []
for title, text in zip(titles, texts):
    documents.append(Document(content=text, meta={"name": title or ""}))
```

## Initializing the DocumentStore

Here we initialize the FAISSDocumentStore. Set `return_embedding` to `True`, so Generator doesn't have to perform re-embedding


```python
from haystack.document_stores import FAISSDocumentStore

document_store = FAISSDocumentStore(faiss_index_factory_str="Flat", return_embedding=True)
```

## Initializing the Retriever

We initialize DensePassageRetriever to encode documents, encode question and query documents.


```python
from haystack.nodes import RAGenerator, DensePassageRetriever

retriever = DensePassageRetriever(
    document_store=document_store,
    query_embedding_model="facebook/dpr-question_encoder-single-nq-base",
    passage_embedding_model="facebook/dpr-ctx_encoder-single-nq-base",
    use_gpu=True,
    embed_title=True,
)
```

## Initializing the Generator

We initialize RAGenerator to generate answers from retrieved Documents.


```python
generator = RAGenerator(
    model_name_or_path="facebook/rag-token-nq",
    use_gpu=True,
    top_k=1,
    max_length=200,
    min_length=2,
    embed_title=True,
    num_beams=2,
)
```

## Writing Documents

We write documents to the DocumentStore, first by deleting any remaining documents then calling `write_documents()`.
The `update_embeddings()` method uses the retriever to create an embedding for each document.



```python
# Delete existing documents in documents store
document_store.delete_documents()

# Write documents to document store
document_store.write_documents(documents)

# Add documents embeddings to index
document_store.update_embeddings(retriever=retriever)
```

## Initializing the Pipeline

With a Haystack `Pipeline` you can stick together your building blocks to a search pipeline.
Under the hood, `Pipelines` are Directed Acyclic Graphs (DAGs) that you can easily customize for your own use cases.
To speed things up, Haystack also comes with a few predefined Pipelines. One of them is the `ExtractiveQAPipeline` that combines a retriever and a reader to answer our questions.
You can learn more about `Pipelines` in the [docs](https://docs.haystack.deepset.ai/docs/pipelines).


```python
from haystack.pipelines import GenerativeQAPipeline

pipe = GenerativeQAPipeline(generator=generator, retriever=retriever)
```

## Asking a Question

Now let's ask questions to our system!
The Retriever will pick out a small subset of documents that it finds relevant.
These are used to condition the Generator as it generates the answer.
What it should return then are novel text spans that form and answer to your question!


```python
from haystack.utils import print_answers

QUESTIONS = [
    "who got the first nobel prize in physics",
    "when is the next deadpool movie being released",
    "which mode is used for short wave broadcast service",
    "who is the owner of reading football club",
    "when is the next scandal episode coming out",
    "when is the last time the philadelphia won the superbowl",
    "what is the most current adobe flash player version",
    "how many episodes are there in dragon ball z",
    "what is the first step in the evolution of the eye",
    "where is gall bladder situated in human body",
    "what is the main mineral in lithium batteries",
    "who is the president of usa right now",
    "where do the greasers live in the outsiders",
    "panda is a national animal of which country",
    "what is the name of manchester united stadium",
]

for question in QUESTIONS:
    res = pipe.run(query=question, params={"Generator": {"top_k": 1}, "Retriever": {"top_k": 5}})
    print_answers(res, details="minimum")
```
