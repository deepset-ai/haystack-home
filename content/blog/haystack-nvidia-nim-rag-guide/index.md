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

Build a Haystack RAG pipeline with NVIDIA NIM
