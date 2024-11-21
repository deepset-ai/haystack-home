---
layout: blog-post
title: 'Announcing Studio: Your Development Environment for Haystack'
description: Build, deploy, and test Haystack pipelines with ease
featured_image: thumbnail.png
images: ["blog/announcing-studio/thumbnail.png"]
toc: True
date: 2024-11-20
last_updated:  2024-11-20
authors:
  - Malte Pietsch
  - Bilge Yucel
tags: ["Community"]
---	

We’re thrilled to announce an exciting new addition to the Haystack ecosystem: **deepset Studio**! After countless requests from our community for a visual editor to create AI workflows and invaluable feedback during the beta phase, we’re officially launching deepset Studio, a powerful tool for visually building, deploying, and managing Haystack pipelines.

<video autoplay loop muted playsinline poster="/images/studio-image.png" width="700" height="398" class="responsive"><source src="/images/studio.mp4" type="video/mp4"></video>

## What is deepset Studio?

**deepset Studio** is the community version of deepset Cloud, the enterprise offering from the creators of Haystack. It allows users to visually construct and deploy Haystack [pipelines](https://docs.haystack.deepset.ai/docs/pipelines) for free. With an intuitive drag-and-drop interface, Studio simplifies the process of designing AI applications by combining Haystack’s core and core-integration [components](https://docs.haystack.deepset.ai/docs/components). 

If you're a Haystack user, you'll feel right at home. You can visually connect the same components you use in code - streamlining your workflow and reducing development time.

> 💡 Learn the basics of Haystack in our tutorial: [Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline).
> 

### Why “Composable AI” Matters

AI workflows are rarely monolithic. Instead, they’re built as **modular systems** where smaller tasks work together to achieve a larger goal, an approach often referred to as **Composable AI** or **Compound AI**.

Take **Retrieval-Augmented Generation (RAG)** as an example. A RAG application consists of:

1. Retrieval: Fetching the most relevant context for a query.
2. Augmentation: Embedding the retrieved context into a prompt for the LLM.
3. Generation: Using the prompt to generate a response with an LLM.

As workflows grow in complexity, the number of tasks and components increases, making it harder to manage the entire system. With Studio, you can architect these use cases visually, test, and deploy workflows, simplifying the process and reducing overhead.

## Key Features

With deepset Studio, you can:

- **Build visually**: Drag, drop, and connect components to create custom pipelines.
- **Use a built-in vector database**: Leverage OpenSearch or connect to your preferred instance (Weaviate, Qdrant, ElasticSearch, or Pinecone).
- **Start quickly**: Use your own files or explore the sample files available in deepset Cloud.
- **Leverage pipeline templates**:  Take advantage of pre-built pipeline templates for common use cases such as Retrieval Augmented Generation (RAG).
- **Experiment with custom components**: Initial support for [integrating your own components](https://docs.cloud.deepset.ai/docs/create-a-custom-component) into pipelines.
- **Deploy with ease**: Host Haystack pipelines on deepset Cloud infrastructure.
- **Test and share**: Test pipelines in the Playground and share prototypes with stakeholders.
- **Export pipelines**: Export your pipeline as a YAML definition or Python code to run locally or customize further.

> 💡 **Want to dive deeper?** Check out our blog post: [Design Haystack AI Applications Visually with deepset Studio & NVIDIA NIMs](https://haystack.deepset.ai/blog/deepset-studio-and-nvidia-nims) to learn how to build your first indexing and RAG pipeline with Studio.

<video autoplay loop muted playsinline poster="/images/studio-image.png" width="700" height="398" class="responsive"><source src="/images/studio-playground.mp4" type="video/mp4"></video>

### Coming soon

We’re actively working to make Studio even more versatile. Here’s a glimpse of what’s coming soon:

- **Enhanced custom component support**: Seamlessly bring your own integrations alongside Haystack's core suite.
- **Extended database options**: Support for more storage solutions.

## Open Access: Start Using Studio Today!

**deepset Studio is free and open to everyone!** [Sign up](https://landing.deepset.ai/deepset-studio-signup) today to start exploring and creating with Studio. Whether you’re building simple RAG workflows or architecting complex AI systems, Studio offers the tools you need to get started. Learn more about Studio on [deepset blog](https://www.deepset.ai/blog/introducing-deepset-studio-visual-ai-builder).

**Need help or have feedback?** Join the dedicated `#deepset-studio` channel on our [Haystack Discord server](https://discord.gg/Dr63fr9NDS). Our team and community are happy to hear your thoughts. 🧡