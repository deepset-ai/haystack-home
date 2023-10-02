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

These are the instructions for installing Haystack. The most straightforward way to install the latest release of Haystack is through [pip](https://github.com/pypa/pip).

{{< tabs totalTabs="3">}}

{{< tab tabName="Minimal Install"  >}}

This command installs everything needed for basic Pipelines that use an InMemoryDocumentStore and external LLM provider (e.g. OpenAI).

```python
pip install farm-haystack
```

{{< /tab >}}

{{< tab tabName="Basic Install"  >}}

This command installs everything you need for basic Pipelines that use an InMemoryDocumentStore, as well as all necessary dependencies for model inference on local machine, including torch.

```python
pip install farm-haystack[inference]
```

{{< /tab >}}

{{< tab tabName="Full Install" >}}

This command installs further dependencies for more advanced features, like certain DocumentStores, FileConverters, OCR, or Ray.

```python
pip install --upgrade pip
pip install 'farm-haystack[all]' ## or 'all-gpu' for the GPU-enabled dependencies
```

{{< /tab >}}
{{< /tabs >}}

For a more comprehensive installation guide, inlcuding methods for various operating systems, refer to our documentation.

{{< button url="https://docs.haystack.deepset.ai/docs/installation" text="Docs: Installation" color="green">}}

## Build Your First RAG Pipeline

Haystack is built around the concept of pipelines. A pipeline is a powerful structure made up of components that can be used to perform a task.
For example, you can connect together a Retriever and a PromptNode to build a Generative Question Answering pipeline.

To try out how Haystack answers questions about Game of Thrones using **Retrieval Augmented Generation (RAG)** approach, run the code below by providing an API key for your model.

```bash
# Minimal Haystack Installation
pip install farm-haystack
```

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

For a hands-on guide to build your first RAG Pipeline, see our tutorial.

{{< button url="https://haystack.deepset.ai/tutorials/22_pipeline_with_promptnode" text="Tutorial: Creating a RAG Pipeline" color="green">}}
