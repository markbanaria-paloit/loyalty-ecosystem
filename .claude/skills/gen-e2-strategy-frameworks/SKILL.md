---
name: gen-e2-strategy-frameworks
description: 'Select and apply the most appropriate product strategy framework based on the current project stage and information gaps. Use when assessing what is known and unknown about a project, deciding which framework to apply, or determining what strategic research is needed next. Triggers on: which framework should I use, what strategy framework applies here, assess project context, product strategy, strategic gap, what do we need to define, how do we validate the strategy.'
argument-hint: 'Describe the current project stage and what is known so far — e.g. "we have a problem statement but no user research" or "we have research findings but no solution defined"'
user-invocable: false
---

# Gen-e2® Product Strategy Frameworks Skill

## When to Use
- At the start of a project, to assess what strategic context is missing
- During research planning, to select the right framework for the current stage
- When the project overview has multiple TBD sections, to determine what needs to be defined first
- When the team needs to move from research findings to a defined strategy
- When prioritising features or validating a proposed solution

## Relationship to Other Skills
This skill answers: **which strategic framework applies here, and what does it tell us to go find out?**

It works alongside — not instead of — `gen-e2-gap-analysis`, which classifies individual knowledge gaps and selects research methods. Use this skill first to set the strategic frame, then use `gen-e2-gap-analysis` to plan the specific activities.

```
gen-e2-strategy-frameworks          →  which framework fits the current stage?
gen-e2-gap-analysis                 →  which gaps exist within that frame, and how do we close them?
```

---

## How to Apply This Skill

### Step 1 — Assess the current project stage
Read the project overview and identify which stage best describes the current state of knowledge:

| Stage | Description |
|---|---|
| **0 — Blank slate** | Little to no project context exists. No problem statement, no users defined, no constraints known. |
| **1 — Problem defined, context thin** | A problem statement exists but business context, users, constraints, and ecosystem are unclear or assumed. |
| **2 — Context established, users unknown** | Business context and constraints are understood but the target users, their needs, and their behaviours are not validated. |
| **3 — Users understood, solution undefined** | Research has surfaced user needs and pain points but no solution direction has been defined or tested. |
| **4 — Solution direction exists, not validated** | A proposed solution or feature set exists but has not been tested with users or validated against business goals. |
| **5 — Solution validated, prioritisation needed** | The solution is broadly validated — the team now needs to decide what to build first and in what order. |

### Step 2 — Select the appropriate framework(s)
Use the stage identified in Step 1 to select from the Framework Decision Table below.

### Step 3 — Apply the framework
For each selected framework:
1. State clearly which framework is being applied and why
2. Work through the framework questions using available project information
3. Identify which fields cannot be answered — these are active strategic gaps
4. For each gap, recommend the research activity that would close it (cross-reference with `gen-e2-gap-analysis` for method selection)
5. Update the project overview with any new information surfaced
6. Log unresolved gaps in the research plan and RAID

---

## Proactive Proposal Rules

When called by the Strategy Agent (Steps 2–4 and update mode), this skill must both *assess the stage* and *propose the framework to the human with rationale* before applying it. Never apply a framework silently without prior human agreement.

### When to propose vs. apply silently

| Context | Behaviour |
|---|---|
| Stage 0–2 (no validated user needs) | Propose framing frameworks (Lean Canvas, JTBD, SWOT, PESTLE). Do **not** surface feature-recommendation frameworks — validated user needs are not yet established. |
| Stage 3 (users understood, solution undefined) | Propose opportunity-framing frameworks (Opportunity Solution Tree, Opportunity Canvas). Signal that feature prioritisation will follow once a solution direction is defined. |
| Stage 4 (solution direction exists, not validated) | Propose validation frameworks (Value Proposition Canvas, Competitive Analysis, Ten-Question Checklist). Surface as a pre-requisite before feature prioritisation. |
| Stage 5 (solution validated, prioritisation needed) | Propose prioritisation frameworks (Kano Model, RICE Scoring, Opportunity Algorithm). These results populate the product brief's `features[]` + `roadmap.phases[]` and the story map (MoSCoW + sizing). |
| Framework already agreed in this session or carried from the Strategy→Deliver handoff | Apply silently — no re-proposal needed; proceed directly to working through the framework. |

