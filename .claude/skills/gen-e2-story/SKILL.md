---
name: gen-e2-story
description: 'Create or update Gen-e2 user story files (.gen-e2.story.md). Use when writing new user stories, updating acceptance criteria, managing task lists, adding technical or design notes, or repairing malformed story files during product discovery or delivery.'
argument-hint: 'Describe the feature or capability (e.g. "user registration flow") and any known role, goal, or acceptance criteria to capture'
---

# Gen-e2™ User Story Skill

## When to Use
- Writing a new user story for a feature identified during Define phase
- Updating acceptance criteria after a refinement session
- Adding or completing tasks on an existing story
- Capturing technical notes, design notes, or dependency information
- Repairing a malformed `.gen-e2.story.md` file (broken frontmatter, missing sections)

## Procedure

### 1. Gather Context
Before creating or updating a user story, collect:
- **Feature / capability** — what the story is about
- **Role** — the user type performing the action (e.g. "health fund member", "GP", "administrator")
- **Goal** — what the user wants to do
- **Benefit / value** — why they want to do it (the "So that" clause)
- **Priority** — `critical` · `high` · `medium` · `low`
- **Status** — `draft` · `ready` · `in-progress` · `review` · `done` · `blocked`
- **Epic** — the parent epic or activity this story belongs to
- **Story points** — optional; positive integer using the team's chosen scale

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If working from a feature idea rather than a completed brief, ask:

1. Who is the primary user performing this action?
2. What specific outcome do they want to achieve?
3. What value does achieving that outcome deliver — to the user and the business?
4. What are the minimum conditions that must be true for this story to be "done"?
5. Are there edge cases, error states, or accessibility requirements to cover?
6. What backend services, APIs, or infrastructure does this depend on?
7. Are there design or UX constraints (existing patterns, accessibility standards)?
8. Is there a technical approach already agreed, or does this need a spike?

### 3. Create the File

The file format is **YAML frontmatter + Markdown body**. Use the local template and field guide as the authoritative references:
1. Read [./references/story-guide.md](./references/story-guide.md) for field guidance, enum values, and acceptance criteria standards
2. Read [./templates/story.gen-e2.story.md](./templates/story.gen-e2.story.md) for the canonical file template
3. Create the file at the path below, replacing all `{{PLACEHOLDER}}` values:

**File path convention:**
```
01-discover/06-concepts/{NN}-{kebab-title}.gen-e2.story.md
```
Or in Define phase:
```
02-define/{NN}-{kebab-title}.gen-e2.story.md
```

**Rules:**
- The `##` headings must match exactly — the parser matches by heading text
- Bold markers (`**`) in the User Story section are required — the parser extracts values between them
- The Tasks table must use `[ ]` or `[x]` in the Status column
- Dates must be `YYYY-MM-DD`
- `id` should be unique within the project (e.g. `US-001`, `US-042`)

### 4. Update an Existing File

When updating:
1. Read the current file to understand existing content
2. Update only the fields or sections requested — preserve all other content
3. Increment `updatedAt` to today's date
4. If adding tasks, append rows to the existing table
5. If updating acceptance criteria, preserve existing criteria unless explicitly replacing them

### 5. Validation Rules

After creating or updating, verify:

| Code | Severity | Condition to check |
|------|----------|--------------------|
| `INVALID_FORMAT` | Error | File starts with `---` and YAML is well-formed |
| `MISSING_TITLE` | Error | `title` is present and non-empty |
| `MISSING_ID` | Warning | `id` is present |
| `INVALID_PRIORITY` | Warning | `priority` is one of: `critical`, `high`, `medium`, `low` |
| `INVALID_STATUS` | Warning | `status` is one of: `draft`, `ready`, `in-progress`, `review`, `done`, `blocked` |
| `INVALID_POINTS` | Warning | `points` is a positive integer or `null` |
| `MISSING_AS_A` | Warning | `## User Story` contains `As a **…**` |
| `MISSING_I_WANT` | Warning | `## User Story` contains `I want to **…**` |
| `MISSING_SO_THAT` | Warning | `## User Story` contains `So that **…**` |

### 6. Cross-Updates

After creating or updating a user story:
- **Story map** — confirm the story is listed under the correct activity and epic; update sizing if points changed
- **RAID** — log any new technical risks, dependencies, or assumptions surfaced during refinement
- **Architecture** — flag any new services, APIs, or data flows implied by the story
- **Product brief** — if the story reveals a scope change, update the Is/Is-Not boundary
