---
name: gen-e2-heuristic
description: 'Create or update Gen-e2 heuristic evaluation files (.gen-e2.he). Use when conducting Nielsen heuristic analysis, capturing usability issues, rating severity, and recording recommendations during product discovery or design review.'
argument-hint: 'Describe the product/feature being evaluated, the evaluator, and the device/context of evaluation'
---

# Gen-e2™ Heuristic Evaluation Skill

## When to Use
- Conducting a formal heuristic evaluation against Nielsen's 10 Usability Heuristics
- Capturing usability issues found during expert review, design critique, or prototype walkthrough
- Recording severity ratings and actionable recommendations per heuristic
- Comparing heuristic scores across multiple evaluators (aggregated reviews)
- Updating an evaluation after design iterations to track improvement

## Procedure

### 1. Gather Context
Before creating an evaluation, confirm:
- **Evaluator**: Who is conducting the evaluation? (name or role)
- **Product / App**: What website, app, or feature is being evaluated?
- **Task / Feature scope**: Is the evaluation scoped to a specific flow or the full product?
- **Device & Browser/OS**: What device and environment was used?
- **Date**: When is the evaluation being conducted?

Ask the user for any missing critical information rather than assuming.

### 2. Severity Scale
All evaluations use the standard 5-point Nielsen severity scale (0–4). This is pre-populated in the template — do **not** change the scale values or labels. The scale is:

| Value | Label | Meaning |
|-------|-------|---------|
| 0 | Not a usability problem | I don't agree this is a usability problem |
| 1 | Cosmetic | Fix if time allows |
| 2 | Minor | Low priority |
| 3 | Major | High priority |
| 4 | Catastrophic | Must fix before release |

### 3. Create the File
Use the local template and field guide as authoritative references:
1. Read [./references/heuristic-guide.md](./references/heuristic-guide.md) for field guidance, heuristic definitions, and evidence standards
2. Read [./templates/heuristic-evaluation.json](./templates/heuristic-evaluation.json) for the canonical JSON schema
3. Create the file at the path below, populated with gathered context — replacing all `{{placeholder}}` values

**File path**: `01-discover/01-research/{NN}-{kebab-name}.gen-e2.he`

> If the evaluation is part of a dedicated UX audit activity, place it under a dedicated subfolder, e.g. `01-discover/06-heuristics/`.

### 4. Populating Heuristics
- **Always include all 10 heuristics** — use `severity: 0` and empty `issues`/`recommendations` arrays for heuristics with no findings
- For each heuristic with findings:
  - `issues`: Specific, observable problems found (not generic complaints)
  - `recommendations`: Actionable design changes — be concrete, not vague
  - `severity`: The worst-case severity rating for that heuristic's issues
- Cite screenshots, task steps, or screen names where possible in issue descriptions

### 5. Evidence Tagging
- Issues observed directly by the evaluator → `validated`
- Issues inferred from user research or previous testing → `strong-signal`
- Issues hypothesised from design review without user data → `hypothesis`

Log any severity 3–4 issues in the RAID log as risks or issues.

### 6. Cross-Updates
After creating or updating a heuristic evaluation:
- Log all severity ≥ 3 issues in RAID as open issues (status: `open`)
- Check if affected flows or journey stages need updating
- Flag critical findings in the product brief under problem signals
- Update the story map if new user stories are implied by recommendations

## Reference
See [./references/heuristic-guide.md](./references/heuristic-guide.md) for heuristic definitions and exemplar issues per heuristic.
