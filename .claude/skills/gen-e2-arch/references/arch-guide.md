# Architecture Field Guide

## Structure Overview

An architecture file (`*.gen-e2.arch`) captures the technical blueprint for a product — the services, layers, decisions, and data flows that define how the system works. It is primarily authored during the **Define** phase and updated throughout build.

---

## Section Guidelines

### meta

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Product name + "Architecture" (e.g. "Platform Architecture") |
| `owner` | Yes | The tech lead or architect responsible |
| `date` | Yes | ISO 8601 date of last update: `YYYY-MM-DD` |
| `version` | Yes | Semantic version string, start at `"1.0"` |

---

### layers

Layers group services by technical concern (e.g. Frontend, Backend, Data, Infrastructure). Each layer has:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Unique kebab-case string: `"layer-frontend"` |
| `label` | Yes | Human-readable layer name displayed in the editor |
| `colour` | Yes | Hex colour for the layer header — use distinct, accessible colours |
| `services` | Yes | Array of `ArchService` objects; can be empty |

**Layer count**: 2–6 layers is typical. More than 6 becomes hard to read.

**Suggested layer ordering** (top to bottom):
1. Frontend (user-facing surfaces)
2. Backend (API, business logic, integrations)
3. Data (databases, caches, search)
4. Infrastructure (cloud, hosting, CDN) — add only if relevant

---

### services

Each service inside a layer:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Unique kebab-case string: `"svc-web-app"` |
| `name` | Yes | Short display name shown on the chip |
| `phase` | Yes | `"mvp"` or `"deferred"` — never leave blank |
| `description` | Yes | One sentence explaining what this service does |

**MVP vs Deferred:**
- `mvp` — required for the first production release
- `deferred` — planned for a later iteration; not needed for MVP

Be conservative with MVP scope. If a service does not directly enable the core user journey, it is likely deferred.

**Naming convention**: service names should match how they appear in data flow descriptions so `from`/`to` references are consistent.

---

### decisions

Technology decisions that have been made (or are under consideration):

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Unique string: `"dec-1"`, `"dec-2"` etc. |
| `topic` | Yes | Short label for the decision area: `"Frontend Framework"` |
| `choice` | Yes | The chosen option: `"React"`, `"PostgreSQL"` |
| `rationale` | No (warning) | Why this choice was made — include trade-offs |
| `alternatives` | Yes | Array of options that were considered but rejected |
| `confidence` | Yes | `"validated"`, `"strong-signal"`, or `"assumption"` |

**Confidence levels:**
- `validated` — backed by prototypes, benchmarks, or direct production experience
- `strong-signal` — supported by research, industry best practice, or strong team consensus
- `assumption` — not yet validated; log in RAID

**Note:** `rationale` is optional at the schema level but important for team transparency. The editor shows a warning indicator when it is missing.

**Decision count**: Capture only decisions that have meaningful alternatives and trade-offs. Routine choices (e.g. "use npm") do not need a decision record.

---

### dataFlows

Numbered steps describing how data moves between services for a key scenario (e.g. user authentication, data submission):

| Field | Required | Notes |
|-------|----------|-------|
| `step` | Yes | Integer step number (1-based) |
| `description` | Yes | What happens in this step — include any transformation or validation |
| `from` | Yes | Name of the source service (should match a `name` in `layers[].services`) |
| `to` | Yes | Name of the destination service (should match a `name` in `layers[].services`) |

> **Critical type constraints — these cause validation errors if violated:**
> - `step` **must be a JSON integer** (e.g. `1`, `2`, `3`) — never a quoted string (e.g. `"1"` is wrong)
> - `description` **must be a non-empty string** — omitting it or leaving it blank causes an error

**Tips:**
- Keep each step to one action — split compound steps into two
- Use service names that exactly match what appears in the layers (for traceability)
- A typical data flow has 3–7 steps
- You may add multiple data flows for different scenarios; give each a descriptive title in the editor

---

### openQuestions

Free-text list of unresolved architectural questions. These should be resolved into decisions or logged in RAID.

- Keep each item as a question, not a statement
- Assign ownership and a target resolution date via RAID
- Remove items once resolved (move to `decisions` if a choice was made)

---

## Colour Guidance for Layers

Use visually distinct, accessible colours that work in both dark and light VS Code themes. The layer colour is used as a tinted header background — avoid very dark or very light values.

| Layer | Suggested colour |
|-------|-----------------|
| Frontend | `#4CAF50` (green) |
| Backend | `#2196F3` (blue) |
| Data | `#FF9800` (orange) |
| Infrastructure | `#9C27B0` (purple) |
| Integrations | `#00BCD4` (teal) |

---

## Exemplar

A well-formed architecture file has:
- 2–4 layers, each with 2–6 services (a mix of MVP and deferred)
- 3–5 technology decisions with `validated` or `strong-signal` confidence
- 1–2 data flows with 3–6 steps each
- A short `openQuestions` list (0–3 items)

Look for an existing `.gen-e2.arch` file in the current project's `02-define/04-architecture/` folder to use as a reference.
