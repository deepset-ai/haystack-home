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