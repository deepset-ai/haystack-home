---
layout: blog-post
title: Building a healthcare chatbot with Mixtral 8x7b, Haystack, and PubMed
description: Have a look into our first commitment to what will eventually become Haystack 2.0
featured_image: thumbnail.png
images: ["blog/mixtral-8x7b-healthcare-chatbot/thumbnail.png"]
alt_image: The Mixtral logo and the Haystack logo against a white background.
toc: True
date: 2023-12-19
last_updated:  2023-12-19
authors:
  - Tilde Thurium
tags: ["RAG", "LLM", "Haystack 2.0"]
---

Unfortunately, countless people around the world have inadequate access to healthcare. I’m lucky to have health insurance and good medical providers taking care of me. However, I still want to educate myself before walking into a doctor’s office.

Technology can empower people to take charge of their health. Large language models can power chatbots where people can ask medical questions. 

In this post, I’ll show you how I built a medical chatbot with Haystack 2.0, and the Mixtral 8x7B model that pulls research papers from PubMed.

You can follow along [with this Colab](https://colab.research.google.com/drive/1Pl8gyfWthqoj7PTCQrteAvtOsswHvkzV). You’ll need a HuggingFace API key. [Sign up for a free account here](https://huggingface.co/join).

## Challenges

Building a medical chatbot presents some challenges.
- *Lack of data*. HIPAA and other privacy regulations make it harder to find public QA datasets to fine-tune a model.
- The human impact of providing wrong answers. 😬
- *Staying up to date*. It takes a long time to train a LLM. By the time they are released, their knowledge is already a bit stale. Medical research breakthroughs are happening all the time. I am particularly interested in long COVID, which has both impacted humanity on a massive scale, and is the subject of ongoing research.

Therefore, I decided to use a RAG pipeline to combine PubMed data with a LLM.

## High Level Architecture Overview

Retrieval augmented generative AI, or RAG, is a way of giving a LLM context so it can better answer questions. 

You pass the LLM some documents, along with a query, and prompt the LLM to use the documents when answering the question.

![](RAG.png)

PubMed has up to date, trustworthy medical information so it seemed like a solid document source. Plus, there's a [PyMed wrapper for the PubMed API](https://github.com/gijswobben/pymed) that made querying easy peasy. We'll wrap this in a Haystack custom component to format the results as `Document`s so that Haystack can use them, and add some light error handling.

```python
from pymed import PubMed
from typing import List
from haystack import component
from haystack import Document

pubmed = PubMed(tool="Haystack2.0Prototype", email="tilde.thurium@deepset.ai")

def documentize(article):
  return Document(content=article.abstract, meta={'title': article.title, 'keywords': article.keywords})

@component
class PubMedFetcher():

  @component.output_types(articles=List[Document])
  def run(self, queries: list[str]):
    cleaned_queries = queries[0].strip().split('\n')

    articles = []
    try:
      for query in cleaned_queries:
        response = pubmed.query(query, max_results = 1)
        documents = [documentize(article) for article in response]
        articles.extend(documents)
    except Exception as e:
        print(e)
        print(f"Couldn't fetch articles for queries: {queries}" )
    results = {'articles': articles}
    return results
```

For the model, I went with Mixtral's 8x7b. Mixtral is a unique new kind of model that uses 8 “experts” that queries can be routed to. Each expert has 7 billion parameters, yet the queries can be pretrained quickly and have faster inference.  [This HuggingFace blog post explains MoE](https://huggingface.co/blog/moe) in more detail. 


## Prompts and queries

First, I tried an approach where I passed a plain query to PubMed. e.g. *"What are the most  current treatments for long COVID?"* Unfortunately, that didn't work too well. The articles returned weren't very relevant. Which makes sense, because PubMed isnt optimized for natural language search. It is optimized for keywords, though. And you know what's great at generating keywords? LLMs!

So now our flow is as follows:
- Our user inputs a question, such as, "
- We prompt the LLM to turn tha question into keywords
- Search PubMed and return top_k articles based on those keywords
- Pass those articles to the LLM and ask them to reference it when formulating an answer.

![](HealthcareChatbotArchitecture.png)

```python
from haystack import Pipeline
from haystack.components.builders.prompt_builder import PromptBuilder

keyword_prompt_template = """
Your task is to convert the follwing question into 3 keywords that can be used to find relevant medical research papers on PubMed.
Here is an examples:
question: "What are the latest treatments for major depressive disorder?"
keywords:
Antidepressive Agents
Depressive Disorder, Major
Treatment-Resistant depression
---
question: {{ question }}
keywords:
"""

prompt_template = """
Answer the question truthfully based on the given documents.
If the documents don't contain an answer, use your existing knowledge base.

q: {{ question }}
Articles:
{% for article in articles %}
  {{article.content}}
  keywords: {{article.meta['keywords']}}
  title: {{article.meta['title']}}
{% endfor %}

"""
keyword_prompt_builder = PromptBuilder(template=keyword_prompt_template)
prompt_builder = PromptBuilder(template=prompt_template)
fetcher = PubMedFetcher()

pipe = Pipeline()

pipe.add_component("keyword_prompt_builder", keyword_prompt_builder)
pipe.add_component("keyword_llm", keyword_llm)
pipe.add_component("pubmed_fetcher", fetcher)
pipe.add_component("prompt_builder", prompt_builder)
pipe.add_component("llm", llm)

pipe.connect("keyword_prompt_builder.prompt", "keyword_llm.prompt")
pipe.connect("keyword_llm.replies", "pubmed_fetcher.queries")

pipe.connect("pubmed_fetcher.articles", "prompt_builder.articles")
pipe.connect("prompt_builder.prompt", "llm.prompt")

```

Try it for yourself and see!
