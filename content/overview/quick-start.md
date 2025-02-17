---
layout: overview
header: dark
footer: dark
title: Get Started
description: Get started with Haystack pipelines. Build your first RAG application! 
weight: 2
toc: true
aliases: [get-started]
---

Haystack is an open-source AI framework to build custom production-grade LLM applications such as AI agents, powerful RAG applications, and scalable search systems.  

## Installation

Use [pip](https://github.com/pypa/pip) to install Haystack:

```bash
pip install haystack-ai
```

For more details, refer to our documentation.

{{< button url="https://docs.haystack.deepset.ai/docs/installation" text="Docs: Installation" color="green">}}

## Ask Questions to a Webpage

This is a very simple pipeline that can answer questions about the contents of a webpage. It uses `gpt-4o-mini` with the `OpenAIGenerator`.

Run the following **Quickstart** or the equivalent **Corresponding Pipeline** below. See the pipeline visualized in **Pipeline Graph**.

{{< tabs totalTabs="2">}}

{{< tab tabName="Quickstart: Chat with Website Pipeline"  >}}
First, install Haystack:
```bash
pip install haystack-ai trafilatura
```

```python
import os

from haystack import Pipeline
from haystack.components.fetchers import LinkContentFetcher
from haystack.components.converters import HTMLToDocument
from haystack.components.builders import ChatPromptBuilder
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage

os.environ["OPENAI_API_KEY"] = "Your OpenAI API Key"

fetcher = LinkContentFetcher()
converter = HTMLToDocument()
prompt_template = [
    ChatMessage.from_user(
      """
      According to the contents of this website:
      {% for document in documents %}
        {{document.content}}
      {% endfor %}
      Answer the given question: {{query}}
      Answer:
      """
    )
]

prompt_builder = ChatPromptBuilder(template=prompt_template)
llm = OpenAIChatGenerator()

pipeline = Pipeline()
pipeline.add_component("fetcher", fetcher)
pipeline.add_component("converter", converter)
pipeline.add_component("prompt", prompt_builder)
pipeline.add_component("llm", llm)

pipeline.connect("fetcher.streams", "converter.sources")
pipeline.connect("converter.documents", "prompt.documents")
pipeline.connect("prompt.prompt", "llm")

result = pipeline.run({"fetcher": {"urls": ["https://haystack.deepset.ai/overview/quick-start"]},
              "prompt": {"query": "Which components do I need for a RAG pipeline?"}})

print(result["llm"]["replies"][0].text)
```
{{< /tab  >}}

{{< tab tabName="Pipeline Graph"  >}}
<div class="row" style="display:flex">
  <div class="column" style="margin:15px auto" >
    <img src="/images/chat_with_web.png" width="300" quality="70"/>
  </div>
</div>
{{< /tab  >}}

{{< /tabs >}}

## Build Your First RAG Pipeline

To build modern LLM-based applications, you need two things: powerful components and an easy way to put them together. The Haystack pipeline is built for this purpose and enables you to design and scale your interactions with LLMs. Learn how to create pipelines [here](https://docs.haystack.deepset.ai/docs/creating-pipelines).

By connecting three components, a [Retriever](https://docs.haystack.deepset.ai/docs/retrievers), a [ChatPromptBuilder](https://docs.haystack.deepset.ai/docs/chatpromptbuilder) and a [Chat Generator](https://docs.haystack.deepset.ai/docs/generators), you can build your first Retrieval Augmented Generation (RAG) pipeline with Haystack.

Try out how Haystack answers questions about the given documents using the **RAG** approach 👇

{{< tabs totalTabs="2">}}

{{< tab tabName="Basic RAG Pipeline with Indexing"  >}}
Install Haystack:

```bash
pip install haystack-ai
```
```python
import os
import urllib.request

from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.components.converters import TextFileToDocument
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.components.embedders import OpenAIDocumentEmbedder, OpenAITextEmbedder
from haystack.components.writers import DocumentWriter
from haystack.components.builders import PromptBuilder
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage

os.environ["OPENAI_API_KEY"] = "Your OpenAI API Key"
urllib.request.urlretrieve("https://archive.org/stream/leonardodavinci00brocrich/leonardodavinci00brocrich_djvu.txt",
                           "davinci.txt")    

document_store = InMemoryDocumentStore()

text_file_converter = TextFileToDocument()
cleaner = DocumentCleaner()
splitter = DocumentSplitter()
embedder = OpenAIDocumentEmbedder()
writer = DocumentWriter(document_store)

indexing_pipeline = Pipeline()
indexing_pipeline.add_component("converter", text_file_converter)
indexing_pipeline.add_component("cleaner", cleaner)
indexing_pipeline.add_component("splitter", splitter)
indexing_pipeline.add_component("embedder", embedder)
indexing_pipeline.add_component("writer", writer)

indexing_pipeline.connect("converter.documents", "cleaner.documents")
indexing_pipeline.connect("cleaner.documents", "splitter.documents")
indexing_pipeline.connect("splitter.documents", "embedder.documents")
indexing_pipeline.connect("embedder.documents", "writer.documents")
indexing_pipeline.run(data={"sources": ["davinci.txt"]})

text_embedder = OpenAITextEmbedder()
retriever = InMemoryEmbeddingRetriever(document_store)
prompt_template = [
    ChatMessage.from_user(
      """
      Given these documents, answer the question.
      Documents:
      {% for doc in documents %}
          {{ doc.content }}
      {% endfor %}
      Question: {{query}}
      Answer:
      """
    )
]
prompt_builder = ChatPromptBuilder(template=prompt_template)
llm = OpenAIChatGenerator()

rag_pipeline = Pipeline()
rag_pipeline.add_component("text_embedder", text_embedder)
rag_pipeline.add_component("retriever", retriever)
rag_pipeline.add_component("prompt_builder", prompt_builder)
rag_pipeline.add_component("llm", llm)

rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
rag_pipeline.connect("retriever.documents", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder", "llm")

query = "How old was Leonardo when he died?"
result = rag_pipeline.run(data={"prompt_builder": {"query":query}, "text_embedder": {"text": query}})

print(result["llm"]["replies"][0].text)
```
{{< /tab  >}}


{{< tab tabName="Pipeline Graphs"  >}}
<div class="row" style="display:flex">
  <div class="column" style="margin:15px auto" >
    <p>Indexing Pipeline</p>
    <img src="/images/indexing.png" width="300" quality="70"/>
  </div>
  <div class="column" style="margin:15px auto" >
    <p>RAG Pipeline</p>
    <img src="/images/rag.png" width="300" quality="70"/>
  </div>
</div>
{{< /tab  >}}

{{< /tabs >}}

For a hands-on guide on how to build your first RAG Pipeline with Haystack, see our tutorial.

{{< button url="https://haystack.deepset.ai/tutorials/27_first_rag_pipeline" text="Tutorial: Creating a RAG Pipeline" color="green">}}
