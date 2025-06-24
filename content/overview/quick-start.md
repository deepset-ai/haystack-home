---
layout: overview
header: dark
footer: dark
title: Get Started
description: Get started with Haystack. Build your first AI agent! 
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

## Prerequisites

You need an [OpenAI API Key](https://platform.openai.com/api-keys) and a [SerperDev API Key](https://serper.dev/api-key)

```python
import os

os.environ["OPENAI_API_KEY"] = "<YOUR OPENAI API KEY>"
os.environ["SERPERDEV_API_KEY"] = "<YOUR SERPERDEV API KEY>"
```

## 🤖 Basic Agent with Haystack

You can build a working agent in just a few lines with the [Agent](https://docs.haystack.deepset.ai/docs/agent) component. It takes in a user question, decides whether to use a tool (like web search), and returns a response without manual routing.

Below is a minimal example using [SerperDevWebSearch](https://docs.haystack.deepset.ai/docs/serperdevwebsearch) component as a tool and OpenAI's `gpt-4o-mini` chat model with [OpenAIChatGenerator](https://docs.haystack.deepset.ai/docs/openaichatgenerator):

```python
from haystack.components.agents import Agent
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage
from haystack.tools import ComponentTool
from haystack.components.websearch import SerperDevWebSearch

search_tool = ComponentTool(component=SerperDevWebSearch())

basic_agent = Agent(
    chat_generator=OpenAIChatGenerator(model="gpt-4o-mini"),
    system_prompt="You are a helpful web agent.",
    tools=[search_tool],
)

result = basic_agent.run(messages=[ChatMessage.from_user("When was the first version of Haystack released?")])

print(result['last_message'].text)
```

## ⚙️ Advanced Agent Configurations

Once you've built your first agent, it's simple to **extend its capabilities** to fit more advanced use cases. Haystack is designed to be modular and customizable, so you can easily fine-tune how your agent behaves, how tools return data, and how that data flows between components.

Here's how to evolve the basic agent into a more advanced one:

### 🛠️ Customize the Tool

In the basic example, the `SerperDevWebSearch` component was turned into a tool with default behavior. For more control, you can:

* **Add name and description to the tool** for the LLM to better understand when to use it.
* **Convert the tool's outputs** (e.g. `Document` objects) into strings using `outputs_to_string` so they can be directly used in prompts.
* **Save tool outputs** into the agent's internal state using `outputs_to_state`, making them accessible to future steps in the reasoning process.

```python
from haystack.tools import ComponentTool
from haystack.components.websearch import SerperDevWebSearch

def doc_to_string(documents) -> str:
    result_str = ""
    for document in documents:
        result_str += f"File Content for {document.meta['link']}: {document.content}\n\n"
    return result_str

search_tool = ComponentTool(
    component=SerperDevWebSearch(top_k=5),
    name="web_search", 
    description="Search the web for up-to-date information on any topic",
    outputs_to_string={"source": "documents", "handler": doc_to_string}, # Convert Documents' content into strings before passing it back to the LLM
    outputs_to_state={"documents": {"source": "documents"}}, # Save Documents into Agent's state
)
```

### 🧠 Enhance Agent Behavior

The `Agent` itself can also be configured to handle more advanced tasks:

* **Custom `system_prompt`** guides the agent's personality and tool usage strategy.
* **`exit_conditions`** let you define when the agent should stop reasoning (e.g., once it produces a final `text` response or calls a listed tool).
* **`state_schema`** defines the shape of internal memor, e.g., to store retrieved documents between steps.
* **`streaming_callback`** allows you to stream partial results, trace tool usage, and debug tool-agent interaction live.

```python
from haystack.components.generators.utils import print_streaming_chunk
from haystack.components.agents import Agent
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage, Document

agent = Agent(
    chat_generator=OpenAIChatGenerator(model="gpt-4o-mini"),
    system_prompt="""
    You are a helpful assistant that has access to web. User's ask you questions and you provide answers.
    Use the tools that you're provided with to get information. Don't use your own knowledge.
    Make sure the information that you retrieved is enough to resolve the user query.
    """,
    tools=[search_tool],
    exit_conditions=["text"], # Stop agent execution when there's a text response
    state_schema={"documents":{"type":list[Document]}}, # Define Agent state schema for saved documents 
    streaming_callback=print_streaming_chunk # Display streaming output chunks and print tool calls and tool call results
)

agent_results = agent.run(messages=[ChatMessage.from_user("What are some popular use cases for AI agents?")])
print(agent_results["last_message"].text)

## See the Documents saved in the Agent state
agent_results["documents"]
```

With just a few lines of configuration, your agent becomes **more transparent, stateful, and useful**. This flexible design allows you to build powerful multi-step assistants that **reason, retrieve, and act intelligently** without writing custom orchestration code from scratch.

For a hands-on guide on how to create an **tool-calling agent** that can use both _components_ and _pipelines_ as tools, see our tutorial.

{{< button url="https://haystack.deepset.ai/tutorials/43_building_a_tool_calling_agent" text="Tutorial: Build a Tool-Calling Agent" color="green">}}

## Next Steps

* [Implement a Multi-Agent System](https://haystack.deepset.ai/tutorials/45_creating_a_multi_agent_system)
* [Create a RAG Pipeline](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline/)
* [Deploy Haystack Applications as REST APIs and MCP Tools](https://docs.haystack.deepset.ai/docs/hayhooks)

<!-- ## Build Your First RAG Pipeline

To build modern LLM-based RAG applications, you need two things: powerful components and an easy way to put them together. The Haystack pipeline is built for this purpose and enables you to design and scale your interactions with LLMs. Learn how to create pipelines [here](https://docs.haystack.deepset.ai/docs/creating-pipelines).

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
from haystack.components.builders import ChatPromptBuilder
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

{{< button url="https://haystack.deepset.ai/tutorials/27_first_rag_pipeline" text="Tutorial: Creating a RAG Pipeline" color="green">}} -->
