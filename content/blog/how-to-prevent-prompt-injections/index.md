---
layout: blog-post
title: How to Prevent Prompt Injections: An Incomplete Guide
description: Learn how to prevent prompt injections leveraging our new open-source model and dataset.
featured_image: thumbnail.png
images: ["blog/how-to-prevent-prompt-injections/thumbnail.png"]
toc: True
date: 2023-05-19
last_updated: 2023-05-19
authors:
  - Jasper Schwenzow
---

[ChatGPT](https://chat.openai.com/) is awesome, [HuggingChat](https://huggingface.co/chat/) is awesome, [Alpaca](https://crfm.stanford.edu/2023/03/13/alpaca.html) is awesome. However, if you want to **use these models in an application,** e.g., for your customer support, you encounter a problem: **Prompt injections**.

![](thumbnail.png)

This guide showcases approaches to handling prompt injections. It also includes one of the first public **prompt injection datasets** and one of the first **pre-trained prompt injection detection models** available on Hugging Face that you can use to combat attacks against your system.

## What are prompt injections?

Prompt injections are prompts that trick a generative language model into writing something the model providers clearly did not intend, e.g., hate speech. [We can roughly distinguish two types of prompt injection](https://arxiv.org/abs/2211.09527): **goal hijacking & prompt leakage**.


![](injection-classes.png)

Both types can pose serious threats to organizations or individuals trying to leverage generative AI:

1.  Goal hijacking: AI systems, like any powerful tool, can be misused. If a model can be tricked into generating **harmful or inappropriate content**, it can be weaponized against individuals or communities, leading to real-world harm. The organization hosting the model might face serious **public backlash**. In extreme cases, they might even violate laws.
2.  Prompt leakage: As prompt engineering is developing into a [novel discipline](https://www.linkedin.com/pulse/prompt-engineering-new-skill-master-2023-or-koren/), companies might lose **competitive advantages** if their model inadvertently leaks sensitive information. Depending on the architecture of the AI system, prompt leakage could also **violate privacy norms and laws**.

## How can we handle injections?

The first step to improve resilience against prompt injections is to improve the **robustness of the internal prompt** that is added to the user input. Let’s look at an example from a retrieval augmented question-answering system:

![](prompt-example.png)

By putting the user input into curly **brackets**, separating it by additional **delimiters,** and adding **text after the input**, the system becomes more robust against prompt injections. Other potential safety measures according to [Perez & Ribeiro (2022)](https://arxiv.org/abs/2211.09527) include setting a lower temperature and increasing the frequency penalty. Additionally, since elaborate prompt injections may require a lot of text to provide context, simply **limiting the user input** to a reasonable maximum length makes prompt injection attacks a lot harder.

However, these measures may not suffice in many cases. So, what else can we do?

## Let’s detect injections!

Ideally, we filter all prompt injection attempts even before being passed to our generative model. This will not only help prevent injection attacks but also save us money as a classifier model is typically a lot smaller than a generative model.

### Building the dataset

To train an injection classifier, we first assembled a novel dataset of 662 widely varying prompts, including 263 prompt injections and 399 legitimate requests. As legitimate requests, we included various questions and keyword-based searches. We then split the data into train and test datasets.

![](dataset.png)

During the first model training, we made two main learnings that helped us enrich the dataset with adversarial examples:

-   **Including translations.** Simply switching the language of the prompt injection may help to bypass security measures. To prevent that, we included translations of both prompt injections as well as legitimate requests. We avoided leakage by making sure that each prompt and its respective translation always remain within the respective training or test set.
-   **Including stacked prompts.** Initially, we were able to fool our first models by combining both legitimate and injection prompts in one prompt. This was especially true if the legitimate part was a prompt that the model had seen during training. Consequently, we included adversarial examples by randomly stacking legitimate and injection prompts within the training and test set, respectively.

The dataset is available on Hugging Face: [](https://huggingface.co/deepset/deberta-v3-base-injection)[https://huggingface.co/datasets/deepset/prompt-injections](https://huggingface.co/datasets/deepset/prompt-injections)

### Training the model

We fine-tuned the popular state-of-the-art [DeBERTa base](https://huggingface.co/microsoft/deberta-base) model [using the transformers library](https://huggingface.co/docs/transformers/training) and Google Colab. The resulting model achieves 99.1% accuracy on our holdout test set, only failing in one edge case.

You can find and try the model on Hugging Face: [](https://huggingface.co/deepset/deberta-v3-base-injection)[https://huggingface.co/deepset/deberta-v3-base-injection](https://huggingface.co/deepset/deberta-v3-base-injection) It’s fully open-source.

## Embedding the model in an AI system

Once you have a classification model, there are multiple ways you can put it into production. For example, you can use this model within the [TransformersQueryClassifier](https://haystack.deepset.ai/tutorials/14_query_classifier) from Haystack as a filter in a QA AI system:

![](ai-system-1.png)

![](ai-system-2.png)

## Final remarks

Despite its surprisingly convincing performance, using the model as a filter does not guarantee that no prompt injections pass the check. The model should be treated as an additional layer of security, rather than as a complete solution to the problem of prompt injection.

Also, the model is trained for the chosen type of legitimate prompts. If your use case requires very different prompts to pass as legitimate, you might need to fine-tune using your own enriched dataset.

We hope the [model](https://huggingface.co/deepset/deberta-v3-base-injection) and [dataset](https://huggingface.co/datasets/deepset/prompt-injections) will prove as valuable for your LLM projects as it has been for ours!”

![](smily.png)
