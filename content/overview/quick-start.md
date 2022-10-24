---
layout: overview
header: light
footer: dark
title: Quick Start
description: Lorem ipsum dolor sit amet, consectetur adipisicing elit, nisi quisquam et eveniet nesciunt repellendus.
weight: 2
toc: true
aliases: [get-started]
---

## The Haystack Source Code

Haystack is an open source framework that helps developers build NLP empowered search systems.
On our Github, you can find the source code for Haystack.
This is also the main channel for raising issues and contributing to the project.

{{< button url="https://github.com/deepset-ai/haystack" text="View Source Code" color="green">}}

## Quick Installation

{{< tabs totalTabs="2">}}
{{< tab tabName="Basic Install"  >}}

The most straightforward way to install the latest release of Haystack is through pip.

This command will install everything needed for Pipelines that use an Elasticsearch Document Store. See <a href="https://docs.haystack.deepset.ai/docs/installation">Installation</a> for more details.

```python
pip install farm-haystack
```

{{< /tab >}}

{{< tab tabName="Full Install" >}}

If you plan to be using more advanced features like Milvus, FAISS, Weaviate, OCR or Ray, you will need to install a full version of Haystack.

The following command will install the latest version on the main branch.

```python
git clone https://github.com/deepset-ai/haystack.git
cd haystack
pip install -e .[all]
```

{{< /tab >}}
{{< /tabs >}}

For a more comprehensive guide to installation, see our documentation.

{{< button url="https://docs.haystack.deepset.ai/docs/installation" text="Installation" color="green">}}

## Build Your First Pipeline

Haystack is built around the concept of Pipelines. A Pipeline is a sequence of connected components that can be used to perform a task.
For example, you can chain together a Reader and a Retriever to build a Question Answering Pipeline.

For a hands-on guide to building your first Pipeline, see our tutorials

{{< button url="/tutorials/" text="Tutorials" color="green">}}
