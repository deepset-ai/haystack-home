---
layout: blog-post
title: 'Haystack 2.0:  The Composable Open-Source LLM Framework'
description: Meet Haystack 2.0, a more flexible, customizable LLM framework
featured_image: thumbnail.png
images: ["blog/haystack-2-release/thumbnail.png"]
toc: True
date: 2024-03-11
last_updated: 2024-03-11
authors:
  - Massimiliano Pippi
  - Tuana Celik
tags: ["Haystack 2.0", "Open Source"]
---


Today we are happy to announce [the stable release of Haystack 2.0](/release-notes/2.0.0) - we’ve been working on this for a while, and some of you have already been [testing the beta since its first release in December 2023](/blog/introducing-haystack-2-beta-and-advent).

Haystack is an open-source Python framework for building production-ready LLM applications, with integrations to almost all major model providers and databases.

At its core, Haystack 2.0 is a major rework of the previous version with a very clear goal in mind: making it possible to implement composable AI systems that are easy to use, customize, extend, optimise, evaluate and ultimately deploy to production.

We encourage you to start using Haystack 2.0 as of today, whether you’ve been a Haystack user before or not. You can get started by installing `haystack-ai`, our new package for Haystack 2.0

> ⭐️ **To get started:**
> 
> `pip install haystack-ai` and follow the [get started](/overview/quick-start) instructions to build your first LLM app with just a few lines of code.

If you’re already using Haystack 1.0 in production, don’t worry! If your applications depend on `farm-haystack` and you’re not ready to migrate just yet, you don’t have to take any action: we will keep supporting Haystack 1.0, releasing security updates and critical bug fixes, giving everybody enough time to migrate. In the coming weeks, we will also start sharing some migration guides to help you along the way.

## Why Haystack 2.0?

