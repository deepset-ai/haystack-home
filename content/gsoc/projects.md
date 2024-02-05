---
header: dark
footer: dark
title: GSoC Project Ideas
description: Haystack project ideas for Google Summer of Code.
weight: 1
toc: true
---

## spaCy Integration in Haystack: Seamless NLP Pipelines

- **Proposed mentors:** [Madeesh Kannan](https://www.linkedin.com/in/m-kannan/), [Stefano Fiorucci](https://www.linkedin.com/in/stefano-fiorucci/)
- **Languages/skills:** Python, spaCy
- **Estimated Project Length:** 175 hours
- **Difficulty:** medium

spaCy and Haystack are two NLP frameworks with different strengths that complement each other but currently they can hardly be used together. The goal of this project is a spaCy integration in Haystack, providing NLP practitioners, developers, and researchers with the flexibility to harness the combined power of both frameworks seamlessly in their NLP workflows. The implementation of this integration will allow users to easily incorporate spaCy components, such as tokenization, feature extraction, named entity recognition (NER), and part-of-speech (POS) tagging, to enhance the preprocessing capabilities of Haystack. Project participants could also focus in particular on efficient processing of large-scale text data, taking advantage of spaCy's parallel processing capabilities for speed and scalability.

## Knowledge Graphs and SQL Databases as data sources for RAG pipelines

- **Proposed mentors:** [Vladimir Blagojevic](https://www.linkedin.com/in/blagojevicvladimir/), [Julian Risch](https://www.linkedin.com/in/julianrisch/)
- **Languages/skills:** Python, SQL, SPARQL (or other graph query language)
- **Estimated Project Length:** 350 hours
- **Difficulty:** hard

One of the features many members in Haystack’s large community wish for is the support of knowledge graphs and relational databases. The task here is to enable users to retrieve information from those sources and seamlessly use them in retrieval augmented generation (RAG) pipelines. This has three required subtasks: 1) the implementation of specialized LLM-based components dynamically generating queries, such as SQLQueryGenerator and KGQueryGenerator, 2) retrievers tailored for sending queries to SQL and KG data sources and fetching query results while ensuring minimal latency and high throughput, and 3) customization options for users to fine-tune query generation based on their specific data schema and requirements. The final task of the project is to conduct automated end-to-end testing to validate the integration of SQL and KG retrieval components within RAG pipelines.

## Command Line Interface: Streamlined Development and User-friendly NLP Pipelines

- **Proposed mentors:** [Silvano Cerza](https://www.linkedin.com/in/silvanocerza/), [Massimiliano Pippi](https://www.linkedin.com/in/masci/)
- **Languages/skills:** Prior experience with creating a CLI tool is preferred
- **Estimated Project Length:** 175 hours
- **Difficulty:** medium

While Haystack provides cutting-edge features for building large language model applications, the first steps of contributors and users can still be cumbersome and time consuming. This project is about developing a Command Line Interface (CLI) for Haystack, serving two primary purposes: 1) improving the developer experience by designing and implementing CLI commands that facilitate the process of creating, testing, and deploying new integrations for Haystack. This includes commands for scaffolding boilerplate code, setting up project structures, and automating common development tasks associated with building Haystack-compatible components. 2) improving the user experience by providing an intuitive and convenient way to easily create, customize, and execute NLP pipelines using predefined templates through commands, making complex workflows simpler. As a result, the CLI will contribute to the broader goal of making Haystack more accessible to a diverse range of users and contributors.

## Multi-modal Support: Audio and Image Data Inputs

- **Proposed mentors:** [Sara Zanzottera](https://www.linkedin.com/in/sarazanzottera/), [Silvano Cerza](https://www.linkedin.com/in/silvanocerza/)
- **Languages/skills:** Python, Basic understanding of embedding models is preferred
- **Estimated Project Length:** 350 hours
- **Difficulty:** medium

Haystack is well known for supporting text-based use cases but for non-textual data it is currently limited to transcribing audio files with Whisper models. The objective of this project is to extend the capabilities of the framework by introducing support for multi-modal data inputs, specifically audio and image data. This involves the implementation of new components that allow users to embed and index files of various audio and image formats, normalize, scale, and transform the data, and search through them. The focus will be on utilizing Google Gemini or similar models to showcase extracting valuable information from audio and image inputs and making them compatible with existing Haystack pipelines.

## Table QA: Enhancing Question Answering on Tabular Data

- **Proposed mentors:** [Julian Risch](https://www.linkedin.com/in/julianrisch/), [Stefano Fiorucci](https://www.linkedin.com/in/stefano-fiorucci/)
- **Languages/skills:** Python, Usage of Large Language Models
- **Estimated Project Length:** 350 hours
- **Difficulty:** hard

Haystack supports retrieval of tables and extractive question answering on them for more than two years, yet users would greatly benefit from an extension of those features in order to build fully production-ready applications. The aim of this project is therefore to leverage generative models for table reading and to address challenges like extraction and preprocessing of tables spanning multiple PDF pages, inconsistent formatting, and merged cells. The task is further to implement validation procedures, including unit tests and end-to-end tests, to ensure robust performance of table retrieval and reading components in real-world scenarios. To make the newly added features more accessible to a diverse range of users and contributors, a tutorial containing best practices for configuring the new components completes the project.
