---
layout: blog-post
title: 'Announcing Studio: A Visual Programming Editor to Create AI Workflows'
description: Build AI workflows with our new visual programming interface for Haystack
featured_image: thumbnail.png
images: ["blog/announcing-studio/thumbnail.png"]
toc: True
date: 2024-08-12
last_updated:  2024-08-12
authors:
  - Malte Pietsch
  - Tuana Celik
tags: ["Community"]
---	

We have some good news. After getting many requests for a visual editor to create AI workflows from our community, we're excited to announce the launch of deepset Studio – a visual programming interface for Haystack.

<video autoplay loop muted playsinline poster="/images/studio-image.png" class="responsive"><source src="/images/studio.mp4" type="video/mp4"></video>

## What is deepset Studio?

deepset Studio is a tool that will help you visually construct AI workflows. It comes with a suite of components that provide the fundamental steps of building any AI application, that you can drag, drop and connect to design your own use case. If you’re already a Haystack user, this will be very familiar to you. You can use all of the [core Haystack components](https://docs.haystack.deepset.ai/reference/audio-api) and connect them the same way you would in code.

### Composable AI

‘Composable AI’ or ‘Compound AI’ are terms that we commonly see being used to describe the approach to building and designing AI applications. The reason for that is simple: most AI applications/workflows are made up of smaller tasks working together. Think of RAG (retrieval augmented generation) for example. To achieve RAG, we actually have 3 main steps:

- Retrieval: Where we retrieve the most relevant context to the users query.
- Augmenting the prompt: Where we add this context into a prompt (instruction) that we will eventually send to an LLM.
- Generation: Where we send the augmented prompt to an LLM and ask for it to generate a response.

As you may imagine, as the use case or requirements get more complex, the number of tasks that our workflow should cover can significantly increase. 

Our new Studio will allow you to architect these use cases away from the code editor, and export your final pipeline architecture as a YAML pipeline definition, or (eventually) as Python code.

## How and When can I Use It?

deepset Studio will be provided as two versions:

### **Open Access**

We will also have a free version of the Studio available to you which will come along with the full selection of Haystack components. In this version, you will be able construct and export your pipelines. While deepset Studio is built for Haystack, an open source AI framework, it is not currently open source.

**Timeline**

- Today, we are **opening up the [waitlist to get access to Studio](https://landing.deepset.ai/deepset-studio-waitlist).**
- We will start giving **access to people as of the first week of September**.
- Studio will be **available to everyone by the end of November.**
- Once you we start granting access to Studio, we will also create a dedicated channel in the [Haystack Discord server](https://discord.com/invite/VBpFzsgRVF) for users of the Open Access version. We’d love to hear your feedback, and will do our best to help you use Studio 🧡

### **Within deepset Cloud**

deepset Studio is natively integrated within deepset Cloud and with todays launch, customers automatically have beta access. It is the default mechanism for designing and editing pipelines in deepset Cloud. Pipelines constructed with Studio from within deepset Cloud can automatically be deployed from within the platform as well

### What’s coming next?

Our initial release of deepset Studio in September covers the basics:

- You can drag and drop haystack core components and core-integration components.
- You can connect them and construct a full [pipeline](https://docs.haystack.deepset.ai/docs/pipelines).
- You will be able to export them as [YAML pipeline definitions](https://docs.haystack.deepset.ai/docs/serialization).

**What’s coming after the first release?**

Once Studio becomes generally available:

- We will add support for custom components. Meaning you will be able to bring your own integrations on top of having full access to our default suite of Haystack components.
- You will be able to export pipelines to Python

[**Join the waitlist to be one of the first to get access 🎉**](https://landing.deepset.ai/deepset-studio-waitlist)
