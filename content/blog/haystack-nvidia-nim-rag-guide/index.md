---
layout: blog-post
title: Building RAG Applications with NVIDIA NIM Inference Microservices and Haystack on K8s 
description: "See how to self-host and deploy models with Nvidia NIMs alongside Haystack RAG pipelines. Deploy and orchestrate with Kubernetes."
featured_image: thumbnail.png
images: ["blog/haystack-nvidia-nim-rag-guide/thumbnail.png"]
featured_image_caption: Diagram of a RAG pipeline connecting NVIDIA retrieval and LLM NIMs with Haystack
alt_image: Diagram of a RAG pipeline connecting NVIDIA retrieval and LLM NIMs with Haystack
toc: True
date: 2024-06-02
last_updated:  2024-06-02
authors:
  - Anshul Jindal
  - Meriem Bendris
  - Tuana Celik
  - Tilde Thurium
tags: ["Integrations", "Haystack 2.0"]
---	

Retrieval-augmented generation (RAG) systems combine generative AI with information retrieval for contextualized answer generation. Building reliable and performant RAG applications at scale is challenging. In this blog, we show how to use Haystack and NVIDIA NIM to create a RAG solution which is easy to deploy/maintain, standardized and enterprise-ready, that can run on-prem as well as on cloud native environments. This recipe is applicable in the cloud, on-premise or even in air-gapped environments.

## About Haystack

