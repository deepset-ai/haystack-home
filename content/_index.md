---
layout: index
header: dark
footer: light
title: Haystack
description: Haystack, the open source NLP framework

# Hero
hero:
  title: Open-source LLM framework to build production-ready applications
  bulletPoints:
    - "Use the latest LLMs: hosted models by OpenAI or Cohere, open-source LLMs, or other pre-trained models"
    - "All tooling in one place: preprocessing, pipelines, agents & tools, prompts, evaluation and finetuning, document and vector databases (Elasticsearch, OpenSearch, Weaviate, Pinecone, Qdrant, Milvus and more)"
    - "Scale to millions of documents: use Haystack's proven retrieval architecture"
  buttons:
    - buttonText: Learn more
      url: /overview/intro
  image: /images/hero.png

# Logo garden
logos:
  anchor: logos
  title: People in our community work for
  logoItems:
    - image:
        url: /images/logos/databricks.svg
    - image:
        url: /images/logos/rakuten.svg
    - image:
        url: /images/logos/nvidia.svg
    - image:
        url: /images/logos/aws.svg
    - image:
        url: /images/logos/betterup.svg

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
