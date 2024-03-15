---
layout: tutorial
featured: True
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/22_Pipeline_with_PromptNode.ipynb
toc: True
title: "Creating a Generative QA Pipeline with Retrieval-Augmentation"
lastmod: "2024-03-12"
level: "intermediate"
weight: 61
description: Use a large language model in your search system through PromptNode
category: "QA"
aliases: ['/tutorials/pipeline-with-promptnode', '/tutorials/retrieval-augmented-generation']
download: "/downloads/22_Pipeline_with_PromptNode.ipynb"
completion_time: 15 min
created_at: 2023-03-13
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Nodes Used**: `InMemoryDocumentStore`, `BM25Retriever`, `PromptNode`, `PromptTemplate`
- **Goal**: After completing this tutorial, you'll have created a generative question answering search system that uses a large language model through PromptNode with PromptTemplate.

> This tutorial is based on Haystack 1.x. If you're using Haystack 2.0 and would like to follow the updated version of this tutorial, check out [Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline). 
>
> For more information on Haystack 2.0, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release).

## Overview

Learn how to build a generative question answering pipeline using the power of LLMs with PromptNode. In this generative pipeline, BM25Retriever gets the related Documents, and PromptNode generates the answer using the retrieval augmented generation ([RAG](https://www.deepset.ai/blog/llms-retrieval-augmentation)) approach. In this tutorial, we'll use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World) as Documents, but you can replace them with any text you want.

This tutorial introduces you to the PrompTemplate structure and explains how to use the new PrompTemplate to integrate PromptNode into a pipeline.

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab]
pip install "datasets>=2.6.1"
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(22)
```

## Initializing the DocumentStore

We'll start creating our question answering system by initializing a DocumentStore. A DocumentStore stores the Documents that the question answering system uses to find answers to your questions. In this tutorial, we're using the `InMemoryDocumentStore`.

Let's initialize our DocumentStore.


```python
from haystack.document_stores import InMemoryDocumentStore

document_store = InMemoryDocumentStore(use_bm25=True)
```

> `InMemoryDocumentStore` is the simplest DocumentStore to get started with. It requires no external dependencies and it's a good option for smaller projects and debugging. But it doesn't scale up so well to larger Document collections, so it's not a good choice for production systems. To learn more about the DocumentStore and the different types of external databases that we support, see [DocumentStore](https://docs.haystack.deepset.ai/docs/document_store).

The DocumentStore is now ready. Now it's time to fill it with some Documents.

## Fetching and Writing Documents

We'll use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World) as Documents. We preprocessed the data and uploaded to a Hugging Face Space: [Seven Wonders](https://huggingface.co/datasets/bilgeyucel/seven-wonders). Thus, we don't need to perform any additional cleaning or splitting.

Let's fetch the data and write it to the DocumentStore:


```python
from datasets import load_dataset

dataset = load_dataset("bilgeyucel/seven-wonders", split="train")

document_store.write_documents(dataset)
```

## Initializing the Retriever

Let's initialize a BM25Retriever and make it use the InMemoryDocumentStore we initialized earlier in this tutorial:


```python
from haystack.nodes import BM25Retriever

retriever = BM25Retriever(document_store=document_store, top_k=2)
```

## Initializing the PromptNode

[PromptNode](https://docs.haystack.deepset.ai/docs/prompt_node) is the central abstraction in Haystack's large language model (LLM) support. It's possible to interact with LLMs through PromptNode by providing `model_name_or_path` and if necessary, `api_key`.

For this tutorial, we'll use OpenAI's `gpt-3.5-turbo`, so, we need to enter a `OPENAI_API_KEY`:


```python
import os
from getpass import getpass

openai_api_key = os.getenv("OPENAI_API_KEY", None) or getpass("Enter OpenAI API key:")
```

Let's define a custom prompt for PromptTemplate to use with PromptNode. As parameters, this prompt will accept `documents` that our Retriever fetched from our DocumentStore and `query` we pass at runtime. To join the content of the Documents, we'll use `join()` function. To learn about using functions in PromptTemplate, check out [PromptTemplate Structure](https://docs.haystack.deepset.ai/docs/prompt_node#prompttemplate-structure). Finally, we'll use [AnswerParser](https://docs.haystack.deepset.ai/reference/prompt-node-api#answerparser) to parse the output of the LLM into a Haystack Answer object.

We'll initialize PromptNode with the PromptTemplate, the `gpt-3.5-turbo` model and the `api_key`.


```python
from haystack.nodes import PromptNode, PromptTemplate, AnswerParser

rag_prompt = PromptTemplate(
    prompt="""Synthesize a comprehensive answer from the following text for the given question.
                             Provide a clear and concise response that summarizes the key points and information presented in the text.
                             Your answer should be in your own words and be no longer than 50 words.
                             \n\n Related text: {join(documents)} \n\n Question: {query} \n\n Answer:""",
    output_parser=AnswerParser(),
)

prompt_node = PromptNode(model_name_or_path="gpt-3.5-turbo", api_key=openai_api_key, default_prompt_template=rag_prompt)
```

>To learn about how to use custom templates with PromptNode, check out [Customizing PromptNode for NLP Tasks](https://haystack.deepset.ai/tutorials/21_customizing_promptnode) tutorial.

## Defining the Pipeline

We'll use a custom pipeline with the Retriever, and PromptNode.


```python
from haystack.pipelines import Pipeline

pipe = Pipeline()
pipe.add_node(component=retriever, name="retriever", inputs=["Query"])
pipe.add_node(component=prompt_node, name="prompt_node", inputs=["retriever"])
```

That's it! The pipeline's ready to generate answers to questions!

## Asking a Question

We use the pipeline `run()` method to ask a question.


```python
output = pipe.run(query="What does Rhodes Statue look like?")

print(output["answers"][0].answer)
```

Here are some other example queries to test:


```python
examples = [
    "Where is Gardens of Babylon?",
    "Why did people build Great Pyramid of Giza?",
    "What does Rhodes Statue look like?",
    "Why did people visit the Temple of Artemis?",
    "What is the importance of Colossus of Rhodes?",
    "What happened to the Tomb of Mausolus?",
    "How did Colossus of Rhodes collapse?",
]
```

🎉 Congratulations! You've learned how to create a generative QA system for your documents with PromptNode.
