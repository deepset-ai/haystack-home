---
layout: overview
header: dark
footer: dark
title: What is Haystack?
description: Haystack is an open source framework for building production-ready LLM applications, retrieval-augmented generative pipelines and state-of-the-art search systems that work intelligently over large document collections.
weight: 1
toc: true
---

Haystack is an open source framework for building production-ready *LLM applications*, *retrieval-augmented generative pipelines* and *state-of-the-art search systems* that work intelligently over large document collections. It lets you quickly try out the latest AI models while being flexible and easy to use. Our inspiring community of users and builders has helped shape Haystack into the modular, intuitive, complete framework it is today. 

## Building with Haystack

Haystack offers comprehensive tooling for developing state-of-the-art AI systems that use LLMs. 

- Use models hosted on platforms like [Hugging Face](https://haystack.deepset.ai/integrations/huggingface), [OpenAI](https://haystack.deepset.ai/integrations/openai), [Cohere](https://haystack.deepset.ai/integrations/cohere), [Mistral](https://haystack.deepset.ai/integrations/mistral), [and more](https://haystack.deepset.ai/integrations?type=Model+Provider).
- Use models deployed on [SageMaker](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html), [Bedrock](https://haystack.deepset.ai/integrations/amazon-bedrock), [Azure](https://haystack.deepset.ai/integrations/azure)…
- Take advantage of our document stores: [OpenSearch](https://haystack.deepset.ai/integrations/opensearch-document-store/), [Pinecone](https://haystack.deepset.ai/integrations/pinecone-document-store), [Weaviate](https://haystack.deepset.ai/integrations/weaviate-document-store), [QDrant](https://haystack.deepset.ai/integrations/qdrant-document-store) [and more](https://haystack.deepset.ai/integrations?type=Document+Store).
- Our growing [ecosystem of community integrations](https://haystack.deepset.ai/integrations) provide tooling for [evaluation](https://haystack.deepset.ai/integrations?type=Evaluation+Framework), [monitoring](https://haystack.deepset.ai/integrations?type=Monitoring+Tool), [data ingestion](https://haystack.deepset.ai/integrations?type=Data+Ingestion) and every layer of your LLM application.

{{< img src="/images/model_providers.png" alt="Model Providers" styling="centered" width="800">}}

Some examples of what you can build include:

- **Advanced RAG** on your own data source, powered by the latest retrieval and generation techniques
- **Chatbots and agents** powered by cutting-edge generative models like GPT-4, that can even call external functions and services
- **Generative multi-modal question answering** on a knowledge base containing mixed types of information: images, text, audio, and tables
- **Information extraction** from documents to populate your database or build a knowledge graph

This is just a small subset of the kinds of systems that can be created in Haystack.

## End to end functionality for your LLM project

A successful LLM project requires more than just the language models. As an end-to-end framework, Haystack assists you in building your system every step of the way:

- Seamless inclusion of models from Hugging Face or other providers into your pipeline
- Integrate data sources for retrieval augmentation, [from anywhere on the web](https://docs.haystack.deepset.ai/v2.0/docs/linkcontentfetcher)
- Advanced dynamic templates for LLM prompting via the Jinja2 templating language
- [Cleaning and preprocessing functions](https://docs.haystack.deepset.ai/v2.0/docs/documentcleaner) for various data formats and sources
- [Integrates with your preferred document store](https://docs.haystack.deepset.ai/docs/document_store): keep your GenAI apps up-to-date with Haystack’s indexing pipelines that help you prepare and maintain your data
- [Specialized evaluation tools](https://docs.haystack.deepset.ai/v2.0/docs/model-based-evaluation) that use different metrics to evaluate the entire system or its individual components
- [Hayhooks module](https://docs.haystack.deepset.ai/v2.0/docs/hayhooks) to serve Haystack Pipelines through HTTP endpoints
- A customizable [logging system](https://docs.haystack.deepset.ai/v2.0/docs/logging) that supports structured logging and tracing correlation out of the box.
- [Code instrumentation collecting spans and traces](https://docs.haystack.deepset.ai/v2.0/docs/tracing) in strategic points of the execution path, with support for Open Telemetry and Datadog already in place

But that’s not all: [metadata filtering](https://docs.haystack.deepset.ai/v2.0/docs/model-based-evaluation), [device management for locally running models](https://docs.haystack.deepset.ai/v2.0/docs/device-management), even advanced RAG techniques like [Hypothetical Document Embedding (HyDE)](https://docs.haystack.deepset.ai/v2.0/docs/hypothetical-document-embeddings-hyde). Whatever your AI heart desires, you’re likely to find it in Haystack. And if not? We’ll build it together.

{{< img src="/images/rest.png" alt="Rest API" styling="centered" width="800" quality="100">}}

## Building blocks

Haystack uses two primary concepts to help you build fully functional and customized end-to-end GenAI systems.

### Components

At the core of Haystack are its [components](https://docs.haystack.deepset.ai/docs/components_overview—fundamental) building blocks that can perform tasks like [document retrieval](https://docs.haystack.deepset.ai/docs/retrievers), [text generation](https://docs.haystack.deepset.ai/docs/generators), or [creating embeddings](https://docs.haystack.deepset.ai/docs/embedders). A single component is already quite powerful. It can manage local language models or communicate with a hosted model through an API.

While Haystack offers a bunch of components you can use out of the box, it also lets you create your own [custom components](https://docs.haystack.deepset.ai/docs/custom-components) — as easy as writing a Python class. Explore the [collection of integrations](https://haystack.deepset.ai/integrations) that includes custom components developed by our partners and community, which you can freely use.

You can connect components together to build *pipelines*, which are the foundation of LLM application architecture in Haystack.

### Pipelines

[Pipelines](https://docs.haystack.deepset.ai/docs/pipelines) are powerful abstractions that allow you to define the flow of data through your LLM application. They consist of *components*.

 As a developer, you have complete control over how you arrange the components in a pipeline. Pipelines can branch out, join, and also cycle back to another component. You can compose Haystack pipelines that can retry, loop back, and potentially even run continuously as a service. 

Pipelines are essentially graphs, or even multigraphs. A single component with multiple outputs can connect to another single component with multiple inputs or to multiple components, thanks to the flexibility of pipelines.

To get you started, Haystack offers many [example pipelines](https://github.com/deepset-ai/haystack-cookbook) for different use cases: indexing, agentic chat, RAG, extractive QA, function calling, web search and more.

## Who’s it for?

Haystack is for everyone looking to build AI apps — LLM enthusiasts and newbies alike. You don’t need to understand how the models work under the hood. All you need is some basic knowledge of Python to dive right in.

## Our community

At the heart of Haystack is the vibrant open source community that thrives on the diverse backgrounds and skill sets of its members. We value collaboration greatly and encourage our users to shape Haystack actively through [GitHub](https://github.com/deepset-ai/haystack) contributions. Our [Discord server](https://discord.com/invite/VBpFzsgRVF) is a space where community members can connect, seek help, and learn from each other.

We also organize [live online and in-person events](https://lu.ma/haystack), webinars, and office hours, which are an opportunity to learn and grow.

💬 [Join Discord](https://discord.com/invite/VBpFzsgRVF)

💌 Sign up for our [monthly email newsletter](https://landing.deepset.ai/haystack-community-updates)

🎥 Subscribe to [the Haystack YouTube channel](https://www.youtube.com/@haystack_ai)

🐘 Follow us on [Twitter](https://x.com/Haystack_AI[) or [Mastodon](https://fosstodon.org/@haystack_ai)

📆 [Subscribe to our lu.ma calendar](https://lu.ma/haystack) to stay informed about events

## Enter the Haystack universe

- Start building with [cookbooks](https://github.com/deepset-ai/haystack-cookbook) in Colab notebooks
- Learn interactively via [tutorials](https://haystack.deepset.ai/tutorials)
- Have a look at the [documentation](https://docs.haystack.deepset.ai/)
- Read and contribute to our [blog](https://haystack.deepset.ai/blog)
- Visit our [GitHub repo](https://github.com/deepset-ai/haystack)