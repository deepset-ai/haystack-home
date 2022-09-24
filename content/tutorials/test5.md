---
layout: tutorial
title: Third Advanced Tutorial
toc: true
date: 2022-09-18
last-update: 2022-09-18
category: QA
level: advanced
description: Lorem ipsum dolor sit amet, consectetur adipisicing elit, nisi quisquam et eveniet nesciunt repellendus.
weight: 3
colab: https://colab.research.google.com/github/deepset-ai/haystack/blob/main/tutorials/Tutorial4_FAQ_style_QA.ipynb
---

While *extractive Question Answering* works on pure texts and is therefore more generalizable, there's also a common alternative that utilizes existing FAQ data.

**Pros**:

- Very fast at inference time
- Utilize existing FAQ data
- Quite good control over answers

**Cons**:

- Generalizability: We can only answer questions that are similar to existing ones in FAQ

In some use cases, a combination of extractive QA and FAQ-style can also be an interesting option.


### Prepare environment

#### Colab: Enable the GPU runtime
Make sure you enable the GPU runtime to experience decent speed in this tutorial.
**Runtime -> Change Runtime type -> Hardware accelerator -> GPU**

<img src="https://raw.githubusercontent.com/deepset-ai/haystack/main/docs/img/colab_gpu_runtime.jpg">


```python
# Make sure you have a GPU running
!nvidia-smi
```


```python
# Install the latest release of Haystack in your own environment
#! pip install farm-haystack

# Install the latest main of Haystack
!pip install --upgrade pip
!pip install git+https://github.com/deepset-ai/haystack.git#egg=farm-haystack[colab]
```

## Logging

We configure how logging messages should be displayed and which log level should be used before importing Haystack.
Example log message:
INFO - haystack.utils.preprocessing -  Converting data/tutorial1/218_Olenna_Tyrell.txt
Default log level in basicConfig is WARNING so the explicit parameter is not necessary but can be changed easily:
