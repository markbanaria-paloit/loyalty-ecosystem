---
name: gen-e2-journey
description: 'Create or update Gen-e2 journey map files (.gen-e2.jm). Use when mapping user journeys, customer experience stages, emotional arcs, needs, actions, and opportunities during product discovery.'
argument-hint: 'Describe the persona and the journey scenario (e.g. "software adoption journey for Alex Chen, a tech-savvy professional")'
---

# Gen-e2™ Journey Map Skill

## When to Use
- Creating a new journey map during the Discover phase
- Mapping an existing user flow to surface emotional highs and lows
- Adding new stages, rows, or opportunities after research synthesis
- Updating emotions or pain points based on user testing feedback
- Aligning multi-persona journeys when multiple archetypes share a flow

## Procedure

### 1. Gather Context
Before creating a journey map, confirm:
- **Persona**: Which persona does this journey represent? (Link to `.gen-e2.persona` file)
- **Scenario**: What high-level scenario or goal is the persona trying to achieve?
- **Stages**: What phases does the journey pass through? (e.g. Awareness → Research → Purchase → Onboarding)
- **Rows**: What data rows are relevant? (Actions, Needs & Pains, Touchpoints, Opportunities — at minimum Actions and one observation row)
- **Emotions**: Do we have qualitative data on emotional highs and lows at each stage?

Ask the user for any missing critical information rather than assuming.

### 2. Create the File
Use the local template and field guide as authoritative references:
1. Read [./references/journey-guide.md](./references/journey-guide.md) for field guidance, row conventions, and evidence standards
2. Read [./templates/journey.json](./templates/journey.json) for the canonical JSON schema
3. Create the file populated with gathered context — replacing all `{{placeholder}}` values

**File path**: Place the file alongside existing journey map artefacts, or follow the project's agreed folder structure. If no convention exists yet, a name like `{NN}-{kebab-name}.gen-e2.jm` in a journeys folder works well.

### 3. Evidence Tagging
- Each row item and emotion should reflect its evidence confidence:
  - From direct user interviews → `validated` or `strong-signal`
  - From workshop assumptions → `assumption` — log in RAID
  - From initial hypothesis → `hypothesis` — plan a validation test

### 4. Emotion Arc
- `emotionScore` is an integer 1–10 (1 = very negative, 10 = very positive)
- Each stage should have an emotion entry if emotional data is available
- Gaps are allowed — the curve only connects stages that have scores
- Aim to capture the emotional arc accurately; inflection points (where emotion shifts significantly) are the most valuable design insights

### 5. Cross-Updates
After creating or updating a journey map:
- Check if a service blueprint needs updating (new touchpoints → new blueprint lanes?)
- Check if user flows cover major decision points surfaced in the journey
- Log new pain points as risks or hypotheses in RAID
- Update the product brief if new problem signals emerge

## Reference
See [./references/journey-guide.md](./references/journey-guide.md) for the journey field guide.
