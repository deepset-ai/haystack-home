---
layout: advent-challenge
title: Judging Toys, Tracing Joy 🧑‍⚖️
description: Find the best toy for each child and evaluate its correctness with an LLM-as-a-Judge
day: 7
door_text: Judging Toys, Tracing Joy 🧑‍⚖️
discuss: https://github.com/deepset-ai/haystack/discussions/8579
submit: https://forms.gle/EYSKzMZTeQKPbNyt9
featured_image: /images/advent-day-seven.png
images: ["/images/advent-day-seven.png"]
draft: false
---

# Day 7: Judging Toys, Tracing Joy 🧑‍⚖️

![](phoenix-elf.jpeg)

Santa collapsed into his chair with a huff, settling heavily next to Mrs. Claus. 

🤶: "What's wrong?"     
🎅: "There's just too many toys to check and not enough time! Christmas is almost here!"  
🤶: "Well, can't you just check some of them?"  
🎅: "I wish it were that easy! But my elves make so many different toys, and we have to ensure every kid gets the right one!"  

Elf Jane overheard the conversation from the next room. As a regular attendee at the North Pole Hackathon, she had learned a lot about evaluation recently and thought she might have a solution. "What if I build an **LLM Judge** to help?" she thought. "I can use Arize Phoenix to log everything—like why this toy was the perfect match or why it wasn’t!"  

For this challenge, you will help Elf Jane by:  
* Using a **Haystack pipeline** to find the best toy for each child in the Big Elf Database of Christmas Wishlists (BEDCW)  
* Evaluating all toy matches using an **LLM-as-a-Judge**  
* **Monitoring the system** with the open-source tracing and evaluation tool, [Arize Phoenix](https://phoenix.arize.com/).  

### 🎯 Requirements:

- An [Open API Key](https://platform.openai.com/api-keys) if you'd like to use `OpenAIChatGenerator` but you can choose any other LLM that is supported with [Haystack Generators](https://docs.haystack.deepset.ai/docs/generators) 

> ### 💡 Some Hints
> - Take a look at this example notebook: [Tracing and Evaluating a Haystack Application with Phoenix](https://github.com/Arize-ai/phoenix/blob/main/tutorials/evals/evaluate_rag_haystack.ipynb)
> - Find more examples in [Arize Phoenix Docs](https://docs.arize.com/phoenix)

> 🩵 Here's the [Starter Colab](https://colab.research.google.com/drive/13I52WKvas1EXYQIHMaiv2P8vgloePhTF?usp=sharing)




