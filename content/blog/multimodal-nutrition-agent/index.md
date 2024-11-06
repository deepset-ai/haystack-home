---
layout: blog-post
title: "Building a Multimodal Nutrition Agent"
description: Use fastRAG and Haystack to build an agent that can process text and image data 
featured_image: thumbnail.png
alt_image: "Title text 'Building a Multimodal Nutrition Agent' above logos of fastRAG and Haystack, with two nutrition label images in the foreground and a nutritionist figure standing behind"
images: ["blog/multimodal-nutrition-agent/thumbnail.png"]
toc: True
date: 2024-11-06
last_updated: 2024-11-06
authors:
  - Moshe Berchansky
  - Bilge Yucel
tags: ["Agent", "Multimodality"]
cookbook: multimodal_nutrition_agent_with_fastrag_haystack.ipynb
---

In artificial intelligence, **multimodal agents** are becoming increasingly popular for their ability to understand and integrate multiple types of input, such as text and images. In this article, we’ll show you how to build a multimodal agent that can interpret both text and image data, like **nutrition fact labels** on food items, to answer practical questions such as "How much protein is in yogurt?"

We’ll focus on building an agent using Haystack and fastRAG, which can perform **multi-step reasoning** to extract and provide accurate answers about the nutritional content of different foods.

