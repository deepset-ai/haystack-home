---
layout: blog-post
title: Customizing RAG Pipelines to Summarize Latest Hacker News Posts with Haystack 2.0
description: Take a look at how we are changing Haystack for advanced LLM pipelines, with an example that uses a custom component to fetch the latest Hacker News posts
featured_image: thumbnail.png
images: ["blog/customizing-rag-to-summarize-hacker-news-posts-with-haystack2/thumbnail.png"]
featured_image_caption: Customizing RAG Pipelines to Summarize Latest Hacker News Posts with Haystack 2.0
toc: True
date: 2023-09-21
last_updated:  2023-09-21
authors:
  - Tuana Celik
tags: ["RAG", "Haystack 2.0", "LLM"]
---	

Over the last few months, the team at [deepset](https://deepset.ai) has been working on a major upgrade in the Haystack repository. Along the way, we’ve been sharing our updates and design process for [Haystack 2.0](https://github.com/deepset-ai/haystack/tree/main/haystack/preview) with the community, as well as releasing new components in a preview package. This means that you can already start exploring features coming to Haystack 2.0 using the preview components available in the `haystack-ai` package (`pip install haystack-ai`).

_You can run the example code showcased in this article in the accompanying_ [_Colab notebook_](https://colab.research.google.com/drive/1YWFvq29xkMAUCt5Aal0VPX0KxGM4xTku?usp=sharing)_._

In this article, I’ll cover two major concepts in Haystack 2.0.

-   **Components:** These are the smallest building blocks in Haystack. They are meant to cover one simple task. As well as using components available in the core Haystack project, you can easily create your own custom components.
-   **Pipelines:** These are made by connecting components to each other.

While components and pipelines have been at the core of Haystack since the beginning, Haystack 2.0 introduces some significant changes to how they are constructed.

We’ll look at how to create custom components and pipelines using the Haystack 2.0 preview. I’ll share a custom Haystack component that fetches the latest posts from Hacker News, and show how we can use it in a retrieval-augmented generative (RAG) pipeline to generate summaries of Hacker News posts.

## Components in Haystack 2.0

A component is a class that does _one thing._ That thing could be to ‘prompt GPT3.5’, or ‘translate’, or ‘retrieve documents’, and so on.

While Haystack comes with a set of components in the core project, we hope that with Haystack 2.0 you will also be able to easily build components to your own custom requirements.

In Haystack 2.0, a class can become a component with just two additions:

-   A `@component` decorator on the class declaration.
-   A `run` function with a decorator `@component.output_types(my_output_name=my_output_type)` that describes what output the pipeline should expect from this component.

And that’s about it.

### Building a Custom Hacker News Component

I’ll admit, the idea for this custom component came from one of our amazing Haystack ambassadors on Discord during a live coding session (thanks rec 💙) — and it turned out pretty well! So let’s take a look at how we create a custom component that fetches the latest _k_ posts from Hacker News.

First, we create a `HackernewsNewestFetcher`. For it to be a valid Haystack component, it will also need a `run` function. For now, let’s create a stub function that simply returns a dictionary containing a single key `‘articles’` with the value ‘Hello world!’.

```python
from haystack.preview import component  
  
@component  
class HackernewsNewestFetcher():  
    
  @component.output_types(articles=str)  
  def run(self):  
    return {'articles': 'Hello world!'}
```
Now let’s make our component actually fetch the latest posts from Hacker News. We can use the [`newspapers3k`](https://newspaper.readthedocs.io/en/latest/) package to crawl and get the contents of given URLs. We will also change the output type to return a list of Document objects.

```python
from typing import List  
from haystack.preview import component, Document  
from newspaper import Article  
import requests  
  
@component  
class HackernewsNewestFetcher():  
    
  @component.output_types(articles=List[Document])  
  def run(self, last_k: int = 5):  
    newest_list = requests.get(url='https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty')  
    articles = []  
    for id in newest_list.json()[0:last_k]:  
      article = requests.get(url=f"https://hacker-news.firebaseio.com/v0/item/{id}.json?print=pretty")  
      if 'url' in article.json():  
        articles.append(article.json()['url'])  
  
    docs = []  
    for url in articles:  
      try:  
        article = Article(url)  
        article.download()  
        article.parse()  
        docs.append(Document(text=article.text, metadata={'title': article.title, 'url': url}))  
      except:  
        print(f"Couldn't download {url}, skipped")  
    return {'articles': docs}
```
We now have a component that, when run, returns a list of Documents containing the contents of the (`last_k`) latest posts on Hacker News. Here we store the output in the `articles` key of the dictionary.

## Pipelines in Haystack 2.0

A pipeline is a structure that connects one component’s output to another component’s input until a final result is reached.

A pipeline is created with a few steps:

1.  Create a Pipeline:  
    `pipeline = Pipeline()`
2.  Add components to the pipeline:  
    `pipeline.add_component(instance=component_a, name=”ComponentA”)`  
    `pipeline.add_component(instance=component_b, name=”ComponentB”)`
3.  Connect an output from one component to the input of another:  
    `pipeline.connect("component_a.output_a", "component_b.input_b")`

There are already enough components available in the Haystack 2.0 preview for us to build a simple RAG pipeline that uses our new`HackernewsNewestFetcher` for the retrieval augmentation step.

### Building a RAG Pipeline to Generate Summaries of Hacker News Posts

To build a RAG pipeline that can create a summary for each of the latest _k_ posts on Hacker News, we will use two components from the Haystack 2.0 preview:

-   The `PromptBuilder`: This component allows us to create prompt templates using [Jinja](https://jinja.palletsprojects.com/en/3.1.x/) as our templating language.
-   The `GPT4Generator`: This component simply prompts GPT4. We can connect the `PromptBuilder` output to this component to customize how we interact with GPT4.

First, we initialize all of the components we will need for the pipeline:

```python
from haystack.preview import Pipeline  
from haystack.preview.components.builders.prompt_builder import PromptBuilder  
from haystack.preview.components.generators.openai.gpt4 import GPT4Generator  
  
prompt_template = """  
You will be provided a few of the latest posts in HackerNews, followed by their URL.  
For each post, provide a brief summary followed by the URL the full post can be found at.  
  
Posts:  
{% for article in articles %}  
  {{article.text}}  
  URL: {{article.metadata['url']}}  
{% endfor %}  
"""  
  
prompt_builder = PromptBuilder(template=prompt_template)  
llm = GPT4Generator(api_key='YOUR_API_KEY')  
fetcher = HackernewsNewestFetcher()
```
Next, we add the components to a Pipeline:

```python
pipeline = Pipeline()  
pipeline.add_component("hackernews_fetcher", fetcher)  
pipeline.add_component("prompt_builder", prompt_builder)  
pipeline.add_component("llm", llm)
```
And finally, we connect the components to each other:
```python
pipeline.connect("hackernews_fetcher.articles", "prompt_builder.articles")  
pipeline.connect("prompt_builder", "llm")
```
Here, notice how we connect `hackernews_fetcher.articles` to `prompt_builder.articles`. This is because `prompt_builder` is expecting `articles` in its template:

```
Posts:  
{% for article in articles %}  
  {{article.text}}  
  URL: {{article.metadata['url']}}  
{% endfor %}
```
The output and input keys do not need to have matching names. Additionally, `prompt_builder` makes _all_ of the input keys available to your prompt template. We could, for example, provide a `documents` input to `prompt_builder` instead of `articles`. Then our code might look like this:

```python
prompt_template = """  
You will be provided a few of the latest posts in HackerNews, followed by their URL.  
For each post, provide a brief summary followed by the URL the full post can be found at.  
  
Posts:  
{% for document in documents %}  
  {{document.text}}  
  URL: {{document.metadata['url']}}  
{% endfor %}  
"""  
  
[...]  
  
pipeline.connect("hackernews_fetcher.articles", "prompt_builder.documents")
```
Notice how the prompt now refers to `documents`, and the `connect` call now attaches to the corresponding `prompt_builder.documents` input.

Now that we have a pipeline, we can run it. Here is what I got as a response at about 22:45 CET on September 21st 🤗

```python
result = pipe.run(data={"hackernews_fetcher":{"last_k": 2}})  
print(result['llm']['replies'][0])
```
Response:
```
1. "The translation world has legends of its own, but not all legends involve greatness.   
Many provide pain, confusion, or comedy, as these examples of bad game translation prove."   
- This post shares a humorous look at some examples of poor video game translations that have   
resulted in confusion and comedy. The author seeks to highlight that while translation is often   
necessary in game localization, it can sometimes yield suboptimal results.  
Link: https://legendsoflocalization.com/bad-translation/  
  
2. “Recently, I found myself returning to a compelling series of   
blog posts titled Zero-cost futures in Rust by Aaron Turon about what would   
become the foundation of Rust's async ecosystem.”   
- This post provides an in-depth analysis of the current state of Rust's   
'async' ecosystem, drawing upon the author's own experiences and Aaron Turon's   
blog series, "Zero-cost futures in Rust". The author also discusses the benefits and   
negatives of the current async ecosystem, the problems with ecosystem fragmentation,   
the state and issue of async-std, alternative runtimes, the complexities of writing async code,   
the benefits of synchronous threads over async, and the obsessiveness of Rust landscape with an   
async-first approach. The post concludes with the notion that async Rust should be used only   
when necessary and that the smaller, simpler language inside Rust (the synchronous Rust)   
should be the default mode.  
Link: https://corrode.dev/blog/async/
```
## Further Improvements

This custom component was created as an experiment and you could certainly take it much further in a real-world application.

For example, our experimental component does nothing to reduce the length of the content in each article. This means that GPT-4 may struggle to give a good response, especially when setting _last_k_ to a high number.
