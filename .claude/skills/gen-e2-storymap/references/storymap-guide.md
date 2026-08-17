# Gen-e2™ Story Map — Field Guide

## Purpose

The Story Map is the Define-phase artefact that organises user stories into a two-dimensional grid of **Activities** (horizontal backbone) → **Epics** → **Stories**. It provides a shared view of scope, priorities, and release phasing for the whole team.

---

## `meta` object

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✓ | Format: `{Product Name} — Story Map` |
| `owner` | string | ✓ | Usually Product Lead or Discovery Lead |
| `date` | string | ✓ | ISO 8601: `YYYY-MM-DD` (last updated date) |
| `version` | string | ✓ | Semantic: `v1.0`, `v1.1` |

---

## `lanes` array (optional)

Swim lanes represent release bands (e.g. MVP, Phase 2, Future Backlog). Stories are tagged with a `lane` id. Omit `lanes` entirely for a flat map without release phasing.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✓ | Kebab-case, unique across lanes — e.g. `mvp`, `v2`, `backlog` |
| `label` | string | ✓ | Human-readable display name — e.g. `MVP (Release 1)` |
| `colour` | string | ✗ | Hex colour for the lane header — light pastels recommended |

**Guidance:**
- Define lanes in priority order (highest priority first — MVP at top)
- Use `colour` sparingly — 2–3 lanes maximum before colour-coding loses value
- Story `lane` fields must reference a valid lane `id`; unmapped stories will render without a lane badge

---

## `activities` array

Activities are the top-level steps a user takes, forming the horizontal backbone of the map.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✓ | Short verb phrase — e.g. `Patient Registration`, `Submit Claim` |
| `colour` | string | ✓ | Hex colour for the activity header strip |
| `epics` | Epic[] | ✓ | At least one epic recommended; may be empty during early mapping |

**Colour palette (default — auto-assign if not specified):**
`#4F46E5`, `#10B981`, `#7C3AED`, `#F59E0B`, `#EF4444`, `#06B6D4`

**Guidance:**
- Activities represent major user tasks, not features — keep names user-centric
- Arrange activities in rough time/journey order (left to right)
- Aim for 4–8 activities; fewer obscures flow, more overwhelms the canvas

---

## `activities[].epics` array

Epics group related stories within an activity.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✓ | Short noun phrase — e.g. `Search & Identify`, `Consent Flow` |
| `stories` | Story[] | ✓ | May be empty; add stories as detail is refined |

---

## `activities[].epics[].stories` array

Stories are the atomic units of scope — specific capabilities or user needs.

| Field | Type | Enum values | Required | Notes |
|---|---|---|---|---|
| `id` | integer | Sequential, unique across document | ✓ | Start at 1; never reuse ids |
| `title` | string | — | ✓ | User-story format preferred: "As a … I want to …" or short imperative |
| `priority` | string | `must` \| `should` \| `could` | ✓ | MoSCoW priority |
| `size` | string | `s` \| `m` \| `l` \| `xl` | ✓ | T-shirt effort estimate |
| `lane` | string | Must match a `lanes[].id` | ✗ | Omit if no lanes defined; required if lanes exist |

---

## Priority Reference (MoSCoW)

| Value | MoSCoW | Release Guidance |
|-------|--------|-----------------|
| `must` | Must Have | Core MVP — product fails without this |
| `should` | Should Have | High value; include if capacity allows in the release window |
| `could` | Could Have | Nice to have; defer to later release or cut entirely |

---

## Size Reference (T-Shirt)

| Value | Rough Effort | Notes |
|-------|-------------|-------|
| `s` | ~2 days | Simple, well-understood, single concern |
| `m` | ~5 days | Moderate complexity; may need design + dev |
| `l` | ~10 days | Complex; multiple components or integration work |
| `xl` | ~15+ days | High complexity or unknowns; needs a spike before sprint |

---

## Validation Rules

| Rule | Error Code |
|------|-----------|
| `meta.title` is empty or missing | `MISSING_META_TITLE` |
| `meta.owner` is empty or missing | `MISSING_META_OWNER` |
| `meta.date` is empty or missing | `MISSING_META_DATE` |
| `meta.version` is empty or missing | `MISSING_META_VERSION` |
| `activities` is not an array | `ACTIVITIES_REQUIRED` |
| An activity has no `name` | `ACTIVITY_NAME_REQUIRED` |
| An activity `epics` is not an array | `EPICS_REQUIRED` |
| A story has no `id` (integer) | `STORY_ID_REQUIRED` |
| A story has no `title` | `STORY_TITLE_REQUIRED` |
| A story `priority` not in enum | `STORY_PRIORITY_INVALID` |
| A story `size` not in enum | `STORY_SIZE_INVALID` |
| A `lane` id is empty or missing | `LANE_ID_REQUIRED` |
| A `lane` label is empty or missing | `LANE_LABEL_REQUIRED` |
| A story `lane` references an undefined lane id | `STORY_LANE_UNDEFINED` |
