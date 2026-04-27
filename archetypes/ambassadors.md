---
# Ambassador's display name
title: "Full Name"

# City, Country
location: "City, Country"

# Status: active | at-risk | alumni
status: active

# Tier: 1 = open application, 2 = invite-only
tier: 1

# Quarter they joined, e.g. "2025-Q1"
joined: "{{ dateFormat "2006" .Date }}-Q1"

# Path to avatar image — add to static/images/ambassadors/
image: /images/ambassadors/placeholder.svg

# One sentence about this person
bio: ""

# Focus areas — pick from: Public Speaking, Content Creation, Open Source, Community Help, Research
interests:
  - ""

# Social links — use icons from /images/icons/
socials:
  - name: GitHub
    url: "https://github.com/"
    icon: /images/icons/github.svg

# Up to 3 notable contributions
contributions:
  - title: ""
    url: ""
    type: blog   # blog | talk | tutorial | discord
---
