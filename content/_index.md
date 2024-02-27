---
layout: index
header: dark
footer: light
title: Haystack
description: Haystack, the open source NLP framework

# Hero
hero:
  title: The Next Generation<br/> AI Open Source Framework
  buttons:
    - buttonText: Haystack 2.0 is live 🎉
      url: /
    - buttonText: Get Started
      url: /

  features:
    - title: Highly<br> customizable
      highlightedText: Don’t just use Haystack, build on top of it.
      text: The flexible components and pipelines architecture allows you to build around your own specifications and use-cases. Whether you’re building a simple retrieval-augmented generation (RAG) app or a complex architecture with many moving parts.

    - title: Build with leading LLM providers and AI tools
      highlightedText: Have the freedom of choice.
      text: Thanks to our partnerships with many leading LLM providers, vector databases, and AI tools such as OpenAI, Mistral, Weaviate, Pinecone and so much more

    - title: Production is where it gets real
      highlightedText: Get your application in front of the world.
      text: Haystack 2.0 is built from the ground-up with production in mind. Our pipelines are fully serializable and perfect for K8s native workflows. Logging and monitoring integrations give you the transparency you need. Our deployment guides walk you through full-scale deployments on all clouds and on-prem.

  CTA:
    link: https://www.deepset.ai/deepset-cloud
    text: Are you looking for a hosted solution to build highly scalable and always available NLP solutions for your customers?
    logo: /images/logos/deepset-cloud.svg

# Logo garden
logos:
  anchor: logos
  title: "People in our community work for:"
  logoItems:
    - image:
        url: /images/logos/aws-dark.svg
        alt: AWS
    - image:
        url: /images/logos/nvidia-dark.svg
        alt: Nvidia
    - image:
        url: /images/logos/ibm-dark.svg
        alt: IBM
    - image:
        url: /images/logos/intel-dark.svg
        alt: Intel

# Use Cases
useCases:
  anchor: use-cases
  title: Haystack Use Cases
  items:
    - title: Multimodal<br> AI
      text: Architect a next generation AI app around all modalities, not just text. Haystack can do tasks like image generation, image captioning and audio transcription too.
      icon: /images/icons/use-case-1.svg
    - title: Conversational<br> AI
      text: All of our generators provide a standardized chat interface so that you can focus on building the perfect bot for your users.
      icon: /images/icons/use-case-2.svg
    - title: Content<br> Generation
      text: The flexibility and composability of Haystack’s prompt flow is unparalleled. Leverage our Jinja-2 templates and build a content generation engine that exactly matches your workflow.
      icon: /images/icons/use-case-3.svg
    - title: Agentic<br> Pipelines
      text: All our LLM generators come with a standard function-calling interface so that your LLM can leverage tools to achieve more. Our pipeline architecture provides branching and looping to support complex agent workflows.
      icon: /images/icons/use-case-4.svg
    - title: Advanced<br> RAG
      text: Build highly performant RAG pipelines with a multitude of retrieval and generation strategies. From hybrid retrieval to self-correction loops, Haystack has got you covered.
      icon: /images/icons/use-case-1.svg

# Features
features:
  anchor: features
  featureItems:
    - title: Latest Models
      text: Pick any Transformer model from Hugging Face's Model Hub, experiment, find the one that works.
      icon: /images/icons/transformer-models.svg
    - title: Flexible Document Store
      text: Use Haystack NLP components on top of Elasticsearch, OpenSearch, or plain SQL.
      icon: /images/icons/document-store.svg
    - title: Vector Databases
      text: Boost search performance with Pinecone, Milvus, FAISS, or Weaviate vector databases, and dense passage retrieval.
      icon: /images/icons/vector-databases.svg
    - title: Scalable
      text: Build semantic search and question answering applications that can scale to millions of documents.
      icon: /images/icons/scalable.svg
    - title: End-to-end
      text: Building blocks for the entire product development cycle such as file converters, indexing functions, models, labeling tools, domain adaptation modules, and REST API.
      icon: /images/icons/end-to-end.svg
    - title: Pipelines
      text: It's not one-size-fits-all! Combine nodes into flexible and scalable pipelines and launch powerful natural language processing systems.
      icon: /images/icons/pipelines.svg

# Github section
github:
  anchor: github
  title: Start exploring Haystack!
  buttons:
    - buttonText: Check on Github
      url: https://github.com/deepset-ai/haystack
  contributors:
    title: Most active contributors

# Community
community:
  anchor: community
  discord:
    title: Join our community
    text: Our community on Discord is for everyone interested in NLP, using Haystack or even just getting started!
    icon: /images/icons/discord.svg
    buttons:
      - buttonText: Join Discord
        url: https://discord.com/invite/VBpFzsgRVF
  newsletter:
    title: Sign up for community updates
    text: Stay tuned for the latest Haystack community news and events.
    icon: /images/icons/email.svg
    inputPlaceholder: Email address...
    buttonText: Submit
---
