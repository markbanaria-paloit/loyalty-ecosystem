# Heuristic Evaluation Field Guide

## Overview

A Gen-e2 heuristic evaluation captures a structured expert review of a product's usability against Nielsen's 10 Usability Heuristics. Each evaluation is scoped to a specific product, feature, or task flow, conducted by one or more evaluators.

---

## `meta` Fields

| Field | Required | Notes |
|-------|----------|-------|
| `evaluator` | Yes | Name or role of the person conducting the review |
| `date` | Yes | ISO date (YYYY-MM-DD) |
| `websiteApp` | Yes | Name of the product, system, or app being evaluated |
| `device` | Yes | e.g. "Laptop", "iPhone 15", "Desktop" |
| `browserOS` | Yes | e.g. "Chrome / macOS", "Safari / iOS 17" |
| `taskFeature` | Yes | Narrow scope: e.g. "Checkout flow", "Onboarding", "Full product" |

---

## `severityScale`

The severity scale is **fixed** — always use the standard 5-point Nielsen scale. Do not modify values, labels, or descriptions. It must appear verbatim in every `.gen-e2.he` file.

---

## `heuristics` Array

Always include **all 10 heuristics** in order. Use `severity: 0` and empty arrays for heuristics with no findings.

### Heuristic Definitions

| ID | Title | Common Issues |
|----|-------|--------------|
| 1 | **Visibility of system status** | No loading indicators, unclear progress, missing confirmation messages |
| 2 | **Match between system and the real world** | Technical jargon, illogical ordering, unfamiliar metaphors |
| 3 | **User control and freedom** | No undo/redo, no cancel, back button breaks flow |
| 4 | **Consistency and standards** | Inconsistent button labels, mixed UI patterns, platform convention violations |
| 5 | **Error prevention** | No input validation, no confirmation dialogs for destructive actions, ambiguous affordances |
| 6 | **Recognition rather than recall** | Hidden options, no autocomplete, users must remember context from previous screens |
| 7 | **Flexibility and efficiency of use** | No shortcuts, no saved preferences, power users slowed by novice-oriented flows |
| 8 | **Aesthetic and minimalist design** | Visual clutter, redundant information, low signal-to-noise ratio |
| 9 | **Help users recognise, diagnose, and recover from errors** | Generic error messages, no recovery path, no cause explanation |
| 10 | **Help and documentation** | No onboarding, no help section, no contextual tips |

### Per-Heuristic Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | 1–10, fixed |
| `title` | string | Use the exact Nielsen title from the table above |
| `description` | string | One-sentence definition — use the canonical descriptions from the template |
| `severity` | integer 0–4 | Worst-case severity across all issues for this heuristic |
| `issues` | string[] | Specific, observable problems. Cite screen/step where possible |
| `recommendations` | string[] | Actionable design changes — one recommendation per issue minimum |

---

## Writing Good Issues

**Too vague**: "Navigation is confusing."
**Good**: "The 'Back' button on the payment screen navigates to the homepage instead of the previous step, losing all form data."

**Too vague**: "Error messages are bad."
**Good**: "When payment fails, the message reads 'Error 500' with no explanation or recovery action."

---

## Writing Good Recommendations

**Too vague**: "Improve the flow."
**Good**: "Replace the 'Back' button target to return to Step 2 (billing details), preserving all previously entered data."

---

## Severity Guidelines

When multiple issues exist for one heuristic, assign the **highest** severity among them to the heuristic's `severity` field.

| Severity | When to Use |
|----------|-------------|
| 0 | No problem found for this heuristic |
| 1 | Minor aesthetic issue; won't affect task completion |
| 2 | Some friction but users can still complete the task |
| 3 | Causes significant user confusion or failed tasks |
| 4 | Task cannot be completed; critical for launch |

---

## RAID Integration

All issues rated **3 (Major)** or **4 (Catastrophic)** must be logged in the project RAID log as open issues with:
- `title`: Heuristic name + brief issue summary
- `status`: `open`
- `impact`: `high` (severity 4) or `medium` (severity 3)
- `owner`: Evaluator or design lead

---

## Exemplar

A well-formed heuristic evaluation has:
- All 10 heuristics present
- At least 3–5 heuristics with substantive findings
- Specific, screen-referenced issues for each finding
- At least one concrete recommendation per issue
- `severity: 0` with empty arrays for heuristics with no violations
