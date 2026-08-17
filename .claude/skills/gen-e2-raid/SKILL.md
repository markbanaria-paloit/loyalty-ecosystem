---
name: gen-e2-raid
description: 'Create or update Gen-e2 RAID log files (.gen-e2.raid). Use when logging risks, assumptions, issues, dependencies, or hypotheses during product discovery or delivery — or when updating existing RAID entries with new information.'
argument-hint: 'Describe the engagement context (e.g. product name, phase, team) and any known RAID items to capture'
---

# Gen-e2™ RAID Log Skill

## When to Use
- Starting a new engagement and creating the initial RAID log
- Adding new risks, assumptions, issues, dependencies, or hypotheses during discovery or delivery
- Updating existing entries with validated evidence, mitigations, or resolutions
- Converting workshop sticky-note outputs into structured RAID items

## Procedure

### 1. Gather Context
Before creating or updating a RAID log, collect:
- **Engagement name** — the product or project name for the meta.title
- **Owner** — who is responsible for maintaining the RAID log (usually Delivery Lead or Discovery Lead)
- **Existing items** — any risks, assumptions, issues, dependencies, or hypotheses already identified
- **Categories** — the relevant risk categories for this engagement (default set provided in template)

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If capturing items from scratch, ask the team:

**Risks:**
1. What could derail this engagement? (technical, commercial, regulatory, operational)
2. For each risk: how likely is it? What's the impact? What's the mitigation plan?

**Assumptions:**
1. What are we assuming to be true that we haven't yet validated?
2. For each assumption: how confident are we? What would validate or invalidate it?

**Issues:**
1. What is already blocking or slowing the team?
2. For each issue: how severe is it? Who owns the resolution?

**Dependencies:**
1. What external or internal things must happen for us to proceed?
2. For each dependency: who owns it? When is it needed by?

**Hypotheses:**
1. What do we believe about user behaviour that we need to test?
2. For each hypothesis: how will we test it? What does success look like?

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/raid-guide.md](./references/raid-guide.md) for field guidance, enum values, and evidence standards
2. Read [./templates/raid.json](./templates/raid.json) for the canonical JSON schema
3. Create the file at the conventional path, replacing all `{{PLACEHOLDER}}` values:
   ```
   02-define/02-raid.gen-e2.raid
   ```
   If the repo already has a RAID log at a different path, update it in place.
4. Populate with gathered context; use today's date for `dateCreated`, `dateRaised`, and `dateUpdated`
5. Generate ids sequentially: `R001`, `R002` … for risks; `A001` … for assumptions; `I001` … for issues; `D001` … for dependencies; `H001` … for hypotheses

### 4. Update an Existing File
When adding new items to an existing file:
1. Read the current file to understand existing entries and category ids
2. Auto-increment ids — find the highest existing number and add 1
3. Set `dateRaised` and `dateUpdated` to today's date
4. Preserve all existing entries unchanged

## Evidence Tagging

When setting `confidence` on an assumption, use this scale:
| Confidence | Meaning |
|---|---|
| `validated` | Confirmed through testing, data, or stakeholder sign-off |
| `strong-signal` | Strong indirect evidence (walkthrough, analogous data, expert input) |
| `assumption` | Team believes this to be true without direct evidence |
| `hypothesis` | Speculative — needs active testing |

## Cross-Updates
After creating or significantly updating a RAID log, check whether these artefacts need updating:
- `.gen-e2.persona` — if a new assumption about user behaviour was added, check persona pain points or goals
- `.gen-e2.jm` — if a dependency or risk affects a journey stage, note it in the journey map's opportunities or blockers
- `.gen-e2.he` — if an issue relates to UX quality, cross-reference the heuristic evaluation
