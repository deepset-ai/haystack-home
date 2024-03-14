---
layout: blog-post
title: 'Hosted or self-hosted RAG? Full flexibility with NVIDIA NIM integration in Haystack 2.0'
description: Meet Haystack 2.0, a more flexible, customizable LLM framework
featured_image: thumbnail.png
images: ["blog/haystack-2-release/thumbnail.png"]
toc: True
date: 2024-03-18
last_updated: 2024-03-18
authors:
  - Malte Pietsch
tags: ["Haystack 2.0", "Integration"]
---

## Iteration speed across design options matters

Retrieval-augmented generation (RAG) is one of the most common architectures today for
building LLM applications. With RAG you can very quickly build a prototype that is tailored to
your use case by connecting the LLM to the relevant data sources.

Once you have your first prototype up and running, you typically iterate a lot on your pipeline
design before you go live in production: Switching embedding models or generative LLMs,
adding rerankers, or leveraging the metadata of your documents. 

We often see our users iterate
fifty or more times before settling on the design that meets their requirements. Besides
optimizing the answer quality, users often have additional requirements like costs, latency or
data privacy that determines their target architecture and deployment strategy for going to
production.

Two crucial features are needed to support rapid prototyping during RAG development: the
flexibility to experiment with many different models and features, and the ability to quickly switch
between them.

Both are at the heart of our design for Haystack 2.0. New integrations with microservices from the NVIDIA AI Enterprise software platform, including NVIDIA
NIM and NeMo Retriever, now allow you to iterate even faster across your RAG development
cycle and give you full flexibility with deployment options: - [NVIDIA API Catalog](https://ai.nvidia.com)to quickly
experiment with the latest GPU-accelerated generative AI models on NVIDIA-hosted API
endpoints. And then Sswitch easily quickly and seamlessly to self-hosted NVIDIA NIM
microservice containers that can run in your own VPC or self-hosted cloud.

## What is NVIDIA NIM?

NVIDIA NIM is a set of easy-to-use microservices designed to speed up generative AI
deployment in enterprises. Supporting a wide range of leading community and proprietary AI
models, hosted on NVIDIA API catalog, NIM
ensures seamless, scalable AI inferencing, whether on- premises or in the cloud, leveraging
industry-standard APIs.

To get started, developers can experience GPU-accelerated generative AI models directly from
a browser or test at scale with free credits to NVIDIA-hosted endpoints from the on NVIDIA
API catalog. When ready to deploy, enterprises can export models to a downloadable NVIDIA
NIM container which is included with the NVIDIA AI Enterprise license, and run it anywhere,
giving them ownership to their customizations and full control of their IP and AI application.

