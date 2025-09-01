---
layout: blog-post
title: 'How Telus Built an Agentic Chatbot with Haystack to Transform Trade Promotions Workflows'
description: See how Telus give users unprecedented access to their data with safety in mind
featured_image: thumbnail.png
images: ["blog/telus-user/thumbnail.png"]
toc: True
date: 2025-09-01
last_updated:  2025-09-01
authors:
  - Bilge Yucel
  - Kelsey Sorrels
tags: ["User Story"]
---	

When a leading company like **Telus**, a global communications and technology powerhouse with a strong presence in agriculture and consumer goods, turns to AI to streamline complex processes, it’s worth taking a closer look.

Telus Agriculture & Consumer Goods helps businesses optimize everything from supply chains to retail operations. One of their latest innovations: an **agentic chatbot powered by Haystack** that simplifies the way users interact with their trade promotions platform.

We sat down with the team behind this project to learn how they built it, why they chose Haystack, and what advice they have for other teams looking to implement Retrieval-Augmented Generation (RAG) and agent-based AI solutions in production.

## The Challenge: Simplifying Complex Workflows

The team’s mission was clear: **give users instant, intelligent access to their data** without requiring them to dig through documentation or request SQL queries from developers.

Previously, users had to navigate dense manuals and wait for SQL reports to be prepared—a process that slowed down decision-making and made even simple questions a hassle.

The chatbot changes all of this. Instead of manually searching through documents or filing tickets for SQL help, users can now ask questions conversationally and get real-time answers. Whether it’s a one-off question about trade promotions or a request for deeper insights, the system delivers immediate results. No waiting, no back-and-forth with development teams.

As the team put it, this was about **“giving users unprecedented access to their data”** while removing the bottlenecks of traditional reporting systems

## Choosing Haystack: From Exploration to Production

When the team began exploring options, they came across **Haystack** while researching RAG workflows and evaluation tools like Ragas. What they needed was a framework that could **support retrieval-augmented generation**, **handle tool calling** for tasks like SQL query generation, and provide **streaming capabilities** for real-time interactions.

Haystack quickly stood out.

> “_Haystack checked all the boxes and was easy to get up and running. Switching to Haystack gave us exactly what we needed._”
> 

The team had some experience with other frameworks, but Haystack’s flexibility, modular design and ease of use allowed them to build a proof of concept almost immediately, earning early buy-in and helping them **move fast from experimentation to production**.

## The Technical Architecture: From Pipelines to Agents

The first version of the system used a **pipeline-based architecture** with two separate workflows:

- One workflow handled **knowledge base queries** via RAG after ingesting user documentation and converting it from raw HTML into a searchable format
- Another generated SQL queries from user inputs using metadata and schema descriptions, then executed them on the SQL database

A *topic router* decided which workflow to trigger. However, this setup quickly proved **too rigid** for real-world use.

To address this, the team moved to an **agent-based architecture**. Instead of maintaining isolated pipelines, they wrapped each capability, the RAG workflow and the SQL pipeline, into separate *tools* that an agent could call dynamically as needed.

The solution was to move to an **agent-based architecture**. Instead of isolated pipelines, the team wrapped each capability, the RAG workflow and the SQL pipeline, into separate *tools* that an agent could call dynamically. 

Switching to an **agent-based model** was a game-changer. With Haystack Agents, the system gained the ability to:

- Retrieve documentation and query the SQL database within a single conversational flow
- Retry and rewrite queries based on error messages (self-debugging)
- Deliver **emergent behaviors** like combining insights from multiple sources

### Key Components of the Solution

- **Knowledge Base Tool**: Ingests user documentation (HTML → searchable documents)
- **SQL Tool**: Generates queries with metadata awareness, using MS SQL + SQL Alchemy
- **Observability & Monitoring**:
    - OTEL (OpenTelemetry) for observability
    - LangFuse + Sentry for monitoring and debugging
- **ETL & Development**: Kedro for ETL pipelines, Gradio for UI testing
- **Guardrails & Safety**:
    - Restricting the incoming SQL queries to `SELECT` statements with `LIMIT` clauses
    - Sanitizing SQL table/column names before output to prevent leakage
    - Enforcing user identity constraints on generated queries

The team’s focus on **security and reliability** ensures sensitive data stays protected while users enjoy a smooth experience.

## Evaluating the Performance

To track performance, the team focuses on three main signals: **latency**, **accuracy**, and **user engagement**.

Tool and LLM response times are monitored with LangFuse, while accuracy initially relied on human-in-the-loop evaluation before moving toward automated benchmarking. Feedback from early users guides iterative improvements and feature priorities.

## Lessons Learned & Advice for Other Teams

The top advice from the team is to start small with a minimal vertical slice of functionality

> “_Starting small gave us confidence_” says Kelsey. “_Our first proof of concept was simple: two pipelines with topic routing, shown through a Gradio demo. But it proved the value and helped us scale up with certainty._”
> 

The team’s top advice for anyone considering a similar project:

- **Start small** with a minimal vertical slice of functionality
- **Invest in observability** early for debugging and insights
- **Use agents** for flexibility rather than hardcoded pipelines
- **Automate evaluation** to speed up iteration cycles

## What’s Next for Telus

The journey doesn’t stop here. Telus plans to **automate data ingestion** processes, build an **AI-based evaluation framework** to score chatbot responses, and even **white-label the application** for other use cases across the organization.

> “_We see this as a template for the future,_” says Kelsey. “_Our goal is to bring this capability to more workflows across Telus, including internal documentation and SQL tooling._”
> 

## Share Your Story with Us

The Telus team’s journey shows what’s possible when innovative teams combine **Haystack** with real-world challenges. From streamlining SQL workflows to unlocking instant access to documentation, they turned a complex problem into a powerful, production-ready solution.

We know there are many more stories like this out there. If your team has built something exciting with Haystack, whether it’s a chatbot, a retrieval system, or an AI-powered internal tool, we’d love to hear about it. Your experiences help the entire community learn, grow, and push the boundaries of what’s possible with open-source AI tools.

**Reach out to us** on Discord or tag us on social media to share your journey. We can’t wait to feature more teams building with Haystack!