---
name: gen-e2-storymap
description: 'Create or update Gen-e2 story map files (.gen-e2.storymap). Use when mapping user story maps, defining MVP scope, MoSCoW prioritisation, t-shirt sizing stories, mapping activities to epics and user stories, or building a product backlog during product discovery.'
argument-hint: 'Describe the product or feature being mapped and any known activities, epics, or stories to capture'
---

# Gen-e2™ Story Map Skill

## When to Use
- Creating a story map for a new product or feature area after personas and journey maps are in place
- Adding new activities, epics, or stories after scope changes
- Applying MoSCoW prioritisation and t-shirt sizing to an existing backlog
- Defining the MVP release boundary using swim lanes
- Updating the story map after discovery workshops or backlog refinement sessions

## Prerequisites
- At least one persona defined (so activities reflect real user goals)
- At least one journey map in place (journey stages map directly to activities)
- Product brief with initial feature candidates

## Procedure

### 1. Gather Context
Before creating or updating a story map, collect:
- **Product name** — used in `meta.title`
- **Owner** — who is responsible for maintaining the story map (usually Product Lead or Discovery Lead)
- **Activities** — the top-level user activities (the "backbone" of the map, e.g. "Patient Registration", "Claim Submission")
- **Epics** — feature groups within each activity
- **Stories** — specific user stories within each epic
- **Release lanes** — the swim-lane release bands (e.g. MVP, Fast Follow, Future Backlog) — optional; omit for lane-free maps

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If mapping from scratch, ask the team:

**Activities (backbone):**
1. What are the main things users do in this product, in rough sequential order?
2. For each activity: what colour should it have in the editor? (or auto-assign from palette)

**Epics:**
1. For each activity, what are the major feature areas or themes within it?

**Stories:**
1. Under each epic, what specific user stories or capabilities are needed?
2. For each story: what is the priority? (`must` / `should` / `could`)
3. For each story: what is the t-shirt size? (`s` / `m` / `l` / `xl`)
4. For each story: which release lane does it belong to? (only if lanes are defined)

**Release lanes:**
1. How many release bands do you want? What are they called? (e.g. MVP, Phase 2, Backlog)
2. For each lane: should it have a highlight colour?

### 3. Create the File
Use the local template and field guide as authoritative references:
1. Read [./references/storymap-guide.md](./references/storymap-guide.md) for field guidance, enum values, and sizing conventions
2. Read [./templates/storymap.json](./templates/storymap.json) for the canonical JSON schema
3. Place the file alongside existing story map artefacts, or follow the project's agreed folder structure. If no convention exists yet, use a name like `{NN}-story-map.gen-e2.storymap` (e.g. `01-story-map.gen-e2.storymap`) in a suitable folder. If the repo already has a story map, update it in place.
4. Populate with gathered context; use today's date for `meta.date`
5. Assign story `id` values sequentially starting at 1, unique across the entire document
6. Auto-assign activity colours from the default palette if not specified:
   `#4F46E5`, `#10B981`, `#7C3AED`, `#F59E0B`, `#EF4444`, `#06B6D4`

### 4. Update an Existing File
1. Read the existing `.gen-e2.storymap` file
2. Read [./references/storymap-guide.md](./references/storymap-guide.md) to confirm field semantics
3. Make targeted edits — add/remove/update activities, epics, or stories as needed
4. Keep existing `id` values stable for already-existing stories; append new ids sequentially
5. Update `meta.version` (bump patch: `v1.0` → `v1.1`) and `meta.date` to today

### 5. Validate
After creating or updating:
- Every `stories[].lane` value must match an `id` in the `lanes` array (if lanes are defined)
- Story `id` values must be unique integers across the entire document
- Every story must have `priority` in `['must', 'should', 'could']`
- Every story must have `size` in `['s', 'm', 'l', 'xl']`
- Every activity must have at least one epic (warn if none, but do not block)
- `meta.title`, `meta.owner`, `meta.date`, and `meta.version` must all be non-empty

### 6. Evidence & Priority Guidance

| Priority | MoSCoW | Meaning |
|----------|--------|---------|
| `must` | Must Have | Without this the MVP fails — core value proposition |
| `should` | Should Have | High value, deliver if capacity permits in release window |
| `could` | Could Have | Nice to have; only if ahead of schedule |

| Size | Effort | Notes |
|------|--------|-------|
| `s` | ~2 days | Simple, well-understood, single concern |
| `m` | ~5 days | Moderate complexity; may need design + dev |
| `l` | ~10 days | Complex; multiple components or integration work |
| `xl` | ~15+ days | High complexity or unknowns; needs a spike before sprint |

### 7. Cross-Document Updates
When the story map changes, check these dependent artefacts:
- **Sizing estimate** (`.gen-e2.sizing`) — story count and scope directly affect ROM estimates; update if MVP scope changes
- **Architecture** (`.gen-e2.arch`) — new services or technical capabilities implied by stories should be reflected
- **RAID log** (`.gen-e2.raid`) — new must-have stories may surface risks or assumptions to log
- **Product Brief** (`.gen-e2.brief`) — MVP scope and roadmap sections should remain consistent
