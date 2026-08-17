# Research Synthesis Field Guide

## File Purpose

A `.gen-e2.research` file synthesises qualitative research findings into named thematic groups, where each group contains one or more insights backed by source file references. It is the primary output of affinity mapping and analysis sessions.

## Meta Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Short study name (e.g. `Onboarding usability tests`) |
| `studyType` | Yes | Method label (e.g. `Moderated usability test synthesis`, `Diary study analysis`) |
| `cycle` | Yes | Sprint or quarter (e.g. `FY25 • Sprint 11`) |
| `researcher` | Yes | Name of the researcher or analyst |
| `lastUpdated` | **Required** | ISO date of last edit — `YYYY-MM-DD`. The editor will raise an error if absent |
| `summary` | Yes | One-sentence headline of what the study revealed |

## Groups

A group is a theme cluster — a named bucket that collects related insights.

### Group Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Stable kebab-case identifier — never changes once set |
| `title` | Yes | Short theme name (Motivations, Pain Points, Mental Models, Workarounds, Delighters) |
| `description` | No | One sentence explaining what this theme captures |
| `insights` | Yes | Array of insight objects (at least one) |

### Group Naming Conventions

The six default segments, in the recommended order:

| Segment | What to capture |
|---------|-----------------|
| Pain Points | Specific frustrations and blockers preventing goal completion |
| Unmet Needs | What participants require that the current solution does not provide |
| Engagement Drivers | What motivates continued use and positive experience |
| Behaviours | What participants actually do today |
| Desired Features | Functionality or improvements participants explicitly requested |
| Context | Environmental, situational, or workflow factors shaping how participants engage |

These six segments are the **default** for a new `.gen-e2.research` synthesis. They are not fixed — a study may add, rename, or replace segments when the research question warrants it. Other themes that appear regularly across studies include Mental Models, Workarounds, Delighters, Barriers, and Expectations.

Aim for 3-7 groups per synthesis. More than 7 groups usually means the analysis needs another round of consolidation.

## Insights

An insight is a named, summarised pattern observed across multiple participants or sessions.

### Insight Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Stable kebab-case identifier |
| `title` | Yes | Complete short sentence stating the finding (e.g. `Learning is the core motivation for IMGs and Registrars`) |
| `summary` | Yes | 1–2 sentences describing the pattern with enough detail to act on |
| `references` | Yes | At least one source reference linking back to raw data |

### Insight Title Conventions

Write insight titles as **complete short sentences** that state the finding directly. A reader should understand the insight from the title alone without needing the summary.

| ❌ Category label | ✅ Complete sentence |
|-------------------|----------------------|
| `Learning` | `Learning is the core motivation for IMGs and Registrars` |
| `Search as safety net` | `Participants use global search as a safety net to recover context during onboarding` |
| `Stay in control` | `Participants prioritise reversible actions to stay in control when navigating unfamiliar screens` |

Keep the title to one sentence and under 120 characters. Use present tense and active voice where possible.

### Demographic Divergence Convention

When a pattern holds for one participant segment but not another, **name both segments and the divergence directly in the insight text** — do not write a single blended finding that hides the directional difference.

**Where to capture it:**

| Scope | Where to write |
|-------|---------------|
| Insight-level divergence | `insight.title` and/or `insight.summary` |
| Theme-wide caveat that applies to multiple insights in the group | `group.description` |

**No new schema field is needed.** Divergence is captured in the text, not the structure.

**Example (insight-level):**

| ❌ Flattened | ✅ Divergence named |
|-------------|---------------------|
| `Participants have mixed reactions to gamification` | `Gamification motivates Registrars who want competition but is off-putting for IMGs` |

The flattened version loses the directional signal — a designer cannot act on "mixed reactions". The divergent version tells the designer exactly which segment to design for and what trade-off to navigate.

**Example (group-level caveat):**

```json
{
  "id": "engagement-drivers",
  "title": "Engagement Drivers",
  "description": "What motivates participants to adopt and persist with the product. Note: motivation patterns diverge strongly between Registrars (competition-driven) and IMGs (mastery-driven) — insights below reflect both where evidence allows.",
  "insights": [...]
}
```

**When evidence is insufficient to confirm the divergence**, log it as a RAID assumption and write the insight with the caveat: *"Divergence suspected between [Segment A] and [Segment B] — requires further research."*

### Insight Quality Criteria

