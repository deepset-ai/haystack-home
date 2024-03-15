---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/02_Finetune_a_model_on_your_data.ipynb
toc: True
title: "Fine-Tuning a Model on Your Own Data"
lastmod: "2023-11-20"
level: "intermediate"
weight: 50
description: Improve the performance of your Reader by performing fine-tuning.
category: "QA"
aliases: ['/tutorials/fine-tuning-a-model']
download: "/downloads/02_Finetune_a_model_on_your_data.ipynb"
completion_time: 15 min
created_at: 2021-08-12
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Nodes Used**: `FARMReader`
- **Goal**: After completing this tutorial, you will have learned how to fine-tune a pretrained Reader model on your own data.

## Overview

For many use cases it is sufficient to just use one of the existing public models that were trained on SQuAD or other public QA datasets (e.g. Natural Questions).
However, if you have domain-specific questions, fine-tuning your model on custom examples will very likely boost your performance.
While this varies by domain, we saw that ~ 2000 examples can easily increase performance by +5-20%.



## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, let's install the latest release of Haystack with `pip`:


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,inference]
```

### Enabling Telemetry 
Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(2)
```


## Create Training Data

There are two ways to generate training data:

1. **Annotation**: You can use the [annotation tool](https://haystack.deepset.ai/guides/annotation) to label your data, which means highlighting answers to your questions in a document. The tool supports structuring your workflow with organizations, projects, and users. The labels can be exported in SQuAD format that is compatible for training with Haystack.

![Snapshot of the annotation tool](https://raw.githubusercontent.com/deepset-ai/haystack/main/docs/img/annotation_tool.png)

2. **Feedback**: For production systems, you can collect training data from direct user feedback via Haystack's [REST API interface](https://github.com/deepset-ai/haystack#rest-api). This includes a customizable user feedback API for providing feedback on the answer returned by the API. The API provides a feedback export endpoint to obtain the feedback data for fine-tuning your model further.


## Fine-Tune Your Model

Once you have collected training data, you can fine-tune your base model. To do that, you need to initialize a reader as a base model and fine-tune it on your custom dataset (should be in SQuAD-like format). We recommend using a base model that was trained on SQuAD or a similar QA dataset beforehand to benefit from Transfer Learning effects.

**Recommendation**: Run training on a GPU.
If you are using Colab: Enable this in the menu "Runtime" > "Change Runtime type" > Select "GPU" in dropdown.
Then change the `use_gpu` arguments below to `True`

1. Initialize a `Reader` with the model to fine-tune:


```python
from haystack.nodes import FARMReader

reader = FARMReader(model_name_or_path="distilbert-base-uncased-distilled-squad", use_gpu=True)
```

2. Get SQUAD-style data for training. You can use this dataset we prepared:


```python
from haystack.utils import fetch_archive_from_http

data_dir = "data/fine-tuning"


fetch_archive_from_http(
    url="https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-downstream/squad20.tar.gz", output_dir=data_dir
)
```

3. Train the model on your own data and save it to "my_model"


```python
reader.train(data_dir=data_dir, train_filename="squad20/dev-v2.0.json", use_gpu=True, n_epochs=1, save_dir="my_model")
```

4. Initialize a new reader with your fine-tuned model:


```python
new_reader = FARMReader(model_name_or_path="my_model")
```

5. Finally, use the `new_reader` that was initialized with your fine-tuned model.


```python
from haystack.schema import Document

new_reader.predict(
    query="What is the capital of Germany?", documents=[Document(content="The capital of Germany is Berlin")]
)
```

Congratulations! 🎉 You’ve fine-tuned a base model on your own data!
