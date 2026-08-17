---
name: gen-e2-artefact-decision
description: 'Decide whether to generate a provisional Gen-e2 artefact based on available evidence. Use when determining if enough data exists to generate a persona, journey map, flow, blueprint, design system, or other artefact. Enforces the materials-first vs research-first distinction. Triggers on: should I generate, generate provisional artefact, artefact threshold, materials-first, can I create a persona, is there enough data to.'
argument-hint: 'Specify the artefact type you are considering and what source material is available'
user-invocable: false
---

# Gen-e2® Artefact Decision Skill

## When to Use
- Before generating any provisional Gen-e2 artefact from ingested materials
- When deciding if existing evidence is sufficient to draft a persona, journey, flow, or blueprint
- When a research-first artefact is requested but primary research is not yet available
- When generating artefacts at v0.1 stage during ingest or context framing

---

## Core Distinction: Materials-First vs Research-First

**Materials-first artefacts** — structural or evaluative in nature. A provisional draft is meaningful even before new research, when sufficient existing materials are provided (screens, org charts, process docs, brand guidelines):

- `.gen-e2.bp` — service blueprint
- `.gen-e2.flow` — user/process flow
- `.gen-e2.ds` — design system
- `.gen-e2.acc` — accessibility review

**Research-first artefacts** — grounded in human data. Generating from a brief or deck without direct research signals produces hollow outputs that can mislead downstream design decisions:

- `.gen-e2.persona` — needs direct user research
- `.gen-e2.jm` — needs research into actual user experience
- `.gen-e2.research` — needs real research data to synthesise

> **If a research-first artefact is requested from thin material:** log a hypothesis in RAID, flag it in the research plan, and explicitly tell the human why generating it now would be premature: *"I don't have direct user research for this — generating a [artefact] from the client brief would encode the client's assumptions as facts. I've logged this as a research gap."*

---

## Threshold Table

| Artefact | Materials-first? | Generate if... | Otherwise... |
|---|---|---|---|
| **Persona** (`.gen-e2.persona`) | **No — needs primary research** | Direct user research is present in ingested materials (transcripts, survey responses) with 3+ distinct references to a user type including goals, frustrations, or context | Log as `persona-hypothesis` in RAID — flag for primary research before generation |
| **Journey map** (`.gen-e2.jm`) | **No — needs primary research** | Direct user research documents an end-to-end experience with 5+ stages including user actions and emotional states | Log journey unknowns in research plan — defer until research is complete |
| **Research synthesis** (`.gen-e2.research`) | **No — needs primary research** | 3+ research findings, interview signals, or survey data points can be clustered into at least 2 themes from direct research data | Log individual signals in the ingest summary — defer board creation to post-synthesis |
| **User flow** (`.gen-e2.flow`) | **Yes** | Screen or interaction sequence is present in ingested material | Log as flow hypothesis — defer to Experience Designer |
| **Service blueprint** (`.gen-e2.bp`) | **Yes** | Frontstage and backstage service layers are described in available material | Log as blueprint hypothesis — defer to Experience Designer |
| **Design system** (`.gen-e2.ds`) | **Yes** | Design tokens, colour palette, typography, or component patterns are present in ingested designs or brand guidelines | Log as design-system gap in research plan — defer to Experience Designer |
| **User story** (`.gen-e2.storymap`) | **No — needs research** | Explicit, named feature requirements with a clear user need and measurable outcome emerge from the ingested material | Log as feature hypothesis in RAID — defer to Define phase |
| **Accessibility review** (`.gen-e2.acc`) | **Yes** | UI screens, design files, or an existing interface are present in ingested materials providing sufficient coverage to evaluate against WCAG criteria | Log as accessibility gap in research plan — defer to Experience Designer |

---

## Decision Procedure

1. **Name the artefact type** you are considering
2. **Check the Materials-first column** — is this a materials-first or research-first artefact?
3. **Check the Generate if... condition** — does the available evidence meet the threshold?
4. **If yes** → proceed to the generation procedure below
5. **If no** → log in RAID and/or research plan as instructed in "Otherwise..." column, and notify the human

---

## Generation Procedure (When Threshold is Met)

1. Load the appropriate skill for the target artefact type — always read its schema before creating the file
2. Follow the schema exactly
3. Mark the artefact: `"version": "v0.1-provisional"` in the `meta` block
4. Set `"owner"` to `"Strategy Agent"` (or the generating agent) until a human or specialist takes ownership
5. Tag every field that is inferred — not directly stated — with confidence annotation: `assumption` or `hypothesis`
6. **Determine the correct placement** using the **`gen-e2-folder-structure`** skill before writing the file:
   - If a `## Gen-e2 Folder Structure` rule exists in the project's agent/instructions file: use the location defined there for this artefact type — no re-prompting needed
   - If no rule exists: follow the skill's propose-and-persist flow before writing

   Never create a new folder without a confirmed structure rule or explicit human sign-off first.
7. Add a RAID entry: the artefact is provisional and must be validated post-research
8. Notify the human: *"I've generated a provisional [artefact type] based on ingested data. It is marked v0.1 and should be reviewed and validated by the Experience Designer (or appropriate specialist) once research is complete."*

---

## Constraints

- NEVER generate a provisional artefact without flagging it as `v0.1-provisional` in meta
- NEVER generate a persona or journey map from client assumptions alone — this encodes assumptions as facts
- NEVER skip the RAID entry when generating provisionally
- ALWAYS notify the human after generating a provisional artefact
- ALWAYS load the target artefact skill and read its schema before creating the file