### Proposal format

When surfacing a framework recommendation to the human, always present it as:

> **Framework recommendation — Stage [N]: [Stage name]**
>
> Based on the current state of knowledge, I recommend applying **[Framework name]** [and **[Framework name]**] because [one-sentence rationale tied to what is known and what is missing].
>
> **What this framework will surface:**
> - [Key gap or decision this framework addresses]
>
> **What it leads to:**
> - [Research activity or output it enables]
>
> Shall I work through this framework now, or would you like to adjust the recommendation?

### Output routing (Stage 3+)

For Stage 3+ framework outputs, route as follows — do **not** create a separate feature-recommendation artefact:

| Stage | Framework output | Destination |
|---|---|---|
| Stage 3 | Opportunities (Opportunity Solution Tree, Opportunity Canvas) | Product brief — `features[]` with status `opportunity` |
| Stage 4 | Validation results (Value Proposition Canvas, Ten-Question Checklist) | Product brief — `features[]` updated with validation confidence |
| Stage 5 | Prioritisation scores (Kano, RICE, Opportunity Algorithm) | Product brief — `features[]` + `roadmap.phases[]`; Story map — MoSCoW priority + t-shirt size per story |

### Kano→MoSCoW mapping (Stage 5)

When story-map MoSCoW prioritisation is driven by Kano analysis, apply the following mapping:

| Kano category | MoSCoW tier | Rationale |
|---|---|---|
| Must-have (basic expectation) | Must Have | Absence causes dissatisfaction — non-negotiable for the MVP |
| Performance feature | Should Have / Could Have | Drives satisfaction incrementally — sequence by RICE rank within this tier |
| Delighter (excitement feature) | Could Have / Won't Have (this release) | Unexpected value — defer unless effort is negligible |

Where RICE Scoring or the Opportunity Algorithm has been applied, use the ranked score to sequence stories within each MoSCoW tier — highest score first. Do not override the Kano must-have classification with RICE rank.

---

## Framework Decision Table

### The numbered ladder

| Stage | Recommended framework(s) | Purpose |
|---|---|---|
| 0 — Blank slate | Lean Canvas | Surface all unknowns and assumptions before any research begins |
| 1 — Problem defined, context thin | SWOT Analysis + PESTLE Analysis | Understand the business environment and surface external constraints and risks |
| 2 — Context established, users unknown | Jobs To Be Done | Define who the users are and what they're trying to achieve |
| 3 — Users understood, solution undefined | Opportunity Solution Tree + Opportunity Canvas (nested) + User Story Mapping | Map opportunities from research findings, deep-dive the chosen one, and map the end-to-end experience |
| 4 — Solution direction exists, not validated | Value Proposition Canvas | Validate that the proposed solution matches user needs |
| 5 — Solution validated, prioritisation needed | Ten-Question Checklist → Kano Model + RICE Scoring + Opportunity Algorithm | Filter weak features first, then prioritise by user value, delivery effort, and quantified opportunity score |

### Cross-cutting frameworks (callable at any stage)

These frameworks are not owned by a single stage — reach for them whenever the corresponding gap appears, regardless of where the project sits on the ladder.

| Framework | Call it whenever… |
|---|---|
| Assumption Mapping | The team is operating on beliefs rather than evidence, or RAID is filling with unvalidated `assumption` entries |
| Competitive Analysis / Benchmarking | Positioning, differentiation, or "does this already exist?" questions arise — useful from problem framing through to solution validation |

### Lifecycle overlay: existing products

Feature Audit is not a stage — it is a conditional overlay. **If the client has an existing product**, prepend Feature Audit *before* Stage 1 framing to assess which current features are working, then proceed down the normal ladder from Stage 1. For greenfield products, skip it entirely.

