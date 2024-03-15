---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/23_Answering_Multihop_Questions_with_Agents.ipynb
toc: True
title: "Answering Multihop Questions with Agents"
lastmod: "2023-12-29"
level: "intermediate"
weight: 63
description: Use Agent to answer multihop questions with extractive models
category: "QA"
aliases: ['/tutorials/multihop-qa-with-agents']
download: "/downloads/23_Answering_Multihop_Questions_with_Agents.ipynb"
completion_time: 10 min
created_at: 2023-03-27
---
    


- **Level**: Intermediate
- **Time to complete**: 10 minutes
- **Nodes Used**: `Agent`, `PromptNode`, `InMemoryDocumentStore`, `FARMReader` and `ExtractiveQAPipeline`
- **Goal**: After completing this tutorial, you will have learned how to use Agents to build a multi-hop question answering system with an `ExtractiveQAPipeline` as a tool
- **Prerequisites**: An [OpenAI API Key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key)


## Overview

The [Agent](https://docs.haystack.deepset.ai/docs/agent) class uses a large language model (LLM) to make decisions and come up with the best next course of action. You can provide the `Agent` with a set of [`Tools`](https://docs.haystack.deepset.ai/docs/agent#tools) that it can choose to use to reach a result. At each iteration, the agent will pick a tool from the ones available to it. Based on the result, the Agent has two options: It will either decide to select a tool again and do another iteration, or it will decide that it has reached a conclusion and return the final answer.

In this tutorial, we will provide the Agent with just one tool to answer questions: a commonly used Haystack component, the `ExtractiveQAPipeline`.


## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, let's install the latest release of Haystack with `pip`. In this tutorial, we'll use a [Hugging Face dataset](https://huggingface.co/datasets/Tuana/presidents) that has already been prepared as Haystack `Documents`, so we will install `datasets` too:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,inference]
pip install datasets
```


### Enabling Telemetry 
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(23)
```

Set the logging level to INFO:


```python
import logging

logging.basicConfig(format="%(levelname)s - %(name)s -  %(message)s", level=logging.WARNING)
logging.getLogger("haystack").setLevel(logging.INFO)
```

## Create an Extractive QA Pipeline

Now, we will introduce an `ExtractiveQAPipeline` as a `Tool` to our `Agent`. To do so, we'll first write our documents about the presidents of the USA into a `DocumentStore` and then create our pipeline.

### 1) Write documents to the DocumentStore


```python
from haystack.document_stores import InMemoryDocumentStore
from datasets import load_dataset

remote_dataset = load_dataset("Tuana/presidents", split="train")

document_store = InMemoryDocumentStore(use_bm25=True)
document_store.write_documents(remote_dataset)
```

### 2) Create an ExtractiveQAPipeline:
Let's define our retriever and reader to to use in an `ExtractiveQAPipeline`:


```python
from haystack.nodes import EmbeddingRetriever, FARMReader
from haystack.pipelines import ExtractiveQAPipeline

retriever = EmbeddingRetriever(
    document_store=document_store, embedding_model="sentence-transformers/multi-qa-mpnet-base-dot-v1", use_gpu=True
)
document_store.update_embeddings(retriever=retriever)
reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=True)
presidents_qa = ExtractiveQAPipeline(reader=reader, retriever=retriever)
```

### 3) Let's test the pipeline!

Now that you have an `ExtractiveQAPipeline`, go ahead and ask it a question about the presidents of the USA. 

Below, we're asking the question: "What year was the 1st president of the USA born?"

Notice how this is 2 questions in one. An extractive model will struggle to find the answer to this question unless the answer is phrased clearly in our documents. For example: "The first president of the USA was born in 1732".

On the other hand, it does well with a question such as "Who was the 1st president of the USA?"


```python
from haystack.utils import print_answers

# result = presidents_qa.run("Who was the 1st president of the USA?")
result = presidents_qa.run("What year was the 1st president of the USA born?")

print_answers(result, "minimum")
```

## Create an Agent with the `ExtractiveQAPipeline` as a `Tool`
### 1) To create the Agent, we'll make use of an Open AI model. So first, provide your Open AI key:


```python
import os
from getpass import getpass

api_key = os.getenv("OPENAI_API_KEY", None) or getpass("Enter OpenAI API key:")
```

### 2) Initialize the Agent 

The `Agent` needs to determine the next best course of action at each iteration. It does this by using an LLM, and a prompt designed specially for this use case. Our `Agent` uses a `PromptNode` with the default ["zero-shot-react" `PromptTemplate` ](https://github.com/deepset-ai/haystack/blob/444a3116c42d2c8852d27aa8093ac92c8e85ab88/haystack/nodes/prompt/prompt_node.py#L337). 

Here, let's define an `Agent` that uses the `gpt-3.5-turbo-instruct` model by OpenAI.


```python
from haystack.agents import Agent
from haystack.nodes import PromptNode

prompt_node = PromptNode(model_name_or_path="gpt-3.5-turbo-instruct", api_key=api_key, stop_words=["Observation:"])
agent = Agent(prompt_node=prompt_node)
```

### 3) Provide the Agent with a Tool
Next, let's add our `ExtractiveQAPipeline` into the Agent's arsenal. The Agent will then be able to use this pipeline when it decides it could be useful.

To do so, let's define a tool and make sure to give it a description. The exact wording of your description matters a lot here. The agent uses it to understand in which cases it should pick this tool. If the agent fails to pick the right tool, adjusting the description might help.


```python
from haystack.agents import Tool

search_tool = Tool(
    name="USA_Presidents_QA",
    pipeline_or_node=presidents_qa,
    description="useful for when you need to answer questions related to the presidents of the USA.",
    output_variable="answers",
)
agent.add_tool(search_tool)
```

### 4) Ask a question!



```python
result = agent.run("What year was the 1st president of the USA born?")

print(result["transcript"].split("---")[0])
```

Congratulations! 🎉 You've used an Agent that can use an extractive model iteratively, to arrive at a final answer to a multi-hop question!!!
