---
layout: blog-post
title: Deploy AI Pipelines Faster with Hayhooks
description: Turn Haystack pipelines into a production-ready REST APIs or expose them as MCP tools with full customization and minimal code
featured_image: thumbnail.png
images: ["blog/deploy-ai-pipelines-faster-with-hayhooks/thumbnail.png"]
toc: True
date: 2025-05-12
last_updated:  2025-05-12
authors:
  - Isabelle Nguyen
  - Michele Pangrazzi
tags: ["Hayhooks", "Deployment"]
---	

[Haystack](https://github.com/deepset-ai/haystack) is an AI orchestration framework that enables developers to effortlessly build custom AI pipelines using a modular, building-block approach. However, when it's time to take those pipelines from your development environment to production, you’re often left with a tough decision: write custom server code, or rely on proprietary tools that may not offer the flexibility you need.

We’re excited to announce [Hayhooks](https://github.com/deepset-ai/hayhooks), an open source package designed to simplify deployment. It lets you focus on developing meaningful AI systems rather than worrying about the underlying infrastructure.

With Hayhooks, you can deploy Haystack pipelines with custom logic, expose OpenAI-compatible chat endpoints, stream responses in real time, and customize your server—all with minimal code and full flexibility. Read on to find out why Hayhooks is a game-changer for every Haystack developer.

## What are Haystack pipelines?

[Haystack](https://docs.haystack.deepset.ai/docs/intro) is an AI orchestration framework designed to create powerful LLM-based systems. It offers a vast library of pre-built components, which you can easily extend with custom logic if your project demands it. Haystack pipelines are designed as modular graphs, allowing you to define how components connect and add branches or loops to your logic. This flexibility enables the development of complex [agentic systems](https://haystack.deepset.ai/tutorials/36_building_fallbacks_with_conditional_routing), custom retrieval-augmented generation (RAG) applications, semantic search, and more

## Introducing Hayhooks

While [building AI pipelines](https://docs.haystack.deepset.ai/docs/creating-pipelines) has become increasingly accessible thanks to frameworks like Haystack, the journey from a working pipeline in a notebook to a production-ready system remains challenging. For basic tasks like processing requests and streaming responses, developers often find themselves writing boilerplate code and dealing with complicated deployment settings.

By simplifying deployment, Hayhooks provides the missing piece to Haystack's ease of building custom AI pipelines. With Hayhooks, you can quickly turn **any Haystack pipeline into a production-ready REST API or expose it as an [MCP server](https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp)**. This allows, for example, a large audience to immediately interact with a pipeline through a UI or use it as an MCP tool for MCP clients. 

> 📺 Explore Hayhooks in details and see a demo in [Open NLP Meetup #15](https://youtu.be/g4UJG6eIF4I?feature=shared&t=1886).

## Hayhooks’ key features

Hayhooks bridges the gap between pipeline development and production deployment, focusing on what developers need most. Here are the key features that make this framework a must for every Haystack developer:

### 1. Simplified deployment

With Hayhooks, the days of writing boilerplate server code just to expose your pipeline are over. Now you can turn your Haystack pipeline into a REST API with a single command. The Hayhooks CLI handles the API creation, auto-generates Swagger and ReDocly documentation, and formats requests/responses for you, so you can focus on what your pipeline does, not how to serve it.

![Hayhooks Swagger Documentation](hayhooks-docs.gif#medium "Hayhooks Swagger documentation with endpoints")

### 2. Complete customization for your API

When it comes to real-world AI applications, customization is key. Hayhooks introduces the `PipelineWrapper` paradigm, allowing you to define exactly how your pipeline behaves as an API. You can insert custom logic before and after pipeline execution for preprocessing, response formatting, and dynamic component configuration, giving you total control over your deployment.

```python
from pathlib import Path
from typing import List
from haystack import Pipeline
from hayhooks import BasePipelineWrapper

class PipelineWrapper(BasePipelineWrapper):
    def setup(self) -> None:
        ## Create the pipeline
        my_pipeline = Pipeline()
        my_pipeline.add_component(....
        ...
        self.pipeline = my_pipeline
        ## or load from yaml
        pipeline_yaml = (Path(__file__).parent / "chat_with_website.yml").read_text()
        self.pipeline = Pipeline.loads(pipeline_yaml)

    def run_api(self, urls: List[str], question: str) -> str:
        """
        Ask a question about one or more websites using a Haystack pipeline.
        """
        result = self.pipeline.run({"fetcher": {"urls": urls}, "prompt": {"query": question}})
        return result["llm"]["replies"][0]
```

### 3. Model Context Protocol (MCP) support

Model Context Protocol (MCP) provides a standardized way of interacting with [large language models](https://haystack.deepset.ai/blog/what-is-an-llm) (LLMs) and other AI models, making it much easier to build customized AI applications. With Hayhooks, you can wrap a Haystack Pipeline into an **MCP server** with a single command and expose it as an MCP tool that MCP clients like Cursor, Windsurf, Claude Desktop, and [Haystack Agents](https://docs.haystack.deepset.ai/docs/agent) can interact with.

### 4. Production-ready streaming and chat endpoints

It's great if your AI pipeline works well and you can talk to it through your IDE. But that's not the way to bring it to a broader audience! Hayhooks generates OpenAI-compatible endpoints for chat interfaces like Open WebUI and supports streaming responses out of the box, so you can easily provide the engaging chat experience users are used to from ChatGPT, Perplexity, and the like. 

### 5. Developer-friendly workflow

Hayhooks includes tools to speed up iteration during development. The `--overwrite` flag allows you to update an existing pipeline without restarting the server. If you're debugging and making frequent changes, you can speed things up even more by skipping file persistence. And for better error visibility during development, enable tracebacks with `HAYHOOKS_SHOW_TRACEBACKS=true`. This provides detailed information when things go wrong, helping you diagnose and fix issues faster.

### 6. Infrastructure that scales with you

Since Hayhooks is built on FastAPI, you can leverage all FastAPI features for more advanced needs. For example, you can add authentication mechanisms for secure deployments, implement custom logging for monitoring, create additional endpoints for administration or diagnostics, and integrate with existing FastAPI applications in your infrastructure. Additionally, you can easily containerize your Hayhooks web server with [Docker](https://docs.haystack.deepset.ai/docs/docker) and deploy it at scale with [Kubernetes](https://docs.haystack.deepset.ai/docs/kubernetes). This flexibility means Hayhooks can adapt to your production requirements rather than forcing you to adapt to its limitations.

## See Hayhooks in action

Want to see how Hayhooks can transform your pipeline into a production-ready solution? Check out our [step-by-step tutorial](https://github.com/deepset-ai/haystack-demos/tree/main/chat_with_website_hayhooks), showing you how to build a chatbot that interacts with website content using **Haystack**, **Hayhooks**, and **Open WebUI**. You’ll have a fully functional chatbot that streams responses and responds to real-time user queries in just a few minutes. 

Explore more examples on [our GitHub](https://github.com/deepset-ai/hayhooks/tree/main/examples).

![](demo.gif#medium "Chat with website example")

## Outlook and getting started

Since the launch of Hayhooks, the feedback from developers has been great. Many have already successfully deployed their pipelines using Hayhooks, validating the demand for customizable deployment solutions in the AI space. We're continuously improving the framework and prioritizing feature requests from the community, including:

- Better support for pipeline redeployment.
- Dependency management using `requirements.txt`.
- Asynchronous pipeline support.

If you're a Haystack developer looking for a fast, easy, and powerful deployment method, check out Hayhooks and let us know what you think either on [GitHub](https://github.com/deepset-ai/hayhooks) or on [our Discord](https://discord.com/invite/xYvH6drSmA). We hope you'll sleep better knowing there's now a safe and easy way to get your AI pipelines out to the masses faster ;)