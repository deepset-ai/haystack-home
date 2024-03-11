---
layout: blog-post
title: Haystack 2.0.0
description: Release notes for Haystack 2.0.0
featured_image: release_notes.png
images: ["/release-notes/2.0.0/release_notes.png"]
toc: True
date: 2024-03-11
last_updated:  2024-03-11
tags: ["Release Notes"]
link: https://github.com/deepset-ai/haystack/releases/tag/v2.0.0
---	

Today, we’ve released the stable version of Haystack 2.0. This is ultimately a rewrite of the Haystack framework, so these release notes are not what you’d usually expect to see in regular release notes where we highlight specific changes to the codebase. Instead, we will highlight features of Haystack 2.0 and how it’s meant to be used.

> To read more about our motivation for Haystack 2.0 and what makes up our design choices, you can read our [release announcement article](https://haystack.deepset.ai/blog/haystack-2-release/).
> 

> To get started with Haystack, follow our [quick starting guide](https://haystack.deepset.ai/overview/quick-start).


## 🕺 Highlights

- [A New Package](#-a-new-package)
- [Powerful Pipelines](#-powerful-pipelines)
- [Customizable Components](#-customizable-components)
- [Ready-Made Pipeline Templates](#-ready-made-pipeline-templates)
- [Document Stores](#-document-stores)
- [Integrations](#-integrations)
- [Logging & Tracing](#-logging--tracing)
- [Device Management](#-device-management)
- [Secret Management](#-secret-management)
- [Prompt Templating](#-prompt-templating)

## 📦 A New Package

Haystack 2.0 is distributed with `haystack-ai`, while Haystack 1.x will continue to be supported with `farm-haystack` with security updates and bug fixes.

**NOTE**: Installing `haystack-ai` and `farm-haystack` into the same Python environment will lead to conflicts - Please use separate virtual environments for each package.

Check out the [installation guide](https://docs.haystack.deepset.ai/v2.0/docs/installation) for more information.

## 💪 Powerful Pipelines

In Haystack 2.0, [pipelines](https://docs.haystack.deepset.ai/v2.0/docs/pipelines) are dynamic computation graphs that support:

- 🚦 **Control flow:** Need to run different components based on the output of another? Not a problem with 2.0.
- ➿ **Loops:** Implement complex behavior such as self-correcting flows by executing parts of the graph repeatedly.
- 🎛️ **Data flow**: Consume it only where you need it. Haystack 2.0 only exposes data to components which need it - benefiting speed and transparency.
- ✅ **Validation and type-checking:** Ensures all components in your pipeline are compatible even before running it.
- 💾 **Serialization:** Save and restore your pipelines from different formats.

Pipelines can be built with a few easy steps:

1. Create the `Pipeline` object.
2. Add components to the pipeline with the `add_component()` method.
3. Connect the components with the `connect()` method. Trying to connect components that are not compatible in type will raise an error.
4. Execute the pipeline with the `run()` method.

### Example

The following pipeline does question-answering on a given URL:

```python
import os

from haystack import Pipeline
from haystack.components.fetchers import LinkContentFetcher
from haystack.components.converters import HTMLToDocument
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator
from haystack.utils import Secret

os.environ["OPENAI_API_KEY"] = "Your OpenAI API Key"

fetcher = LinkContentFetcher()
converter = HTMLToDocument()
prompt_template = """
According to the contents of this website:
{% for document in documents %}
  {{document.content}}
{% endfor %}
Answer the given question: {{query}}
Answer:
"""
prompt_builder = PromptBuilder(template=prompt_template)
llm = OpenAIGenerator(api_key=Secret.from_env_var("OPENAI_API_KEY"))

pipeline = Pipeline()
pipeline.add_component("fetcher", fetcher)
pipeline.add_component("converter", converter)
pipeline.add_component("prompt", prompt_builder)
pipeline.add_component("llm", llm)

# pass the fetchers's `streams` output to the converter using the `sources` parameter
pipeline.connect("fetcher.streams", "converter.sources")
# pass the converted `documents to the prompt_builder using the `documents` parameter
pipeline.connect("converter.documents", "prompt.documents")
# pass the interpolated `prompt to the llm using the `prompt` parameter
pipeline.connect("prompt.prompt", "llm.prompt")

pipeline.run({"fetcher": {"urls": ["https://haystack.deepset.ai/overview/quick-start"]},
              "prompt": {"query": "How should I install Haystack?"}})

print(result["llm"]["replies"][0])
```

## 🔌 Customizable Components

Previously known as *Nodes*, [components](https://docs.haystack.deepset.ai/v2.0/docs/components) have been formalized with well-defined inputs and outputs that allow for easy extensibility and composability.  

Haystack 2.0 provides a diverse selection of built-in components. Here’s a non-exhaustive overview:

| Category | Description | External Providers & Integrations |
| --- | --- | --- |
| Audio Transcriber | Transcribe audio to text | OpenAI |
| Builders | Build prompts and answers from templates |  |
| Classifiers | Classify documents based on specific criteria |  |
| Connectors | Interface with external services | OpenAPI |
| Converters | Convert data between different formats | Azure, Tika, Unstructured, PyPDF, OpenAPI, Jinja |
| Embedders | Transform texts and documents to vector representations | Amazon Bedrock, Azure, Cohere, FastEmbed, Gradient, Hugging Face (Optimum, Sentence Transformers, Text Embedding Inference), Instructor, Jina, Mistral, Nvidia, Ollama, OpenAI |
| Extractors | Extract information from documents | Hugging Face, spaCy |
| Evaluators | Evaluate components using metrics | Ragas, DeepEval, UpTrain |
| Fetcher | Fetch data from remote URLs |  |
| Generators | Prompt and generate text using generative models | Amazon Bedrock, Amazon Sagemaker, Azure, Cohere, Google AI, Google Vertex, Gradient, Hugging Face, Llama.cpp, Mistral, Nvidia, Ollama, OpenAI |
| Joiners | Combine documents from different components |  |
| Preprocessors | Preprocess text and documents |  |
| Rankers | Sort documents based on specific criteria | Hugging Face |
| Readers | Find answers in documents |  |
| Retrievers | Fetch documents from a document store based on a query | Astra, Chroma, Elasticsearch, MongoDB Atlas, OpenSearch, Pgvector, Pinecone, Qdrant, Weaviate |
| Routers | Manipulate pipeline control flow |  |
| Validators | Validate data based on schemas |  |
| Web Search | Perform search queries | Search, SerperDev |
| Writers | Write data into data sources |  |

---

### Custom Components

If Haystack lacks a functionality that you need, you can easily create your own component and slot that into a pipeline. Broadly speaking, writing a custom component requires:

- Creating a class with the `@component` decorator.
- Providing a `run()` method. The parameters passed to this method double as the component’s inputs.
- Defining the outputs and the output types of the `run()` method with a `@component.output_types()` decorator.
- Returning a dictionary that includes the outputs of the component.

Below is an example of a toy [Embedder](https://docs.haystack.deepset.ai/v2.0/docs/embedders) component that receives a `text` input and returns a random vector representation as `embedding`.

```python
import random
from typing import List  
from haystack import component, Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever

@component
class MyEmbedder:
	def __init__(self, dim: int = 128):
		self.dim = dim

  @component.output_types(embedding=List[float])
  def run(self, text: str):
		print(f"Random embedding for text : {text}")
		embedding = [random.uniform(1.0, -1.0) for _ in range(self.dim)]
    return {"embedding": embedding}

# Using the component directly
my_embedder = MyEmbedder()
my_embedder.run(text="Hi, my name is Tuana") 

# Using the component in a pipeline
document_store = InMemoryDocumentStore()
query_pipeline = Pipeline()
query_pipeline.add_component("text_embedder", MyEmbedder())
query_pipeline.add_component("retriever", InMemoryEmbeddingRetriever(document_store=document_store))
query_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")

query_pipeline.run({"text_embedder":{"text": "Who lives in Berlin?"}})
```

## 🍱 Ready-made Pipeline Templates

Haystack 2.0 offers [ready-made pipeline templates](https://docs.haystack.deepset.ai/v2.0/docs/pipeline-templates) for common use cases, which can be created with just a single line of code.

### Example

```python
from haystack import Pipeline, PredefinedPipeline

pipeline = Pipeline.from_template(PredefinedPipeline.CHAT_WITH_WEBSITE)

# and then you can run this pipeline 👇
# pipeline.run({
#    "fetcher": {"urls": ["https://haystack.deepset.ai/overview/quick-start"]},
#    "prompt": {"query": "How should I install Haystack?"}}
# )
```

## 🗃️ Document Stores

In Haystack 2.0, [Document Stores](https://docs.haystack.deepset.ai/v2.0/docs/document-store) provide a common interface through which pipeline components can read and manipulate data without any knowledge of the backend technology. Furthermore, Document Stores are paired with specialized retriever components that can be used to fetch documents from a particular data source based on specific queries.

This separation of interface and implementation lets us provide support for several third-party providers of vector databases such as Weaviate, Chroma, Pinecone, Astra DB, MongoDB, Qdrant, Pgvector, Elasticsearch, OpenSearch, Neo4j and Marqo. 

### Example

```python
#pip install chroma-haystack

from haystack_integrations.document_stores.chroma import ChromaDocumentStore
from haystack_integrations.components.retrievers.chroma import ChromaEmbeddingRetriever

document_store = ChromaDocumentStore()
retriever = ChromaEmbeddingRetriever(document_store)
```

## 🧩 Integrations

Thanks to Haystack 2.0’s flexible infrastructure, pipelines can be easily extended with external technologies and libraries in the form of new components, document stores, etc, all the while keeping dependencies cleanly separated. 

Starting with 2.0, [integrations](https://docs.haystack.deepset.ai/v2.0/docs/integrations) are divided into two categories:

- Core integrations - These are maintained by deepset and part of the `[haystack-core-integrations` GitHub repository](https://github.com/deepset-ai/haystack-core-integrations/tree/f8efcfe3126fd4066e708872386c06716f5415a4).
- Community and partner integrations - These are maintained by community members and our partners.

Please refer to the [official integrations](https://haystack.deepset.ai/integrations) website for more information.

## 🕵️ Logging & Tracing

The monitoring of Haystack 2.0 pipelines in production is aided by both a customizable [logging system](https://docs.haystack.deepset.ai/v2.0/docs/logging) that supports structured logging and tracing correlation out of the box, and code instrumentation collecting spans and traces in strategic points of the execution path, with support for Open Telemetry and Datadog already in place.

## 🏎️ Device Management

Haystack 2.0 provides a [framework-agnostic system](https://docs.haystack.deepset.ai/v2.0/docs/device-management) of addressing and using devices such as GPUs and accelerators across different platforms and providers.

## 🔐 Secret Management

To securely manage credentials for services that require authentication, Haystack 2.0 provides a [type-safe approach](https://docs.haystack.deepset.ai/v2.0/docs/secret-management) to handle authentication and API secrets that prevents accidental leaks.

## 📜 Prompt Templating

Haystack 2.0 prompt templating uses [Jinja](https://jinja.palletsprojects.com/en/3.1.x/), and prompts are included in pipelines with the use of a `PromptBuilder` (or `DymanicPromptBuilder` for advanced use cases ). Everything in `{{ }}` in a prompt, becomes an input to the `PromptBuilder`.

### Example

The following `prompt_builder` will expect `documents` and `query` as input.

```python
from haystack.components.builders import PromptBuilder

template = """Given these documents, answer the question.
              Documents:
              {% for doc in documents %}
                  {{ doc.content }}
              {% endfor %}
              Question: {{query}}
              Answer:"""
prompt_builder = PromptBuilder(template=template)
```

## 🚀 Getting Started

Alongside Haystack 2.0, today we are also releasing a whole set of new tutorials, documentation, resources and more to help you get started: 

- [Get Started](https://haystack.deepset.ai/overview/quick-start): A quick starting guide with readily runnable code.
- [Documentation](https://docs.haystack.deepset.ai/docs): Full technical documentation on all Haystack concepts and components.
- [Tutorials](https://haystack.deepset.ai/tutorials): Step-by-step, runnable Colab notebooks. Start with our first 2.0 tutorial [“Creating Your First QA Pipeline with Retrieval-Augmentation”](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline).
- [Cookbooks](https://github.com/deepset-ai/haystack-cookbook): A collection of useful notebooks that showcase Haystack in various scenarios, using a number of our integrations.

## 🧡 Join the Community

Stay up-to-date with Haystack:

- [Discord](https://discord.com/invite/VBpFzsgRVF)
- [Subscribe to our newsletter](https://landing.deepset.ai/haystack-community-updates?utm-campaign=developer-relations&utm-source=blog&utm-medium=release)
- [Twitter](https://twitter.com/Haystack_AI)
- [GitHub](https://github.com/deepset-ai/haystack)

## ⏳ Haystack 2.0-Beta History

Follow the progress we made during beta in each beta release:

- [v2.0.0-beta.1](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.1)
- [v2.0.0-beta.2](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.2)
- [v2.0.0-beta.3](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.3)
- [v2.0.0-beta.4](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.4)
- [v2.0.0-beta.5](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.5)
- [v2.0.0-beta.6](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.6)
- [v2.0.0-beta.7](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.7)
- [v2.0.0-beta.8](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.8)