---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/24_Building_Chat_App.ipynb
toc: True
title: "Building a Conversational Chat App"
lastmod: "2023-12-11"
level: "intermediate"
weight: 64
description: Use ConversationalAgent to build a human-like chat application
category: "QA"
aliases: ['/tutorials/building-chat-app']
download: "/downloads/24_Building_Chat_App.ipynb"
completion_time: 10 min
created_at: 2023-05-30
---
    


- **Level**: Intermediate
- **Time to complete**: 10 minutes
- **Nodes Used**: `PromptNode`, `ConversationalAgent` and `ConversationSummaryMemory`
- **Goal**: After completing this tutorial, you will have learned how to use ConversationalAgent to build a conversational chat application
- **Prerequisites**: A [Hugging Face API Key](https://huggingface.co/settings/tokens)

## Overview

A [ConversationalAgent](https://docs.haystack.deepset.ai/docs/agent#conversational-agent) is a type of Agent that is specifically implemented to create chat applications easily. With its memory integration, the ConversationalAgent enables human-like conversation with large language models (LLMs).

This tutorial introduces you to the ConversationalAgent, ConversationSummaryMemory and explains how you can create your conversational chat application.


## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab]
```


### Enabling Telemetry
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product, but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(24)
```

## Initializing the ConversationalAgent

To initialize a ConversationalAgent, you'll first need to create a PromptNode to define the LLM that your chat application will use. Then, you'll add a memory to enable the application to store previous conversation and use this memory to make the interaction more human-like.

Now, create necessary components for a ConversationalAgent:

### 1) Provide a Hugging Face API Key

Hugging Face offers [a hosted Inference API](https://huggingface.co/docs/api-inference/index) which you can use to access machine learning models using simple HTTP requests. This way, you don't need to download models from the hub. To use the service, you need to provide an [API key](https://huggingface.co/settings/tokens) from Hugging Face:


```python
import os
from getpass import getpass

model_api_key = os.getenv("HF_API_KEY", None) or getpass("Enter HF API key:")
```

### 2) Create a PromptNode

You'll initialize a PromptNode with the `model_name_or_path`, `api_key`, and `max_length` to control the output length of the model. In this tutorial, you'll use [HuggingFaceH4/zephyr-7b-beta](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta), an open source chat Language Model.


```python
from haystack.nodes import PromptNode

prompt_node = PromptNode(
    model_name_or_path="HuggingFaceH4/zephyr-7b-beta", api_key=model_api_key, max_length=256, stop_words=["Human"]
)
```

### 3) Create a ConversationSummaryMemory

To have a chat application closer to a human interaction, you need to provide [memory](https://docs.haystack.deepset.ai/docs/agent#conversational-agent-memory) to the ConversationalAgent. There are two types of memory options in Haystack:

1.   **ConversationMemory**: stores the conversation history (default).
2.   **ConversationSummaryMemory**: stores the conversation history and periodically generates summaries.

These memory nodes inject the conversation history into the prompt for the large language model with every run. Instead of using the full conversation history, you'll use ConversationSummaryMemory that sums up the conversation without losing important information, thus saving the token limit.

You can use the same PromptNode in ConversationSummaryMemory, so the same `HuggingFaceH4/zephyr-7b-beta` model generates chat summaries. By default, ConversationSummaryMemory summarizes the chat with every `3` runs using the predefined [`conversational-summary`](https://prompthub.deepset.ai/?prompt=deepset%2Fconversational-summary) PromptTemplate on PromptHub.


```python
from haystack.agents.memory import ConversationSummaryMemory

summary_memory = ConversationSummaryMemory(prompt_node)
```

> Optionally, you can define a separate PromptNode with another LLM and PromptTemplate for generating conversation summary and use it in the ConversationSummaryMemory.

### 4) Create a ConversationalAgent

Now that you have all the necessary components, you can initialize the ConversationalAgent. If you don't provide any tools, the ConversationalAgent uses the [`conversational-agent-without-tools`](https://prompthub.deepset.ai/?prompt=deepset%2Fconversational-agent-without-tools) prompt by default.


```python
from haystack.agents.conversational import ConversationalAgent

conversational_agent = ConversationalAgent(prompt_node=prompt_node, memory=summary_memory)
```

> You can add tools to your chat application using `tools` params of the ConversationalAgent:
> ```python
> conversational_agent = ConversationalAgent(
>    prompt_node=prompt_node,
>    memory=summary_memory,
>    tools=[search_tool]
>)
>```
>To learn how to create tools, check out [Haystack documentation](https://docs.haystack.deepset.ai/docs/agent#tools).

Now, your conversational agent is ready to chat!

## Trying Out a Prompt


```python
conversational_agent.run("Tell me three most interesting things about Istanbul, Turkey")
```


```python
conversational_agent.run("Can you elaborate on the second item?")
```


```python
conversational_agent.run("Can you turn this info into a twitter thread?")
```

* At any point during the chat, you can use `load()` function to check the chat summary:

```python
print(conversational_agent.memory.load())
```

* To delete the whole chat history, call `clear()` method:

```python
conversational_agent.memory.clear()
```


Congratulations! 🎉 You've learned how to use ConversationalAgent to create a chat application with a summarized memory.

## 💬 Example Application

To take the chat experience to another level, check out this example application. Run the code cell below and use the textarea to interact with the conversational agent. Use the buttons on the right to load or delete the chat summary.


```python
import ipywidgets as widgets
from IPython.display import clear_output, display

## Text Input
user_input = widgets.Textarea(
    value="",
    placeholder="Type your prompt here",
    disabled=False,
    style={"description_width": "initial"},
    layout=widgets.Layout(width="100%", height="100%"),
)

## Submit Button
submit_button = widgets.Button(
    description="Submit", button_style="success", layout=widgets.Layout(width="100%", height="80%")
)


def on_button_clicked(b):
    user_prompt = user_input.value
    user_input.value = ""
    print("\nUser:\n", user_prompt)
    conversational_agent.run(user_prompt)


submit_button.on_click(on_button_clicked)

## Show Memory Button
memory_button = widgets.Button(
    description="Show Memory", button_style="info", layout=widgets.Layout(width="100%", height="100%")
)


def on_memory_button_clicked(b):
    memory = conversational_agent.memory.load()
    if len(memory):
        print("\nMemory:\n", memory)
    else:
        print("Memory is empty")


memory_button.on_click(on_memory_button_clicked)

## Clear Memory Button
clear_button = widgets.Button(
    description="Clear Memory", button_style="warning", layout=widgets.Layout(width="100%", height="100%")
)


def on_clear_button_button_clicked(b):
    conversational_agent.memory.clear()
    print("\nMemory is cleared\n")


clear_button.on_click(on_clear_button_button_clicked)

## Layout
grid = widgets.GridspecLayout(3, 3, height="200px", width="800px", grid_gap="10px")
grid[0, 2] = clear_button
grid[0:2, 0:2] = user_input
grid[2, 0:] = submit_button
grid[1, 2] = memory_button
display(grid)
```
