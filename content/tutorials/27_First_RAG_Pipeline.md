---
layout: tutorial
featured: True
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/27_First_RAG_Pipeline.ipynb
toc: True
title: "Creating Your First QA Pipeline with Retrieval-Augmentation"
lastmod: "2024-03-12"
level: "beginner"
weight: 5
description: Build your first generative QA pipeline with OpenAI GPT models
category: "QA"
aliases: []
download: "/downloads/27_First_RAG_Pipeline.ipynb"
completion_time: 10 min
created_at: 2023-12-05
---
    


- **Level**: Beginner
- **Time to complete**: 10 minutes
- **Components Used**: [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore), [`SentenceTransformersDocumentEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder), [`SentenceTransformersTextEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformerstextembedder), [`InMemoryEmbeddingRetriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever), [`PromptBuilder`](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder), [`OpenAIGenerator`](https://docs.haystack.deepset.ai/v2.0/docs/openaigenerator)
- **Prerequisites**: You must have an [OpenAI API Key](https://platform.openai.com/api-keys).
- **Goal**: After completing this tutorial, you'll have learned the new prompt syntax and how to use PromptBuilder and OpenAIGenerator to build a generative question-answering pipeline with retrieval-augmentation.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).

## Overview

This tutorial shows you how to create a generative question-answering pipeline using the retrieval-augmentation ([RAG](https://www.deepset.ai/blog/llms-retrieval-augmentation)) approach with Haystack 2.0. The process involves four main components: [SentenceTransformersTextEmbedder](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformerstextembedder) for creating an embedding for the user query, [InMemoryBM25Retriever](https://docs.haystack.deepset.ai/v2.0/docs/inmemorybm25retriever) for fetching relevant documents, [PromptBuilder](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder) for creating a template prompt, and [OpenAIGenerator](https://docs.haystack.deepset.ai/v2.0/docs/openaigenerator) for generating responses.

For this tutorial, you'll use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World) as Documents, but you can replace them with any text you want.


## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/logging)

## Installing Haystack

Install Haystack 2.0 and other required packages with `pip`:


```bash
%%bash

pip install haystack-ai
pip install "datasets>=2.6.1"
pip install "sentence-transformers>=2.2.0"
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/enabling-telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(27)
```

## Fetching and Indexing Documents

You'll start creating your question answering system by downloading the data and indexing the data with its embeddings to a DocumenStore. 

In this tutorial, you will take a simple approach to writing documents and their embeddings into the DocumenStore. For a full indexing pipeline with preprocessing, cleaning and splitting, check out our tutorial on [Preprocessing Different File Types](https://haystack.deepset.ai/tutorials/30_file_type_preprocessing_index_pipeline).


### Initializing the DocumentStore

Initialize a DocumentStore to index your documents. A DocumentStore stores the Documents that the question answering system uses to find answers to your questions. In this tutorial, you'll be using the `InMemoryDocumentStore`.


```python
from haystack.document_stores.in_memory import InMemoryDocumentStore

document_store = InMemoryDocumentStore()
```

> `InMemoryDocumentStore` is the simplest DocumentStore to get started with. It requires no external dependencies and it's a good option for smaller projects and debugging. But it doesn't scale up so well to larger Document collections, so it's not a good choice for production systems. To learn more about the different types of external databases that Haystack supports, see [DocumentStore Integrations](https://haystack.deepset.ai/integrations?type=Document+Store).

The DocumentStore is now ready. Now it's time to fill it with some Documents.

### Fetch the Data

You'll use the Wikipedia pages of [Seven Wonders of the Ancient World](https://en.wikipedia.org/wiki/Wonders_of_the_World) as Documents. We preprocessed the data and uploaded to a Hugging Face Space: [Seven Wonders](https://huggingface.co/datasets/bilgeyucel/seven-wonders). Thus, you don't need to perform any additional cleaning or splitting.

Fetch the data and convert it into Haystack Documents:


```python
from datasets import load_dataset
from haystack import Document

dataset = load_dataset("bilgeyucel/seven-wonders", split="train")
docs = [Document(content=doc["content"], meta=doc["meta"]) for doc in dataset]
```

### Initalize a Document Embedder

To store your data in the DocumentStore with embeddings, initialize a [SentenceTransformersDocumentEmbedder](https://docs.haystack.deepset.ai/v2.0/docs/sentencetransformersdocumentembedder) with the model name and call `warm_up()` to download the embedding model.

> If you'd like, you can use a different [Embedder](https://docs.haystack.deepset.ai/v2.0/docs/embedders) for your documents.


```python
from haystack.components.embedders import SentenceTransformersDocumentEmbedder

doc_embedder = SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
doc_embedder.warm_up()
```

### Write Documents to the DocumentStore

Run the `doc_embedder` with the Documents. The embedder will create embeddings for each document and save these embeddings in Document object's `embedding` field. Then, you can write the Documents to the DocumentStore with `write_documents()` method.


```python
docs_with_embeddings = doc_embedder.run(docs)
document_store.write_documents(docs_with_embeddings["documents"])
```

## Building the RAG Pipeline

The next step is to build a [Pipeline](https://docs.haystack.deepset.ai/v2.0/docs/pipelines) to generate answers for the user query following the RAG approach. To create the pipeline, you first need to initialize each component, add them to your pipeline, and connect them.

### Initialize a Text Embedder

Initialize a text embedder to create an embedding for the user query. The created embedding will later be used by the Retriever to retrieve relevant documents from the DocumentStore.

> ⚠️ Notice that you used `sentence-transformers/all-MiniLM-L6-v2` model to create embeddings for your documents before. This is why you need to use the same model to embed the user queries.


```python
from haystack.components.embedders import SentenceTransformersTextEmbedder

text_embedder = SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
```

### Initialize the Retriever

Initialize a [InMemoryEmbeddingRetriever](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever) and make it use the InMemoryDocumentStore you initialized earlier in this tutorial. This Retriever will get the relevant documents to the query.


```python
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever

retriever = InMemoryEmbeddingRetriever(document_store)
```

### Define a Template Prompt

Create a custom prompt for a generative question answering task using the RAG approach. The prompt should take in two parameters: `documents`, which are retrieved from a document store, and a `question` from the user. Use the Jinja2 looping syntax to combine the content of the retrieved documents in the prompt.

Next, initialize a [PromptBuilder](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder) instance with your prompt template. The PromptBuilder, when given the necessary values, will automatically fill in the variable values and generate a complete prompt. This approach allows for a more tailored and effective question-answering experience.


```python
from haystack.components.builders import PromptBuilder

template = """
Given the following information, answer the question.

Context:
{% for document in documents %}
    {{ document.content }}
{% endfor %}

Question: {{question}}
Answer:
"""

prompt_builder = PromptBuilder(template=template)
```

### Initialize a Generator


Generators are the components that interact with large language models (LLMs). Now, set `OPENAI_API_KEY` environment variable and initialize a [OpenAIGenerator](https://docs.haystack.deepset.ai/v2.0/docs/OpenAIGenerator) that can communicate with OpenAI GPT models. As you initialize, provide a model name:


```python
import os
from getpass import getpass
from haystack.components.generators import OpenAIGenerator

os.environ["OPENAI_API_KEY"] = getpass("Enter OpenAI API key: ")
generator = OpenAIGenerator(model="gpt-3.5-turbo")
```

> You can replace `OpenAIGenerator` in your pipeline with another `Generator`. Check out the full list of generators [here](https://docs.haystack.deepset.ai/v2.0/docs/generators).

### Build the Pipeline

To build a pipeline, add all components to your pipeline and connect them. Create connections from `text_embedder`'s "embedding" output to "query_embedding" input of `retriever`, from `retriever` to `prompt_builder` and from `prompt_builder` to `llm`. Explicitly connect the output of `retriever` with "documents" input of the `prompt_builder` to make the connection obvious as `prompt_builder` has two inputs ("documents" and "question").

For more information on pipelines and creating connections, refer to [Creating Pipelines](https://docs.haystack.deepset.ai/v2.0/docs/creating-pipelines) documentation.


```python
from haystack import Pipeline

basic_rag_pipeline = Pipeline()
# Add components to your pipeline
basic_rag_pipeline.add_component("text_embedder", text_embedder)
basic_rag_pipeline.add_component("retriever", retriever)
basic_rag_pipeline.add_component("prompt_builder", prompt_builder)
basic_rag_pipeline.add_component("llm", generator)

# Now, connect the components to each other
basic_rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
basic_rag_pipeline.connect("retriever", "prompt_builder.documents")
basic_rag_pipeline.connect("prompt_builder", "llm")
```

That's it! Your RAG pipeline is ready to generate answers to questions!

## Asking a Question

When asking a question, use the `run()` method of the pipeline. Make sure to provide the question to both the `text_embedder` and the `prompt_builder`. This ensures that the `{{question}}` variable in the template prompt gets replaced with your specific question.


```python
question = "What does Rhodes Statue look like?"

response = basic_rag_pipeline.run({"text_embedder": {"text": question}, "prompt_builder": {"question": question}})

print(response["llm"]["replies"][0])
```

Here are some other example questions to test:


```python
examples = [
    "Where is Gardens of Babylon?",
    "Why did people build Great Pyramid of Giza?",
    "What does Rhodes Statue look like?",
    "Why did people visit the Temple of Artemis?",
    "What is the importance of Colossus of Rhodes?",
    "What happened to the Tomb of Mausolus?",
    "How did Colossus of Rhodes collapse?",
]
```

## What's next

🎉 Congratulations! You've learned how to create a generative QA system for your documents with the RAG approach.

If you liked this tutorial, you may also enjoy:
- [Filtering Documents with Metadata](https://haystack.deepset.ai/tutorials/31_metadata_filtering)
- [Preprocessing Different File Types](https://haystack.deepset.ai/tutorials/30_file_type_preprocessing_index_pipeline)
- [Creating a Hybrid Retrieval Pipeline](https://haystack.deepset.ai/tutorials/33_hybrid_retrieval)

To stay up to date on the latest Haystack developments, you can [subscribe to our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=tutorial&utm_medium=first-rag) and [join Haystack discord community](https://discord.gg/haystack).

Thanks for reading!
