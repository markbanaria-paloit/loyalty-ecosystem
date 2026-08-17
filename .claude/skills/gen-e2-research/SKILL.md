---
name: gen-e2-research
description: 'Create or update Gen-e2 research synthesis files (.gen-e2.research). Use when clustering research insights into thematic groups, synthesising usability test findings, tagging observations from interviews or sessions, or recording source references with file links during product discovery.'
argument-hint: 'Describe the research type (usability test, diary study, interview synthesis) and any known themes or participant count'
---

# Gen-e2™ Research Synthesis Skill

## When to Use
- Creating a new research synthesis during the Discover phase
- Clustering raw observations from usability tests, interviews, or diary studies into themes
- Adding new insights from a completed research sprint
- Linking insights back to source transcripts or session notes with file references

## Procedure

### 1. Gather Context
Before creating a synthesis file, collect:
- **Study type**: Moderated usability test, diary study, interview synthesis, survey analysis, contextual inquiry
- **Cycle**: Sprint or quarter the study belongs to (e.g. `FY25 • Sprint 11`)
- **Researcher**: Who ran or synthesised the sessions
- **Participant count**: How many sessions were conducted
- **Source files**: Paths to transcripts, session notes, or recordings available in the workspace

Ask the user for any missing critical information rather than assuming.

### 2. Interview / Synthesis Prompts
If working from raw notes, guide the team through affinity mapping:
1. What behaviour or reaction did you observe most frequently?
2. What surprised you most — positive or negative?
3. Where did participants get stuck or confused?
4. What workarounds or compensating behaviours appeared?
5. What emotional responses (frustration, delight, anxiety) were most visible?
6. What quotes best capture the experience?
7. What would change if each of these insights were addressed?
8. Did any pattern differ noticeably between participant segments (e.g. role, experience level, context)? If so, name both segments and the directional difference — do not flatten it.

Cluster observations into 3-7 thematic groups. Each group needs a title, an optional description, and one or more insights.

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/research-guide.md](./references/research-guide.md) for field guidance and evidence standards
2. Read [./templates/research.json](./templates/research.json) for the canonical JSON schema
3. Create the file populated with the gathered context — replacing all `{{placeholder}}` values

**File path**: Place the file alongside existing research synthesis artefacts, or follow the project's agreed folder structure. If no convention exists yet, a name like `{NN}-{kebab-name}-synthesis.gen-e2.research` in the research folder works well.

### 4. Evidence Tagging in Notes
When summarising insights:
- Quote directly from transcripts where possible — include the `excerpt` field
- Include `note` on each reference to explain why that specific passage supports the insight
- Point `filePath` to the transcript or session note file in the workspace
- Set `range.start.line` and `range.end.line` to the exact line numbers so "Open" jumps to the right place

### 5. Group Structure Guidelines
The six default segments for a new synthesis, in order, are: **Pain Points**, **Unmet Needs**, **Engagement Drivers**, **Behaviours**, **Desired Features**, **Context**. Use the template at [./templates/research.json](./templates/research.json) to start with all six pre-seeded. These are defaults — add, rename, or remove groups when the research question warrants it.

See [./references/research-guide.md](./references/research-guide.md) for the full group-naming conventions, insight quality criteria, and reference linking standards.

### 6. Cross-Updates
After creating/updating a synthesis:
- Check if journey maps need new stages or updated pain-point items
- Add validated insights as `validated` assumptions in RAID
- Flag any new risks or blockers discovered during the study
- Update the product brief Vision or Problem Signals if the data changes framing

## Reference
See [./references/research-guide.md](./references/research-guide.md) for the field guide and exemplar document.
