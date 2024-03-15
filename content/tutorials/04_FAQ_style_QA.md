---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/04_FAQ_style_QA.ipynb
toc: True
title: "Utilizing Existing FAQs for Question Answering"
lastmod: "2023-06-29"
level: "beginner"
weight: 20
description: Create a smarter way to answer new questions using your existing FAQ documents.
category: "QA"
aliases: ['/tutorials/existing-faqs']
download: "/downloads/04_FAQ_style_QA.ipynb"
completion_time: False
created_at: 2021-08-12
---
    

- **Level**: Beginner
- **Time to complete**: 15 minutes
- **Nodes Used**: `InMemoryDocumentStore`, `EmbeddingRetriever`
- **Goal**: Learn how to use the `EmbeddingRetriever` in a `FAQPipeline` to answer incoming questions by matching them to the most similar questions in your existing FAQ.

# Overview
While *extractive Question Answering* works on pure texts and is therefore more generalizable, there's also a common alternative that utilizes existing FAQ data.

**Pros**:

- Very fast at inference time
- Utilize existing FAQ data
- Quite good control over answers

**Cons**:

- Generalizability: We can only answer questions that are similar to existing ones in FAQ

In some use cases, a combination of extractive QA and FAQ-style can also be an interesting option.


## Preparing the Colab Environment

- [Enable GPU Runtime](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)


## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,inference]
```

### Enabling Telemetry 
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(4)
```

Set the logging level to INFO:


```python
import logging

logging.basicConfig(format="%(levelname)s - %(name)s -  %(message)s", level=logging.WARNING)
logging.getLogger("haystack").setLevel(logging.INFO)
```

### Create a simple DocumentStore
The InMemoryDocumentStore is good for quick development and prototyping. For more scalable options, check-out the [docs](https://docs.haystack.deepset.ai/docs/document_store).


```python
from haystack.document_stores import InMemoryDocumentStore

document_store = InMemoryDocumentStore()
```

### Create a Retriever using embeddings
Instead of retrieving via Elasticsearch's plain BM25, we want to use vector similarity of the questions (user question vs. FAQ ones).
We can use the `EmbeddingRetriever` for this purpose and specify a model that we use for the embeddings.


```python
from haystack.nodes import EmbeddingRetriever

retriever = EmbeddingRetriever(
    document_store=document_store,
    embedding_model="sentence-transformers/all-MiniLM-L6-v2",
    use_gpu=True,
    scale_score=False,
)
```

### Prepare & Index FAQ data
We create a pandas dataframe containing some FAQ data (i.e curated pairs of question + answer) and index those in our documentstore.
Here: We download some question-answer pairs related to COVID-19


```python
import pandas as pd

from haystack.utils import fetch_archive_from_http


# Download
doc_dir = "data/tutorial4"
s3_url = "https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-qa/datasets/documents/small_faq_covid.csv.zip"
fetch_archive_from_http(url=s3_url, output_dir=doc_dir)

# Get dataframe with columns "question", "answer" and some custom metadata
df = pd.read_csv(f"{doc_dir}/small_faq_covid.csv")
# Minimal cleaning
df.fillna(value="", inplace=True)
df["question"] = df["question"].apply(lambda x: x.strip())
print(df.head())

# Create embeddings for our questions from the FAQs
# In contrast to most other search use cases, we don't create the embeddings here from the content of our documents,
# but rather from the additional text field "question" as we want to match "incoming question" <-> "stored question".
questions = list(df["question"].values)
df["embedding"] = retriever.embed_queries(queries=questions).tolist()
df = df.rename(columns={"question": "content"})

# Convert Dataframe to list of dicts and index them in our DocumentStore
docs_to_index = df.to_dict(orient="records")
document_store.write_documents(docs_to_index)
```

### Ask questions
Initialize a Pipeline (this time without a reader) and ask questions


```python
from haystack.pipelines import FAQPipeline

pipe = FAQPipeline(retriever=retriever)
```


```python
from haystack.utils import print_answers

# Run any question and change top_k to see more or less answers
prediction = pipe.run(query="How is the virus spreading?", params={"Retriever": {"top_k": 1}})

print_answers(prediction, details="medium")
```
