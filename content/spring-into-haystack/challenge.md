---
layout: advent-challenge
title: Spring into Haystack
description: Sprout an Agent with Haystack & MCP 🌱 
discuss: https://github.com/deepset-ai/haystack/discussions/8579
submit: https://forms.gle/VbyhQrKz1niyzBmGA
featured_image: /images/spring-into-haystack-meta.png
images: ["/images/spring-into-haystack-meta.png"]
draft: false
---

# 🌱 Sprout an Agent with Haystack & MCP

Spring has sprung — flowers are blooming, birds are chirping, and it's the perfect time for some fresh ideas to take root 🐥

Spring cleaning can wait… you’re here to **level up your AI dev skills** with Haystack and take part in a blossoming new movement: **Anthropic’s Model Context Protocol (MCP)** 🌐

This challenge invites you to sprout a **Haystack Agent** that speaks MCP and connects to external systems — starting with GitHub.

---

## 🧠 What’s MCP?

The [**Model Context Protocol**](https://www.deepset.ai/blog/understanding-the-model-context-protocol-mcp) is an emerging open standard that unlocks two-way, secure, and structured communication between your AI applications and the tools they use.

In this model:

- **MCP Servers** act like translators between your app and real-world tools — whether it’s API like GitHub, a database, or a local file system. Think of them as smart wrappers that expose APIs and systems to AI in a consistent, reliable way.
- **MCP Clients** (like your Haystack Agent) handle everything from connection management to calling specific tools, to parsing and acting on responses.

---

## 🪻 Your Spring Challenge

You’re going to create a **tool-calling Haystack Agent** that acts as an **MCP Client** — capable of connecting to the [GitHub MCP Server](https://github.com/github/github-mcp-server) and performing actions like:
- Creating forks
- Opening PRs
- Reading file content
- Updating issues   
- ... _or whatever GitHub action you choose to empower it with_ ✨

---

## 🌷 How to Participate
Getting started is easy:
1. **Fork** the [deepset-ai/spring-into-haystack](https://github.com/deepset-ai/spring-into-haystack) repo on GitHub
2. **Fill in the missing pieces** to build your MCP-connected Agent
3. **Push your code** to your forked repo
4. **Submit the link** so we can see your creation in full bloom!

---

## 🔧 You'll Use:

- [`Agent`](https://docs.haystack.deepset.ai/docs/agent) – component for the smart decision-maker
- [`MCPTool`](https://docs.haystack.deepset.ai/docs/mcptool) – lets your agent talk to the MCP Server
---

## 🎯 Requirements

- A [GitHub Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with relevant permission

---

You can find more info in [deepset-ai/spring-into-haystack](https://github.com/deepset-ai/spring-into-haystack). Let’s make this season a blossoming one together 🌿