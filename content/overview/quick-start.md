---
layout: overview
header: dark
footer: dark
title: Get Started
description: Guide to setting up and installing Haystack. 
weight: 2
toc: true
aliases: [get-started]
---

Haystack is an open-source Python framework that helps developers build LLM-powered custom applications. In March 2024, we released Haystack 2.0, a significant update. This page provides information for both Haystack 1.x and the latest version, 2.0. For more information on Haystack 2.0, you can also read the [announcement post]().

## Installation

Use [pip](https://github.com/pypa/pip) to install Haystack:

```python
pip install haystack-ai
```

For more details, refer to our documentation.

{{< button url="https://docs.haystack.deepset.ai/v2.0/docs/installation" text="Docs: Installation" color="green">}}

## Ask Questions to a Webpage

This is a very simple pipeline that can answer questions about the contents of a webpage. It uses GPT-3.5-Turbo with the `OpenAIGenerator`.

Run the following **Quickstart** or the equivalent **Corresponding Pipeline** below. See the pipeline visualized in **Pipeline Graph**.

{{< tabs totalTabs="3">}}

{{< tab tabName="Quickstart"  >}}
First, install Haystack:
```bash
pip install haystack-ai
```

```python
import os
from haystack import Pipeline, PredefinedPipeline

os.environ["OPENAI_API_KEY"] = "Your OpenAI API Key"

pipeline = Pipeline.from_template(PredefinedPipeline.CHAT_WITH_WEBSITE)
result = pipeline.run({
    "fetcher": {"urls": ["https://haystack.deepset.ai/overview/quick-start"]},
    "prompt": {"query": "How should I install Haystack?"}}
)
print(result["llm"]["replies"][0])
```
{{< /tab  >}}

{{< tab tabName="Corresponding Pipeline"  >}}
```bash
pip install haystack-ai
```

```python
import os

from haystack import Pipeline
from haystack.components.fetchers import LinkContentFetcher
from haystack.components.converters import HTMLToDocument
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator

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
llm = OpenAIGenerator()

pipeline = Pipeline()
pipeline.add_component("fetcher", fetcher)
pipeline.add_component("converter", converter)
pipeline.add_component("prompt", prompt_builder)
pipeline.add_component("llm", llm)

pipeline.connect("fetcher.streams", "converter.sources")
pipeline.connect("converter.documents", "prompt.documents")
pipeline.connect("prompt.prompt", "llm.prompt")

pipeline.run({"fetcher": {"urls": ["https://haystack.deepset.ai/overview/quick-start"]},
              "prompt": {"query": "How should I install Haystack?"}})

print(result["llm"]["replies"][0])
```
{{< /tab  >}}

{{< tab tabName="Pipeline Graph"  >}}
<img src="/images/chat_with_web.png" width="400" quality="70" style="margin:15px auto"/>
{{< /tab  >}}

{{< /tabs >}}

## Build Your First RAG Pipeline

To build modern search pipelines with LLMs, you need two things: powerful components and an easy way to put them together. The Haystack pipeline is built for this purpose and enables you to design and scale your interactions with LLMs. Learn how to create pipelines [here](https://docs.haystack.deepset.ai/v2.0/docs/creating-pipelines).

By connecting three components, a [Retriever](https://docs.haystack.deepset.ai/v2.0/docs/retrievers), a [PromptBuilder](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder) and a [Generator](https://docs.haystack.deepset.ai/v2.0/docs/generators), you can build your first Retrieval Augmented Generation (RAG) pipeline with Haystack.

Try out how Haystack answers questions about the given documents using the **RAG** approach 👇

{{< tabs totalTabs="3">}}

{{< tab tabName="Quickstart"  >}}
First, install Haystack:
```bash
pip install haystack-ai
```

```python
```
{{< /tab  >}}

{{< tab tabName="Corresponding Pipeline"  >}}
```bash
pip install haystack-ai
```

{{< /tab  >}}

{{< tab tabName="Pipeline Graph"  >}}

{{< /tab  >}}

{{< /tabs >}}

For a hands-on guide on how to build your first RAG Pipeline with Haystack 2.0-Beta, see our tutorial.

{{< button url="https://haystack.deepset.ai/tutorials/27_first_rag_pipeline" text="Tutorial: Creating a RAG Pipeline" color="green">}}