> [**fastRAG**](https://github.com/IntelLabs/fastRAG/tree/main) is a research framework developed by Intel Labs for efficient and optimized RAG pipelines. It is fully compatible with Haystack and includes novel and efficient RAG modules designed for efficient deployment on Intel hardware, including client and server CPUs (Xeon) and the [Intel Gaudi AI accelerator](https://www.intel.com/content/www/us/en/products/details/processors/ai-accelerators/gaudi.html).
> 

## **Understanding Multimodal Agents: Multi-Hop and ReAct Architecture**

A **multimodal agent** processes different input types, such as text and images, making it versatile for tasks like image question answering. The agent we implement in this article allows users to ask questions like "Which one has more protein, yogurt or a protein bar?" and gives the correct answer by retrieving **nutrition fact labels** of different food items. By using **multi-hop reasoning**, the agent processes an image, extracts nutritional data, tries to answer the user query, and, if necessary, performs these actions again without human intervention. Its **ReAct architecture** lets it dynamically choose which tool to use, whether to retrieve a new image or respond based on already retrieved information, ensuring flexibility and efficiency in handling diverse queries.

This combination of multimodality, multi-hop reasoning, and reactive decision-making makes this agent ideal for quick, accurate responses to user questions.

Now that we know the basics, let's implement our agent! 🤖

## Indexing Data

### Getting Nutrition Fact Labels

Let’s start by getting images of nutrition facts and indexing them in our database. You can find the data [here](https://github.com/IntelLabs/fastRAG/blob/main/assets/multi_modal_files/nutrition_data.json).

```python
import json

entries = json.load(open("../assets/multi_modal_files/nutrition_data.json", "r"))
```

Each entry in this data contains a brief textual description with a title and an image url. Here’s an example:

```json
{
    "image_url": "https://m.media-amazon.com/images/I/71nh-zRJCSL.jpg",
    "title": "Protein bar nutrition facts",
    "content": "Protein bar with chocolate peanut butter nutrition facts per bar (50g)"
}
```

### Index Documents to InMemoryDocumentStore

We will use `sentence-transformers/all-MiniLM-L6-v2` model to create embeddings for each label description and create a pipeline to index our data to [InMemoryDocumentStore](https://docs.haystack.deepset.ai/docs/inmemorydocumentstore).

```python
from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.writers import DocumentWriter
from haystack.components.embedders import SentenceTransformersDocumentEmbedder

document_store = InMemoryDocumentStore()

index_pipeline = Pipeline()
index_pipeline.add_component(
    instance=SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2"), name="doc_embedder"
)
index_pipeline.add_component(
    instance=DocumentWriter(document_store=document_store), name="doc_writer"
)

index_pipeline.connect("doc_embedder.documents", "doc_writer.documents")
```

Next, we create Document objects with the nutrition label content as the `content` and store the `title` and `image_url` as metadata before passing them to the indexing pipeline for processing.

```python
index_pipeline.run({
    "documents": [
        Document(
            content=entry["content"],
            meta={
                "title": entry["title"],
                "image_url": entry["image_url"]
            }
        ) for entry in entries
    ]
})

```

## Building a Retrieval Pipeline

Next, we create a document retrieval pipeline for the documents above. We will later use this pipeline in our tool. 

This pipeline consists of:

- A [SentenceTransformersTextEmbedder](https://docs.haystack.deepset.ai/docs/sentencetransformerstextembedder), to embed our questions.
- An [InMemoryEmbeddingRetriever](https://docs.haystack.deepset.ai/docs/inmemoryembeddingretriever) to fetch the top-1 document.
- A [MultiModalPromptBuilder](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/prompt_builders/multi_modal_prompt_builder.py), to construct the prompt that our Agent will eventually use.

```python
from haystack import Pipeline
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from fastrag.prompt_builders.multi_modal_prompt_builder import MultiModalPromptBuilder

template = """{% for document in documents %}
Image: <|image_
This image shows: {{ document.content }}
{% endfor %}
"""

retrieval_pipeline = Pipeline()
retrieval_pipeline.add_component("embedder", SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2"))
retrieval_pipeline.add_component("retriever", InMemoryEmbeddingRetriever(document_store=document_store, top_k=1))
retrieval_pipeline.add_component("prompt_builder", MultiModalPromptBuilder(template=template))

retrieval_pipeline.connect("embedder.embedding", "retriever.query_embedding")
retrieval_pipeline.connect("retriever", "prompt_builder.documents")
```

In this pipeline, the `MultiModalPromptBuilder` component receives one Document object from the retriever and renders the prompt. Notice that we have the "<|image_" placeholder in the prompt template for our model, in order to inject the images into later. Additionally, `MultiModalPromptBuilder` converts the given image into a [base64](https://en.wikipedia.org/wiki/Base64) string for the image to be processed by the multimodal agent. Let’s run the pipeline to see its output. 

```python
retrieval_pipeline.run({"embedder":{"text": "Protein bar"}})

"""
{'prompt_builder': {'prompt': '\nImage: <|image_\nThis image shows: Protein bar with chocolate peanut butter nutrition facts per bar (50g)\n',
 'images': ['/9j/4AAQSkZJRgABAQAAAQABAAD/4....']} 
"""
```

## Creating the Multimodal ReAct Agent

### Defining a Tool

With our retrieval pipeline ready, we can create our Tool using the [DocWithImageHaystackQueryTool](https://github.com/IntelLabs/fastRAG/blob/4f73883ca85abf702eb81fd4a384a872b9fd3767/fastrag/agents/tools/tools.py#L69) component from fastRAG. `DocWithImageHaystackQueryTool` can use Haystack v2 pipelines as a tool with fastRAG Agents.

This tool, like other agent tools, requires a name and a description of its functionality for our agent to decide when to use it. We provide it with our `retrieval_pipeline` as follows:

```python
from fastrag.agents.tools.tools import DocWithImageHaystackQueryTool

nutrition_tool = DocWithImageHaystackQueryTool(
    name="nutrition_tool",
    description="useful for when you need to retrieve nutrition fact image of packaged food. It can give information about one food type per query",
    pipeline_or_yaml_file=retrieval_pipeline
)
```

Let's test out our tool!

```python
tool_result = nutrition_tool.run("protein bar")
print(tool_result[0])

# Image: <|image_
# This image shows: Protein bar with chocolate peanut butter nutrition facts per bar (50g)
```

With our tool ready, we can create our agent. 

### Multimodal LLaVA Models

To process both text and images, we utilize a multimodal LLM introduced in [LLaVA](https://arxiv.org/abs/2304.08485). These models combine an LLM effective in language-focused instruction-tuning with a pre-trained visual encoder skilled in visual understanding.

The visual encoder extracts features from images, linking them to language embeddings using a trainable projection matrix. This matrix translates visual features into language embedding tokens, creating a connection between text and images.

### Initialize the Generator

For our multimodal agent, we initialize a [`Phi35VisionHFGenerator`](https://github.com/IntelLabs/fastRAG/blob/4f73883ca85abf702eb81fd4a384a872b9fd3767/fastrag/generators/llava.py#L211), which processes both text prompts and base64-encoded images. This makes it well-suited for image-to-text tasks like visual question answering.

The `Phi35VisionHFGenerator` generator uses a Hugging Face image-to-text model, which will function as the LLM for our agent. For this example, we’ll use a [4B Phi3.5 Vision model](https://huggingface.co/microsoft/Phi-3.5-vision-instruct) to perform multi-step reasoning with tools and answer questions about the nutrition facts of various foods.

Note that we define the words "Observation:" and "<|end|>" as stop words. These stop words are specific to the model and the ReAct prompting. 

```python
from fastrag.generators.stopping_criteria.stop_words import StopWordsByTextCriteria
from transformers import AutoTokenizer, StoppingCriteriaList
from fastrag.generators.llava import Phi35VisionHFGenerator
import torch

model_name_or_path = "microsoft/Phi-3.5-vision-instruct"
sw = StopWordsByTextCriteria(
    tokenizer=AutoTokenizer.from_pretrained(model_name_or_path),
    stop_words=["Observation:", "<|end|>"],
    device="cpu"
)

generator = Phi35VisionHFGenerator(
    model = model_name_or_path,
    task = "image-to-text",
    generation_kwargs = {
        "max_new_tokens": 100,
        "stopping_criteria": StoppingCriteriaList([sw])
    },
    huggingface_pipeline_kwargs={
        "torch_dtype": torch.bfloat16,
        "trust_remote_code": True,
        "_attn_implementation": "eager",
        "device_map": "auto"
    },
)

generator.warm_up()
```

### ReAct Prompting

To allow our agent to deduce which tools it needs to use logically, we will use [ReAct](https://arxiv.org/abs/2210.03629), which prompts the agent iteratively and requires it to generate 3 main steps:

Let’s say we want a description of how a bird chirps.

1. **Thought**: A logical explanation of what the model should perform (For example, *I will use the docRetriever tool to find a description of how a bird chirps*).
2. **Action:** The precise operation that must be executed (For example, *Tool: docRetriever, Tool Input: {”input”: “Description of how a bird chirps”}*).
3. **Observation:** The output produced by the action (i.e. tool call) after it has been performed (For example, *Observation: A bird's chirp is a light, melodic sound that often feels crisp and rhythmic, with a sequence of short, high-pitched notes…* ).

Let’s define a prompt instructing the LLM to follow the ReAct behavior. Note that we provide tool information as `{tool_names_with_descriptions}` in the prompt.

```python
agent_prompt="""
You are designed to help with a variety of multimodal tasks and can perform multiple hops to answer questions.

## Tools

You have access to a wide variety of tools. You are responsible for using the tools in any sequence you deem appropriate to complete the task at hand.
This may require breaking the task into subtasks and using different tools to complete each subtask.

You have access to the following tools:
{tool_names_with_descriptions}

## Output Format

If you need to make a tool call, your responses should follow this structure instead:

Thought: [your reasoning process, decide whether you need a tool or not]
Tool: [tool name]
Tool Input: [the input to the tool, in a JSON format representing the kwargs (e.g. {{"input": "hello world"}})]
Observation: [tool response]
Final Answer: [final answer to the human user's question after observation]

If you have enough information to answer the question without using any more tools, you MUST finish with "Final Answer:" and respond in the following format:

Thought: [your reasoning process, decide whether you need a tool or not]
Final Answer: [final answer to the human user's question after observation]

"""
prompt_template = {"system":[{"role": "system", "content": agent_prompt}], "chat":[{'role': 'user', 'content': 'Question: {query}\nThought: '}]}
```

### Bring it All Together

With our tools and generator ready, we create our multimodal agent using [Agent](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/agents/base.py#L170). We incorporate [ConversationMemory](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/agents/memory/conversation_memory.py) to save the conversation history between the user and the agent and provide tools with the [ToolsManager](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/agents/base.py#L78).

```python
from fastrag.agents.base import Agent, ToolsManager
from fastrag.agents.create_agent import ConversationMemory

multimodal_agent = Agent(
    generator,
    prompt_template=prompt_template,
    tools_manager=ToolsManager(tools=[nutrition_tool]),
    memory=ConversationMemory(generator=generator),
)
```

## Testing Out the Agent

Our agent is now ready! Let’s start interacting with it. We can begin by asking a question about a food’s nutrition information:

```python
agent_response = multimodal_agent.run("What is protein bar's protein percentage?")
print(agent_response["transcript"])
```

```bash
Thought: I need to find the protein percentage of a protein bar.
Tool: nutrition_tool
Tool Input: {{"input": "protein bar"}}
Observation:
Observation: 
Image: <|image_
This image shows: Protein bar with chocolate peanut butter nutrition facts per bar (50g)

Thought:Thought: I have found the protein percentage of the protein bar.
Final Answer: The protein bar contains 28% protein.
```

The answer is "The protein bar contains 28% protein," and it's correct! You can verify the answer by viewing the image in [this link](https://m.media-amazon.com/images/I/71nh-zRJCSL.jpg).

## Conclusion

In this article, we built a powerful multimodal agent capable of retrieving and answering questions about nutrition facts using fastRAG, Haystack, and the Phi3.5 Vision model. By combining multi-hop reasoning and ReAct prompting, this agent effectively handles complex queries, making it an ideal solution for real-time nutrition information retrieval.

Hopefully, this article gives you an idea of what these types of systems can accomplish by combining both image and textual data to answer multi-faceted questions. 

Check out IntelLabs frameworks for more information and AI solutions:

- [fastRAG](https://github.com/IntelLabs/fastRAG)
- [RAG-FIT](https://github.com/IntelLabs/RAG-FiT)

Happy coding! :)