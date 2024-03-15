---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "1.17.2"
haystack_2: False
hidden: True
sitemap_exclude: True
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/12_LFQA.ipynb
toc: True
title: "Generative QA with Seq2SeqGenerator"
lastmod: "2023-08-03"
level: "intermediate"
weight: 70
description: Try out a generative model in place of the extractive Reader.
category: "QA"
aliases: ['/tutorials/lfqa']
download: "/downloads/12_LFQA.ipynb"
completion_time: False
created_at: 2021-08-12
---
    


> As of version 1.16, `Seq2SeqGenerator` has been deprecated in Haystack and completely removed from Haystack as of v1.18. We recommend following the tutorial on [Creating a Generative QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/22_pipeline_with_promptnode) instead. For more details about this deprecation, check out [our announcement](https://github.com/deepset-ai/haystack/discussions/4816) on Github.

Follow this tutorial to learn how to build and use a pipeline for Long-Form Question Answering (LFQA). LFQA is a variety of the generative question answering task. LFQA systems query large document stores for relevant information and then use this information to generate accurate, multi-sentence answers. In a regular question answering system, the retrieved documents related to the query (context passages) act as source tokens for extracted answers. In an LFQA system, context passages provide the context the system uses to generate original, abstractive, long-form answers.


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

tutorial_running(12)
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

document_store = FAISSDocumentStore(embedding_dim=128, faiss_index_factory_str="Flat")
```

## Cleaning and Writing Documents

Similarly to the previous tutorials, we download, convert and write some Game of Thrones articles to our DocumentStore.


```python
from haystack.utils import convert_files_to_docs, fetch_archive_from_http, clean_wiki_text


# Let's first get some files that we want to use
doc_dir = "data/tutorial12"
s3_url = "https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-qa/datasets/documents/wiki_gameofthrones_txt12.zip"
fetch_archive_from_http(url=s3_url, output_dir=doc_dir)

# Convert files to dicts
docs = convert_files_to_docs(dir_path=doc_dir, clean_func=clean_wiki_text, split_paragraphs=True)

# Now, let's write the dicts containing documents to our DB.
document_store.write_documents(docs)
```

## Initializing the Retriever

We use a `DensePassageRetriever` and we invoke `update_embeddings` to index the embeddings of documents in the `FAISSDocumentStore`.


```python
from haystack.nodes import DensePassageRetriever

retriever = DensePassageRetriever(
    document_store=document_store,
    query_embedding_model="vblagoje/dpr-question_encoder-single-lfqa-wiki",
    passage_embedding_model="vblagoje/dpr-ctx_encoder-single-lfqa-wiki",
)

document_store.update_embeddings(retriever)
```

Before we blindly use the `DensePassageRetriever` let's empirically test it to make sure a simple search indeed finds the relevant documents.


```python
from haystack.utils import print_documents
from haystack.pipelines import DocumentSearchPipeline

p_retrieval = DocumentSearchPipeline(retriever)
res = p_retrieval.run(query="Tell me something about Arya Stark?", params={"Retriever": {"top_k": 10}})
print_documents(res, max_text_len=512)
```

## Initializing the Generator

Similar to previous Tutorials we now initalize our Generator.

Here we use a `Seq2SeqGenerator` with the [*vblagoje/bart_lfqa*](https://huggingface.co/vblagoje/bart_lfqa) model.


```python
from haystack.nodes import Seq2SeqGenerator


generator = Seq2SeqGenerator(model_name_or_path="vblagoje/bart_lfqa")
```

## Initializing the Pipeline

With a Haystack `Pipeline` you can stick together your building blocks to a search pipeline.
Under the hood, `Pipelines` are Directed Acyclic Graphs (DAGs) that you can easily customize for your own use cases.
To speed things up, Haystack also comes with a few predefined Pipelines. One of them is the `GenerativeQAPipeline` that combines a Retriever and a Generator to answer our questions.
You can learn more about `Pipelines` in the [docs](https://docs.haystack.deepset.ai/docs/pipelines).


```python
from haystack.pipelines import GenerativeQAPipeline

pipe = GenerativeQAPipeline(generator, retriever)
```

## Asking a Question
We use the pipeline `run()` method to ask a question.


```python
pipe.run(
    query="How did Arya Stark's character get portrayed in a television adaptation?", params={"Retriever": {"top_k": 3}}
)
```


```python
pipe.run(query="Why is Arya Stark an unusual character?", params={"Retriever": {"top_k": 3}})
```
