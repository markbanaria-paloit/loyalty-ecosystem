# Gen-e2™ RAID Log — Field Guide

## Purpose

The RAID Log is the single source of truth for engagement-level risks, assumptions, issues, dependencies, and hypotheses. It is created on day 1 and maintained throughout discovery and delivery. It feeds into stakeholder reporting, prioritisation decisions, and hypothesis test planning.

---

## `meta` object

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✓ | Format: `{Product Name} — RAID Log` |
| `owner` | string | ✓ | Usually Delivery Lead or Discovery Lead |
| `dateCreated` | string | ✓ | ISO 8601: `YYYY-MM-DD` |
| `version` | string | ✓ | Semantic: `v1.0`, `v1.1` |

---

## `categories` array

User-defined category palette. Cards are grouped and colour-tinted by category in the editor.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✓ | Kebab-case, unique across categories |
| `label` | string | ✓ | Human-readable name |
| `colour` | string | ✓ | Hex colour (light pastel recommended for readability) |

**Default categories** (adjust to engagement context):
- `clinical-regulatory` — regulatory, compliance, clinical validation
- `data-technical` — integration, data quality, infrastructure
- `user-market` — user research, behaviour, market assumptions
- `commercial` — pricing, contracts, partnerships
- `operational` — team capacity, process, environment

---

## `risks` array

Items that could negatively impact the engagement if they occur.

| Field | Type | Enum values | Required |
|---|---|---|---|
| `id` | string | `R001`, `R002` … | ✓ |
| `category` | string | Must match a `categories[].id` | ✓ |
| `description` | string | — | ✓ |
| `impact` | string | `high` \| `medium` \| `low` | ✓ |
| `likelihood` | string | `high` \| `medium` \| `low` | ✓ |
| `mitigation` | string | — | ✓ (can be empty) |
| `owner` | string | — | ✓ (can be empty) |
| `status` | string | `open` \| `mitigated` \| `closed` \| `accepted` | ✓ |
| `dateRaised` | string | ISO 8601 | ✓ |
| `dateUpdated` | string | ISO 8601 | ✓ |
| `tags` | string[] | Free-form | ✓ (can be empty) |

**Guidance:**
- Set `impact` and `likelihood` independently — a low-likelihood, high-impact risk is still worth tracking
- Move to `mitigated` when the mitigation plan is in place; `closed` when the risk window has passed; `accepted` when the team consciously accepts the risk without mitigation

---

## `assumptions` array

Things the team believes to be true but has not yet validated.

| Field | Type | Enum values | Required |
|---|---|---|---|
| `id` | string | `A001`, `A002` … | ✓ |
| `category` | string | Must match a `categories[].id` | ✓ |
| `description` | string | — | ✓ |
| `confidence` | string | `validated` \| `strong-signal` \| `assumption` \| `hypothesis` | ✓ |
| `impact` | string | `high` \| `medium` \| `low` | ✓ |
| `status` | string | `validated` \| `invalidated` \| `pending` \| `in-progress` | ✓ |
| `validationPlan` | string | — | ✓ (can be empty) |
| `evidence` | string | — | ✓ (can be empty) |
| `alternatives` | AlternativeItem[] | — | ✓ (can be empty) |
| `dateRaised` | string | ISO 8601 | ✓ |
| `dateUpdated` | string | ISO 8601 | ✓ |
| `tags` | string[] | Free-form | ✓ (can be empty) |

**`alternatives[]` sub-items:**

| Field | Type | Required |
|---|---|---|
| `description` | string | ✓ |
| `pros` | string | ✓ (can be empty) |
| `cons` | string | ✓ (can be empty) |

**Confidence scale:**
| Value | Meaning |
|---|---|
| `validated` | Confirmed through testing, data, or stakeholder sign-off |
| `strong-signal` | Strong indirect evidence (walkthrough, analogous data, expert input) |
| `assumption` | Team believes this to be true without direct evidence |
| `hypothesis` | Speculative — needs active testing |