A well-formed insight:
- Has a **title written as a complete sentence** — category labels such as "Learning" or "Stay in control" are not acceptable titles
- Is **behavioural**, not attitudinal — what participants *did*, not just what they *said*
- Appears in **at least 2 sessions or data sources** — single-participant observations are hypotheses, not insights (tag the underlying assumption in RAID)
- Has a **clear implication** — reading it, a designer can identify what to change
- Avoids generic framing — "Users are confused" is not an insight; "Users re-read the confirmation screen three times before clicking Submit" is
- **Names segment divergence explicitly** — if the pattern holds for one segment but not another, both segments and the directional difference must appear in the title or summary; blended language that hides the divergence (e.g. "mixed reactions") is not acceptable

## References

Each reference links an insight back to a specific passage in a source file.

### Reference Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Stable identifier (e.g. `motivation-ref-1`) |
| `sourceId` | No | Session identifier (e.g. `S1`, `STUDY-04`) |
| `participantId` | No | Participant code (e.g. `P01`, `DM-03`) |
| `filePath` | **Required** | Workspace-relative path to the transcript or session note |
| `range.start.line` | Yes | Zero-based line number of the evidence passage start |
| `range.end.line` | Yes | Zero-based line number of the evidence passage end |
| `note` | No | Why this passage supports the insight — be specific |
| `excerpt` | No | Direct quote from the transcript (include double quotes) |

### Reference Linking Standards

- **`filePath`** should be a path relative to the workspace root — the "Open" button in the editor resolves it relative to the extension host's workspace folder
- **Line numbers** are zero-based (line 1 in the editor = `0` in JSON)
- **Quote directly** when a participant's exact words capture the insight better than a paraphrase — always include in `excerpt`
- **`note`** must explain the *relevance*, not just re-state what the text says. "Participant reached the admin dashboard by typing rather than browsing" is better than "Admin dashboard navigation"

## Validation Rules

The editor enforces:

| Rule | Severity |
|------|----------|
| `meta.lastUpdated` must be present and a non-empty string | **Error** — prevents save |
| `groups` must be an array | **Error** |
| Each group must have a non-empty string `id` | **Error** |
| Each group must have a non-empty string `title` | **Error** |
| Group `id` values must be unique | **Error** |
| Each insight must have a non-empty string `id` | **Error** |
| Each insight must have a non-empty string `title` | **Error** |
| Insight `id` values must be unique across the document | **Error** |
| Each reference must have a non-empty string `filePath` | **Error** |
| `range.start` must have a non-negative integer `line` | **Error** |
| `meta.title` should be present | **Warning** |
| `meta.researcher` should be present | **Warning** |

## Exemplar

```json
{
  "meta": {
    "title": "IMG and Registrar motivation study",
    "studyType": "Moderated usability test synthesis",
    "cycle": "FY25 • Sprint 11",
    "researcher": "Mia Chen",
    "lastUpdated": "2025-11-22",
    "summary": "Eight sessions across IMGs and Registrars revealed that learning is the primary driver of tool adoption, and that participants use global search as a safety net when navigating unfamiliar screens."
  },
  "groups": [
    {
      "id": "engagement-drivers",
      "title": "Engagement Drivers",
      "description": "What motivates participants to adopt and persist with the product.",
      "insights": [
        {
          "id": "learning-core-motivation",
          "title": "Learning is the core motivation for IMGs and Registrars",
          "summary": "Across all eight sessions, participants cited professional growth and skill acquisition — not efficiency — as the primary reason they chose and continued using the product.",
          "references": [
            {
              "id": "eng-ref-1",
              "sourceId": "S2",
              "participantId": "P02",
              "filePath": "01-discover/01-research/transcripts/session-02-priya.md",
              "range": {
                "start": { "line": 44, "character": 0 },
                "end": { "line": 57, "character": 0 }
              },
              "note": "Participant explicitly prioritised learning opportunities over time-saving features when choosing which module to try first.",
              "excerpt": "\"I'm not here to do things faster — I want to understand why I'm doing them.\""
            }
          ]
        }
      ]
    },
    {
      "id": "behaviours",
      "title": "Behaviours",
      "description": "What participants actually do today when navigating and using the product.",
      "insights": [
        {
          "id": "search-as-safety-net",
          "title": "Participants use global search as a safety net to recover context during onboarding",
          "summary": "Participants use the search bar to recover context rather than to find new content — it reduces anxiety about making mistakes during onboarding.",
          "references": [
            {
              "id": "beh-ref-1",
              "sourceId": "S1",
              "participantId": "P01",
              "filePath": "01-discover/01-research/transcripts/session-01-alex.md",
              "range": {
                "start": { "line": 81, "character": 0 },
                "end": { "line": 94, "character": 0 }
              },
              "note": "Reached the admin dashboard by typing the manager name rather than browsing for three minutes.",
              "excerpt": "\"Search is how I sanity check the spelling before I talk to a client.\""
            }
          ]
        }
      ]
    }
  ]
}
```
