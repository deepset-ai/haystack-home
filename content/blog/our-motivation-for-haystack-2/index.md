---
layout: blog-post
title: 'Our Motivation for Haystack 2.0'
description: Learn more about why we are upgrading Haystack and our learnings throughout the years
featured_image: thumbnail.png
images: ["blog/our-motivation-for-haystack-2/thumbnail.png"]
toc: True
date: 2023-03-30
last_updated: 2023-03-30
authors:
  - Malte Pietsch
  - Timo Moller
tags: ["Haystack 2.0", "LLM", "Community"]
---

This week, we released Haystack 2.0-Beta. And today, we would like to gibe you some insight into our motivation for working on Haystack 2.0, and where we are at with the task at hand. At its core, reworking our pipeline design with **production readiness, ease of use, and customizability** at the forefront. We want to outline what this means and showcase the new Haystack 2.0 code and documentation.

### 🚂 Pillars of Production Readiness

Production readiness is a rather loaded word these days, so we want to clearly outline what this means for us and what is already part of the current release. To explain how we look at going to production you need to understand the history of deepset, the company behind Haystack. deepset was founded in 2018 with the premise of generative AI (back then it was called NLP) becoming standardized. We brought [Haystack-powered RAG systems to production since late 2020](https://github.com/deepset-ai/haystack/releases/tag/v0.5.0) both on-premise on highly secure infrastructure, as well as in the cloud with our commercial offering, [deepset Cloud](https://www.deepset.ai/deepset-cloud).

Seeing hundreds of projects, we identified 7 key pillars for “production-ready” LLM applications.

Some of those are already addressed in the **current beta release** (✅). 

Others are still “work in progress” and will only **come later in the stable 2.0 release (🏗️)**

1. ✅ Handling **changes to the codebase** in a non-breaking way. In this fast-paced generative AI environment, new functionality means competitive advantage. You want to add the new GPT-4-Turbo model to your existing production setup and A/B test its capabilities with existing users. To get all this exciting new functionality into Haystack, we rely on a vibrant and professional community. With Haystack 2.0, we created a structure that allows easy additions without breaking changes or additional technical debt: see how to add [components](https://docs.haystack.deepset.ai/v2.0/docs/custom-components), [document stores](https://docs.haystack.deepset.ai/v2.0/docs/creating-custom-document-stores), and [integrations](https://github.com/deepset-ai/haystack-integrations#how-to-contribute). By being stable and without accumulating technical debt with each commit, haystack will be able to orchestrate LLM applications for production in the long run.
2. ✅ **Avoiding vendor lock-in**. There are many model providers, both for [embeddings and generation](https://haystack.deepset.ai/integrations?type=Model+Provider), [data conversion tools](https://haystack.deepset.ai/integrations?search=convert) and [databases](https://haystack.deepset.ai/integrations?type=Document+Store) out there. If anything, the events of the past few weeks shows us that we can’t rely on putting all our eggs in one basket. Remaining agnostic on a lot of these technologies is proving to be important, allowing production-scale applications to option to switch to different technologies at any time
3. ✅ Caring about **data security and data privacy**. You might be able to send your data to [OpenAI’s API](https://github.com/deepset-ai/haystack/blob/main/haystack/preview/components/generators/openai.py), or compliance forces you to use [locally deployed LLMs](https://github.com/deepset-ai/haystack/blob/main/haystack/preview/components/generators/hugging_face_local.py) or LLMs inside your own cloud environment ([Huggingface TGI](https://github.com/deepset-ai/haystack/blob/main/haystack/preview/components/generators/hugging_face_tgi.py), [Gradient.ai](https://github.com/deepset-ai/haystack-core-integrations/tree/main/integrations/gradient)).
4. ✅ Good **dependency & license management**. You want the latest security patches without worrying about incompatibilities in your production pipeline. You want to avoid any licensing issues due to non-permissive or “viral” open source licenses. You want to only install what you really need. With the 2.0-beta we introduce a more granular dependency management and can make sure that the “plain vanilla” Haystack installation always includes the latest security patches and only permissive licenses. On top, you can install many [optional integrations](https://haystack.deepset.ai/integrations) and dependencies to fully fit your use case.
5. 🏗️You want to **deploy** your systems behind **REST API**s in a **scalable** way.
6. 🏗️ Meaningful **evaluation.** You want to evaluate how well or fast your system is before showing it to (all) your clients. When using RAG this means evaluating retrieval, the generated answer with respect to hallucinations (groundedness and answer relevance), and collecting + acting on human feedback. For the beta release we [reworked the evaluation design](https://github.com/deepset-ai/haystack/blob/456902235abcd68924c4c468178a166a5495ea49/proposals/text/5794-evaluation-haystack-2.md), the actual implementation will be added in the coming weeks.
7. 🏗️  L**ogging and monitoring.** For the stable 2.0 release, we want to have structured logging and instructions on how to connect your external observability platform like Grafana, or datadog.

To improve Haystack even more on those pillars, we also want to learn from your production challenges in the community and **offer up to 3 teams direct, hands-on help by our Haystack engineers on their journey to production**. Apply here.

### 🙇🏻 Ease of use

In this fast-evolving generative AI landscape, Haystack 2.0 enables developers to easily use those technologies. We want to enable application builders to use Haystack without in depth NLP knowledge. So for us ease-of-use means:

1. ✅ We want users to **get started immediately**, in under 5 minutes. We want you to get a decently working app in front of end users as fast as possible. Only through end user validation, you will understand if your app is useful, or needs changes before a final rollout. That is the beauty of LLMs: they work out of the box. No more time-intensive data science tasks like labeling and finetuning before an end user can interact with your app in a meaningful way. LLMs work out of the box for a lot of use cases, when correctly configured. You just have to understand if it works for your use case, data, and end users. Then you can ship the first productive version.
2. ✅ Developers have a clear path **from simple getting started to full customizability**. We have many [example code snippets](https://github.com/deepset-ai/haystack/tree/main/examples), as well as useful abstractions, like [indexing and query pipelines](https://docs.haystack.deepset.ai/v2.0/docs/pipelines#indexing-and-query-pipelines). Also, you want to [connect components](https://docs.haystack.deepset.ai/v2.0/docs/pipelines#flexibility) in novel ways and ensure they continue to work in complex pipelines that branch or loop. You want to [visualize those connections](https://docs.haystack.deepset.ai/v2.0/docs/drawing-pipeline-graphs#example) and debug them with [meaningful error messages](https://docs.haystack.deepset.ai/v2.0/docs/pipelines#validation). Let’s drill down into customizability in the following section.

### 🪛 Customizability

When talking to our commercial enterprise clients, or organizations using Haystack we often see custom business logic that requires customizations. For us, this means:

1. ✅ Easily **[create custom components](https://docs.haystack.deepset.ai/v2.0/docs/custom-components)**. You can add a special preprocessor node since your data is stored in a specific format, or you need to retrieve not only relevant documents in your RAG pipeline but are interested in the most recent information. Still you want those custom nodes to continue to work in the future. Here is an example of a simple custom component:
    
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
    
2. ✅ You want to **create complex pipelines** . With the new pipeline design you can add loops to your system, a feature that was not possible with Haystack 1.x. One example is an [error correction loops](https://github.com/deepset-ai/haystack/blob/main/examples/pipeline_loop_to_autocorrect_json.py) that runs until the output adheres to a specific file format, like JSON. For agents you might want to loop through parts of your pipeline until a (sub)goal is satisfied.
3. 🏗️ Benefit from a big ecosystem of integrations. As we made it simpler to build your own components and have a cleaner, transparent way of installation and maintenance, we expect some rapid growth of 3rd party integrations over the next months. You can see the current list [here](https://haystack.deepset.ai/integrations).