---
layout: index
header: dark
footer: light
title: Haystack
description: Haystack, the composable open-source AI framework

# Hero
hero:
  title: The Production-Ready<br/> Open Source AI Framework
  buttons:
    - buttonText: pip install haystack-ai
    - buttonText: Get Started with Haystack
      buttonColor: green
      url: /overview/quick-start/
    - buttonText: Get Started with Studio
      buttonColor: blue
      url: https://www.deepset.ai/deepset-studio

  features:
    - title: Highly<br> customizable
      highlightedText: Don’t just use Haystack, build on top of it.
      text: The flexible components and pipelines architecture allows you to build around your own specifications and use-cases. Whether you’re building a simple retrieval-augmented generation (RAG) app or a complex agentic pipeline with many moving parts.

    - title: Build with leading LLM providers and AI tools
      highlightedText: Have the freedom of choice.
      text: Thanks to our partnerships with leading LLM providers, vector databases, and AI tools such as OpenAI, Anthropic, Mistral, Weaviate, Pinecone and so many more

    - title: Production is where it gets real
      highlightedText: Get your application in front of the world.
      text: Haystack is built with production in mind. Pipelines are fully serializable and perfect for K8s native workflows. Logging and monitoring integrations give you the transparency you need. Deployment guides walk you through full-scale deployments on all clouds and on-prem.

  studio:
    # title: "deepset Studio: Your Development Environment for Haystack"
    title: Build Haystack apps faster with deepset Studio
    media: # Choose one
      # image: /images/cookbook-thumbnail.png
      # video: /images/deepset-studio-demo.mp4
      video: /images/studio.mp4
      # youtubeVideoId: Hns424sFY7s
    bulletPoints: 
      - Drag, drop, and construct Haystack pipelines
      - Bring your own files or connect your database
      - Deploy on deepset or export pipelines locally
      - Test, debug, and share your prototype
      - Free and open to everyone
    buttons:
      - buttonText: Learn more
        buttonColor: dark-blue
        url: https://www.deepset.ai/blog/introducing-deepset-studio-visual-ai-builder

      - buttonText: Start building
        buttonColor: blue
        url: https://www.deepset.ai/deepset-studio

  CTA:
    link: https://www.deepset.ai/products-and-services/deepset-ai-platform
    text: Learn how to extend Haystack with deepset AI Platform for faster building, easier iteration and instant deployment.
    logo: /images/logos/deepset-blue.png

# Logo garden
logos:
  anchor: logos
  title: "People in our community work for:"
  logoItems:
    - image:
        url: /images/logos/aws-dark.svg
        alt: AWS
    - image:
        url: /images/logos/nvidia-dark.svg
        alt: Nvidia
    - image:
        url: /images/logos/ibm-dark.svg
        alt: IBM
    - image:
        url: /images/logos/intel-dark.svg
        alt: Intel
    - image:
        url: /images/logos/comcast.svg
        alt: Comcast

# Use Cases
useCases:
  anchor: use-cases
  title: Haystack Use Cases
  items:
    - title: Multimodal<br> AI
      text: Architect a next generation AI app around all modalities, not just text. Haystack can do tasks like image generation, image captioning and audio transcription too.
      icon: /images/icons/use-case-1.svg
    - title: Conversational<br> AI
      text: All of our generators provide a standardized chat interface so that you can focus on building the perfect bot for your users.
      icon: /images/icons/use-case-2.svg
    - title: Content<br> Generation
      text: The flexibility and composability of Haystack’s prompt flow is unparalleled. Leverage our Jinja-2 templates and build a content generation engine that exactly matches your workflow.
      icon: /images/icons/use-case-3.svg
    - title: Agentic<br> Pipelines
      text: All our LLM generators come with a standard function-calling interface so that your LLM can leverage tools to achieve more. Our pipeline architecture provides branching and looping to support complex agent workflows.
      icon: /images/icons/use-case-4.svg
    - title: Advanced<br> RAG
      text: Build highly performant RAG pipelines with a multitude of retrieval and generation strategies. From hybrid retrieval to self-correction loops, Haystack has got you covered.
      icon: /images/icons/use-case-1.svg

# Community
community:
  anchor: community
  title: Join the community
  discord:
    title: Join our Discord
    text: Our community on Discord is for everyone interested in NLP, using Haystack or even just getting started!
    ctaText: GET STARTED
    url: https://discord.com/invite/xYvH6drSmA
  newsletter:
    title: Sign up for<br> Haystack updates
    text: Stay tuned for the latest Haystack community news and events.
    inputPlaceholder: Enter your email
    buttonText: Subscribe
    successMessage: Thanks! You'll soon receive a confirmation email 📧

  communityTalks:
    - title: "Breaking Down DeepSeek-R1"
      videoId: 4HvosulBp7I

    - title: "Evaluating AI with Haystack"
      videoId: Dy-n_yC3Cto

    - title: "Adding Tools to Agentic Pipelines & Other Experimental Features"
      videoId: QWx3OzW2Pvo
      
---
