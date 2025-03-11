---
layout: blog-post
title: Introducing Haystack 2.0-Beta and Advent of Haystack
description: Have a look into our first commitment to what will eventually become Haystack 2.0
featured_image: thumbnail.png
images: ["blog/introducing-haystack-2-beta-and-advent/thumbnail.png"]
alt_image: An image with a snowman and christmas tree. The title says Haystack 2.0-beta and Advent of Haystack
toc: True
date: 2023-12-04
last_updated:  2023-12-04
authors:
  - Tuana Celik
  - Massimiliano Pippi
tags: ["Open Source", "Community"]
---

Today, we are really happy to announce that we have released [Haystack 2.0-Beta](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.1), alongside our first-ever [Advent of Haystack](https://haystack.deepset.ai/advent-of-haystack): a set of 10 challenges that we will publish throughout the month of December, each introducing the features and design of Haystack 2.0-Beta.

## What does this release mean for me?

Since the first day we started building Haystack 2.0, we’ve involved our community with our design decisions and the feedback we got on our proposals on GitHub and via our Discord community proved to be incredibly valuable. While this is not yet the full stable release of Haystack 2.0, we want to make this first official commitment to the new design available for you to test and truly experience how Haystack is improving. We are committed to redesigning our LLM framework, and we need your help to shape it. To participate, complete and submit a challenge, with any feedback you would like to give us about your experience.

So, should you migrate your Haystack pipelines yet? No. This is not yet a stable release of Haystack 2.0, and by the time 2.0.0 is released, there will be a set of migration guides to help you with the task. The good news is Haystack 2.0-Beta is coming to you in a brand new package `haystack-ai`, so you do not have to change anything with your already existing Haystack deployments that depend on `farm-haystack`. We will keep up the maintenance of Haystack 1.x (currently on 1.22.1) which will continue to be released under `farm-haystack`.

But should you use Haystack 2.0-Beta? Yes! Because Haystack 2.0-Beta introduces some major improvements to how you will build and customize production-ready LLM applications. And the best way to do so is by participating in Advent of Haystack and checking out the [2.0-Beta documentation](https://docs.haystack.deepset.ai/v2.0/docs).

To get started: `pip install haystack-ai` 🎉

> Haystack 2.0-Beta does not have feature parity with Haystack 1.x yet. The stable release of Haystack 2.0 will happen once a higher level of feature parity exists. To see a full list of available features in this beta release, check out our [release notes](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.1).

> Over the last few months, we've also been working with some of our partners and community members on extending the [Haystack integrations](https://haystack.deepset.ai/integrations) with integrations compatible with Haystack 2.0. Today, you can also start using those with this Beta release.

## Why is Haystack Changing

When the [first proper release of Haystack](https://github.com/deepset-ai/haystack/releases/tag/0.2.1) came about in 2020, a lot of the design centered around retrieval, embedding creation, indexing, semantic search and extractive QA. As you may have seen, that completely pivoted in the past (nearly two) years. With the rise of LLMs, we want to build more applications that make use of retrieval-augmented generation (RAG), agents and the ever-expanding LLM capabilities.

While the Haystack 1.x design - and especially the pipeline architecture - was fit for these use cases, the developer experience was sometimes unintuitive and difficult to customize, especially when diverting from the standard semantic search use cases.. This was mainly due to some major assumptions in the design of 1.x. For example, if you’ve used Haystack you know that a pipeline _has_ to start with either a “Query” or a “File” input, even if at the end of the day you don’t want to use them. Haystack 1.x was still able to be the basis on top of which many LLM applications have been built with the addition of the `PromptNode` in [Haystack 1.12.1](https://github.com/deepset-ai/haystack/releases/tag/v1.12.1). However, the design of our framework often made it difficult to navigate the vast optionality that it actually provides, with many model providers and capabilities being seemingly “hidden” in larger concepts such as the PromptNode, or even the `EmbeddingRetriever`.

With Haystack 2.0, our aim is to be a lot more explicit about what each component does, and (to possibly exploit an overused term) to make the code self-explanatory, on top of making the Pipeline and Component architecture a lot more flexible, extendable, customizable while maintaining our high standards in terms of production readiness.

## How is Haystack Changing

Although Haystack 2.0 is a complete overhaul of the framework, it remains rooted in the fundamental abstractions that contributed to its prior success: users can continue using pipelines, document stores and nodes, which have now been rebranded as “components”.

Here we will briefly highlight what some of the major changes are, with particular regard to developer experience. To see where we are in terms of feature parity with Haystack 1.x, check out the table in our [release notes](https://github.com/deepset-ai/haystack/releases/tag/v2.0.0-beta.1).

### Components

Nodes have always been considered the building blocks of Haystack pipelines, but that analogy isn’t completely true. If somebody is given building blocks, they assume they can arrange them however they want, but that’s not the case with nodes: for example, you can only put a Node of type Document Store at the very end of a pipeline. If you wonder why this happens, imagine building something with Legos, just the bricks all have different stubs and tubes sizes, and you have to try which one can possibly fit the other.

We decided to change the name Node to Component in Haystack 2.0 to stress how different the new design is. Components are still the building blocks of a Pipeline, but this time the analogy is for real:

-   Every Component declares its input and output types, making clear to which other Component can be connected. Connections can therefore be validated already while building a Pipeline.
-   Every Component is self contained and fulfils a specific purpose: we like to say that a good Component should only have one job.
-   Every Component must respect a strict contract to be used within a Pipeline, but everything else is left to the developer to provide maximum flexibility. You can stretch this flexibility up to the point of running a single Component “standalone”, without the need of a Pipeline.

For example, below is a component that takes in a `query` and returns a list of documents as `documents`.

```python
from typing import List
from haystack import component, Document  
  
@component  
class MyCustomComponent():  
    
  @component.output_types(documents=List[Document])  
  def run(self, query: str):  
    # do something  
    return {'documents': docs}

```

For a full example, you can check out a custom component Tuana built that [fetches the latest Hacker News articles](https://haystack.deepset.ai/blog/customizing-rag-to-summarize-hacker-news-posts-with-haystack2).

> You can find the complete documentation of Haystack 2.0-Beta components [here](https://docs.haystack.deepset.ai/v2.0/docs/components).

### Pipelines

Pipelines are a core offering of Haystack, and that’s not changing. What’s different is what a Pipeline can do and how it can be assembled. In fact, the first challenge in Advent of Haystack exposes you to the most obvious changes.

#### Connections

Connecting pipeline components is becoming a lot more flexible. We’re moving away from having a rigid contract requiring “Query” or “File” as the first input, and every component can be connected to any other compatible one (or even more than one), being explicit about which output is being connected to which input. As a result, the final input and output of a Pipeline run will be solely determined by how components are laid out.

**In Haystack 1.x**

```python
from haystack import Pipeline

pipeline = Pipeline()
pipeline.add_node(component=my_component_1, name="My_Component_1", inputs=["Query"])
pipeline.add_node(component=my_component_2, name="My_Component_2", inputs=["My_Component_1"])

```

**In Haystack 2.0-Beta**

```python
from haystack import Pipeline

pipeline = Pipeline()
pipeline.add_component(instance=my_component_1, name="my_component_1")
pipeline.add_component(instance=my_component_2, name="my_component_2")

pipeline.connect("my_component_1.output_1", "my_component_2.input_4")
pipeline.connect("my_component_1.output_3", "my_component_2.input_1")

```

#### Directed (Multi)Graphs (out with the acyclical)

Haystack 1.x pipelines are implemented as directed acyclic graphs (DAGs). Massi’s analogy of it is that using a pipeline in Haystack 1.x is like going down a water slide. A very powerful architecture that can branch out from a platform and join up at the main pool, building pipelines in Haystack 1.x is a matter of stringing together the Nodes that you require to build out the NLP application you’re aiming for. But it’s always one directional with a clear start and end.

In Haystack 2.0, we are getting rid of the A in DAG (acyclic), meaning we can have pipelines that can branch out, join, and also cycle back to another component. This allows us to set the Haystack framework up for pipelines that can retry, loop back, and potentially even run _forever_ as a service. One of the first things we tried to build was a “retry” Component that allows a Pipeline to loop back if it deems an output to not be good enough.

These new pipelines are also technically multigraphs, meaning a single component with multiple outputs can connect to another single component with multiple inputs.

#### Serialization

Serialization means converting a pipeline to a format that you can save on your disk or send over the wire to load it later. In both Haystack 1.x and in Haystack 2.0-beta we use YAML for this, although we will be extending the support to other formats for Haystack 2.0.

However, one of the major changes to Haystack in terms of serialization is the addition of “Marshallers” to the core project. Marshallers are how we make available different serialization formats to pipelines, and they can be used to add any format that Haystack doesn’t support out of the box. For example, if you want to represent pipelines with TOML you can create a TOML Marshaller that you can pass to the serialization API.

> You can find our complete documentation on Haystack 2.0-Beta Pipelines [here](https://docs.haystack.deepset.ai/v2.0/docs/pipelines). You can find our complete documentation on Haystack 2.0-Beta Pipeline Serialization [here](https://docs.haystack.deepset.ai/v2.0/docs/serialization)

### Prompt Templating

One other change we are excited about is how prompt templating is changing in Haystack 2.0, which is already available in this Beta release. We are now using Jinja templating for prompts, making it very clean and readable to build prompts that have loops and that can even make use of functions inside the prompt. For example, below is a simple prompt template in Haystack 2.0 which loops through documents and also adds some meta information from those documents into the prompt.

```python
from haystack.builders import PromptBuilder

prompt_template = """ Answer the question based on the context. Refer to the URL
in the generated answer.
Context:  
{% for doc in documents %}  
  {{doc.content}}  
  URL: {{article.meta['url']}}  
{% endfor %}  
Question: {{question}}
"""  
  
prompt_builder = PromptBuilder(template=prompt_template)

```

## Join us in testing Haystack 2.0-Beta

The release of Haystack 2.0-Beta marks a significant milestone in the evolution of the Haystack framework. This announcement comes with an added bonus - the inaugural Advent of Haystack, featuring 10 challenges throughout December, offering you a hands-on opportunity to explore the features and design of the latest release. The development of Haystack 2.0 has been a collaborative effort with the community and while not yet the stable release, this Beta version invites you to test and engage in shaping the future of Haystack.

Cheers to the evolution of Haystack and the exciting developments ahead! 🎉