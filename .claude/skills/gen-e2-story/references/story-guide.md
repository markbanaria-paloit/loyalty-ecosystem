# Gen-e2™ User Story — Field Guide

## Purpose

User Story files are the atomic unit of delivery scope. Each file represents a single user-facing capability, written in the standard Agile format, with structured acceptance criteria, a task checklist, and notes for technical, design, and dependency context.

Unlike other Gen-e2 artefacts, user stories use **Markdown + YAML frontmatter** — not pure JSON. The YAML block holds structured metadata; the Markdown body holds narrative content parsed by heading text.

---

## Frontmatter Fields

| Field | Type | Required | Valid Values | Notes |
|-------|------|----------|-------------|-------|
| `id` | string | Recommended | `US-001`, `US-042` … | Unique within the project; increment sequentially |
| `title` | string | **Error if missing** | Non-empty string | Displayed as the story card heading |
| `priority` | string | Recommended | `critical` · `high` · `medium` · `low` | Drives sprint planning order |
| `status` | string | Recommended | `draft` · `ready` · `in-progress` · `review` · `done` · `blocked` | Updated each sprint |
| `points` | number | Optional | Positive integer | Use team's agreed scale (Fibonacci, T-shirt, etc.) |
| `assignee` | string | Optional | Name string | Leave empty if unassigned |
| `tags` | string[] | Optional | Free-form | Use for epic, component, or domain tags |
| `epic` | string | Optional | Epic or activity name | Links story to parent epic in story map |
| `createdAt` | string | Optional | `YYYY-MM-DD` | Set on creation; do not change |
| `updatedAt` | string | Optional | `YYYY-MM-DD` | Update every time the file changes |
| `dueDate` | string | Optional | `YYYY-MM-DD` | Sprint or milestone target date |

---

## Markdown Body Sections

All sections use `##` headings. The parser matches by **exact heading text** — do not rename or reorder headings.

### `## User Story` (required)

The three-line narrative. Each line must match the pattern below — `**` bold markers are required as the parser extracts values between them:

```
As a **{role}**
I want to **{goal}**
So that **{benefit}**
```

**Guidance:**
- `role` — a user type, not a persona name: "health fund member", "GP", "administrator"
- `goal` — a verb phrase describing the desired action or capability
- `benefit` — the value delivered; answers "why does this matter?"
- Avoid "I want to see a button" — describe the outcome, not the UI mechanism

### `## Acceptance Criteria`

A numbered list of testable conditions that define "done". Rendered and edited as rich text in the editor.

**Guidance:**
- Each criterion should be independently verifiable by QA
- Cover the happy path, edge cases, and error states
- Include accessibility requirements where relevant
- Avoid implementation details — test outcomes, not mechanisms
- Minimum 2 criteria; aim for 3–6

**Example:**
```markdown
1. Member can upload a blood test PDF from any iOS or Android device
2. Upload fails gracefully with a user-visible error if the file exceeds 10 MB
3. Uploaded results appear in the member's health timeline within 30 seconds
4. Screen reader announces upload success or failure after the action completes
```

### `## Tasks`

A Markdown table that breaks the story into implementation sub-tasks. The editor serialises tasks back to this format on save.

| Column | Notes |
|--------|-------|
| `Status` | `[ ]` incomplete · `[x]` complete |
| `Title` | Short task name (imperative verb phrase) |
| `Description` | Optional detail; can be empty |

**Guidance:**
- Break work down to items completable in < 1 day
- One row per task; order by implementation sequence
- Mark done tasks as `[x]` — the editor renders them with strikethrough

### `## Technical Notes`

Free-form Markdown. Rendered in the Notes panel "Technical Notes" tab.

**What to capture:**
- Agreed implementation approach or architectural decisions
- API contracts, service dependencies, data models
- Performance constraints or non-functional requirements
- Security considerations (auth, data residency, PII handling)
- Links to ADRs or spike outputs

### `## Design Notes`

Free-form Markdown. Rendered in the Notes panel "Design Notes" tab.

**What to capture:**
- Component or pattern references from the design system
- Interaction behaviour (transitions, states, empty states)
- Responsive breakpoint behaviour
- Figma frame URLs or asset references
- Accessibility requirements (WCAG level, contrast, focus order)

### `## Dependencies`

Free-form Markdown. Rendered in the Notes panel "Dependencies" tab.

**What to capture:**
- Backend APIs or microservices required
- Third-party integrations (auth providers, payment gateways, analytics)
- Infrastructure prerequisites (feature flags, environment config)
- Stories that must be completed before this one can begin
- Cross-team dependencies with owner and target date

---

## Priority Guidance

| Priority | Meaning |
|----------|---------|
| `critical` | Blocking — the product cannot ship without this |
| `high` | Core MVP scope — significant user or business impact |
| `medium` | Important but not blocking for initial release |
| `low` | Nice-to-have; can be deferred to a later sprint |

## Status Lifecycle

```
draft → ready → in-progress → review → done
                     ↓
                  blocked
```

| Status | Meaning |
|--------|---------|
| `draft` | Story written but not yet refined with the team |
| `ready` | Refined, estimated, and ready to pull into a sprint |
| `in-progress` | Being actively developed |
| `review` | In PR review or QA; awaiting sign-off |
| `done` | All acceptance criteria met and signed off |
| `blocked` | Cannot proceed — dependency or impediment unresolved |

---

## Exemplar

A well-formed user story has:
- A unique `id` and a clear, action-oriented `title`
- `priority` and `status` set to real values
- Story points estimated after team refinement
- At least 3 acceptance criteria covering happy path + edge case
- At least 2 tasks breaking down the implementation
- Technical notes referencing the agreed approach
- Dependencies listing all blocking services or stories

Look for existing `.gen-e2.story.md` files in the project's `02-define/` or `01-discover/06-concepts/` folders to use as a reference.
