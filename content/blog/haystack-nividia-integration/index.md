---
layout: blog-post
title: 'Hosted or self-hosted RAG? Full flexibility with NVIDIA NIM integration in Haystack 2.0'
description: Meet Haystack 2.0, a more flexible, customizable LLM framework
featured_image: thumbnail.png
images: ["blog/haystack-nvidia-integration/thumbnail.png"]
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

## Use NVIDIA AI with Haystack 2.0

Now we’ll walk through the nitty-gritty details of how to build a RAG pipeline with Haystack and
hosted NVIDIA APIs. At a high level, you’ll build a couple of [Haystack pipelines](https://docs.haystack.deepset.ai/docs/pipelines): an indexing
pipeline to create and store documents, and a RAG pipeline to query those documents.

In order for this code to work, you’ll need an [NVIDIA API key](https://org.ngc.nvidia.com/setup). Set it as an environment variable,
NVIDIA_API_KEY.

First: install the Haystack NVIDIA integration:

```bash
pip install nvidia-haystack
```
Next, build an indexing pipeline. This example uses one of NVIDIA’s embedding models to turn
documents into vectors, and adds them to the `document_store`.

```python

```

Then create a RAG pipeline to query the data.

```python
```

When switching to self-deployed containers, you simply pass an additional `api_url` init
parameter to the embedder and generator - that’s all.

```python
```

## Wrapping it up
- Want to learn more about Haystack 2.0? Get started with our [tutorials](https://haystack.deepset.ai/tutorials[), [cookbooks](https://github.com/deepset-ai/haystack-cookbook/), and
[blog posts](https://haystack.deepset.ai/blog).
- Have more questions? [Join our community on Discord](https://discord.com/invite/VBpFzsgRVF) or [sign up for our monthly
newsletter](https://landing.deepset.ai/haystack-community-updates).
- Want to learn more about NVIDIA NIM and how to run the containers? Be on the lookout
for a more in-depth technical blog about how to use NIM with Haystack.
