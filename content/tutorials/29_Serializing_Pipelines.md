---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/29_Serializing_Pipelines.ipynb
toc: True
title: "Serializing LLM Pipelines"
lastmod: "2024-03-12"
level: "beginner"
weight: 9
description: Learn how to serialize and deserialize your pipelines between YAML and Python
category: "QA"
aliases: []
download: "/downloads/29_Serializing_Pipelines.ipynb"
completion_time: 10 min
created_at: 2024-01-29
---
    


- **Level**: Beginner
- **Time to complete**: 10 minutes
- **Components Used**: [`HuggingFaceLocalGenerator`](https://docs.haystack.deepset.ai/v2.0/docs/huggingfacelocalgenerator), [`PromptBuilder`](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder)
- **Prerequisites**: None
- **Goal**: After completing this tutorial, you'll understand how to serialize and deserialize between YAML and Python code.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).

## Overview

**📚 Useful Documentation:** [Serialization](https://docs.haystack.deepset.ai/v2.0/docs/serialization)

Serialization means converting a pipeline to a format that you can save on your disk and load later. It's especially useful because a serialized pipeline can be saved on disk or a database, get sent over a network and more. 

Although it's possible to serialize into other formats too, Haystack supports YAML our of the box to make it easy for humans to make changes without the need to go back and forth with Python code. In this tutorial, we will create a very simple pipeline in Python code, serialize it into YAML, make changes to it, and deserialize it back into a Haystack `Pipeline`.

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/logging)

## Installing Haystack

Install Haystack 2.0 with `pip`:


```bash
%%bash

pip install haystack-ai
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/enabling-telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(29)
```

## Creating a Simple Pipeline

First, let's create a very simple pipeline that expects a `topic` from the user, and generates a summary about the topic with `google/flan-t5-large`. Feel free to modify the pipeline as you wish. Note that in this pipeline we are using a local model that we're getting from Hugging Face. We're using a relatively small, open-source LLM.


```python
from haystack import Pipeline
from haystack.components.builders import PromptBuilder
from haystack.components.generators import HuggingFaceLocalGenerator

template = """
Please create a summary about the following topic:
{{ topic }}
"""
builder = PromptBuilder(template=template)
llm = HuggingFaceLocalGenerator(
    model="google/flan-t5-large", task="text2text-generation", generation_kwargs={"max_new_tokens": 150}
)

pipeline = Pipeline()
pipeline.add_component(name="builder", instance=builder)
pipeline.add_component(name="llm", instance=llm)

pipeline.connect("builder", "llm")
```


```python
topic = "Climate change"
result = pipeline.run(data={"builder": {"topic": topic}})
print(result["llm"]["replies"][0])
```

## Serialize the Pipeline to YAML

Out of the box, Haystack supports YAML. Use `dumps()` to convert the pipeline to YAML:


```python
yaml_pipeline = pipeline.dumps()

print(yaml_pipeline)
```

You should get a pipeline YAML that looks like the following:

```yaml
components:
  builder:
    init_parameters:
      template: "\nPlease create a summary about the following topic: \n{{ topic }}\n"
    type: haystack.components.builders.prompt_builder.PromptBuilder
  llm:
    init_parameters:
      generation_kwargs:
        max_new_tokens: 150
      huggingface_pipeline_kwargs:
        device: cpu
        model: google/flan-t5-large
        task: text2text-generation
        token: null
      stop_words: null
    type: haystack.components.generators.hugging_face_local.HuggingFaceLocalGenerator
connections:
- receiver: llm.prompt
  sender: builder.prompt
max_loops_allowed: 100
metadata: {}

```

## Editing a Pipeline in YAML

Let's see how we can make changes to serialized pipelines. For example, below, let's modify the promptbuilder's template to translate provided `sentence` to French:


```python
yaml_pipeline = """
components:
  builder:
    init_parameters:
      template: "\nPlease translate the following to French: \n{{ sentence }}\n"
    type: haystack.components.builders.prompt_builder.PromptBuilder
  llm:
    init_parameters:
      generation_kwargs:
        max_new_tokens: 150
      huggingface_pipeline_kwargs:
        device: cpu
        model: google/flan-t5-large
        task: text2text-generation
        token: null
      stop_words: null
    type: haystack.components.generators.hugging_face_local.HuggingFaceLocalGenerator
connections:
- receiver: llm.prompt
  sender: builder.prompt
max_loops_allowed: 100
metadata: {}
"""
```

## Deseriazling a YAML Pipeline back to Python

You can deserialize a pipeline by calling `loads()`. Below, we're deserializing our edited `yaml_pipeline`:


```python
from haystack import Pipeline
from haystack.components.builders import PromptBuilder
from haystack.components.generators import HuggingFaceLocalGenerator

new_pipeline = Pipeline.loads(yaml_pipeline)
```

Now we can run the new pipeline we defined in YAML. We had changed it so that the `PromptBuilder` expects a `sentence` and translates the sentence to French:


```python
new_pipeline.run(data={"builder": {"sentence": "I love capybaras"}})
```

## What's next

🎉 Congratulations! You've serialzed a pipeline into YAML, edited it and ran it again!

If you liked this tutorial, you may also enjoy:
-  [Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline)

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=tutorial&utm_medium=serialization). Thanks for reading!
