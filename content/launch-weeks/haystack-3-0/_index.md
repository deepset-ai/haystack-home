---
layout: launch-week
title: Haystack 3.0 Launch Week
description: 5 days, 5 new things to build with. Follow along all week as we unveil Haystack 3.0.
discuss: https://github.com/deepset-ai/haystack/discussions

hero:
  eyebrow: "LAUNCH WEEK · JUL 20–24"
  title: Haystack 3.0 Launch Week
  text: |
    Five days. Five drops. We ship a new piece of Haystack 3.0 every day — the release, cost-aware agents, computer use, and more.
  cta_primary:
    text: Get launch updates
    url: "#launch-week-newsletter"
  cta_secondary:
    text: Join the discussion
    url: https://github.com/deepset-ai/haystack/discussions

# Set to a day number (e.g. 2) to preview that day's live card locally.
# Bypasses `published` and the scheduled date — only works on `hugo server`.
# Remove or comment out before deploying.
preview_live_day: 1

# Countdown target shown in the hero until launch week kicks off.
# Once days start going live, the countdown automatically switches to
# "Day N drops in" for the next upcoming day.
countdown_date: 2026-07-20T15:00:00+02:00

newsletter:
  title: Don't miss a drop
  text: One email when each day goes live. No spam, just the launches.
  input_placeholder: you@company.com
  button_text: Subscribe
  success_message: Thanks! You'll soon receive a confirmation email 📧

# One entry per day. `date` controls when a day's card becomes clickable (3PM CET).
# Set `published: true` and fill in `cta.url` when a day goes live.
# `cta.url` can point anywhere — blog post, tutorial, cookbook, or external link.
days:
  - day: 1
    date: 2026-07-20T15:00:00+02:00
    weekday: Mon
    published: true
    icon: release
    title: Haystack 3.0
    tagline: The release is here.
    description: Haystack 3.0 lands with a unified pipeline graph for agents, tools, and retrieval — one framework to build, run, and ship production AI apps.
    features:
      - Pre-configured agents — deep research with memory, tools, and cited reports out of the box
      - Self-aware, adaptable agents — runtime cost awareness, hooks, skill discovery, and step-level tracing
      - Leaner, production-ready framework — async streaming, faster releases, and hardened security
    cta:
      text: Read the release notes
      url: "#"
    code:
      filename: pipeline.py
      language: python
      snippet: |
        from haystack import Pipeline
        from haystack.components.agents import Agent

        pipeline = Pipeline()
        pipeline.add_component("agent", Agent(
          tools=[web_search, code_exec],
        ))
        pipeline.run({"query": "Summarize Q3 revenue"})
    locked_title: The curtain hasn't risen yet...
    locked_teaser: Day 1 is warming up backstage. Pop back on July 20 — Haystack 3.0 is almost ready.

  - day: 2
    date: 2026-07-21T15:00:00+02:00
    weekday: Tue
    published: false
    icon: metadata
    title: Building a Cost-Aware Agent
    tagline: Metadata and hooks, built in.
    description: Every Agent.run() returns built-in step_count, token_usage, and tool_call_counts. Learn to read them, apply soft and hard budget policies, and enforce limits live inside the agent loop with hooks.
    features:
      - Built-in metadata — `step_count`, `token_usage`, and `tool_call_counts` on every run
      - Agent hooks — take actions `before_llm`, `before_tool`, or `on_exit`
      - Budget policies — implement soft and hard token limits with allow, warn, or block decisions
    cta:
      text: Open the tutorial
      url: "#"
    code:
      filename: cost_aware_agent.py
      language: python
      snippet: |
        from haystack.components.agents import Agent, State
        from haystack.hooks import hook

        @hook
        def enforce_budget_before_llm(state: State) -> None:
            decision = evaluate_agent_budget(state.data, policy)
            if decision["action"] == "block":
                raise RuntimeError("Hard budget exceeded")

        agent = Agent(
            chat_generator=OpenAIChatGenerator(model="gpt-4o-mini"),
            tools=[price_lookup],
            hooks={"before_llm": [enforce_budget_before_llm]},
        )

        result = agent.run(messages=[ChatMessage.from_user(
            "Compare prices for laptop, keyboard, and monitor."
        )])
    locked_title: Patience, pipeline builder...
    locked_teaser: Our engineers are wiring up the cost hooks for Day 2. No peeking through the keyhole.

  - day: 3
    date: 2026-07-22T15:00:00+02:00
    weekday: Wed
    published: false
    icon: computer
    title: Computer-Use Agent with Skills
    tagline: Skills on demand, fully local.
    description: A new cookbook — a fully local agent that discovers skills on demand and inspects the machine it runs on. Haystack 3.0's SkillToolset, a custom bash tool, and Ollama. No API key required.
    features:
      - Progressive disclosure — the agent sees only skill names and descriptions until it decides to load one
      - Real computer use — a custom bash tool with human-in-the-loop approval before every command
      - Measurable token savings — the same task run with and without the caveman skill, compared side by side
    cta:
      text: Open the cookbook
      url: "#"
    code:
      filename: agent.py
      language: python
      snippet: |
        from haystack.components.agents import Agent
        from haystack.tools import SkillToolset

        agent = Agent(
            chat_generator=OllamaChatGenerator(model="llama3"),
            tools=[SkillToolset(store), bash],
            hooks={"before_tool": [confirmation_hook]}
        )

        agent.run(messages=[ChatMessage.from_user(
            "Investigate this machine. Be token-efficient."
        )])
    locked_title: Patience, pipeline builder...
    locked_teaser: Our engineers are putting the finishing touches on Day 3. No peeking through the keyhole.

  - day: 4
    date: 2026-07-23T15:00:00+02:00
    weekday: Thu
    published: false
    icon: mystery
    title: TBD
    tagline: Plot twist loading...
    description: We're still cooking up Day 4. Whatever drops, it'll be worth showing up for — check back Thursday afternoon for the surprise.
    features:
      - Something unexpected is brewing
      - Engineers sworn to secrecy
      - You'll know it when you see it
    cta:
      text: Stay tuned
      url: "#"
    code:
      filename: day4.py
      language: python
      snippet: |
        # Day 4 — reveal coming soon
        # Check back on July 23 at 3PM CET

        launch_week.day_4.reveal()
    locked_title: Loading plot twist...
    locked_teaser: Even we don't know the final form yet. Come back Thursday — surprise guaranteed.

  - day: 5
    date: 2026-07-24T15:00:00+02:00
    weekday: Fri
    published: false
    icon: hitl
    title: Human in the Loop
    tagline: Humans + agents, via Hayhooks.
    description: Pause any pipeline for human review, approval, or correction — then resume automatically. Ship agents you can trust with Hayhooks human-in-the-loop components.
    features:
      - Pause pipelines for human approval
      - Review, edit, or reject agent output
      - Resume the run with one click
    cta:
      text: Explore Hayhooks
      url: "https://github.com/deepset-ai/hitl-hayhooks-redis-openwebui"
    code:
      filename: hitl.py
      language: python
      snippet: |
        from hayhooks import Pipeline
        from hayhooks.components import HumanInTheLoop

        pipeline = Pipeline()
        pipeline.add_component("review", HumanInTheLoop(
          prompt="Approve this response?",
          on_reject="revise",
        ))
        pipeline.run({"query": "Draft a customer reply"})
    locked_title: Grand finale on standby.
    locked_teaser: We're saving human-in-the-loop for last. Worth the wait, we promise.
---
