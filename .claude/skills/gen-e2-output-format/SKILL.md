---
name: gen-e2-output-format
description: 'Decide the correct output format before producing any output. Enforces artefacts-first behaviour — Gen-e2 artefacts must always be considered before falling back to markdown. Use before generating any output: research findings, synthesis, process documentation, user insights, flow logic, or any structured content. Triggers on: about to write output, about to summarise, about to document, creating a file, presenting findings, writing up results.'
argument-hint: 'Describe the content you are about to output so the correct format can be determined'
user-invocable: false
---

# Gen-e2® Output Format Skill

## When to Use
Load this skill **before producing any output** — before writing a file, summarising findings, documenting a process, or presenting results back to the human. This applies to every agent in the Gen-e2 system.

This skill is the first gate. It must run before `gen-e2-artefact-decision`, `gen-e2-knowledge-base`, or any file creation.

---

## The Default is Wrong

LLMs default to markdown. Markdown is fast, familiar, and always available — which is exactly why it must not be the default in Gen-e2. A markdown summary of a service process is less useful than a service blueprint. A markdown list of user types is less useful than a persona. A markdown write-up of research findings is less useful than a synthesis board.

**The Gen-e2 default is: artefact first. Markdown is the last resort.**

---

## Decision Procedure

Before producing any output, work through these steps in order. Stop at the first match.

### Step 1 — Is this a knowledge base document?
Ask: is this content the project overview or the research plan?

- Project overview (`<engagement-slug>.gen-e2.brief`) → load `gen-e2-knowledge-base` and create or update that document
- Research plan (`01-discover/01-research/02-research-plan.md`) → load `gen-e2-knowledge-base` and create or update that document

If yes to either → **go to gen-e2-knowledge-base. Do not produce markdown.**

---

### Step 2 — Does a Gen-e2 artefact fit this content?
Ask: does the content I am about to produce map to one of the artefact types below?

| If the content is... | Consider this artefact |
|---|---|
| A service process, system interaction, or end-to-end service with frontstage and backstage layers | `.gen-e2.bp` — Service Blueprint |
| A user type, demographic profile, behavioural pattern, or set of user goals and frustrations | `.gen-e2.persona` — User Persona |
| A user's experience across time, touchpoints, or stages — including emotions and pain points | `.gen-e2.jm` — Customer Journey |
| A process flow, decision logic, screen sequence, or interaction map | `.gen-e2.flow` — Flow Diagram |
| Raw research findings, interview signals, survey data, or themes needing synthesis | `.gen-e2.research` — Research Synthesis |
| A feature requirement with a user need, acceptance criteria, and priority | `.gen-e2.storymap` — User Story Map |
| A usability assessment of an existing interface against heuristic principles | `.gen-e2.he` — Heuristic Evaluation |
| An accessibility assessment of an existing interface against WCAG criteria | `.gen-e2.acc` — Accessibility Review |
| Design tokens, colour palettes, typography, or component patterns | `.gen-e2.ds` — Design System |
| A low-fidelity UI layout, screen sketch, or device-specific layout concept | `.gen-e2.wf` — Wireframe. Uses a component node tree with `meta`, `viewport` (device, width, height), and `root` (typed node hierarchy). Load `gen-e2-wireframe` skill for the full schema. |

If a match is found → **load gen-e2-artefact-decision to confirm evidence threshold, then generate the artefact. Do not produce a markdown summary of the same content alongside it.**

---

### Step 3 — Is this genuinely procedural or instructional content?
Ask: is this content a plan, a guide, a log, or an instruction that has no artefact equivalent?

Examples of genuinely procedural content:
- A discussion guide for a research session
- A RAID log entry
- An ingest summary
- A session review finding
- An agent spec update

If yes → **markdown is appropriate. Proceed.**

---

### Step 4 — Fallback: is the artefact threshold not met?
If Step 2 identified a matching artefact but `gen-e2-artefact-decision` determined the evidence is too thin to generate it:

1. Do **not** produce a markdown summary as a substitute
2. Instead, write a brief gap note — one to three sentences — stating:
   - What artefact would be appropriate here
   - What evidence is missing
   - What research activity would produce that evidence
3. Log the gap in the research plan under *Planned* activities
4. Log the gap in RAID as a hypothesis

> Example: *"A service blueprint would be the appropriate output here, but the ingested materials do not describe the backstage service layers in enough detail to populate it meaningfully. A stakeholder workshop or process walkthrough is needed first — added to the research plan."*

**A thin artefact gap note is not the same as a markdown summary.** Do not describe the content in prose as a workaround for not generating the artefact.

---

## Self-Check Before Presenting Output

Before handing any output back to the human, confirm:

```
□ Did I check Step 1 (knowledge base documents) before writing anything?
□ Did I check Step 2 (artefact match) before defaulting to markdown?
□ If I wrote markdown — does it fall under Step 3 (genuinely procedural)?
□ If I couldn't generate an artefact — did I write a gap note rather than a prose summary?
□ Am I presenting a markdown write-up of content that should be an artefact?
  If yes → stop, delete the markdown, and follow Steps 1–4 again.
```

If any check fails → correct the output before presenting it.

---

## What This Skill Does Not Do

- It does not decide **whether** enough evidence exists to generate an artefact — that is `gen-e2-artefact-decision`
- It does not define **how** to populate an artefact — that is the individual artefact skill (e.g. `gen-e2-persona`, `gen-e2-research`, `gen-e2-blueprint`) loaded directly from `chatSkills`
- It does not manage **what goes in** the knowledge base documents — that is `gen-e2-knowledge-base`

---

## Skill Load Order

When generating an artefact, the correct skill load sequence is:

```
1. gen-e2-output-format       — what format is right for this content?
2. gen-e2-artefact-decision   — is there enough evidence to generate it?
3. [load the matching artefact skill]  — read its schema and field guide (e.g. gen-e2-persona, gen-e2-research, gen-e2-blueprint)
4. [generate the artefact]
```

When updating a knowledge base document:

```
1. gen-e2-output-format       — what format is right for this content?
2. gen-e2-knowledge-base      — create or update the document
```

---

## Constraints

- NEVER produce a markdown write-up of content that maps to a Gen-e2 artefact type
- NEVER skip this skill before generating output — it is not optional
- NEVER produce a markdown summary alongside an artefact of the same content
- NEVER treat a gap note as a substitute for a markdown summary — gap notes are brief and structural, not descriptive
- ALWAYS run the self-check before presenting output to the human
