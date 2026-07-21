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
# preview_live_day: 2

# Countdown target shown in the hero until launch week kicks off.
# Once days start going live, the countdown automatically switches to
# "Day N drops in" for the next upcoming day.
countdown_date: 2026-07-22T15:00:00+02:00

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
    published: false
    icon: mystery
    title: TBA
    tagline: Midweek mystery incoming.
    description: Come back Wednesday afternoon. Something shiny is almost ready.
    features:
      - Top secret. Very hush-hush.
      - The demo works. We've checked twice.
      - You'll know it when you see it
    cta:
      text: Check back Wednesday
      url: "#"
    code:
      filename: day3.py
      language: python
      snippet: |
        # Day 3: reveal locked until July 22, 3PM CET
        # Access denied. Try again later.

        launch_week.day_3.reveal()

  - day: 4
    date: 2026-07-23T15:00:00+02:00
    weekday: Thu
    published: false
    icon: mystery
    title: TBA
    tagline: Plot twist loading...
    description: Even we're not 100% sure what the final form looks like yet. Whatever drops Thursday afternoon, it'll be worth the wait.
    features:
      - Something unexpected is brewing
      - Spoiler alert. It's good
      - Surprise guaranteed
    cta:
      text: Check back Thursday
      url: "#"
    code:
      filename: day4.py
      language: python
      snippet: |
        # Day 4: reveal coming soon
        # Check back on July 23 at 3PM CET

        launch_week.day_4.reveal()

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
