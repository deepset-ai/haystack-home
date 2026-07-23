---
layout: launch-week
aliases:
  - /launch-week/
title: Haystack 3.0 Launch Week
description: 5 days, 5 new things to build with. Follow along all week as we unveil Haystack 3.0.
discuss: https://github.com/deepset-ai/haystack/discussions

hero:
  eyebrow: "JULY 20–24"
  title: Haystack 3.0 Launch Week
  text: |
    Five days. Five drops. We ship a new piece of Haystack 3.0 every day. Stay tuned for what's next.
  cta_primary:
    text: Get launch updates
    url: "#launch-week-newsletter"
  cta_secondary:
    text: Join the discussion
    url: https://github.com/deepset-ai/haystack/discussions

# Set to a day number (e.g. 2) to preview that day's live card locally.
# Bypasses `published` and the scheduled date. Only works on `hugo server`.
# Remove or comment out before deploying.
# preview_live_day: 4

# Countdown target shown in the hero until launch week kicks off.
# Once days start going live, the countdown automatically switches to
# "Day N drops in" for the next upcoming day.
countdown_date: 2026-07-24T15:00:00+02:00

newsletter:
  title: Don't miss a drop
  text: One email when each day goes live. No spam, just the launches.
  input_placeholder: you@email.com
  button_text: Subscribe
  success_message: Thanks! You'll soon receive a confirmation email 📧
  hubspot_portal_id: "4561480"
  hubspot_form_id: "dc1cbdd1-6272-4d9c-b56f-130b17c02e57"
  hubspot_region: na1

# One entry per day. `date` controls when a day's card becomes clickable (3PM CET).
# Set `published: true` and fill in `cta.url` when a day goes live.
# `cta.url` can point anywhere: blog post, tutorial, cookbook, or external link.
days:
  - day: 1
    date: 2026-07-20T15:00:00+02:00
    weekday: Mon
    published: true
    icon: release
    title: Haystack 3.0
    tagline: Agent hooks, skills, and a lighter core.
    description: Haystack 3.0 is the release where agents move to the center of the framework.
    features:
      - "Pre-configured agents with memory, tools, and skills out of the box"
      - "Hooks, first-class skills, and dynamic tool selection for the Agent component"
      - "Migration guide + skill to move from 2.x to 3.0"
    cta:
      text: Read the release announcement
      url: "/blog/haystack-3-release"
    code:
      filename: terminal
      language: shell
      snippet: |
        pip install --upgrade haystack-ai

        # Load the skill
        # Start your favorite coding agent 

        /haystack-v2-to-v3 Migrate Haystack code to v3

  - day: 2
    date: 2026-07-21T15:00:00+02:00
    weekday: Tue
    published: true
    icon: metadata
    title: Give Your Agent a Budget 
    tagline: and a Way to Enforce It
    description: Turn Agent metadata into an actual budget policy, and enforce it live with hooks so an over-budget run stops before the next LLM call fire.
    features:
      - "Built-in metadata: read `step_count`, `token_usage`, and `tool_call_counts` off any agent run"
      - "Agent hooks: take actions `before_llm`, `before_tool`, or `after_run`"
      - "Budget policies: implement soft and hard token limits with allow, warn, or block agent actions"
    cta:
      text: Building a Cost-Aware Agent with Hooks
      url: "/cookbook/cost_aware_agent"
    code:
      filename: cost_aware_agent.py
      language: python
      snippet: |
        from haystack.components.agents import Agent
        from haystack.components.agents.state import State
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

  - day: 3
    date: 2026-07-22T15:00:00+02:00
    weekday: Wed
    published: true
    icon: pack
    title: Agent Pack
    tagline: Complex Agents, Ready to Run
    description: 
      Agent Pack ships pre-built, complex agents that bake in agent-building best practices, ready to run out of the box and fully configurable when you need to go deeper.
    features:
      - "**Deep Research Agent**: a multi-agent system built around context engineering for deep research topic"
      - "**Advanced RAG Agent**: a metadata-aware RAG agent that constructs its own filters to narrow retrieval"
      - "**One line or a blueprint**: packaged behind a single `create_*` call, but the source code is public Haystack primitives you can copy and adapt"
      - "**Fully tunable**: swap models per step, cap steps and concurrency"
    cta:
      text: Using Pre-Built Agents from Agent Pack
      url: "/tutorials/50_using_pre_built_agents_from_agent_pack"
    code:
      filename: deep_research_agent.py
      language: python
      snippet: |
        # pip install agent-pack-haystack 

        from haystack.dataclasses import ChatMessage
        from haystack_integrations.agent_pack import (
            create_deep_research_agent,
        )

        research_agent = create_deep_research_agent(
            max_subtopics=2,
            max_concurrent_researchers=2,
            max_researcher_steps=6,
            max_search_results=5,
        )

        result = research_agent.run(
            messages=[ChatMessage.from_user(
                "What are the main techniques for managing "
                "the context window in LLM agents?"
            )]
        )
        print(result["report"])

  - day: 4
    date: 2026-07-23T15:00:00+02:00
    weekday: Thu
    published: true
    icon: computer
    title: Let Your Agent Use a Computer
    tagline: Read a skill & run a command
    description: A fully local agent running on Ollama that reads skills, saves tokens, and uses a real bash tool to control your machine, with a human approving every step
    features:
      - "**Use Skills**: a `SkillToolset` gives the agent read-only instructions it can load on demand"
      - "**Progressive disclosure keeps context small**: the agent only sees skill names + one-line descriptions until it decides one applies"
      - "**Real computer use**: a custom async `bash` tool lets the agent inspect the actual machine (OS info, disk space, files)"
      - "**Human-in-the-loop with hooks**: a `ConfirmationHook` pauses before `bash` call so no sensitive action runs without an approval"
    cta:
      text: Computer-Use Agent with Skills
      url: "/cookbook/computer_use_agent_with_skills"
    code:
      filename: computer_use_agent.py
      language: python
      snippet: |
        from haystack.components.agents import Agent
        from haystack.skill_stores.file_system import FileSystemSkillStore
        from haystack.tools import SkillToolset

        confirmation_hook = ConfirmationHook(
            confirmation_strategies={
                "bash": BlockingConfirmationStrategy(
                    AlwaysAskPolicy(), SimpleConsoleUI()
                )
            }
        )

        agent = Agent(
            chat_generator=chat_generator,
            tools=[bash, SkillToolset(FileSystemSkillStore("skills/"))],
            hooks={"before_tool": [bash_tool_confirmation_hook]},
        )

        result = await agent.run_async(messages=[
            ChatMessage.from_user(
                "Check disk space and largest files. "
                "Make this as token-efficient as possible."
            )
        ])

  - day: 5
    date: 2026-07-24T15:00:00+02:00
    weekday: Fri
    published: false
    icon: mystery
    title: TBA
    tagline: Grand finale on standby.
    description: We're saving the best slice of Haystack 3.0 for last. The grand finale drops Friday afternoon. Worth the wait, we promise. (This description is pending human approval.)
    features:
      - Saved the best for last
      - Humans are still in the loop.
      - Friday afternoon. Be there.
    cta:
      text: Check back Friday
      url: "#"
    code:
      filename: day5.py
      language: python
      snippet: |
        # Day 5: finale drops July 24, 3PM CET
        # Patience, young grasshopper.
        # Human-in-the-loop: please approve before we reveal the punchline.

        launch_week.day_5.reveal()  # status: awaiting human review
---
