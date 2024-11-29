---
layout: advent-challenge
title: Help the Elves Find What They've Lost 🎄
description: Create a RAG pipeline over Weaviate Collections
day: 2
door_text: 🎄 Help the Elves Find What They've Lost 🎄
discuss: https://github.com/deepset-ai/haystack/discussions/8579
submit: https://forms.gle/7hPrPa6qfu83Vfzn6
featured_image: /images/advent-day-two.png
images: ["/images/advent-day-two.png"]
draft: false
---

# 🎄 Day 2: Help the Elves Find What They've Lost

Once upon a time at the North Pole, Santa Claus realized that his centuries-old tradition of spreading joy and cheer was missing something in the modern age—knowledge about the world outside his snowy workshop. While Santa knew about children’s hopes and dreams through their letters, he felt increasingly out of touch with the broader events shaping their lives.

"How can I be a true global gift-giver," Santa mused, "if I don’t understand what’s going on in the world?". He called an emergency meeting with tech-savvy elf David, who had been itching for a project that wasn’t just sleigh upgrades. They decided to build a **Retrieval-Augmented Generation (RAG)** system using Haystack, which elf David had previously used to streamline toy inventory tracking. This time, they connected it to the BBC News feed, creating a personal RAG assistant for Santa. 

“One last requirement” said Santa, “I know about some Advanced Retrieval methods now, use multi-query retrieval to increase recall, I want relevant answers!”. 

For this challenge, you need to help elf David to create some custom components to implement multi-query retrieval for the RAG pipeline.