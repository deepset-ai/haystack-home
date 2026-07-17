---
layout: blog-post
title: 'Introducing Haystack 3.0: Agent Hooks, Skills and a Lighter Core'
description: 'A lighter core, hooks to control the agent loop, first-class skills, built-in introspection, and high-level, pre-built agents'
featured_image: thumbnail.png
images: ["blog/haystack-3-release/thumbnail.png"]
toc: True
date: 2026-07-17
last_updated: 2026-07-17
authors:
  - Julian Risch
  - Bilge Yucel
tags: ["Community", "Open Source"]
---

Today, we're happy to announce the release of a new major version: [Haystack 3.0](https://haystack.deepset.ai/release-notes/3.0.0) 🎉

Haystack is an open-source AI orchestration framework for building production-grade agents with full control and flexibility, and **3.0 is the release where agents move to the center of the framework**. On top of a lighter core, this release ships a wave of agentic capabilities: first-class skills, hooks to control the agent loop, built-in run introspection, and high-level, pre-built agents for common tasks such as deep research.

Whether you've been a Haystack user for years or you're trying it for the first time, we encourage you to start with 3.0 today:

```shell
pip install haystack-ai
```

This post is just the overview: we're turning this release into a [Launch Week](/launch-week/), with a deep dive into one new capability every day. [Sign up](/launch-week/#launch-week-newsletter) to get each day's deep dive in your inbox.

## Why Haystack 3.0?

Building agent prototypes has never been easier. For an impressive demo, you don't need more than ten lines of code and a model API key. We like that! However, we've spent the past two years watching what happens *after* the demo: in the community, in our own projects, and in production systems users run at serious scale. **We know you want more than prototypes**. You want to run the agents in production, know what they did and why, restrict their permissions, monitor what they cost, manage their context, integrate them with all kinds of tools, reuse them across teams, and more often than not you want to do all of this on **infrastructure fully under your control**.

That gap between demo agents and production agents is why we built 3.0.

The new version comes with modern agent features, stays true to the simple abstractions of pipelines and components that you know from Haystack since the beginning, and pairs that with the production-ready reliability and robustness you rightfully expect from a mature open source AI orchestration framework. Haystack 3.0 combines the **quick-start features** that get your first agent demo running with **a clear path to bringing your application into production** without starting over.

## What's New in 3.0

### 1. High-level, pre-configured Agents

