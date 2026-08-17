# Persona Field Guide

## Persona Types

| Type | Purpose | Count | Example |
|------|---------|-------|---------|
| **Primary** | The main user the product is designed for | 1-2 | End consumer, patient |
| **Secondary** | Users who benefit but aren't the primary target | 1-2 | Family member, carer |
| **Stakeholder** | People who influence or are affected by the product | 1-2 | Doctor, admin, partner org |

## Section Guidelines

### Demographics
- Include 4-6 primary fields that define the persona at a glance
- Add secondary fields for context (income, family, gender)
- Use `isPrimary: true` for fields shown in the persona card header

### Goals (3-5 items)
- Frame as desires, not features: "Wants a full picture of their health" not "Needs a dashboard"
- Include research percentages when available: "Develop an action plan (73%)"
- Order by importance/frequency from research

### Pain Points (4-7 items)
- Specific frustrations, not generic complaints
- Include evidence: "GP visits are too basic (64%)"
- Cover: current solutions, information gaps, cost/time barriers, emotional frustrations

### Current Practices (3-5 items)
- What they do TODAY to address their needs (before your product exists)
- Tools, services, workarounds, habits
- Reveals competitive landscape and switching costs

### Behaviours (3-5 items)
- Observable patterns, not attitudes
- Frequency indicators: "Trains 4-5 times per week"
- Technology usage patterns

### Touchpoints (4-6 items)
- Grouped by category: Wearables, Apps, Healthcare, Content
- Specific product/service names
- Reveals integration opportunities and data sources

### Quote
- Direct from research interviews when possible
- If synthesised, capture the persona's authentic voice
- Should encapsulate their core frustration or aspiration

### Mindset
- `personality`: 3-4 adjective-based traits
- `values`: 3-4 core values that drive decisions

## Avatar Image (optional)

Personas can include a custom portrait via the `avatar` field:

```json
"avatar": "./images/sarah.png"
```

- The path must be **relative to the `.gen-e2.persona` file** itself
- Supported formats: PNG, JPG, GIF, WebP, SVG
- **Omit the field entirely** if no custom image is available — the editor generates a deterministic avatar automatically from the persona's name and demographics; no placeholder or empty string is needed
- The avatar can also be set interactively inside the editor by clicking the portrait and using the file picker

## Exemplar

A well-formed persona has all sections populated with at least 2–3 evidence-tagged items each, a distinctive quote, and a mindset map with tension between goals and frustrations. Look for an existing `.gen-e2.persona` file in the current project's `01-discover/02-personas/` folder to use as a reference.
