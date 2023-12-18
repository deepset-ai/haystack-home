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

## High Level Architecture

Retrieval augmented generative AI, or RAG, is a way of giving a LLM context so it can better answer questions. 

You pass the LLM some documents, along with a query, and prompt the LLM to use the documents when answering the question.

![](RAG.png)

For the model, I went with Mixtral's 8x7b. Mixtral is a unique new kind of model that uses 8 “experts” that queries can be routed to. [This HuggingFace blog post explains MoE](https://huggingface.co/blog/moe) in more detail. 

