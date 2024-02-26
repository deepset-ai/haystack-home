---
layout: index
header: dark
footer: light
title: Haystack
description: Haystack, the open source NLP framework

# Hero
header: light
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

# Showcase
showcase:
  anchor: showcase
  title: Enabling Semantic Search
  showcaseItems:
    - title: Question Answering
      text: Ask questions in natural language and find granular answers in your documents using the latest QA models with the help of Haystack pipelines.
      url: https://docs.haystack.deepset.ai/docs/ready_made_pipelines#extractiveqapipeline
      buttonText: Explore Docs
      image:
        url: /images/qa.png
        alt: placeholder img
    - title: Document Search
      text: Perform semantic search and retrieve ranked documents according to meaning, not just keywords!
      url: https://docs.haystack.deepset.ai/docs/ready_made_pipelines#documentsearchpipeline
      buttonText: Explore Docs
      image:
        url: /images/document_search.png
        alt: placeholder img
    - title: Latest Models
      text: Make use of and compare latest pre-trained transformer based language models like OpenAI’s GPT-3, BERT, RoBERTa, DPR and more.
      url: https://docs.haystack.deepset.ai/docs/reader#models
      buttonText: Explore Docs
      image:
        url: /images/models.png
        alt: placeholder img

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
