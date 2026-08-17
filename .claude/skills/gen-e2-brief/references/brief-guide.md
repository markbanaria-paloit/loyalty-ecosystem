# Gen-e2™ Product Brief — Field Guide

## Purpose

The Product Brief is the central Define-phase artefact. It synthesises discovery findings into a shared, living document that aligns the team on vision, scope, features, roadmap, and success criteria. It is initialised at project start and updated incrementally after every significant workshop or research session.

---

## `meta` object

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✓ | Format: `{Product Name} — Product Brief` |
| `owner` | string | ✓ | Usually Product Lead or Discovery Lead |
| `date` | string | ✓ | ISO 8601: `YYYY-MM-DD` (last updated date) |
| `version` | string | ✓ | Semantic: `v1.0`, `v1.1` |

---

## `vision` object

| Field | Type | Required | Notes |
|---|---|---|---|
| `statement` | string | ✓ | One concise sentence: the desired future state |
| `shortTermVision` | string | ✗ | Now – ~6-12 months: what can realistically ship with today's skills, resources, and tech — quick wins that prove value and build momentum |
| `midTermVision` | string | ✗ | ~1-3 years: the bridge — capabilities, partnerships, or infrastructure needed to scale toward the long-term vision (new foundations, not just new features) |
| `longTermVision` | string | ✗ | ~3-5+ years: the destination — the big "why", aspirational but logically connected to the short and mid term |
| `boundaryRule` | string | ✓ | What this product is explicitly NOT — prevents scope creep |
| `market.addressable` | string | ✗ | Estimated TAM/SAM, e.g. `$2.4B SME Analytics Market` |
| `market.segments` | string[] | ✗ | Target audience segments, e.g. `["Mid-market Enterprises"]` |

**Guidance:**
- Keep `statement` to one sentence. Avoid jargon.
- `shortTermVision`, `midTermVision`, and `longTermVision` are optional — omit them for existing briefs that predate this field, or fill them in incrementally as the vision horizon is clarified.
- `boundaryRule` is most useful when it names a temptation the team has had — e.g. "We are NOT a transactional workflow system"

---

## `problemSignals` array

Each entry represents a validated (or hypothesised) user problem driving the product.

| Field | Type | Enum values | Required |
|---|---|---|---|
| `id` | string | `s1`, `s2` … | ✓ |
| `icon` | string | Emoji or empty string | ✗ |
| `title` | string | — | ✓ |
| `description` | string | — | ✓ |
| `confidence` | string | `validated` \| `strong-signal` \| `assumption` \| `hypothesis` | ✓ |
| `source` | string | — | ✓ (can be empty) |

**Evidence confidence scale:**
| Level | Meaning |
|---|---|
| `validated` | Confirmed through user research, data analysis, or stakeholder sign-off |
| `strong-signal` | Strong indirect evidence (walkthrough, analogous data, SME input) |
| `assumption` | Team believes this to be true without direct evidence |
| `hypothesis` | Speculative — needs active testing |

---

## `features` array

Each entry represents a named product feature.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✓ | Sequential slug: `f1`, `f2` … |
| `name` | string | ✓ | Short feature name |
| `description` | string | ✓ | One-paragraph description |
| `phase` | string | ✓ | Free-form: `MVP`, `Phase 2`, `Future` — must match a `roadmap.phases[].name` |
| `evidenceLink` | string | ✗ | ID of the `problemSignals` entry this feature addresses |

---

## `roadmap` object

| Field | Type | Required | Notes |
|---|---|---|---|
| `phases` | RoadmapPhase[] | ✓ | Ordered list of delivery phases |

### `roadmap.phases[]`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✓ | e.g. `Phase 1 — MVP` |
| `timeline` | string | ✓ | e.g. `Q3 2026 (12 weeks)` |
| `goal` | string | ✓ | What success looks like for this phase |
| `features` | string[] | ✓ | List of `features[].id` values included in this phase |
| `pricing` | string | ✗ | Pricing tier or model for this phase |

---

## `isIsNot` object

| Field | Type | Required | Notes |
|---|---|---|---|
| `is` | string[] | ✓ | 3–5 things this product clearly IS |
| `isNot` | string[] | ✓ | 3–5 things this product clearly IS NOT |

**Guidance:** Each item should be one short noun phrase. Focus on things the team has actually debated — not obvious exclusions.

---

## `guidingPrinciples` array

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | number | ✓ | Sequential integer starting at 1 |
| `title` | string | ✓ | Short imperative phrase, e.g. `Zero Manual Entry` |
| `description` | string | ✓ | One or two sentences explaining the principle |

**Guidance:** Aim for 3–5 principles. Each must be a genuine design constraint, not a platitude.

---

## `regulatory` array

| Field | Type | Enum values | Required |
|---|---|---|---|
| `body` | string | — | ✓ | Regulatory body or standard name, e.g. `GDPR`, `SOC 2 Type II` |
| `requirement` | string | — | ✓ | The specific obligation |
| `status` | string | `compliant` \| `in-scope` \| `out-of-scope` \| `tbd` | ✓ |
| `notes` | string | — | ✗ | Action items, deadlines, or context |

---

## `successMetrics` array

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✓ | Sequential slug: `m1`, `m2` … |
| `metric` | string | ✓ | Metric name, e.g. `Time to first insight` |
| `target` | string | ✓ | Target value, e.g. `< 3 minutes` |
| `timeframe` | string | ✓ | When this target should be achieved, e.g. `3 months post-launch` |
| `rationale` | string | ✗ | Why this metric was chosen |
