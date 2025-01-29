---
layout: blog-post
title: "Use DeepSeek-R1 with Haystack: Demo and Tutorial"
description: "Compare DeepSeek-R1 and OpenAI's o1 in the deepset demo and explore their reasoning capabilities" 
featured_image: thumbnail.png
images: ["blog/use-deepseek-with-haystack/thumbnail.png"]
toc: True
date: 2025-01-29
last_updated:  2025-01-29
authors:
  - Bilge Yucel
tags: ["RAG", "LLM"]
---	


The latest from **DeepSeek** confirms an essential truth about AI: there won’t be one model or provider to rule them all. As the field evolves, it's evident that diverse models bring unique strengths, making a model-agnostic approach vital for developers and organizations alike. Whether you're building agentic systems, Retrieval-Augmented Generation (RAG) architectures, search or other architectures, a model-agnostic design unlocks flexibility, scalability, and long-term success 🔐

### Stay Flexible with a Model-Agnostic Approach
Decoupling your application from specific models or APIs gives you the freedom to adapt as AI evolves. A model-agnostic approach lets you choose the best tool for the job—whether it’s generating human-like text, answering complex questions, or handling domain-specific analysis. Through Haystack's modular architecture, you can easily test, swap, or integrate new models as they emerge, all without rearchitecting your entire AI system. This flexibility ensures you stay ahead of advancements, fine-tune for industry needs, and maintain optimal performance without being locked into a single provider ecosystem.

## DeepSeek-R1: Open-Source AI with Cutting-Edge Reasoning 
`DeepSeek-R1` is the latest latest large language model by DeepSeek, designed for high-level reasoning tasks. Achieving performance comparable to `OpenAI-o1-1217` on reasoning tasks, it stands out as a reliable choice for advanced AI applications. This release marks a major step forward in open-source AI, offering researchers and developers the flexibility to distill, deploy, and commercialize models under the permissive MIT license.  

Alongside `DeepSeek-R1`, the release includes six distilled models, ranging from 1.5B to 70B parameters, built from `DeepSeek-R1` based on `Qwen` and `Llama`. Impressively, the distilled 32B and 70B models rival the performance of `OpenAI-o1-mini`. By open-sourcing `DeepSeek-R1-Zero`, `DeepSeek-R1`, and the complete suite of distilled models, the creators have made a powerful contribution to the research community, fostering innovation and accessibility in AI development 💙

![benchmark.png](benchmark.png#medium "Benchmark Performance of DeepSeek-R1, [source](https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf)")

Learn more about DeepSeek-R1 in [this paper](https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf).

 
## Test DeepSeek-R1 yourself
`DeepSeek-R1` can be seamlessly integrated with Haystack. To illustrate the potential of `DeepSeek-R1`, try out [this demo](https://r1-demo.deepset.ai/) using `DeepSeek-R1` within the Haystack and deepset ecosystem. In the demo, you can compare `DeepSeek-R1` with Open AI’s new reasoning model, `o1`, to see which of these two models sets the bar for accuracy, performance, and efficiency. 

!["demo ui"](demo.gif "Compare DeepSeek-R1 and OpenAI's o1 in the deepset demo")

If you'd like to use `DeepSeek-R1` in your Haystack applications, you can run inference using [OpenAIChatGenerator](https://docs.haystack.deepset.ai/docs/openaichatgenerator) with [Together AI](https://www.together.ai/). 

```python
import os
from getpass import getpass
from haystack.utils import Secret
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.components.generators.utils import print_streaming_chunk

if "TOGETHER_AI_API_KEY" not in os.environ:
    os.environ["TOGETHER_AI_API_KEY"] = getpass("Enter TogetherAI API key:")

chat_generator = OpenAIChatGenerator(model="deepseek-ai/DeepSeek-R1",
    api_key=Secret.from_env_var("TOGETHER_AI_API_KEY"),
    api_base_url="https://api.together.xyz/v1",
    streaming_callback=print_streaming_chunk)
```

Find a full example in this [tutorial](https://colab.research.google.com/drive/1LsL5szMmrnKmY6jre5GljVX5RmLTZnGY?usp=sharing).

## Conclusion

AI is evolving fast, and DeepSeek-R1 proves that no single model fits all use cases. A model-agnostic approach lets you plug in the best tool for the job and with modular systems, you can experiment, optimize, and stay ahead as new models emerge. Whether you're building agents, intelligent search systems, or RAG architectures, the ability to seamlessly switch between models ensures long-term scalability and success. 

We’d love to see what you build! Try out the notebook, adapt it for your needs, and share your results with us on [LinkedIn](https://www.linkedin.com/company/deepset-ai/) or [Discord](https://discord.gg/Dr63fr9NDS) or submit your Haystack story through [this form](https://forms.gle/UU2Yz6TfJ4Kssk5u7).