```
Existing product?  ──yes──▶  Feature Audit  ──▶  Stage 1 ──▶ Stage 2 ──▶ … ──▶ Stage 5
                   ──no───▶                       Stage 0 ──▶ Stage 1 ──▶ … ──▶ Stage 5
```

### Nesting: Opportunity Solution Tree + Opportunity Canvas

At Stage 3 these two work as a pair. The **Opportunity Solution Tree maps the whole landscape** — every opportunity surfaced by research and the candidate solutions for each. The **Opportunity Canvas then deep-dives a single chosen opportunity** from that tree, pressure-testing its user need, proposed solution, business value, and assumptions before design begins. Run the tree first to choose where to focus, then the canvas to go deep.

Multiple frameworks may apply at once — use judgment based on which gaps are most critical to close before the project can move forward.

---

## Framework Library

The full entry for each of the fifteen frameworks — what it does, the questions it answers, the gaps it exposes, and when to apply it — lives in [`references/framework-library.md`](references/framework-library.md).

Read only the entry for the framework the decision table selected. Do not load the file end to end.

---

## Problem Framing: Common Feature Traps

The following are twelve common arguments used to justify adding features that should not be built. When a client or stakeholder uses any of these justifications, flag it explicitly and redirect to validated evidence before proceeding.

| Argument | Why it is dangerous |
|---|---|
| "The data looks good" | Usage data shows a feature is being used, not that it is valuable. A feature can be used out of habit, lack of alternative, or confusion. Usage alone does not validate importance. |
| "It'll only take a few minutes" | Effort underestimation is one of the most common causes of roadmap overcommitment. Even small features carry long-term maintenance cost and user interface complexity. |
| "A big customer is asking for it" | Building to a single customer's request builds a product for one customer. Validate whether the need is representative before treating it as a signal. |
| "We can always remove it later" | Features are very rarely removed. Every feature added is a long-term commitment to maintain, document, and support. |
| "A competitor has it" | Matching competitors feature-for-feature is not a strategy. If they built the wrong thing, copying it builds the wrong thing twice. |
| "It's already on the roadmap" | Being on the roadmap is not evidence of value. Roadmaps are plans built on what was known at the time — they should be revised as new evidence emerges. |
| "It's low-hanging fruit" | Ease of building is not a reason to build. Low-effort features still consume design, test, and maintenance resources and increase product complexity. |
| "The team is excited about it" | Team enthusiasm is a poor proxy for user need. It is a reason to validate — not a reason to build. |
| "It adds to our feature matrix" | Feature matrices do not drive adoption. Users choose products that solve their most important jobs well, not products with the longest feature list. |
| "A customer will churn if we don't" | Churn threats should trigger root cause analysis, not immediate feature delivery. If churn is driven by a structural product gap, a single feature may not resolve it. |
| "We promised it" | Promises made before research was complete should be revisited with new evidence. A promise to build the wrong thing is not a commitment worth honouring. |
| "Everyone wants it" | This is almost never true. Validate the claim: who specifically wants it, and what outcome are they trying to achieve? |

**How to use this reference:**
When reviewing client requirements or a proposed feature backlog, identify whether any of these arguments appear — explicitly or implicitly. Log them in RAID as `assumption` entries requiring validation before proceeding to scoping.

---

## Constraints

- NEVER apply a framework without first identifying the current project stage
- NEVER recommend a Stage 5 framework (Kano, RICE) when the project is still at Stage 0–2 — prioritisation is meaningless without validated user needs
- ALWAYS state which framework is being applied and why before working through it
- ALWAYS surface gaps identified through framework application to the research plan and RAID
- ALWAYS update the project overview with any new information the framework exercise produces
- If multiple frameworks apply, sequence them from foundational to specific — do not apply Kano before JTBD
- The cross-cutting frameworks (Assumption Mapping, Competitive Analysis) are exempt from stage-gating — call them at any stage the relevant gap appears
- For existing products, ALWAYS run the Feature Audit overlay before Stage 1 framing; skip it entirely for greenfield products
- At Stage 3, run the Opportunity Solution Tree before the Opportunity Canvas — map the landscape first, then deep-dive the chosen opportunity