---

## `issues` array

Problems that are already occurring and need resolution.

| Field | Type | Enum values | Required |
|---|---|---|---|
| `id` | string | `I001`, `I002` … | ✓ |
| `category` | string | Must match a `categories[].id` | ✓ |
| `description` | string | — | ✓ |
| `impact` | string | `high` \| `medium` \| `low` | ✓ |
| `severity` | string | `blocker` \| `major` \| `minor` | ✓ |
| `resolution` | string | — | ✓ (can be empty) |
| `owner` | string | — | ✓ (can be empty) |
| `status` | string | `open` \| `in-progress` \| `resolved` \| `closed` | ✓ |
| `dateRaised` | string | ISO 8601 | ✓ |
| `dateUpdated` | string | ISO 8601 | ✓ |
| `tags` | string[] | Free-form | ✓ (can be empty) |

**Severity guide:**
- `blocker` — stops the team from progressing on a critical path item
- `major` — significant impact but a workaround exists
- `minor` — low impact, can be deferred

---

## `dependencies` array

External or internal things that must happen for the engagement to proceed.

| Field | Type | Enum values | Required |
|---|---|---|---|
| `id` | string | `D001`, `D002` … | ✓ |
| `category` | string | Must match a `categories[].id` | ✓ |
| `description` | string | — | ✓ |
| `type` | string | `external` \| `internal` | ✓ |
| `owner` | string | — | ✓ (can be empty) |
| `targetDate` | string | ISO 8601 | ✓ (can be empty) |
| `status` | string | `pending` \| `in-progress` \| `resolved` \| `blocked` | ✓ |
| `dateRaised` | string | ISO 8601 | ✓ |
| `dateUpdated` | string | ISO 8601 | ✓ |
| `tags` | string[] | Free-form | ✓ (can be empty) |

**Type guide:**
- `external` — dependency on a third party, supplier, or government body
- `internal` — dependency on another team or capability within the organisation

---

## `hypotheses` array

Structured belief statements to be tested, following the Lean UX format.

| Field | Type | Enum values | Required |
|---|---|---|---|
| `id` | string | `H001`, `H002` … | ✓ |
| `statement` | string | Lean UX template | ✓ |
| `successCriteria` | string | — | ✓ (can be empty) |
| `testMethod` | string | `prototype-test` \| `user-interview` \| `analytics` \| `survey` \| `other` | ✓ |
| `status` | string | `untested` \| `in-progress` \| `validated` \| `invalidated` | ✓ |
| `impact` | string | `high` \| `medium` \| `low` | ✓ |
| `conceptRef` | string | Workspace-relative path | ✓ (can be empty) |
| `learnings` | string | Markdown supported | ✓ (can be empty) |
| `linkedEvidence` | string[] | Workspace-relative paths | ✓ (can be empty) |
| `dateCreated` | string | ISO 8601 | ✓ |
| `dateTested` | string | ISO 8601 | ✓ (can be empty) |

**Statement template:**
```
We believe that [persona] will [behaviour] because [evidence/rationale].
```

**Test method guide:**
- `prototype-test` — test with a clickable prototype or mockup
- `user-interview` — qualitative 1:1 session with a user
- `analytics` — quantitative data from a live product or similar
- `survey` — structured questionnaire with a target sample
- `other` — any other method (describe in `learnings`)

---

## ID Format Rules

All item ids must follow the pattern `[RAIDH]\d{3,}`:
- Risks: `R001`, `R002`, `R010`, `R100`
- Assumptions: `A001`, `A002` …
- Issues: `I001`, `I002` …
- Dependencies: `D001`, `D002` …
- Hypotheses: `H001`, `H002` …

Always auto-increment — never reuse or reassign an id within a file.

---

## File Placement

```
02-define/
  02-raid.gen-e2.raid   ← one file per engagement
```

> This is the suggested convention for new projects. If a repo already has the RAID log at a different path, respect that location.
