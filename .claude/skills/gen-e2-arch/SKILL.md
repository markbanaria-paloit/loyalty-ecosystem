---
name: gen-e2-arch
description: 'Create or update Gen-e2 architecture files (.gen-e2.arch). Use when defining service layers, technology decisions, data flows, and MVP vs deferred service scoping during the Define phase.'
argument-hint: 'Describe the product domain and known services, technology constraints, or architectural goals'
---

# Gen-e2™ Architecture Skill

## When to Use
- Creating a new architecture diagram during the Define phase
- Documenting technology decisions and their rationale
- Mapping data flows between services
- Classifying services as MVP or deferred scope
- Updating an existing architecture with new decisions or services

## Procedure

### 1. Gather Context
Before creating an architecture file, collect:
- **Product domain**: What system or product is being architected?
- **Team constraints**: Existing technology, language preferences, or platform targets
- **MVP scope**: Which services are required for the first release vs. later phases?
- **Known decisions**: Any already-agreed technology choices (e.g. cloud provider, auth approach)

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If working from scratch, ask the team these questions:
1. What are the primary user-facing surfaces? (web, mobile, desktop)
2. What backend services are needed for MVP?
3. What data needs to be stored and how?
4. What are the integration points with third-party systems?
5. What technology decisions have already been made?
6. What alternatives were considered and ruled out?
7. What are the main data flows (e.g. authentication, data submission)?
8. What open questions remain unresolved?

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/arch-guide.md](./references/arch-guide.md) for field guidance, section rules, and evidence standards
2. Read [./templates/arch.json](./templates/arch.json) for the canonical JSON schema
3. Create the file at the path below, populated with the gathered context — replacing all `{{placeholder}}` values

**File path**: `02-define/04-architecture/{kebab-name}.gen-e2.arch`

### 4. Evidence Tagging
Use the `confidence` field on each decision to tag evidence quality:
- `validated` — decision backed by prototypes, benchmarks, or direct team experience
- `strong-signal` — supported by research, industry best practice, or team consensus
- `assumption` — not yet validated; should be logged in RAID for follow-up

### 5. MVP vs Deferred
Every service must have a `phase` of either `"mvp"` or `"deferred"`:
- **MVP** — required for the first production release
- **Deferred** — planned but not required for MVP; can be added in later iterations

Be conservative with MVP scope — defer anything that does not directly enable the core user journey.

### 6. Schema Validation
Before saving, verify these constraints that cause validation errors:
- `dataFlows[].step` must be a **JSON number** (e.g. `1`) — never a quoted string (e.g. `"1"` will fail)
- `dataFlows[].description` must be a **non-empty string** — never omit it or leave it blank
- `meta.version` must be a **non-empty string** (e.g. `"1.0"`)
- `decisions[].id`, `.topic`, and `.choice` are all required when a decisions array is present

### 7. Cross-Updates
After creating/updating an architecture file:
- Check if data flows reference services that exist in the `layers` array
- Check if decisions reference technology used in service descriptions
- Log any `assumption`-confidence decisions in RAID
- Check if the product brief technology section needs updating

## Reference
See [./references/arch-guide.md](./references/arch-guide.md) for the architecture field guide and exemplar.
