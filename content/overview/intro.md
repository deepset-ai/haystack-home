---
layout: overview
title: What is Haystack?
description: Lorem ipsum dolor sit amet, consectetur adipisicing elit, nisi quisquam et eveniet nesciunt repellendus.
weight: 1
toc: true
---

## Overview

Haystack is an **open-source framework** for building **search systems** that work intelligently over large document collections.
Recent advances in NLP have enabled the application of question answering, retrieval and summarization to real world settings
and Haystack is designed to be the bridge between research and industry.

- **NLP for Search**: Pick components that perform [retrieval](https://docs.haystack.deepset.ai/docs/retriever),
  [question answering](https://docs.haystack.deepset.ai/docs/reader), [reranking](https://docs.haystack.deepset.ai/docs/ranker) and much more.

- **Latest models**: Utilize all transformer based models (BERT, RoBERTa, MiniLM, DPR) and smoothly switch when new ones get published.

- **Flexible databases**: Load data into and query from a range of [databases](https://docs.haystack.deepset.ai/docs/document_store) such as Elasticsearch, Milvus, FAISS, SQL and more.

- **Scalability**: [Scale your system](https://docs.haystack.deepset.ai/docs/optimization) to handle millions of documents and deploy them via [REST API](https://docs.haystack.deepset.ai/docs/rest_api).

- **Domain adaptation**: All tooling you need to [annotate](https://docs.haystack.deepset.ai/docs/annotation) examples, collect [user-feedback](https://docs.haystack.deepset.ai/docs/domain_adaptation#user-feedback), [evaluate](https://docs.haystack.deepset.ai/docs/evaluation) components and [finetune](https://docs.haystack.deepset.ai/docs/domain_adaptation) models.

![image](/images/concepts_haystack_handdrawn.png)

## Enabling New Styles of Search

Haystack is designed to take your search to the next level.
Keyword search is effective and appropriate for many situations,
but Machine Learning has enabled systems to search based on word meaning rather than string matching.
As new language processing models are developed, new styles of search are also possible.
In Haystack, you can create systems that perform:

- [Question Answering](https://docs.haystack.deepset.ai/docs/ready_made_pipelines#extractiveqapipeline)
- [Summarization](https://docs.haystack.deepset.ai/docs/ready_made_pipelines#searchsummarizationpipeline)
- [Document Search](https://docs.haystack.deepset.ai/docs/ready_made_pipelines#documentsearchpipeline)
- [Question Generation](https://docs.haystack.deepset.ai/docs/ready_made_pipelines#questiongenerationpipeline)

This is just a small subset of the kinds of systems that can be created in Haystack.

## How Haystack Works

Haystack is geared towards building great search pipelines that are customizable and production ready.
There are 3 different levels on which you can interact with the components in Haystack.

- Nodes
- Pipelines
- REST API

To find out more, visit our Documentation

{{< button url="https://docs.haystack.deepset.ai/docs" text="Documentation" color="green">}}
