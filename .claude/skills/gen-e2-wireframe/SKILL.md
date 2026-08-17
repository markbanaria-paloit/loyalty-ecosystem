---
name: gen-e2-wireframe
description: 'Create or update Gen-e2 wireframe files (.gen-e2.wf). Use when creating wireframes, lo-fi mockups, screen sketches, device-specific layout diagrams, or multi-screen wireframe flows during product discovery. Triggers on: wireframe, lo-fi, mockup, screen sketch, multi-step screen flow, wireframe flow, screens in sequence.'
argument-hint: 'Describe the screen or flow to wireframe (e.g. "health check dashboard for desktop") and the target device (desktop / tablet / mobile). For multi-screen flows, describe the full user journey (e.g. "onboarding flow — 5 mobile screens in sequence").'
---

# Gen-e2™ Wireframe Skill

## When to Use
- Creating a new wireframe for a screen, flow, or feature concept during Discover
- Starting a lo-fi prototype to align the team before visual design
- Producing layout sketches to accompany journey maps or user flows
- Capturing device-specific layout decisions (desktop vs tablet vs mobile)
- **Creating multiple wireframes for a multi-step flow** — generates all `.gen-e2.wf` files in a subfolder plus a companion `.gen-e2.flow` that links them as a sequence of wireframe nodes

## Procedure

### 1. Gather Context
Before creating a wireframe, collect:
- **Screen / flow name**: What is being wireframed? (e.g. "Health Check Dashboard – Desktop")
- **Target device**: `desktop` (1440 × 900), `tablet` (768 × 1024), or `mobile` (390 × 844)?
- **Author and date**: Who owns this artefact?
- **Starting elements**: Any known sections, headers, cards, or navigation to include?

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If working from scratch, ask:
1. Which screen or user-facing surface is this?
2. Which device context matters most?
3. What are the primary sections or content areas?
4. Are there any navigation elements (header, footer, sidebar)?
5. Are there forms, cards, or data tables to sketch?
6. Are there linked journeys, personas, or flows to reference?

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/wf-guide.md](./references/wf-guide.md) for field guidance and component conventions
2. Read [./templates/wf.json](./templates/wf.json) for the canonical JSON schema and a full example
3. Create the file at the conventional path, replacing all `{{placeholder}}` values

**File path**: Place the file alongside existing wireframe artefacts, or follow the project's agreed folder structure. If no convention exists yet, use a name like `{NN}-{kebab-name}.gen-e2.wf` (e.g. `01-login.gen-e2.wf`) in a suitable folder.

### 4. Component Conventions
- The wireframe is a **node tree** under `root`, not a flat elements array
- Every node has `id`, `type`, optional `props`, and optional `children`
- Use container types (`page`, `frame`, `flex`, `grid`, `card`, `navbar`, `sidebar`, `tabs`, `modal`, `list`) for layout — they accept `children`
- Use leaf types (`text`, `button`, `input`, `image`, `icon`, `progress`, `divider`, `table`, `checkbox`, `radio`) for content — they do not accept `children`
- Set `text` `variant` prop to control visual size: `h1`–`h6` for headings, `body` for paragraphs, `caption` for helper text
- Set `button` `variant` to `primary`, `secondary`, `ghost`, `danger`, or `link`
- Use `{semantic.token.path}` syntax for spacing tokens in node `props` (e.g. `"gap": "{semantic.dimension.spacing.md}"`) — these are resolved from the linked DS file at render time and appear as read-only badges in the properties panel
- Add a top-level `"designSystem"` field with a workspace-relative path to a `.gen-e2.ds` file to apply a live token system to the wireframe (e.g. `"designSystem": "./tokens/brand.gen-e2.ds"`). The canvas re-renders automatically when the DS file is saved.
- Use `{{Placeholder Text}}` for all content values when generating from scratch so an LLM or the user can substitute domain copy
- **Never use empty `frame`, `flex`, or `container` nodes as spacers.** All spacing between siblings is expressed via the parent container's `gap` prop; internal padding is expressed via `padding`. Empty layout nodes exist only when they contain children.

### 5. Cross-Updates
After creating or updating a wireframe:
- Check if the corresponding journey map stage or flow node should link to this artefact
- Log new design assumptions in RAID (e.g. "Assumed 3-column grid layout for desktop")
- Update the product brief if new UI patterns reveal scope decisions

---

## Multi-Wireframe Flow Procedure

Use this procedure whenever the request describes **two or more screens in sequence** (e.g. an onboarding flow, a checkout journey, a settings wizard). The result is a subfolder of `.gen-e2.wf` files plus a companion `.gen-e2.flow` at the parent level that links them as wireframe nodes.

### Step A — Plan the Screen Inventory

Before creating any files:
1. List every screen in order and assign a sequential two-digit prefix (`01`, `02`, …)
2. Identify branching screens (alternate paths — e.g. "Sign In" vs "Sign Up") and note their position relative to the primary sequence
3. Choose a **kebab-name** for the flow (e.g. `onboarding-flow`, `checkout-flow`)

### Step B — File Layout

```
{phase-folder}/
  {NN}-{flow-name}/            ← wireframe subfolder
    01-{screen-a}.gen-e2.wf
    02-{screen-b}.gen-e2.wf
    ...
  {NN}-{flow-name}.gen-e2.flow ← companion flow (sibling of subfolder)
```

Example for a 3-screen mobile onboarding flow:
```
{flow-folder}/
  01-onboarding-flow/
    01-welcome.gen-e2.wf
    02-sign-up.gen-e2.wf
    03-home.gen-e2.wf
  01-onboarding-flow.gen-e2.flow
```

### Step C — Create the Wireframes

Create each `.gen-e2.wf` file inside the subfolder following the standard [Single Wireframe Procedure](#procedure) above.

> All wireframes in a flow should use the **same `viewport` dimensions** unless the request explicitly mixes device types.

### Step D — Create the Companion Flow

Load and follow the **`gen-e2-flow` skill** for all general flow authoring rules (meta, actors, edge kinds, handle conventions). Apply these wireframe-specific overrides:

- **`layout.direction`: always `"LR"`** for wireframe-only flows
- **Nodes: `"type": "wireframe"` only — no `start` or `end` nodes**
- `"isPrimary": true` on the main/happy-path screens; `false` on alternate-path screens
- Set `data.wfRef` relative to the flow file — because the flow is a sibling of the subfolder: `./{NN}-{flow-name}/{NN}-{screen}.gen-e2.wf`

#### Node Positioning (`data._pos`)

Pre-position every node so the canvas opens in a readable layout:

**Primary path:**
```
x = screenIndex × (viewport.width + 100)    // screenIndex starts at 0
y = 0
```

**Alternate-path nodes** (branches off the primary row):
```
x = branchPointIndex × (viewport.width + 100)   // same column as the branch source
y = viewport.height + 100
```

`viewport.width` and `viewport.height` come from the wireframe's `viewport` field (e.g. 390 × 844 for mobile).

### Step E — Cross-Updates
After creating the multi-wireframe flow:
- Link the flow from the corresponding journey map stage if one exists
- Log layout and navigation assumptions in RAID
- Update the product brief if new navigation patterns reveal scope decisions

---

## References
- [./references/wf-guide.md](./references/wf-guide.md) — component types, props, text variants, layout tips
- [./references/tokens.md](./references/tokens.md) — all 37 design tokens consumed by the canvas renderer, with purpose and which DS paths to populate
- [./references/icons.md](./references/icons.md) — available codicon names for the `icon` component
- [./templates/wf.json](./templates/wf.json) — canonical JSON template