[Haystack was first officially released in 2020](https://github.com/deepset-ai/haystack/releases/tag/0.2.1), in the good old days when the forefront of NLP was semantic search, retrieval, and extractive question-answering. During this time, we established the core of what makes Haystack _Haystack_: [Components](https://docs.haystack.deepset.ai/docs/nodes_overview) and [Pipelines](https://docs.haystack.deepset.ai/docs/pipelines). These allowed users to build end-to-end applications by combining their desired language models (embedding, extractive QA, ranking) with their database of choice.

The boom of LLMs in 2023 made two things clear:

1.  👍 The pipeline-component structure is a great abstraction for building composable LLM applications with many moving parts.
2.  👎 Haystack 1.0 often assumed that you would be doing retrieval and extractive QA over a set of documents, imposing limitations and providing a developer experience far from ideal when building LLM applications.

So, we decided that the best thing we could do for Haystack and our community was to rewrite the component and pipeline architecture to keep up with the fast-paced AI industry. While Haystack 2.0 is a complete rewrite, the underlying principle of composing components into flexible pipelines remains the same.

With that, let’s take a look at the pillars of Haystack 2.0:

-   Composable and customizable pipelines
-   A common interface for storing data
-   A clear path to production
-   Optimization and Evaluation for Retrieval Augmentation

## Composable and customizable Pipelines

Modern LLM applications [comprise many moving parts](https://bair.berkeley.edu/blog/2024/02/18/compound-ai-systems/): retrievers, rankers, LLMs, and many more such as entity extractors, summarizers, format converters and data cleaners. Each one of these ‘subtasks’ is a _component_ in Haystack.

With the first version of Haystack we proved that pipelines are a good abstraction for connecting all those moving parts, but some of the assumptions we made in Haystack 1.0 dated back to a pre-LLM era and needed rethinking.

One important limitation in Haystack 1.0 is that loops are not allowed, and the pipeline graph has to be acyclic. This makes it difficult to implement, for example, agents, which are often designed with a reasoning flow that loops until a task is resolved.

In Haystack 2.0 the pipeline graph can have cycles. Combined with decision components (think about if-then-else clauses in the execution flow) and routers (components that direct the execution flow towards a specific subgraph depending on the input) this can be used to build sophisticated loops that model agentic behavior.

### Customizable Components

We believe that the design of an AI framework should meet the following requirements:

-   **Be technology agnostic:** Allow users the flexibility to decide what vendor or technology they want for _each_ of these components and make it easy to switch out any component for another.
-   **Be explicit:** Make it transparent as to how these components can “talk” to each other.
-   **Be flexible:** Make it possible to create custom components whenever custom behavior is desirable.
-   **Be extensible:** Provide a uniform and easy way for the community and third parties to build their own components and foster an open ecosystem around Haystack.

All components in Haystack 2.0 (including [Haystack Integrations](https://docs.haystack.deepset.ai/v2.0/docs/integrations)) are built with a common “component” interface. The principle is simple:

-   A component implements some logic in a method called `run`
-   The `run` method receives one or more input values
-   The `run` method returns one or more output values

Take [embedders](https://docs.haystack.deepset.ai/v2.0/docs/embedders) as an example: these components expect text as input and create vector representations (embeddings) that they return as output. On the other hand, [retrievers](https://docs.haystack.deepset.ai/v2.0/docs/retrievers) may need embeddings as input and return documents as output. When creating a new component, to decide what inputs and outputs it should have is part of the ideation process.

While there are many ready-made components built into Haystack, we want to highlight that [building your own custom components](https://docs.haystack.deepset.ai/v2.0/docs/custom-components) is also a core functionality of Haystack 2.0.

> In fact, we’ve taken advantage of this ourselves. For example, you can [read about how to use the latest optimization techniques](https://haystack.deepset.ai/blog/optimizing-retrieval-with-hyde) (like HyDE) in Haystack pipelines with custom components.

### Sharing Custom Components

Since the release of Haystack 2.0-Beta, we’ve seen the benefits of having a well-defined simple interface for components. We, our community, and third parties have already created many components, available as additional packages for you to install.

We share these on the [Haystack Integrations](https://haystack.deepset.ai/integrations) page, which has expanded to include all sorts of components over the last few months (with contributions from [Assembly AI](https://haystack.deepset.ai/integrations/assemblyai), [Jina AI](https://haystack.deepset.ai/integrations/jina), [mixedbread ai](https://haystack.deepset.ai/integrations/mixedbread-ai) and more). We will continue to expand this page with new integrations and you can help us by creating a PR on [haystack-integrations](https://github.com/deepset-ai/haystack-integrations) if you’d like to share a component with the community. To learn more about integrations and how to share them, you can check out our [“Introduction to Integrations” documentation](https://docs.haystack.deepset.ai/v2.0/docs/integrations).

## A common interface for storing data

Most NLP applications work on large amounts of data. A common design pattern is to connect your internal knowledge base to a Large Language Model (LLM) so that it can answer questions, summarize or translate documents, and extract specific information. For example, in retrieval-augment generative pipelines (RAG), you often use an LLM to answer questions about some data that was previously retrieved.

This data has to come from somewhere, and Haystack 2.0 provides a common interface to access it in a consistent way, independently from where data comes from. This interface is called “Document Store”, and it’s implemented for many different storage services, to make data easily available from within Haystack pipelines.

Today, we are releasing Haystack 2.0 with a [large selection of database and vector store integrations](https://haystack.deepset.ai/integrations?type=Document+Store). These include [Chroma](https://haystack.deepset.ai/integrations/chroma-documentstore), [Weaviate](https://haystack.deepset.ai/integrations/weaviate-document-store), [Pinecone](https://haystack.deepset.ai/integrations/pinecone-document-store), [Qdrant](https://haystack.deepset.ai/integrations/qdrant-document-store), [Elasticsearch](https://haystack.deepset.ai/integrations/elasticsearch-document-store), [Open Search](https://haystack.deepset.ai/integrations/opensearch-document-store), [pgvector](https://haystack.deepset.ai/integrations/pgvector-documentstore), [MongoDB](https://haystack.deepset.ai/integrations/mongodb), [AstraDB](https://haystack.deepset.ai/integrations/astradb), [Neo4j](https://haystack.deepset.ai/integrations/neo4j-document-store), [Marqo DB](https://haystack.deepset.ai/integrations/marqo-document-store), and the list will keep growing. And if your storage service is not supported yet, or should you need a high degree of customization on top of an existing one, by following our [guide to creating custom document stores](https://docs.haystack.deepset.ai/v2.0/docs/creating-custom-document-stores), you can connect your Haystack pipelines to your data from pretty much any storage service.

## A clear path to production

The experience we got over the last couple of years, working on Haystack 1.0 and interacting with its community, taught us two things:

1.  It’s essential for any AI application framework to be feature-complete and developer-friendly.
2.  It's only after the deployment phase that AI-based applications can truly make an impact.

While rewriting the framework from scratch, we took the opportunity to incorporate specific features that would simplify the deployment of Haystack-based AI applications in a production-grade environment:

-   A customizable [logging system](https://docs.haystack.deepset.ai/v2.0/docs/logging) that supports structured logging and tracing correlation out of the box.
-   [Code instrumentation collecting spans and traces](https://docs.haystack.deepset.ai/v2.0/docs/tracing) in strategic points of the execution path, with support for Open Telemetry and Datadog already in place.

In addition, we decided to start a dedicated project to simplify deploying Haystack pipelines behind a RESTful API: [Hayhooks](https://docs.haystack.deepset.ai/v2.0/docs/hayhooks).

Hayhooks is a client-server application that allows you to deploy Haystack pipelines, serving them through HTTP endpoints dynamically spawned. Two foundational features of Haystack 2.0 made this possible:

1.  [The ability to introspect a pipeline](https://docs.haystack.deepset.ai/v2.0/reference/pipeline-api#pipelineinputs), determining its inputs and outputs at runtime. This means that every REST endpoint has well-defined, dynamically generated schemas for the request and response body, all depending on the specific pipeline structure.
2.  [A robust serialization mechanism](https://docs.haystack.deepset.ai/v2.0/docs/serialization). This allows for the conversion of Haystack pipelines from Python to a preferred data serialization format, and vice versa. The default format is YAML but Haystack is designed to easily extend support for additional serialization formats.

## Optimization and Evaluation of Retrieval Augmentation

We’ve already been seeing the benefits of the new Haystack design, with pipeline optimization and evaluation being good examples of how we’ve been leveraging Haystack 2.0. How?:

-   It’s easier to extend the capabilities of Haystack
-   It’s easy to implement new integrations

### Implementing the latest retrieval optimizations

Retrieval is a crucial step for successful RAG pipelines. And there’s been a lot of work to optimize this step. With Haystack 2.0, we’ve been able to:

-   Implement Hypothetical Document Embeddings (HyDE) easily, and we’ve already published [a guide to HyDE](https://docs.haystack.deepset.ai/v2.0/docs/hypothetical-document-embeddings-hyde) along with [an example walkthrough](https://haystack.deepset.ai/blog/optimizing-retrieval-with-hyde)
-   Added an integration for [Optimum](https://haystack.deepset.ai/integrations/optimum) embedders by Hugging Face

And we will be able to add more optimization techniques along the way!

### Evaluation

Haystack 2.0 is being released with a few evaluation framework integrations in place:

-   [Ragas](https://haystack.deepset.ai/integrations/ragas)
-   [DeepEval](https://haystack.deepset.ai/integrations/deepeval)
-   [UpTrain](https://haystack.deepset.ai/integrations/uptrain)

Along with a [guide to model-based evaluation](https://docs.haystack.deepset.ai/v2.0/docs/model-based-evaluation).

## Start using Haystack 2.0

Alongside Haystack 2.0, today we are also releasing a whole set of new tutorials, documentation, resources and more to help you get started:

-   [Documentation](https://docs.haystack.deepset.ai/docs): full technical documentation on all Haystack concepts and components
-   [Tutorials](https://haystack.deepset.ai/tutorials): step-by-step, runnable Colab notebooks. Start with our first 2.0 tutorial [“Creating Your First QA Pipeline with Retrieval-Augmentation”](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline)
-   [Cookbooks](https://github.com/deepset-ai/haystack-cookbook): A collection of useful notebooks that showcase Haystack in various scenarios, using a number of our integrations.

And, as always, keep an eye out on our [blog](https://haystack.deepset.ai/blog) and [integrations](https://haystack.deepset.ai/integrations) for updates and new content.

## Join the Community

Stay up-to-date with Haystack:

-   [Discord](https://discord.com/invite/VBpFzsgRVF)
-   [Subscribe to our newsletter](https://landing.deepset.ai/haystack-community-updates?utm-campaign=developer-relations&utm-source=blog&utm-medium=release)
-   [Twitter](https://twitter.com/Haystack_AI)
-   [GitHub](https://github.com/deepset-ai/haystack)