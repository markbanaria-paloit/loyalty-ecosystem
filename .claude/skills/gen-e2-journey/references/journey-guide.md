# Gen-e2™ Journey Map Field Guide

## Purpose
A journey map captures the end-to-end experience of a single persona moving through a scenario. It is the primary output of the Discover phase that surfaces emotional highs, lows, and opportunity areas.

## File Naming
`01-discover/03-journeys/{NN}-{kebab-scenario}.gen-e2.jm`

Example: `01-discover/03-journeys/01-software-adoption.gen-e2.jm`

## Exemplar
A well-formed journey map has 4–8 stages, at least 2 rows with items across most stages, emotion scores for the majority of stages, and a clear emotional arc with at least one inflection point. Look for an existing `.gen-e2.jm` file in the current project's `01-discover/03-journeys/` folder to use as a reference.

---

## Field Reference

### `meta`
| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Descriptive title, e.g. `"Health Check — Member Journey"` |
| `owner` | Yes | Team or individual responsible |
| `date` | Yes | ISO 8601 `YYYY-MM-DD` — last updated |
| `version` | Yes | `vX.Y` format (increment on significant updates) |
| `persona` | No | String label matching the persona's `meta.title` |

### `stages[]`
- **Aim for 4–8 stages** — fewer than 4 lacks narrative; more than 8 becomes cluttered
- Each stage needs a unique `id` (kebab-case, no spaces) — IDs are used as keys in `rows[].items` and `emotions`
- `description` should answer "What is the user trying to do at this point?"
- **Order matters** — stages are rendered left-to-right in the grid

**Common stage patterns:**
- Acquisition: Awareness → Research → Evaluation → Purchase
- Service: Onboarding → Active Use → Support → Renewal
- Health: Discovery → Assessment → Treatment → Recovery → Maintenance

### `rows[]`
- **Minimum 2 rows** — at least one action row and one observation row
- Common row labels: `Actions`, `Needs & Pains`, `Touchpoints`, `Opportunities`, `Thoughts`, `Questions`
- `id` must be unique within the file
- `items` is an object keyed by `stageId` — every stage should be represented (empty array `[]` is valid)
- Each item: `{ id: "unique-id", text: "…" }`

**Row ordering convention:**
1. Actions (what the user does)
2. Touchpoints (channels/systems they interact with)
3. Needs & Pains (what they're trying to achieve or avoid)
4. Opportunities (design/product interventions)

### `emotions`
- Object keyed by `stageId` — only stages with known emotional data need entries
- `emotionScore` (integer 1–10): 1 = very negative, 10 = very positive
- `text` should be a brief qualitative description of the feeling
- The editor renders a visual bezier curve connecting all scored stages
- **Inflection points** (where the score shifts by 3+) are high-value design targets
- Do NOT fabricate scores without evidence — leave the key absent rather than guess

**Score guidance:**
| Score | Sentiment |
|-------|-----------|
| 1–2 | Frustrated, distressed |
| 3–4 | Concerned, uncertain |
| 5–6 | Neutral, cautious |
| 7–8 | Satisfied, confident |
| 9–10 | Delighted, enthusiastic |

### `persona`
- Optional but recommended — embeds persona context directly in the map
- `experienceLevel`: `"Beginner"`, `"Intermediate"`, or `"Expert"`
- If a `.gen-e2.persona` file exists, `meta.persona` should reference it by `meta.title`

---

## Evidence Standards

| Confidence | Tag | Source |
|------------|-----|--------|
| `validated` | Direct user interview confirming the item | Research session transcript |
| `strong-signal` | Multiple qualitative data points aligning | 3+ interviews, observation sessions |
| `assumption` | Team-stated belief without user data | Workshop, stakeholder input |
| `hypothesis` | Informed guess based on adjacent evidence | Analogous research, competitive analysis |

Log all `assumption` and `hypothesis` items in the project RAID.

---

## Quality Checklist

Before marking a journey map as `v1.0`:
- [ ] At least 4 stages defined
- [ ] At least 2 rows with non-empty items for most stages
- [ ] Emotion scores present for at least 50% of stages
- [ ] Emotion arc shows at least one inflection point
- [ ] All items can be traced to a research source or flagged as assumptions
- [ ] `meta.owner`, `meta.date`, and `meta.version` are set