[Haystack](https://haystack.deepset.ai/), by [deepset](https://www.deepset.ai/), is an open source framework for building production-ready LLM applications, RAG pipelines and state-of-the-art search systems that work intelligently over large document collections. Haystack’s [growing ecosystem of community integrations](https://haystack.deepset.ai/integrations) provide tooling for evaluation, monitoring, transcription, data ingestion and more. The [NVIDIA Haystack integration](https://haystack.deepset.ai/integrations/nvidia) allows using NVIDIA models and NIM microservices in Haystack pipelines, [giving the flexibility to pivot from prototyping in the cloud to deploying on-prem](https://haystack.deepset.ai/blog/haystack-nvidia-integration).

## About NVIDIA NIM

NVIDIA NIM is a collection of containerized microservices designed for optimized inference of state-of-the-art  AI models.  The container uses a variety of components to serve AI models and exposes them via standard API. Models are optimized using [TensorRT](https://developer.nvidia.com/tensorrt) or TensorRT-LLM (depending on the type of the model), applying procedures such as quantization, model distribution, optimized kernel/runtimes and inflight- or continuous batching among others allowing even further optimization if needed. Learn more about NIM here.

## Build a Haystack RAG pipeline with NVIDIA NIM

For RAG pipelines, Haystack provides 3 components that can be connected with NVIDIA NIM: 
- [NvidiaGenerator](https://docs.haystack.deepset.ai/docs/nvidiagenerator): Text generation with self-deployed LLM NIM.
- [NvidiaDocumentEmbedder](https://docs.haystack.deepset.ai/docs/nvidiadocumentembedder): Document embedding with self-deployed NVIDIA NeMo
- [Embedding NIM](https://build.nvidia.com/nvidia/embed-qa-4) to be stored in vector stores.
- [NvidiaTextEmbedder](https://docs.haystack.deepset.ai/docs/nvidiatextembedder): Query embedding with self-deployed NeMo Retriever embedding NIM.

For this section, we have provided scripts and instructions for building a RAG pipeline with models hosted by NVIDIA (so you can start even if you do not have access to the `rag-with-nvidia-nims` [GitHub repository](https://github.com/deepset-ai/nvidia-haystack). A [self-hosted notebook](https://colab.research.google.com/github/deepset-ai/haystack-cookbook/blob/main/notebooks/rag-with-nims.ipynb) is provided for the same pipeline using self-hosted NIMs. 

## Vectorize Documents with Haystack Indexing Pipelines

Our indexing pipeline implementation is available in the [indexing tutorial](https://github.com/deepset-ai/nvidia-haystack/blob/main/indexing.py). Haystack provides several [preprocessing](https://docs.haystack.deepset.ai/docs/preprocessors) components for document cleaning, splitting, [embedders](https://docs.haystack.deepset.ai/docs/converters), as well as [converters](https://docs.haystack.deepset.ai/docs/converters) extracting data from files in different formats. In this tutorial, we will store PDF files in a `QdrantDocumentStore`. `NvidiaDocumentEmbedder` is used to connect with models hosted by NVIDIA accessible [here](https://build.nvidia.com/explore/retrieval). Below is an example of how to initialize the embedder component with the NVIDIA-hosted [`snowflake/arctic-embed-l`](https://build.nvidia.com/snowflake/arctic-embed-l) model.

```python
from haystack.utils.auth import Secret
from haystack_integrations.components.embedders.nvidia import NvidiaDocumentEmbedder


embedder = NvidiaDocumentEmbedder(model="snowflake/arctic-embed-l",
                                  api_url="https://ai.api.nvidia.com/v1/retrieval/snowflake/arctic-embed-l",
                                  batch_size=1)
```

## Creating the Haystack RAG Pipeline

In our example, we will create a simple question/answering RAG pipeline using both Embedding Retrieval and LLM NIMs. For this pipeline, we use the NvidiaTextEmbedder to embed the query for retrieval, and the NvidiaGenerator to generate a response. An example is shown below for how to instantiate the generator using [`meta/llama3-70b-instruct` as an NVIDIA hosted LLM NIM](https://build.nvidia.com/meta/llama3-70b).

```python
generator = NvidiaGenerator(
    model="meta/llama3-70b-instruct",
    api_url="https://integrate.api.nvidia.com/v1",
    model_arguments={
        "max_tokens": 1024
    }
)
```


We use Haystack pipelines to connect various components of this RAG pipeline including query embedders and LLM generators. Below is an example of a RAG pipeline:

```python
from haystack import Pipeline
from haystack.utils.auth import Secret
from haystack.components.builders import PromptBuilder
from haystack_integrations.components.embedders.nvidia import NvidiaTextEmbedder
from haystack_integrations.components.generators.nvidia import NvidiaGenerator
from haystack_integrations.components.retrievers.qdrant import QdrantEmbeddingRetriever
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore

document_store = QdrantDocumentStore(embedding_dim=1024, host="qdrant")

embedder = NvidiaTextEmbedder(model="snowflake/arctic-embed-l", 
                                  api_key=Secret.from_env_var("NVIDIA_EMBEDDINGS_KEY"), 
                                  api_url="https://ai.api.nvidia.com/v1/retrieval/snowflake/arctic-embed-l")

retriever = QdrantEmbeddingRetriever(document_store=document_store)

prompt = """Answer the question given the context.
Question: {{ query }}
Context:
{% for document in documents %}
    {{ document.content }}
{% endfor %}
Answer:"""
prompt_builder = PromptBuilder(template=prompt)

generator = NvidiaGenerator(
    model="meta/llama3-70b-instruct",
    api_url="https://integrate.api.nvidia.com/v1",
    model_arguments={
        "max_tokens": 1024
    }
)

rag = Pipeline()
rag.add_component("embedder", embedder)
rag.add_component("retriever", retriever)
rag.add_component("prompt", prompt_builder)
rag.add_component("generator", generator)

rag.connect("embedder.embedding", "retriever.query_embedding")
rag.connect("retriever.documents", "prompt.documents")
rag.connect("prompt", "generator")
```

## Indexing Files and Deploying the Haystack RAG Pipeline

[Hayhooks](https://docs.haystack.deepset.ai/docs/hayhooks) allows the deployment of RAG pipelines in a containerized environment. In our example, we have provided [a docker-compose file](https://github.com/deepset-ai/nvidia-haystack/blob/main/docker-compose.yml) to set up both the Qdrant database, and the RAG pipeline. As we are using NVIDIA-hosted models, we need to set the API keys for the listed models on the .env file. The instructions below expect an `NVIDIA_API_KEY` (for `NvidiaGenerator`) and `NVIDIA_EMBEDDINGS_KEY` (for `NvidiaDocumentEmbedder` and `NvidiaTextEmbedder`). 

Executing `docker-compose up` will launch 3 containers: **qdrant**, **hayhooks** and **qdrant-setup** (which will run our indexing pipeline and stop). The Qdrant database will be deployed on the localhost and exposed at port 6333. The Qdrant dashboard allows users to inspect the vectorized documents at **localhost:6333/dashboard**.

### Serializing Pipelines

