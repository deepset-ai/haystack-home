---
layout: advent-challenge
title: Fetching Holiday Wisdom for Santa 📖
description: For this challenge, build and enhance a pipeline for Santa that fetches content from given URLs and answers questions based on the retrieved information.
day: 1
door_text: Fetching Holiday Wisdom for Santa 📖
discuss: https://github.com/deepset-ai/haystack/discussions/8579
submit: https://forms.gle/rZwvBc8zubrm8pzM6
featured_image: /images/advent-day-one.png
images: ["/images/advent-day-one.png"]
draft: true
---

# Day 1: Fetching Holiday Wisdom for Santa 📖

With Christmas looming, the North Pole was buzzing with activity. Toys were being assembled, reindeer were training for the big night, and the elves were fine-tuning Santa’s sleigh. But amidst the holiday chaos, Santa faced a pressing personal challenge.

For the past year, Santa had been learning all about LLMs, RAG, and AI Agents and loving it. These approaches had revolutionized his work last Christmas, and he wanted to take things even further this year.

“I need to finish these blog posts and understand how to transform queries for better retrieval and the difference between metadata filtering and metadata enrichment,” Santa muttered, pacing his study. “But Christmas is almost here, and there’s no time before I’m buried in gift deliveries and chimney logistics!” 🎅🎁

“Santa, I overheard you,” said Elf Bilge, popping into the room. “You want to master advanced RAG approaches before Christmas, but there’s no time to read everything. What if we build something that can fetch the articles you want and answer your questions directly?”

Santa’s eyes lit up. “Why didn’t I think of that? You’re right, Bilge. I guess I’m getting old. We just need a Haystack pipeline with a **LinkContentFetcher** and a few extra components, and we’re all set!” 💡

Elf Bilge grinned. “With a little Haystack magic, anything’s possible.”

For this challenge, you must help Elf Bilge build a Haystack pipeline that fetches content from given URLs, processes the data for relevance, and enables a seamless Q&A system to answer Santa’s queries

Here are the initial components you will use for this challenge:
- [`LinkContentFetcher`](https://docs.haystack.deepset.ai/docs/linkcontentfetcher) for using the contents of several URLs in your pipeline
- [`HTMLToDocument`](https://docs.haystack.deepset.ai/docs/htmltodocument) for converting the HTML files into documents.
- [`PromptBuilder`](https://docs.haystack.deepset.ai/docs/promptbuilder) for creating the prompt
- [`OpenAIGenerator`](https://docs.haystack.deepset.ai/docs/openaigenerator) for generating responses

Your task is to figure out how to connect these components and think about additional components to add this pipeline that will help you identify the 10 most relevant chunks of the given content.

## 🎯 Requirements:

- An [OpenAI API Key](https://platform.openai.com/api-keys) if you'd like to use `OpenAIGenerator` but you can choose any other LLM that is supported with [Haystack Generators](https://docs.haystack.deepset.ai/docs/generators)

> ### 💡 Some Hints:
> - Check out the [Haystack Pipelines documentation](https://docs.haystack.deepset.ai/docs/creating-pipelines) to learn more about pipeline connections
> - If you connect the given components, the initial pipeline will work as is, but there are two additional components you can add to enhance this pipeline.
> - No retriever is necessary for this challenge
> - One extra component is to split the documents into smaller chunks of around 10 sentences each.
> - As the other component, consider methods or components you can use to filter out irrelevant chunks by ranking before injecting the context into the prompt.

> **⭐ Bonus Task:**
> Use the OpenAIChatGenerator or other ChatGenerator component instead of the standard Generator component and provide a system message to guide the LLM:
>
> ```python
>system_message = """You are a technical expert. Use only the provided content and source URLs to answer questions. Don't use your own knowledge.
>Do not add any extra information or search the web. 
>Keep your answers clear, accurate, and to the point, including the document links you used. 
>If the documents don’t have the answer, say "no answer"
>"""
>```

> 💜 Here is the [Starter Colab](https://colab.research.google.com/drive/14191mCQkS1fJQiCxXqyVT4HJzB9hYmof?usp=sharing). Don’t forget to submit your solution notebook using the "Submit" button above to win surprise prizes!