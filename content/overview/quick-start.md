---
layout: overview
header: dark
footer: dark
title: Quick Start
description: Guide to setting up and installing Haystack. 
weight: 2
toc: true
aliases: [get-started]
---

<!-- ## Haystack Source Code

Haystack is an open source Python framework that helps developers build LLM empowered custom application.

You can find the source code for Haystack on GitHub. This is also the main channel for raising issues, asking questions and contributing to the project.

{{< button url="https://github.com/deepset-ai/haystack" text="View Source Code" color="green">}} -->

## Installation

Use [pip](https://github.com/pypa/pip) to install the latest Haystack release:

{{< tabs totalTabs="4">}}

{{< tab tabName="Minimal"  >}}

This command installs everything needed for basic Pipelines using InMemoryDocumentStore and an external LLM provider (for example, OpenAI). Use this installation method for basic features such as keyword-based retrieval, web search and text generation with LLMs including generative question answering.

```python
pip install farm-haystack
```

{{< /tab >}}

{{< tab tabName="Basic"  >}}

This command installs everything needed for basic Pipelines using InMemoryDocumentStore, and necessary dependencies for model inference on a local machine, including torch. Use this installation option for features such as document retrieval with semantic similarity and extractive question answering.

```python
pip install 'farm-haystack[inference]'
```

{{< /tab >}}

{{< tab tabName="Custom" >}}

This command installs given dependencies. Use this installation option when you are using various features of Haystack and want to keep the dependency list as small as possible. 

```python
pip install 'farm-haystack[DEPENDENCY_OPTION_1, DEPENDENCY_OPTION_2, DEPENDENCY_OPTION_3...]'
```

For the full list of dependency options, read [Custom Installation](https://docs.haystack.deepset.ai/docs/installation#custom-installation) section in the documentation.

{{< /tab >}}

{{< tab tabName="Full" >}}

This command installs all dependencies required for all document stores, file converters, OCR, Ray and more. Use this installation option if you don't want to install dependencies separately or if you're still experimenting with Haystack and don't have a final list of features you want to use in your application.

```python
pip install 'farm-haystack[all]' ## or 'all-gpu' for the GPU-enabled dependencies
```

{{< /tab >}}
{{< /tabs >}}

For a more comprehensive installation guide, including methods for various operating systems, refer to our documentation.

{{< button url="https://docs.haystack.deepset.ai/docs/installation" text="Docs: Installation" color="green">}}

## Build Your First Retrieval Augmented Generation (RAG) Pipeline

Haystack is built around the concept of pipelines. A pipeline is a powerful structure that performs an NLP task. It's made up of components connected together.
For example, you can connect a Retriever and a PromptNode to build a Generative Question Answering pipeline that uses your own data.

Try out how Haystack answers questions about Game of Thrones using the **RAG** approach 👇

Run the minimal Haystack installation:
```bash
pip install farm-haystack
```
Index your data to the DocumentStore, build a RAG pipeline, and ask a question on your data: 
```python
from haystack.document_stores import InMemoryDocumentStore
from haystack.utils import build_pipeline, add_example_data, print_answers

# We are model agnostic :) Here, you can choose from: "anthropic", "cohere", "huggingface", and "openai".
provider = "openai"
API_KEY = "sk-..." # ADD YOUR KEY HERE

# We support many different databases. Here we load a simple and lightweight in-memory database.
document_store = InMemoryDocumentStore(use_bm25=True)

# Download and add Game of Thrones TXT articles to Haystack DocumentStore.
# You can also provide a folder with your local documents.
add_example_data(document_store, "data/GoT_getting_started")

# Build a pipeline with a Retriever to get relevant documents to the query and a PromptNode interacting with LLMs using a custom prompt.
pipeline = build_pipeline(provider, API_KEY, document_store)

# Ask a question on the data you just added.
result = pipeline.run(query="Who is the father of Arya Stark?")

# For details, like which documents were used to generate the answer, look into the <result> object
print_answers(result, details="medium")
```
The output of the pipeline references the documents used to generate the answer:

```text
'Query: Who is the father of Arya Stark?'
'Answers:'
[{'answer': 'The father of Arya Stark is Lord Eddard Stark of '
                'Winterfell. [Document 1, Document 4, Document 5]'}]
```

For a hands-on guide on how to build your first RAG Pipeline, see our tutorial.

{{< button url="https://haystack.deepset.ai/tutorials/22_pipeline_with_promptnode" text="Tutorial: Creating a RAG Pipeline" color="green">}}