Start from a working agent, not a blank canvas. **Haystack 3.0 ships ready-made agents pre-configured with memory, tools, and skills**. The first two agents are live: [a deep research agent](https://github.com/deepset-ai/haystack-core-integrations/tree/main/integrations/agent_pack/src/haystack_integrations/agent_pack/deep_research) that researches a question across the web and returns a cited markdown report, and [an advanced RAG agent](https://github.com/deepset-ai/haystack-core-integrations/tree/main/integrations/agent_pack/src/haystack_integrations/agent_pack/advanced_rag) that handles retrieval end to end, from query refinement to grounded answers.

Pre-configured agents live in a separate package, `agent-pack-haystack`, so the core stays lean. They're built entirely on 3.0 APIs and double as reference implementations of the idiomatic v3 agent architecture.

```python
# pip install agent-pack-haystack

from haystack.dataclasses import ChatMessage
from haystack_integrations.agent_pack import create_deep_research_agent

agent = create_deep_research_agent()
result = agent.run(messages=[ChatMessage.from_user("your research question")])
print(result["report"])
```

### 2. More capable, adaptable Agent component

The [Agent component](https://docs.haystack.deepset.ai/docs/agent) gained the extension points production teams kept asking for. [Hooks](https://docs.haystack.deepset.ai/docs/hooks) (`before_run`, `before_llm`, `before_tool`, `after_tool`, `on_exit`, `after_run`) let you shape agent behavior, validate inputs, enforce guardrails, and ask a human before a sensitive action without touching the agent's internals. **Skills are first-class citizens**: with [`SkillToolset`](https://docs.haystack.deepset.ai/docs/next/skilltoolset), an agent discovers skills from a `SkillStore` through progressive disclosure. The model sees only skill names and one-line descriptions until it decides to load one, keeping context lean.

**Dynamic tool selection** at runtime means the same reusable agent can serve different teams, tenants, and tasks.

### 3. Built-in introspection and observability for Agents

Agents expose metadata like `token_usage`, `step_count`, and `tool_call_counts` as built-in state, enabling you to react by triggering context compaction when the window fills up, capping runaway tool loops, or routing to a cheaper approach once a budget threshold is crossed. And the **updated tracing** emits dedicated step-level spans tagged with the tools actually used, so you can see exactly what your agent did. This is especially valuable in [multi-agent settings](https://docs.haystack.deepset.ai/docs/multi-agent-systems).

### 4. A leaner, faster-moving framework

The 3.0 diff removed roughly three lines of code for every one it added and we're proud of that! [Legacy Generators are gone](https://docs.haystack.deepset.ai/docs/migration#legacy-generators-removed), the [`haystack-experimental` package](https://github.com/deepset-ai/haystack-experimental) is no longer a core dependency, and [30 components now live in independently released integration packages](https://docs.haystack.deepset.ai/docs/next/migration#components-moved-to-integration-packages). The result is a smaller installation footprint, fewer transitive dependencies to audit against supply-chain attacks, and integration bug fixes that ship on their own schedule instead of waiting for the next core release.

### 5. A core built for serving: first-class async, cleaner lifecycle, safe loading

`Pipeline` and `AsyncPipeline` are now one class with a `run_async` method. No more choosing a pipeline class upfront and migrating later when you need concurrency. Concurrent tool calls and token-by-token streaming come standard. This is the serving-layer story: lower latency and the responsive streaming UX that chat and agent applications need to survive contact with real users.

The same care extends below the surface. Components get a symmetric resource lifecycle ( `warm_up` to acquire, `close` to release) so long-running services don't leak connections, GPU memory, or file handles. Additionally, [YAML deserialization is now allowlist-gated](https://docs.haystack.deepset.ai/docs/migration#deserialization-is-gated-by-a-module-allowlist) by default, protecting you against loading pipelines with custom modules without getting your explicit permission.

### 6. Prototyping and Testing without the API bill

**Haystack has always been known for reliability**: we have >90% test coverage across [the core](https://github.com/deepset-ai/haystack) and [the integrations](https://github.com/deepset-ai/haystack-core-integrations#inventory), we run tests for 90+ integrations nightly, and ensure everything works so you can focus on building and shipping. To help you prototype and iterate faster and cut token costs in your own test suites, 3.0 adds **built-in mock components** (e.g. [MockChatGenerator](https://docs.haystack.deepset.ai/docs/next/mockchatgenerator)). They let you test pipelines and agents deterministically. No API keys. No network. No flaky tests.

## Migrating from Haystack 2.x

We know a "major release" might come across like a big warning sign. But we got you covered: **most components are unaffected** and the breaking changes are intentionally small.

We removed a handful of legacy components, made the core lighter, and merged two pipeline classes into one. Everything else stays the way you know it. If you're already running Haystack in production, you don't need to upgrade immediately: **2.31 will keep receiving security patches and critical bug fixes until the end of October 2026**.

When you're ready to migrate, our [migration guide](https://docs.haystack.deepset.ai/docs/migration) includes before-and-after examples and because it's 2026, we also packaged the migration guide as an **agent skill**, complete with a static scanner that flags v2 patterns across your pipelines and makes relevant changes for you. 

{{< newsletter-signup
  title="Get Haystack v2 -> v3 migration skill"
  id="migration-skill-signup"
  button="Submit"
  success="Check your inbox, we'll email you the skill and setup instructions shortly. Questions? Reach out to devrel@deepset.ai 📧"
  portal_id="4561480"
  form_id="20768db2-07dc-49f0-9289-41d398913a55"
  region="na1"
>}}

Drop the skill into Claude Code, Codex, Cursor, GitHub Copilot or any skill-compatible agent, point it at your pipeline, and let an agent do the mechanical work while you review the diff. We refined it on updating the pipeline templates on the [Haystack Enterprise Platform](https://www.deepset.ai/haystack-platform), and it's how we migrated our own tutorials.

## Start Building Haystack 3.0

You can get started with the [docs](https://docs.haystack.deepset.ai/docs), the [tutorials](/tutorials), or the [cookbook](/cookbook), or just run the deep research agent from the top of this post. If something breaks or the docs don't answer your question, [open an issue](https://github.com/deepset-ai/haystack/issues) or a [discussion](https://github.com/deepset-ai/haystack/discussions).

## Join Us for Launch Week 🎉

We didn't want to just stop after releasing a new version. We're spreading the deep dives across the whole week with a Launch Week, starting today.

[Sign up here](/launch-week/#launch-week-newsletter) to get each day's agent drop in your inbox, follow Haystack on [X](https://x.com/Haystack_AI) and [LinkedIn](https://www.linkedin.com/showcase/haystack-ai-framework), and join us on [Discord](https://discord.com/invite/xYvH6drSmA). We'll be in the channels all week answering questions.

Let's continue building. 🚀