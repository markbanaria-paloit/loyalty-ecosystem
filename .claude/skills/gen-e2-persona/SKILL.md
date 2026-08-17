---
name: gen-e2-persona
description: 'Create or update Gen-e2 persona files (.gen-e2.persona). Use when building user personas, stakeholder profiles, or updating persona pain points, goals, and behaviours during product discovery.'
argument-hint: 'Describe the persona type (primary user, secondary user, stakeholder) and any known attributes'
---

# Gen-e2™ Persona Skill

## When to Use
- Creating a new persona during the Discover phase
- Updating an existing persona with new research insights
- Adding a stakeholder persona (e.g., GP, admin, partner)

## Procedure

### 1. Gather Context
Before creating a persona, collect:
- **Type**: Primary user, secondary user, or stakeholder
- **Research source**: Interview data, survey results, market research, or assumption
- **Domain**: What product/service is this persona for?

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If working from scratch, ask the team these questions:
1. Who is this person? (age, role, location, tech comfort)
2. What triggers them to seek this product/service?
3. What are their top 3-5 goals?
4. What frustrates them most about current solutions?
5. What does their typical day/workflow look like?
6. What tools/services do they currently use?
7. What would they quote about their experience?
8. What personality traits and values define their approach?

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/persona-guide.md](./references/persona-guide.md) for field guidance, section rules, and evidence standards
2. Read [./templates/persona.json](./templates/persona.json) for the canonical JSON schema
3. Create the file at the path below, populated with the gathered context — replacing all `{{placeholder}}` values

**File path**: `01-discover/02-personas/{NN}-{kebab-name}.gen-e2.persona`

### 4. Evidence Tagging
- Tag each section item with confidence where relevant (include % from research if available)
- Items from direct interviews → `validated` or `strong-signal`
- Items from team assumptions → `assumption` — log in RAID
- Items from single data points → `hypothesis`

### 5. Avatar
The `avatar` field is **optional and should be omitted by default**. The editor generates a deterministic avatar automatically.

Only add it when the team provides an explicit portrait image:
```json
"avatar": "./images/persona-name.png"
```
Path must be relative to the `.gen-e2.persona` file. The field can also be set interactively inside the editor (click the portrait → file picker).

### 6. Cross-Updates
After creating/updating a persona:
- Check if journey maps need updating (new pain point → new journey stage?)
- Check if product brief persona references are current
- Log any new assumptions in RAID

## Reference
See [./references/persona-guide.md](./references/persona-guide.md) for the persona field guide and exemplar.
