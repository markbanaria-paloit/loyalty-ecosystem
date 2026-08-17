---
name: gen-e2-knowledge-base
description: 'Manage Gen-e2 living knowledge base documents: the product brief and research-plan.md. Use when creating or updating the product brief, updating the research plan, moving activities between planned/in-progress/completed, resolving open questions, or onboarding to an existing discovery. Triggers on: update knowledge base, update research plan, update product brief, open question resolved, research activity completed.'
argument-hint: 'Specify which document to create or update: product-brief or research-plan'
user-invocable: false
---

# Gen-e2® Knowledge Base Skill

## When to Use
- Creating or updating the product brief (`<engagement-slug>.gen-e2.brief`) when new information is ingested
- Creating the research plan (`02-research-plan.md` in the project's research folder) on first run
- Updating the research plan when activities start, progress, or complete
- Moving an open question from "What We Don't Know" to "What We Know"
- Resolving a knowledge gap by linking it to a completed research activity

## Documents Managed

**All documents must be written relative to the project's discovery workspace root** (wherever the project has established its artefact folders).

| Document | Path | Creation rule |
|---|---|---|
| Product brief | `<engagement-slug>.gen-e2.brief` | Use the `gen-e2-brief` skill — create on first run, update incrementally thereafter |
| Research plan | `{research-folder}/02-research-plan.md` | Create on first agent run; update — never replace — thereafter |

---

## Document 1: Product Brief

The product brief is a Gen-e2 JSON artefact — use the **`gen-e2-brief` skill** to create or update it. Do not author it as a markdown file.

The brief is the living document that captures problem signals, vision, features, roadmap, design principles, regulatory considerations, and success metrics. It is initialised at project start and updated incrementally after every significant workshop or research session.

See the `gen-e2-brief` skill for schema guidance, field rules, and update procedures.

---

## Document 2: Research Plan

### Required Structure

```markdown
# [Project Name] — Research Plan
Last updated: [date]

## Current Unknowns
[A short summary of the knowledge gaps driving the current round of research. Rewrite this section each run to reflect the current state — not the original state.]

---

## Research Activities

### ✅ Completed
[Activities fully executed and synthesised.]

- [x] **[Activity name]** — [Method] | Completed [date]
  → Finding: [one-line summary of outcome or key insight]
  → Artefact: [link to output if generated]

### 🔄 In Progress
[Activities currently being executed.]

- [ ] **[Activity name]** — [Method] | Started [date] | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: [which unknown this addresses]

### 📋 Planned
[Activities not yet started, prioritised by risk and impact.]

- [ ] **[Activity name]** — [Method] | Priority: [High / Medium / Low]
  → Targeting gap: [which unknown this addresses]
  → Recommended artefact: [Gen-e2 artefact type if applicable]
  → Trigger: [what needs to happen before this activity starts, if anything]
```

### Update Rules

- When a new gap is identified: add a new item to *Planned* — never delete an existing item
- When an activity moves state: move it to the appropriate section and add the outcome note
  - Planned → In Progress: add start date and owner placeholder
  - In Progress → Completed: add completion date and one-line finding
- When a completed activity surfaces a new unknown: immediately add a new *Planned* item referencing it — *"Surfaced by: [completed activity name]"*
- **Current Unknowns** at the top: rewrite each run to reflect current open state, not original state

---

## Procedure: Creating on First Run

1. **Load `gen-e2-folder-structure`** — determine the workspace root and subfolder layout before writing any file. If a `## Gen-e2 Folder Structure` rule already exists in the project's agent/instructions file, read it and use it. If not, the skill will guide the propose-and-persist flow.
2. Use the `gen-e2-brief` skill to create `<engagement-slug>.gen-e2.brief` at the location defined by the folder structure rule
3. Determine where the project's research folder is — check whether a research folder already exists in the workspace. If not, create it alongside the first file
4. Create `02-research-plan.md` in the research folder using the structure above
5. Populate all sections with content available at time of creation
6. Leave owner fields as `[HUMAN TO ASSIGN]`
7. Mark any unvalidated claims as provisional

## Procedure: Updating on Subsequent Runs

1. Read the existing document in full before making any changes
2. Identify which sections are affected by new information
3. Apply targeted updates — do not rewrite unaffected sections
4. Refresh `Last updated` date
5. For research plan: rewrite `Current Unknowns` to reflect current state

## Constraints

- NEVER recreate or overwrite documents from scratch on subsequent runs
- NEVER delete an existing entry — corrections and resolutions are additive
- NEVER leave an owner field assigned to an AI agent — always `[HUMAN TO ASSIGN]`
- ALWAYS preserve the history of what was previously documented
