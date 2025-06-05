---
layout: blog-post
title: Building a HackerNews Fetching & Summarization Pipeline with Haystack and OPEA
images: ["blog/opea-integration/ai.jpg"]
featured_image: ai.jpg
toc: True
date: 2025-06-05
last_updated: 2025-06-05
authors:
  - Daniel Fleischer
canonical_url: https://www.deepset.ai/blog/opea-integration
tags: ["LLM", "RAG"]
---

Welcome to this step-by-step tutorial where we'll build a simple Retrieval-Augmented Generation (RAG) pipeline using Haystack. We'll fetch the newest Hacker News posts, feed them to a lightweight LLM endpoint (OPEAGenerator), and generate concise one-sentence summaries (based on this [tutorial](https://haystack.deepset.ai/cookbook/hackernews-custom-component-rag)). Let's dive in! 🎉

---

## 📖 Table of Contents

1. [Introduction & Motivation](#1-introduction--motivation)
2. [Prerequisites](#2-prerequisites)
3. [Building the News Fetcher](#3-building-the-news-fetcher)
4. [Integrating the LLM (OPEAGenerator)](#4-integrating-the-llm-opeagenerator)
5. [Crafting the Prompt](#5-crafting-the-prompt)
6. [Assembling the Pipeline](#6-assembling-the-pipeline)
7. [Running the Pipeline](#7-running-the-pipeline)
8. [Results](#8-results)
9. [Conclusion](#9-conclusion)

---


## 1. Introduction & Motivation


In modern GenAI applications, having a flexible, performant, and scalable platform is essential. [OPEA](https://opea-project.github.io/latest/introduction/index.html) (Open Platform for Enterprise AI) is an open, model-agnostic framework for building and operating composable GenAI solutions. It provides:

- A library of microservices (LLMs, data stores, prompt engines) and higher-order megaservices for end-to-end workflows
- HTTP-based inference with multi-model support (open- and closed-source)
- Advanced features like batching, streaming, auto-scaling, routing via gateways, and unified observability

In this demo, we'll use OPEA LLM endpoint in a Haystack pipeline, giving you:

- Instant HTTP access to any hosted model.
- Seamless switching from small prototypes to production-grade RAG solutions.


In this tutorial we'll build a simple RAG pipeline that fetches the newest Hacker News posts, sends them to a local OPEA endpoint running a Qwen/Qwen2.5-7B-Instruct demo model, and produces concise one-sentence summaries. Of course you can replace our toy model with any other OPEA-served model—making this pattern both lightweight for prototyping and powerful for real-world deployments. Let's get started! 🚀


---

## 2. Prerequisites

Make sure you have:

- Python 3.9+
- Install dependencies: `pip install haystack-ai haystack-opea newspaper3k lxml[html_clean]`
- A running OPEA endpoint at <http://localhost:9000/v1> (or your own)

> [!NOTE]
> As a reference, here is a [Docker Compose](./compose.yaml) recipe to get you started.
> OPEA LLM service can be configured to use a variety of model serving backends like TGI, vLLM, ollama, OVMS... and offers validated runtime settings for good performance on various hardware's including Intel Gaudi.
> In this example it creates an OPEA LLM service with a TGI backend.
> The code is based on [OPEA LLM example](https://github.com/opea-project/GenAIComps/blob/main/comps/llms/deployment/docker_compose/compose_text-generation.yaml)
> and [OPEA TGI example](https://github.com/opea-project/GenAIComps/blob/main/comps/third_parties/tgi/deployment/docker_compose/compose.yaml).
>
> To run, call `LLM_MODEL_ID=Qwen/Qwen2.5-7B-Instruct docker compose up`.


---

## 3. Building the News Fetcher

We'll create a custom Haystack component, `HackernewsNewestFetcher`, that:

1. Calls the Hacker News API to get the latest story IDs
2. Filters for posts containing URLs
3. Downloads & parses each article with `newspaper3k`.
4. Wraps results in Haystack `Document` objects

```python
from typing import List
from haystack import component, Document
from newspaper import Article
import requests

@component
class HackernewsNewestFetcher():

  @component.output_types(documents=List[Document])
  def run(self, last_k: int):
    # Fetch the IDs of the newest stories
    newest_list = requests.get(
        url='https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty'
    )
    url_list = []
    # Keep only the first `last_k` IDs with URLs
    for id in newest_list.json()[0:last_k]:
      article = requests.get(
          url=f"https://hacker-news.firebaseio.com/v0/item/{id}.json?print=pretty"
      )
      if 'url' in article.json():
        url_list.append(article.json()['url'])

    docs = []
    # Download and parse each article
    for url in url_list:
      try:
        article = Article(url)
        article.download()
        article.parse()
        docs.append(
          Document(
            content=article.text,
            meta={'title': article.title, 'url': url}
          )
        )
      except Exception:
        print(f"Couldn't download {url}, skipped")
    return {"documents": docs}
```

---

## 4. Integrating the LLM (OPEAGenerator)

We use the `OPEAGenerator` to call our LLM over HTTP. Here we point to a local endpoint serving the `Qwen/Qwen2.5-7B-Instruct` model:

```python
from haystack_opea import OPEAGenerator

llm = OPEAGenerator(
    "http://localhost:9000/v1",             # Your OPEA endpoint
    "Qwen/Qwen2.5-7B-Instruct",             # Model name
    model_arguments={"max_tokens": 2000}    # Generation settings
)
```

---

##  5. Crafting the Prompt

Using `PromptBuilder`, we define a Jinja-style template that:

- Lists each article's title, content, and URL.
- Asks the model for a one-sentence summary plus the URL.

```python
from haystack.components.builders import PromptBuilder

prompt_template = """
You will be provided a few of the latest posts in HackerNews, followed by their URL.
For each post, provide a one sentence summary, followed by the original post URL.

Posts:
{% for doc in documents %}
  {{doc.meta['title']}}:
  {{doc.content}}
  URL: {{doc.meta['url']}}
{% endfor %}
"""

prompt_builder = PromptBuilder(template=prompt_template)
```

---

## 6. Assembling the Pipeline

We wire up the components in a `Pipeline`:

```python
from haystack import Pipeline

# Instantiate components
fetcher = HackernewsNewestFetcher()

# Build and connect
pipe = Pipeline()
pipe.add_component("hackernews_fetcher", fetcher)
pipe.add_component("prompt_builder", prompt_builder)
pipe.add_component("llm", llm)

# Define data flow
pipe.connect("hackernews_fetcher.documents", "prompt_builder.documents")
pipe.connect("prompt_builder.prompt", "llm.prompt")

# Visualize the pipeline
pipe.show()                    # Interactive usage
pipe.draw(pipeline.png)        # Plotting to file
```

---

## 7. Running the Pipeline

Fetch and summarize the top 2 newest Hacker News posts:

```python
result = pipe.run(data={"hackernews_fetcher": {"last_k": 2}})
print(result['llm']['replies'][0])
```

---

## 8. Results

```
A course on using Large Language Models (LLMs) to understand and structure search queries without relying on external services is being offered, demonstrating how LLMs can significantly improve and automate search capabilities.

[URL: https://softwaredoug.com/blog/2025/04/08/llm-query-understand]

The European Commission's new ProtectEU security strategy proposes enhanced tools for law enforcement, including methods to access encrypted data, raising significant concerns about potential violations of privacy and civil liberties.

[URL: https://www.cloudwards.net/news/protecteu-security-strategy-raises-encryption-concerns/]
```

Beautiful, concise summaries in seconds! ✨

---

## 9. Conclusion

In this tutorial, we built a full RAG pipeline:

- Custom news fetcher for Hacker News.
- Lightweight LLM integration via `OPEAGenerator`.
- Jinja-templated prompt for structured input.
- Haystack pipeline orchestration.

Feel free to extend this setup with more advanced retrieval, caching, or different LLM backends. Happy coding! 🛠️🔥