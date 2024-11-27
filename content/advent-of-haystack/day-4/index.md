---
layout: advent-challenge
title: Sharing the Christmas Magic with Gen Z 🎶
description: For this challenge, you must help Santa transcribe a Christmas story and make it Gen Z-friendly using AssemblyAI's speech-to-text support.
day: 4
door_text: Sharing the Christmas Magic with Gen Z 🎶
discuss: https://github.com/deepset-ai/haystack/discussions/8579
submit: https://forms.gle/tNTddLRDsxsweGs67
featured_image: /images/advent-day-four.png
images: ["/images/advent-day-four.png"]
draft: false
---

# Sharing the Christmas Magic with Gen Z 🎶

At the North Pole, where magic and technology danced hand in hand, Santa was preparing for Christmas. In his workshop filled with glowing gadgets and humming machines, he summoned Elf Patrick, one of the most tech-savvy elves. “Elf Patrick,” Santa said with a chuckle, “this year, I want you to share the story of how I became Santa Claus. But here's the twist—you'll use coding to help you create the perfect versions of the story for all kinds of kids.”

Elf Patrick's eyes sparkled. “Coding? That's my jam, Santa! I'll make sure your story is ready for everyone, no matter how they like it told!”
Santa handed elf Patrick the audio file. “Start by transcribing it, then simplify it, and finally, remix it into that fun Gen Z lingo I keep hearing about.”
“Consider it done!” elf Patrick declared, racing to the North Pole Coding Hub.

For this challenge, you must help Elf Patrick transcribe Santa's story, summarize it, and rewrite it for Gen Z kids.

Here are the components you might need for this challenge:
- [`AssemblyAITranscriber`](https://haystack.deepset.ai/integrations/assemblyai) for speech-to-text tasks
- [`PromptBuilder`](https://docs.haystack.deepset.ai/docs/promptbuilder) for creating the prompt
- [`OpenAIGenerator`](https://docs.haystack.deepset.ai/docs/openaigenerator) for generating responses

### 🎯 Requirements:

- A free [AssemblyAI API key](https://www.assemblyai.com/dashboard/signup)
- An LLM. Here we'll use an [OpenAI API key](https://platform.openai.com/), but you can choose any other LLM that is supported with [Haystack Generators](https://docs.haystack.deepset.ai/docs/generators)

> ### 💡 Some Hints:
> - [Haystack docs - AssemblyAI integration](https://haystack.deepset.ai/integrations/assemblyai)
> - [Haystack docs - Creating pipelines](https://docs.haystack.deepset.ai/docs/creating-pipelines)

> 💜 Here is the [Starter Colab](https://colab.research.google.com/drive/1NxVrmf8ew2dDAZmk6Im3hnM1wWK-1eYf)

![elf](./elf.png)