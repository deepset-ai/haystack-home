---
layout: tutorial
featured: True
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/25_Customizing_Agent.ipynb
toc: True
title: "Customizing Agent to Chat with Your Documents"
lastmod: "2024-01-12"
level: "advanced"
weight: 117
description: Advanced Customizations for Agents with Memory
category: "QA"
aliases: ['/tutorials/customizing-agent']
download: "/downloads/25_Customizing_Agent.ipynb"
completion_time: 15 min
created_at: 2023-07-19
---
    


- **Level**: Advanced
- **Time to complete**: 20 minutes
- **Nodes Used**: `BM25Retriever`, `PromptNode`, `Agent`, and `Memory`
- **Goal**: After completing this tutorial, you will have learned about how to customize an Agent to create a chat system for your documents.
- **Prerequisites**: An [OpenAI API Key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key)

## Overview

The [Agent](https://docs.haystack.deepset.ai/docs/agent) class is designed to use a large language model (LLM) to make decisions and determine the best course of action to find the most suitable answers. It offers great flexibility with the ability to provide multiple [`Tools`](https://docs.haystack.deepset.ai/docs/agent#tools), [`Memory`](https://docs.haystack.deepset.ai/docs/agent#conversational-agent-memory), and a custom prompt with a parameter resolver. This means you have full control over the agent's prompt, allowing you to customize it according to your specific use case, whether it's a personal assistant, a chatbot, or a multihop search system.

In this tutorial, you will learn how to set up the Agent with one tool and a summarized memory, as well as how to customize the prompt and resolve parameters within it. By the end of the tutorial, you will have a system ready to engage in conversations using your own documents.

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

tutorial_running(25)
```

## Creating a Generative QA Pipeline Tool

### 1) Initialize the DocumentStore and Write Documents

You'll start creating a generative pipeline by initializing a DocumentStore, which will store the Documents to be chatted with.

As Documents, you will use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World). These pages are crawled, preprocessed and uploaded to a Hugging Face Space: [Seven Wonders](https://huggingface.co/datasets/bilgeyucel/seven-wonders).

> To learn about the preprocessing step, check out [Tutorial: Preprocessing Your Documents](https://haystack.deepset.ai/tutorials/08_preprocessing).

Initialize `InMemoryDocumentStore` and write Documents to the DocumentStore:


```python
from datasets import load_dataset
from haystack.document_stores import InMemoryDocumentStore

dataset = load_dataset("bilgeyucel/seven-wonders", split="train")

document_store = InMemoryDocumentStore(use_bm25=True)
document_store.write_documents(dataset)
```

### 2) Provide an OpenAI API Key

You need an the API key to use OpenAI models for generative pipeline and the agent.



```python
import os
from getpass import getpass

openai_api_key = os.getenv("OPENAI_API_KEY", None) or getpass("Enter OpenAI API key:")
```

### 3) Create a Generative QA Pipeline

A generative QA pipeline consists of a PromptNode and a Retriever. In this pipeline, Retriever gets the related Documents, and PromptNode generates the answer using the retrieval augmented generation ([RAG](https://www.deepset.ai/blog/llms-retrieval-augmentation)) approach.

> To learn about the details of a generative pipeline with RAG, check out [Tutorial: Creating a Generative QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/22_pipeline_with_promptnode).


```python
from haystack.nodes import PromptNode, PromptTemplate, AnswerParser, BM25Retriever
from haystack.pipelines import Pipeline

retriever = BM25Retriever(document_store=document_store, top_k=3)

prompt_template = PromptTemplate(
    prompt="""
    Answer the question truthfully based solely on the given documents. If the documents do not contain the answer to the question, say that answering is not possible given the available information. Your answer should be no longer than 50 words.
    Documents:{join(documents)}
    Question:{query}
    Answer:
    """,
    output_parser=AnswerParser(),
)

prompt_node = PromptNode(
    model_name_or_path="gpt-3.5-turbo-instruct", api_key=openai_api_key, default_prompt_template=prompt_template
)

generative_pipeline = Pipeline()
generative_pipeline.add_node(component=retriever, name="retriever", inputs=["Query"])
generative_pipeline.add_node(component=prompt_node, name="prompt_node", inputs=["retriever"])
```

Test out your pipeline:


```python
from haystack.utils import print_answers

response = generative_pipeline.run("What does Rhodes Statue look like?")
print_answers(response, details="minimum")
```

To make sure that the generative pipeline uses only the provided Documents, test it out with an out-of-context query:


```python
response = generative_pipeline.run("What does Taylor Swift look like?")
print_answers(response, details="minimum")
```

### 4) Define a Tool with the Generative QA Pipeline

Later, you will provide this Tool to your Agent.


```python
from haystack.agents import Tool

search_tool = Tool(
    name="seven_wonders_search",
    pipeline_or_node=generative_pipeline,
    description="useful for when you need to answer questions about the seven wonders of the world",
    output_variable="answers",
)
```

Now that you have a working pipeline as a Tool, time to initialize an Agent!

## Creating an Agent

> If you are not familiar with the Agent class, you can go through [Tutorial: Answering Multihop Questions with Agents](https://haystack.deepset.ai/tutorials/23_answering_multihop_questions_with_agents) before you continue.

### 1) Initialize PromptNode for the Agent

For your Agent to be most efficient, you need an LLM that can perform dynamic reasoning with [ReAct](https://arxiv.org/pdf/2210.03629.pdf) prompts, which can be achieved by configuring the `stop_words` and `temperature`. Once set, the PromptNode will be ready to use.


```python
from haystack.nodes import PromptNode

agent_prompt_node = PromptNode(
    "gpt-3.5-turbo",
    api_key=openai_api_key,
    max_length=256,
    stop_words=["Observation:"],
    model_kwargs={"temperature": 0.5},
)
```

### 2) Initialize Memory

Memory makes the interaction with the Agent more human-like. Haystack offers various memory options, one of which, `ConversationSummaryMemory`, will create the summary of every three exchanges. You will be using the [`philschmid/bart-large-cnn-samsum`](https://huggingface.co/philschmid/bart-large-cnn-samsum) model which is especially good at generating chat summaries.

> To discover other memory options in Haystack, check out [Good Listener: How Memory Enables Conversational Agents](https://haystack.deepset.ai/blog/memory-conversational-agents#summarizing-memory) blog post.


```python
from haystack.agents.memory import ConversationSummaryMemory
from haystack.nodes import PromptNode

memory_prompt_node = PromptNode(
    "philschmid/bart-large-cnn-samsum", max_length=256, model_kwargs={"task_name": "text2text-generation"}
)
memory = ConversationSummaryMemory(memory_prompt_node, prompt_template="{chat_transcript}")
```

### 3) Define the Prompt

To have an Agent with chat ability, you need to use a prompt similar to [`conversational-agent`](https://prompthub.deepset.ai/?prompt=deepset%2Fconversational-agent). This prompt is useful especially when you want to inject the memory into the prompt.


```python
agent_prompt = """
In the following conversation, a human user interacts with an AI Agent. The human user poses questions, and the AI Agent goes through several steps to provide well-informed answers.
The AI Agent must use the available tools to find the up-to-date information. The final answer to the question should be truthfully based solely on the output of the tools. The AI Agent should ignore its knowledge when answering the questions.
The AI Agent has access to these tools:
{tool_names_with_descriptions}

The following is the previous conversation between a human and The AI Agent:
{memory}

AI Agent responses must start with one of the following:

Thought: [the AI Agent's reasoning process]
Tool: [tool names] (on a new line) Tool Input: [input as a question for the selected tool WITHOUT quotation marks and on a new line] (These must always be provided together and on separate lines.)
Observation: [tool's result]
Final Answer: [final answer to the human user's question]
When selecting a tool, the AI Agent must provide both the "Tool:" and "Tool Input:" pair in the same response, but on separate lines.

The AI Agent should not ask the human user for additional information, clarification, or context.
If the AI Agent cannot find a specific answer after exhausting available tools and approaches, it answers with Final Answer: inconclusive

Question: {query}
Thought:
{transcript}
"""
```

### 4) Initialize Prompt Parameter Resolver

> Keep in mind that for common use cases of Agent such as simple chatbots or ReAct-based Agents, there are pre-defined resolver functions in Haystack that you can import and start using without defining one from scratch. [Here](https://github.com/deepset-ai/haystack/blob/main/haystack/agents/utils.py) is the full list of all resolver functions. Below is an example of how you may customize it yourself.

`prompt_parameter_resolver` is a callback function that returns a dictionary of parameters which will resolve the variables in the `prompt_template`. This function customizes Agent's behaviour by taking inputs from internal Agent classes and enabling preprocessing these before returning prompt parameters. 

Currently, resolver functions can access to the query from the user, `AgentStep`, and `Agent`. `Agent` class is required to get all memory related attributes or when you need some tool information in the prompt which is essential for the ReAct-based Agents to determine their next action. `AgentStep` class is useful when you need the transcript of an Agent's internal monologue for each iteration or the information of at which iteration the Agent is at that given time.

These are the parameters you need to define in the resolver function for the prompt above:

- `query`: User input
- `tool_names_with_descriptions`: Names of all tools and their descriptions
- `transcript`: Transcript of the ReAct-based Agent's iterative process that generates thought, action, and observation
- `memory`: History of the previous conversation

Now, initialize the resolver function with these parameters using the `Agent`, `AgentStep` and query:


```python
from haystack.agents import AgentStep, Agent


def resolver_function(query, agent, agent_step):
    return {
        "query": query,
        "tool_names_with_descriptions": agent.tm.get_tool_names_with_descriptions(),
        "transcript": agent_step.transcript,
        "memory": agent.memory.load(),
    }
```

### 5) Create the Agent

Bring together all the components and create the Agent:


```python
from haystack.agents.base import Agent, ToolsManager

conversational_agent = Agent(
    agent_prompt_node,
    prompt_template=agent_prompt,
    prompt_parameters_resolver=resolver_function,
    memory=memory,
    tools_manager=ToolsManager([search_tool]),
)
```

### 6) Start Chatting!


```python
conversational_agent.run("What did Rhodes Statue look like?")
```


```python
conversational_agent.run("When did it collapse?")
```


```python
conversational_agent.run("How tall was it?")
```


```python
conversational_agent.run("How long did it stand?")
```

Congratulations! 🎉 You’ve customized an Agent to chat with your documents!
