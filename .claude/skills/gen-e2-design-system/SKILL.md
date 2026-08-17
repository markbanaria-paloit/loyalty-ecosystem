---
name: gen-e2-design-system
description: 'Create or update Gen-e2 design system files (.gen-e2.ds). Use when defining design tokens, building a DTCG-format token library, organising colour palettes, typography scales, shadow tokens, dimension scales, motion tokens, or updating existing design system files during product discovery or design system authoring.'
argument-hint: 'Describe the design system (name, brand colours, type scale, spacing, any existing Figma or token exports to ingest)'
---

# Gen-e2™ Design System Skill

## When to Use
- Creating a new design system token file from scratch (brand guidelines, Figma token export, or design specification)
- Adding new token collections (e.g. dark mode semantic colours, new spacing scale)
- Updating existing tokens after a brand refresh or design decision
- Ingesting Figma variable exports or Style Dictionary JSON into the DTCG format
- Defining alias tokens that reference primitive tokens (semantic layer)

## Prerequisites
- Brand guidelines, colour palette, or Figma design file to reference
- Agreed token naming convention (collection → group → token)

## Procedure

### 1. Gather Context
Before creating or updating a design system file, collect:
- **System name** — used in the `name` field (e.g. `Acme Enterprise Design System`)
- **Version** — semantic version (default `1.0.0`)
- **Primary brand colours** — hex values for primary, secondary, neutral, semantic (success, warning, danger)
- **Typography** — font families, size scale, weight values, line heights
- **Spacing/dimension scale** — base unit and scale steps
- **Shadow tokens** — elevation levels (sm, md, lg)
- **Motion tokens** — duration values and easing curves
- **Semantic layer** — aliases that map component-level tokens to primitive values

Ask the user for any missing critical information rather than assuming hex values.

### 2. Interview Prompts
If creating from scratch, ask:

**Brand identity:**
1. What is the primary brand colour?
2. Are there secondary/accent colours?
3. What is the neutral palette (greys)?

**Typography:**
1. Primary font family (body text)?
2. Monospace font (code/labels)?
3. Preferred base font size? (default: 16px)

**Spacing:**
1. Base unit for spacing? (default: 4px)
2. How many scale steps are needed?

**Semantic layer:**
1. Should semantic tokens be created (light/dark mode colour aliases)?
2. What component-level tokens are needed (background, text, border, accent)?

### 3. Create the File
Use the local template and field guide as authoritative references:
1. Read [./references/design-system-guide.md](./references/design-system-guide.md) for field guidance, token types, and naming conventions
2. Read [./templates/design-system.json](./templates/design-system.json) for the canonical JSON schema
3. Create the file alongside existing design system artefacts, or follow the project's agreed folder structure. If no convention exists yet, a name like `{NN}-<engagement-slug>.gen-e2.ds` in a suitable folder works well. For standalone design system repositories, place at the root.
4. Populate with gathered context; use today's date for `lastUpdated`
5. Start with primitive tokens (`core` collection), then build semantic aliases on top

### 4. Update an Existing File
1. Read the existing `.gen-e2.ds` file
2. Read [./references/design-system-guide.md](./references/design-system-guide.md) to confirm field semantics
3. Make targeted token edits — add new groups, update values, add alias references
4. Bump `version` (e.g. `1.0.0` → `1.1.0`) and update `lastUpdated` to today
5. Preserve existing alias references — verify they still resolve after any path changes

### 5. Token Naming Conventions
Use lowercase, dot-separated paths:

```
<collection>.<category>.<group>.<name>
```

Examples:
- `core.color.primitive.blue.500` — primitive colour token
- `semantic.color.light.background.canvas` — semantic alias
- `core.dimension.scale.16` — spacing/size token
- `core.typography.family.sans` — font family

**Collections** — top-level namespaces:
- `core` — primitive, source-of-truth values (never aliases)
- `semantic` — contextual aliases that reference `core` tokens
- `component` — component-specific tokens (optional)

### 6. Validate
After creating or updating:
- Every token leaf must have `$type`
- `$type` must be one of: `color`, `dimension`, `fontFamily`, `typography`, `shadow`, `duration`, `cubicBezier`, `opacity`, `border`, `gradient`, `transition`, `number`, `boolean`, `string`
- `$value` must match the shape for its `$type` (see field guide)
- Alias values (`{path.to.token}`) are valid for any `$type`
- `name` must be present and non-empty at the root level
- `$schema` should be set to `https://www.designtokens.org/schemas/2025.10/format.json`

### 7. Wireframe Canvas Compatibility

If this design system will be linked to a `.gen-e2.wf` wireframe via its `"designSystem"` field, the token tree **must** include a specific set of paths for the canvas renderer to apply your brand correctly.

Read [../gen-e2-wireframe/references/tokens.md](../../../apm_modules/GLOBAL-PALO-IT/gen-e2-marketplace/plugins/gen-e2-edith/skills/gen-e2-wireframe/references/tokens.md) for the full list of 37 tokens consumed by the wireframe editor, with purpose and expected `$type` for each.

**Quick checklist — minimum set for meaningful canvas rendering:**

| Group | Paths to populate |
|---|---|
| Background | `semantic.color.light.background.canvas`, `.surface`, `.subtle`, `.sunken` |
| Text | `semantic.color.light.text.primary`, `.secondary`, `.tertiary` |
| Border | `semantic.color.light.border.default`, `.muted`, `.brand` |
| Accent | `semantic.color.light.accent.primary` |
| Spacing | `semantic.dimension.spacing.xs` through `.xl` (5 tokens, `$type: dimension`) |
| Card | `component.card.background`, `.border`, `.borderRadius`, `.shadow` |
| Button | `component.button.primary.*`, `.secondary.*`, `.ghost.text`, `.danger.*` |
| Input | `component.input.border`, `.background`, `.borderRadius` |
| Navbar | `component.navigation.header.background`, `.header.title` |

Component tokens may use alias syntax to reference semantic tokens:
```json
"component": {
  "card": {
    "background": { "$type": "color", "$value": "{semantic.color.light.background.surface}" }
  }
}
```

Spacing tokens must use `$type: "dimension"` with a structured `{ value, unit }` object — **not** a CSS string:
```json
"semantic": {
  "dimension": {
    "spacing": {
      "md": { "$type": "dimension", "$value": { "value": 16, "unit": "px" } }
    }
  }
}
```

### 8. Cross-Document Updates
When the design system changes, check these dependent artefacts:
- **Wireframes** (`.gen-e2.wf`) — any wireframe with a `"designSystem"` field will live-reload when the DS file is saved; verify the canvas renders as expected
- **Architecture** (`.gen-e2.arch`) — if a design system token library affects frontend technology decisions, update the architecture
- **Product Brief** (`.gen-e2.brief`) — if brand/design decisions are scope-defining, note in the design principles section
- **RAID Log** (`.gen-e2.raid`) — flag any unresolved design decisions or missing brand assets as assumptions
