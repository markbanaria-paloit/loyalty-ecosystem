---
name: gen-e2-brief
description: 'Create or update Gen-e2 Product Brief files (.gen-e2.brief). Use when defining product vision, problem signals, MVP features, roadmap, IS/IS NOT boundary, design principles, regulatory considerations, or success metrics during product discovery.'
argument-hint: 'Describe the product context (e.g. product name, target users, problem domain, phase) and any known signals or decisions to capture'
---

# Gen-e2™ Product Brief Skill

## When to Use
- Initialising the Product Brief at the start of a discovery engagement
- Updating the vision statement or boundary rule after stakeholder alignment
- Adding problem signals from research synthesis or user interviews
- Defining or revising the feature list and roadmap phases
- Recording IS/IS NOT boundary decisions after Define workshops
- Adding or updating design principles, regulatory items, or success metrics

## Procedure

### 1. Gather Context
Before creating or updating a Product Brief, collect:
- **Product name** — for `meta.title`
- **Owner** — who is accountable for this brief (usually Product Lead or Discovery Lead)
- **Vision statement** — one concise sentence describing the desired future state
- **Boundary rule** — what this product is explicitly NOT
- **Target market** — addressable market size and target segments
- **Problem signals** — 3–5 validated or hypothesised problems driving the product
- **Feature set** — named features with IDs, descriptions, and which phase they belong to
- **Roadmap** — named phases with timelines, goals, pricing tier, and which feature IDs are included
- **Design principles** — 3–5 guiding product design values
- **Regulatory obligations** — any compliance bodies or requirements (GDPR, SOC 2, HIPAA, etc.)
- **Success metrics** — measurable KPIs with targets and timeframes

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If capturing content from scratch, ask the team:

**Vision & Boundary:**
1. In one sentence, what is the desired future state this product creates?
2. What is one thing this product must never become?

**Problem Signals:**
1. What are the top 3–5 problems or friction points your users face today?
2. For each: how confident are we in this signal? What's the source?

**Features:**
1. What capabilities will the product provide?
2. For each: which problem signal does it address? Which phase does it land in?

**Roadmap:**
1. How many phases are planned? What is the goal and timeline for each?
2. What is the pricing model or tier for each phase?

**IS / IS NOT:**
1. List 3–5 things this product clearly IS (to align the team)
2. List 3–5 things this product clearly IS NOT (to prevent scope creep)

**Design Principles:**
1. What non-negotiable user experience values must guide every design decision?

**Regulatory:**
1. Are there any compliance bodies or regulations that apply?
2. For each: in-scope, out-of-scope, or tbd?

**Success Metrics:**
1. How will you know this product succeeded? List 3–5 measurable outcomes.
2. For each: what is the target value and by when?

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/brief-guide.md](./references/brief-guide.md) for field guidance and enum values
2. Read [./templates/brief.json](./templates/brief.json) for the canonical JSON schema
3. Create the file at the conventional path, replacing all `{{PLACEHOLDER}}` values:
   ```
   <engagement-slug>.gen-e2.brief
   ```
   By convention, the product brief lives at the root of the discovery workspace — it is a living document updated throughout all phases. If the repo already has a brief at a different path, update it in place.
4. Use today's date for `meta.date`
5. Generate feature IDs sequentially: `f1`, `f2`, `f3` …
6. Generate problem signal IDs sequentially: `s1`, `s2`, `s3` …
7. Generate success metric IDs sequentially: `m1`, `m2`, `m3` …
8. Ensure every `features[].evidenceLink` references an existing `problemSignals[].id`
9. Ensure every entry in `roadmap.phases[].features[]` references an existing `features[].id`

### 4. Update an Existing File
When adding new content to an existing brief:
1. Read the current file to understand existing IDs and phases
2. Auto-increment IDs — find the highest existing number and add 1
3. Cross-check `evidenceLink` and `roadmap.phases[].features[]` references remain valid after changes
4. Update `meta.version` (increment minor: `v1.0` → `v1.1`)

## Evidence Tagging

When setting `confidence` on a problem signal, use this scale:
| Confidence | Meaning |
|---|---|
| `validated` | Confirmed through user research, data analysis, or stakeholder sign-off |
| `strong-signal` | Strong indirect evidence (walkthrough, analogous data, SME input) |
| `assumption` | Team believes this to be true without direct evidence |
| `hypothesis` | Speculative — needs active testing or research |

## Cross-Updates
After creating or significantly updating a Product Brief, check whether these artefacts need updating:
- `.gen-e2.raid` — log new assumptions as RAID items; flag regulatory items as risk or dependency entries
- `.gen-e2.storymap` — new features should appear as epics or stories in the story map
- `.gen-e2.arch` — new services or integrations implied by features should be reflected in the architecture
- `.gen-e2.sizing` — feature count changes affect the sizing estimate
