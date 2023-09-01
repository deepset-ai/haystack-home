---
layout: blog-post
title: "Talk to Haystack Docs: Creating a Domain-Focused Q&A RAG Pipeline with WebRetriever"
description: How to create a domain-focused Question and Answering (Q&A) system using Haystack's WebRetriever and RAG pipeline
featured_image: thumbnail.png
images: ["blog/talk-to-haystack-docs/thumbnail.png"]
featured_image_caption: An artistic interpretation of the WebRetriever courtesy of MidJourney.
alt_image: An artistic interpretation of the WebRetriever courtesy of MidJourney. 
toc: True
date: 2023-09-01
last_updated:  2023-09-01
authors:
  - Vladimir Blagojevic
tags: ["LLM", "NLP", "Generative AI", "Retrieval"]
---

Ever since its introduction, WebRetriever has proven useful in the Haystack ecosystem. As its name implies, WebRetriever allows fetching documents from the Internet and channelling them into Haystack pipelines. 

Under the hood, WebRetriever uses a search engine to look up relevant documents to retrieve from the web. Although users could customize the domain scope of the search queries even before (using the “site:” AND/OR syntax mixed with the actual query), it often felt like a workaround rather than a feature. Even worse – it created a barrier for users to exploit the WebRetriever capabilities fully. We needed to make it more intuitive and less “hacky”.

With the release of Haystack 1.20, WebRetriever can now limit searches to specific domains instead of searching the entire Internet. In this article, we'll demonstrate how this small adjustment allows the easy creation of a specialized Q&A system that answers questions using documents only from a specific domain (Haystack docs, in this case).

Although we utilize Haystack docs as a use case in this article, we can easily envision many other use cases. Businesses can create RAG pipelines pointing WebRetriever to product-specific FAQs or troubleshooting guides from the product's official website, thus effectively creating AI-powered assistants to answer customer queries. Students and researchers can scope WebRetriever to academic journals, arXiv, or PubMed to answer questions related to their field of study. Users can set the WebRetriever to collect product reviews or specifications from trusted websites when purchasing products. It takes a considerable amount of effort to exhaust all the potential use cases.  


## The Power of WebRetriever

The WebRetriever is a Haystack component that extracts relevant documents from the web. It leverages an instance of WebSearch to obtain search result links; then it fetches content from the links and extracts the raw text content as a Document list. 

The WebRetriever supports three distinct modes of operation:

Snippets Mode: In this mode, the WebRetriever generates a list of Document instances, where each Document represents a snippet or a segment from a web page result. It's important to note that this mode does not involve actual web page retrieval.

Raw Documents Mode: In this mode, the WebRetriever generates a list of Document instances, where each Document represents an entire web page (retrieved from the search result link) devoid of any HTML and containing only the raw text content.

Preprocessed Documents Mode: This mode is similar to the Raw Documents Mode but includes an additional step – the raw text from each retrieved web page is divided into shorter Document instances using a specified PreProcessor. 

Although knowledgeable users could use Google "site:" search syntax to manually hack a query, the new "allowed_domains" WebRetriever init parameter empowers users to limit the search to specific websites easily, making their Q&A focused and reliable.


## RAG pipeline setup

To better understand the building blocks of the “talk to the website” use case, let's review each code section of the pipeline example [1]. Before assembling the RAG pipeline, we must set up the https://serper.dev API key and choose an LLM to use. It could be any LLM, but we’ll limit the choice to Anthropic Claude, OpenAI GPT models, and open-source models available on the free tier of Hugging Face inference API.


```python
import os
from typing import Dict, Any


search_key = os.environ.get("SERPERDEV_API_KEY")
if not search_key:
    raise ValueError("Please set the SERPERDEV_API_KEY environment variable")

models_config: Dict[str, Any] = {
    "openai": {"api_key": os.environ.get("OPENAI_API_KEY"), "model_name": "gpt-3.5-turbo"},
    "anthropic": {"api_key": os.environ.get("ANTHROPIC_API_KEY"), "model_name": "claude-instant-1"},
    "hf": {"api_key": os.environ.get("HF_API_KEY"), "model_name": "tiiuae/falcon-7b-instruct"},
}
```

Next, we define a simple prompt template to instruct LLM on how to construct the answer. Using the defined PromptTemplate, we also initialize PromptNode with additional parameters like API key, maximum answer length, streaming settings, etc.

```python
from haystack.nodes import PromptNode, PromptTemplate

prompt_text = """
Synthesize a comprehensive answer from the provided paragraphs and the given question.\n
Focus on the question and avoid unnecessary information in your answer.\n
\n\n Paragraphs: {join(documents)} \n\n Question: {query} \n\n Answer:
"""
prompt_node = PromptNode(
    model["model_name"],
    default_prompt_template=PromptTemplate(prompt_text),
    api_key=model["api_key"],
    max_length=768,
    model_kwargs={"stream": stream},
)
```

We initialize the WebRetriever component with specific parameters like the search engine API key, allowed domains for fetching documents, and document caching. WebRetriever is now set to retrieve documents only from the domain "haystack.deepset.ai".

```python
from haystack.document_stores import InMemoryDocumentStore
from haystack.nodes.retriever import WebRetriever

web_retriever = WebRetriever(
    api_key=search_key,
    allowed_domains=["haystack.deepset.ai"],
    top_search_results=10,
    mode="preprocessed_documents",
    top_k=50,
    cache_document_store=InMemoryDocumentStore(),
)
```


Next, we create our Haystack RAG pipeline. One by one, we add our components: WebRetriever, sampler, ranker, and finally, PromptNode as an answer generation. We add the pipeline nodes in a sequence, defining the data flow through the pipeline.

```python
from haystack import Pipeline
from haystack.nodes.sampler import TopPSampler
from haystack.nodes.ranker import LostInTheMiddleRanker

pipeline = Pipeline()
pipeline.add_node(component=web_retriever, name="Retriever", inputs=["Query"])
pipeline.add_node(component=TopPSampler(top_p=0.90), name="Sampler", inputs=["Retriever"])
pipeline.add_node(component=LostInTheMiddleRanker(1024), name="LostInTheMiddleRanker", inputs=["Sampler"])
pipeline.add_node(component=prompt_node, name="PromptNode", inputs=["LostInTheMiddleRanker"])
```


Finally, we enter a loop that allows users to input their queries. Our example code runs these questions through the pipeline to produce answers which are then printed to the console. Super simple!


```python
while True:
    user_input = input("\nAsk question (type 'exit' or 'quit' to quit): ")
    if user_input.lower() == "exit" or user_input.lower() == "quit":
        break
    if stream:
        print("Answer:")
    response = pipeline.run(query=user_input)
    if not stream:
        print(f"Answer: {response['results'][0]}")
```

## Conclusion

Haystack’s WebRetreiver enables users to quickly and effortlessly set up highly-specialized Q&A system drawing contents directly from the specified domains. Whether you are setting up an AI-powered Q&A assistant for your website, or an engineer sifting through a list of arXiv publications, Haystack’s modular architecture lets you quickly set up a RAG pipeline that fits your particular use case. 

We’ve only scratched the surface with this simple example, but we hope it drives you further to explore Haystack RAG pipelines and components, allowing you to customize Haystack to your particular scenario. We look forward to seeing how the community utilizes WebRetriever and other Haystack components to address today’s complex information retrieval use case scenarios.

### References

[1] https://github.com/deepset-ai/haystack/blob/main/examples/talk_to_website.py
