---
layout: blog-post
title: Why rewriting Haystack?!
description: A short history behind the inception and development of Haystack 2.0
featured_image: thumbnail.png
images: ["blog/haystack-rewrite-why/thumbnail.png"]
alt_image: A GitHub diff with a large-letter "Rewrite" printed over
toc: True
date: 2023-10-11
last_updated:  2023-10-11
authors:
  - Sara Zanzottera
tags: ["Haystack 2.0"]
---	

Before even diving into what Haystack 2.0 is, how it was built, and how it works, let's spend a few words about the whats and the whys.

First of all, *what is* Haystack?

And next, why on Earth did we decide to rewrite it from the ground up?

### A Pioneer Framework

Haystack is a relatively young framework, its initial release dating back to [November 28th, 2019](https://github.com/deepset-ai/haystack/releases/tag/0.1.0). Back then, Natural Language Processing was a field that had just started moving its first step outside of research labs, and Haystack was one of the first libraries that promised enterprise-grade, production-ready NLP features. We were proud to enable use cases such as [semantic search](https://medium.com/deepset-ai/what-semantic-search-can-do-for-you-ea5b1e8dfa7f), [FAQ matching](https://medium.com/deepset-ai/semantic-faq-search-with-haystack-6a03b1e13053), document similarity, document summarization, machine translation, language-agnostic search, and so on.

The field was niche but constantly moving, and research was lively. [The BERT paper](https://arxiv.org/abs/1810.04805) had been published a few months before Haystack's first release, unlocking a small revolution. In the shade of much larger research labs, [deepset](https://www.deepset.ai/), then just a pre-seed stage startup, was also pouring effort into [research](https://arxiv.org/abs/2104.12741) and [model training](https://huggingface.co/deepset).

In those times, competition was close to non-existent. The field was still quite technical, and most people didn't fully understand its potential. We were free to explore features and use cases at our own pace and set the direction for our product. This allowed us to decide what to work on, what to double down on, and what to deprioritize, postpone, or ignore. Haystack was nurturing its own garden in what was fundamentally a green field.


### ChatGPT

This rather idyllic situation came to an end all too abruptly at the end of November 2022, when [ChatGPT was released](https://openai.com/blog/chatgpt).

For us in the NLP field, everything seemed to change overnight. Day by day. For *months*. 

The speed of progress went from lively to faster-than-light all at once. Every company with the budget to train an LLM seemed to be doing so, and researchers kept releasing new models just as quickly. Open-source contributors pushed to reduce the hardware requirements for inference lower and lower. My best memory of those times is the drama of [LlaMa's first "release"](https://github.com/facebookresearch/llama/pull/73): I remember betting on March 2nd that within a week I would be running LlaMa models on my laptop, and I wasn't even surprised when my prediction [turned out true](https://news.ycombinator.com/item?id=35100086) with the release of [llama.cpp](https://github.com/ggerganov/llama.cpp) on March 10th.

Of course, keeping up with this situation was far beyond us. Competitors started to spawn like mushrooms, and our space was quickly crowded with new startups, far more agile and aggressive than us. We suddenly needed to compete and realized we weren't used to it.

### PromptNode vs FARMReader

Luckily, Haystack seemed capable of keeping up, at least for a while. Thanks to the efforts of [Vladimir Blagojevic](https://twitter.com/vladblagoje), a few weeks after ChatGPT became a sensation, we added some decent support for LLMs in the form of [PromptNode](https://github.com/deepset-ai/haystack/pull/3665). Our SaaS team could soon bring new LLM-powered features to our customers. We even managed to add support for [Agents](https://github.com/deepset-ai/haystack/pull/3925), another hot topic in the wake of ChatGPT.

However, the go-to library for LLMs was not Haystack in the mind of most developers. It was [LangChain](https://docs.langchain.com/docs/), and for a long time, it seemed like we would never be able to challenge their status and popularity. Everyone was talking about it, everyone was building demos, products, and startups on it, its development speed was unbelievable and, in the day-to-day discourse of the newly born LLM community, Haystack was nowhere to be found.

Why?

That's because no one even realized that Haystack, the semantic search framework from 2019, also supported LLMs. All our documentation, tutorials, blog posts, research efforts, models on HuggingFace, *everything* was pointing towards semantic search. LLMs were nowhere to be seen.

And semantic search was going down *fast*.

![Reader Models downloads graph](reader-model-downloads.png)

The image above shows today's monthly downloads for one of deepset's most successful models on HuggingFace, 
[deepset/roberta-base-squad2](https://huggingface.co/deepset/roberta-base-squad2). This model performs [extractive Question Answering](https://huggingface.co/tasks/question-answering), our former primary use case before the release of ChatGPT. Even with more than one and a half million downloads monthly, this model is experiencing a disastrous collapse in popularity, and in the current landscape, it is unlikely to ever recover.


### A (Sort Of) Pivot

In this context, around February 2023, we decided to bet on the rise of LLMs and committed to focus all our efforts towards becoming the #1 framework powering production-grade LLM applications.

As we quickly realized, this was by far not an easy proposition. Extractive QA was not only ingrained deeply in our public image but in our codebase as well: implementing and maintaining PromptNode was proving more and more painful by the day, and when we tried to fit the concept of Agents into Haystack, it felt uncomfortably like trying to force a square peg into a round hole.

Haystack pipelines made extractive QA straightforward for the users and were highly optimized for this use case. But supporting LLMs was nothing like enabling extractive QA. Using Haystack for LLMs was quite a painful experience, and at the same time, modifying the Pipeline class to accommodate them seemed like the best way to mess with all the users that relied on the current Pipeline for their existing, value-generating applications. Making mistakes with Pipeline could ruin us.

With this realization in mind, we took what seemed the best option for the future of Haystack: a rewrite. The knowledge and experience we gained while working on Haystack 1 could fuel the design of Haystack 2 and act as a reference frame for it. Unlike our competitors, we already knew a lot about how to make NLP work at scale. We made many mistakes we would avoid in our next iteration. We knew that focusing on the best possible developer experience fueled the growth of Haystack 1 in the early days, and we were committed to doing the same for the next version of it.

So, the redesign of Haystack started, and it started from the concept of Pipeline.

### Fast-forward

Haystack 2.0 hasn't been released yet, but for now, it seems that we have made the right decision at the start of the year.

Haystack's name is starting to appear more often in discussions around LLMs. The general tone of the community is steadily shifting, and scaling up, rather than experimenting, is now the focus. Competitors are re-orienting themselves toward production-readiness, something we're visibly more experienced with. At the same time, LangChain is becoming a victim of its own success, collecting more and more criticism for its lack of documentation, leaky abstractions, and confusing architecture. Other competitors are gaining steam, but the overall landscape no longer feels as hostile.

In the next post, I will explore the technical side of Haystack 2.0 and delve deeper into the concept of Pipelines: what they are, how to use them, how they evolved from Haystack 1 to Haystack 2, and why.
