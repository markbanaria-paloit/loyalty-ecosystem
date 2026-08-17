# Flow Field Guide

## Node Kinds

| Kind | Purpose | Min | Max |
|------|---------|-----|-----|
| `start` | Entry point — triggered by user action or system event | 1 | 1 |
| `end` | Exit point — successful completion or terminal error | 1 | many |
| `action` | A discrete step: user action or system process | 1 | — |
| `decision` | A conditional branch — must have ≥ 2 outgoing edges. Up to 4 branches can exit cleanly (one per side). If two branches target nodes in the same direction they can share a side — ReactFlow separates the lines after the exit point. | 0 | — |
| `subflow` | Collapsed reference to another `.gen-e2.flow` file | 0 | — |
| `event` | An external or system-triggered event (webhook, timer, etc.) | 0 | — |
| `wireframe` | A screen linked to a `.gen-e2.wf` file — shows a scaled preview of the wireframe on the canvas | 0 | — |
| `note` | Contextual annotation — no edges required | 0 | — |

> **These are the only valid `type` values.** Any other string will fail schema validation.

## Edge Kinds

| Kind | Purpose | Visual |
|------|---------|--------|
| `normal` | Default sequential connection | Grey arrow |
| `success` | Positive / happy-path exit from a decision | Green arrow |
| `error` | Failure or validation rejection path | Red arrow |
| `timeout` | Time-based fallback path | Orange arrow |
| `callback` | Async return path (e.g. external system response) | Animated dashed blue |

## Edge Priority

| Priority | Meaning |
|----------|---------|
| `main` | Primary / happy path |
| `alt` | Secondary, error, or rarely-taken path |

## Edge Connection Points — sourceHandle and targetHandle

By default the editor auto-routes edges between nodes. Use `sourceHandle` and `targetHandle` to pin an edge to a specific side of a node when auto-routing produces a cluttered or misleading diagram.

| Value | Side of node the edge exits/enters |
|-------|------------------------------------|
| `right` | Right side — default exit for LR flows |
| `left` | Left side — used for back-edges (retry, loop) |
| `bottom` | Bottom side — used for TB flows or decision downward branch |
| `top` | Top side — used for upward escapes (error path going back, or TB inbound) |

### When to use them

Always set **both** `sourceHandle` and `targetHandle` on every edge. Without an explicit `targetHandle`, ReactFlow defaults to `"top"` regardless of actual node position, which produces incorrect routing.

The `targetHandle` is always the **opposite face** of `sourceHandle`:
- Exit `"right"` → enter `"left"`
- Exit `"bottom"` → enter `"top"`
- Exit `"top"` → enter `"bottom"`
- Exit `"left"` → enter `"right"` (back-edges in LR)

The only exception is **arcing back-edges in TB layout** where you want the edge to curve around the side of the target — use `targetHandle: "left"` or `"right"` instead of the direct opposite `"bottom"` to force the arc.

**Decision node branches** — the most common case. A decision in an LR layout exits right by default; use `sourceHandle` to send one branch to a different side:

```json
{ "from": "valid?", "to": "process",     "label": "Yes", "kind": "success", "priority": "main", "sourceHandle": "right" },
{ "from": "valid?", "to": "show-error",  "label": "No",  "kind": "error",   "priority": "alt",  "sourceHandle": "bottom" }
```

**TB layout** — set `sourceHandle: "bottom"` + `targetHandle: "top"` on every edge so they connect vertically rather than side-to-side:

```json
{ "from": "step-a", "to": "step-b", "priority": "main", "sourceHandle": "bottom", "targetHandle": "top" }
```

**Back-edge / retry loop** — the edge travels leftward against flow direction; pin the source to `left` and the target to `right` so it routes around the nodes cleanly:

```json
{ "from": "retry", "to": "start", "label": "Retry", "kind": "error", "sourceHandle": "left", "targetHandle": "right" }
```

**Async callback returning to a later node** — use `sourceHandle: "bottom"` or `"top"` to keep the callback edge visually separate from the main path.

### Multi-branch decisions (3+ outgoing edges)

A decision node has four sides, so up to four branches can exit without overlap. Assign sides by the spatial position of each branch's target — the same spatial rule applies:

| Branch direction | `sourceHandle` | `targetHandle` |
|-----------------|----------------|----------------|
| Same row (main path) | `"right"` | `"left"` |
| Node placed above | `"top"` | `"bottom"` |
| Node placed below | `"bottom"` | `"top"` |
| Back-edge / retry | `"left"` | `"right"` |

If two branches both target nodes in the same direction, they can share a `sourceHandle` — ReactFlow routes the individual lines separately after they leave the node.

### Spatial rule — always apply this first

> The `sourceHandle` must point **toward** the target node. The `targetHandle` is always the opposite face. Determine the spatial relationship **before** assigning handles.

**Predicting Dagre placement for decision branches (LR layout):**
- Both branches eventually converge at the same downstream node (e.g. `end`)
- The **longer branch** (more intermediate nodes) stays on the **main horizontal row**
- The **shorter branch** is placed **above** the main row by Dagre

Example: decision → [long: A → B → C → end] and [short: X → end] — X will be above the decision. Use `sourceHandle: "top"`, `targetHandle: "bottom"` for the short branch and `sourceHandle: "right"`, `targetHandle: "left"` for the long branch.

### Common patterns by layout

| Layout | Typical sequential edge | Branch toward same row | Branch toward node above | Branch toward node below | Back-edge / retry |
|--------|------------------------|------------------------|--------------------------|--------------------------|-------------------|
| `LR` | `sourceHandle: "right"`, `targetHandle: "left"` | `sourceHandle: "right"`, `targetHandle: "left"` | `sourceHandle: "top"`, `targetHandle: "bottom"` | `sourceHandle: "bottom"`, `targetHandle: "top"` | `sourceHandle: "left"`, `targetHandle: "right"` |
| `TB` | `sourceHandle: "bottom"`, `targetHandle: "top"` | `sourceHandle: "right"`, `targetHandle: "left"` | `sourceHandle: "top"`, `targetHandle: "bottom"` | `sourceHandle: "bottom"`, `targetHandle: "top"` | `sourceHandle: "top"`, `targetHandle: "left"` |

> **TB back-edge exception:** use `targetHandle: "left"` (not `"bottom"`) to force the arc around the side of the target node rather than entering from the top.

> **Tip:** handles are set automatically when you drag a new connection in the visual editor. Only set them by hand in JSON when constructing flows from scratch.

## Node Priority

| Priority | Meaning |
|----------|---------|
| `high` | Critical step — must not be skipped |
| `medium` | Important but not blocking |
| `low` | Optional enhancement |

## Layout Direction

| Value | Description |
|-------|-------------|
| `LR` | Left-to-right — best for sequential linear flows |
| `TB` | Top-to-bottom — best for hierarchical or decision-heavy flows |

**Choosing direction:** Use **TB** if the flow has ≥ 2 decision nodes or any parallel branches. Use **LR** only for straight, unbranching sequences of ≤ 8 steps with at most one decision. When uncertain, default to **TB**.

Each node may override auto-layout by storing `_pos` in its `data` field (see [Node `data` Field Reference](#node-data-field-reference) below). This is set automatically when the node is dragged in the visual editor.

## Node Notes

Any node can carry an optional `notes` string — freeform text for context, assumptions, or caveats that don't belong in the node label:

```json
{
  "id": "validate-form",
  "type": "action",
  "label": "Validate form",
  "notes": "Client-side validation only at MVP — server-side validation deferred to Phase 2."
}
```

Notes are editable directly in the properties panel. They are **not** displayed on the canvas node itself; they are surfaced only in the properties panel when the node is selected. Omit the field when there is nothing to add.

## Images in Nodes

Use the `images` array when a screenshot, mockup, or diagram meaningfully illustrates the step:

```json
"images": [
  {
    "label": "{{Screen label}}",
    "path": "{{../../relative/path/to/image.png}}"
  }
]
```

Paths are relative to the `.gen-e2.flow` file location. The editor resolves them to webview URIs automatically.

## Node References

Use `refs` to link a node to related discovery artefacts:

```json
"refs": {
  "personas":      ["01-discover/02-personas/{{NN}}-{{persona-kebab-name}}.gen-e2.persona"],
  "journeys":      ["01-discover/03-journeys/{{NN}}-{{journey-kebab-name}}.gen-e2.jm"],
  "a11yCriteria":  ["{{WCAG criterion}}"],
  "designSystem":  ["{{Design system component}}"],
  "tickets":       ["{{TICKET-ID}}"],
  "files":         ["{{path/to/any-related-file.gen-e2.ext}}"]
}
```

All ref values are paths or identifiers — they are rendered as clickable links in the properties panel. Use the categorised arrays (`personas`, `journeys`, etc.) when the ref type is known. Use `files` for any related gen-e2 artefact that doesn't fit a specific category — files added via the properties panel **Browse** button are placed here automatically.

## Actors

Actors represent who (or what) is responsible for a node. Always define actors in the top-level `actors` array before referencing them in nodes:

```json
"actors": [
  { "id": "{{actor-id}}",   "label": "{{Actor Label}}" },
  { "id": "system",         "label": "System" },
  { "id": "{{actor-id-2}}", "label": "{{Actor Label 2}}" }
]
```

Set `meta.defaultActor` to the actor ID that should be pre-selected when adding a new node.

## Subflow Nodes

Use `type: "subflow"` to reference another flow file. Use **`data.subflowRef`** for the path to the linked flow — this is what renders the "Open flow" button in the visual editor. Use `refs` for contextual cross-document links shown in the properties panel (personas, journeys, tickets, etc.).

> **`subflowRef` is a path relative to the current flow file**, not from the project root.
> If both flows are in `01-discover/05-flows/`, use `./{{NN}}-{{flow-kebab-name}}.gen-e2.flow`, not `01-discover/05-flows/{{NN}}-{{flow-kebab-name}}.gen-e2.flow`.

```json
{
  "id": "{{subflow-node-id}}",
  "type": "subflow",
  "label": "{{Subflow Label}}",
  "actor": "{{actor-id}}",
  "data": {
    "subflowRef": "./{{NN}}-{{subflow-kebab-name}}.gen-e2.flow"
  },
  "refs": {
    "journeys": ["01-discover/03-journeys/{{NN}}-{{journey-kebab-name}}.gen-e2.jm"]
  }
}
```

In the visual editor, clicking the "Open flow" button on the subflow node opens the file at `data.subflowRef`. The properties panel also provides a file-picker button to select the target flow; the resolved relative path is written back automatically — so prefer the file-picker over typing the path by hand.

## Wireframe Nodes

Use `type: "wireframe"` to embed a screen design directly on the flow canvas. The node renders a scaled, read-only preview of the linked `.gen-e2.wf` wireframe, styled with the wireframe's linked design system tokens (if any). This makes it easy to see what the screen looks like without leaving the flow.

> **`wfRef` is a path relative to the current flow file**, not from the project root.
> If the wireframe lives in `01-discover/06-wireframes/` and the flow is in `01-discover/05-flows/`, use `../06-wireframes/{{NN}}-{{screen-kebab-name}}.gen-e2.wf`.

```json
{
  "id": "{{wireframe-node-id}}",
  "type": "wireframe",
  "label": "{{Screen Name}}",
  "actor": "{{actor-id}}",
  "data": {
    "wfRef": "../06-wireframes/{{NN}}-{{screen-kebab-name}}.gen-e2.wf"
  }
}
```

In the visual editor, the properties panel provides a file-picker button to select the `.gen-e2.wf` file — the resolved relative path is written back automatically. Once linked, the extension resolves the wireframe's `designSystem` reference (if set) and injects the brand tokens so the preview reflects the correct colours.

## Node `data` Field Reference

The `data` field on a node is a freeform object. The following keys are recognised by the editor — all other keys are ignored.

### Universal keys (all node types)

| Key | Type | Purpose |
|-----|------|---------|
| `_pos` | `{ x: number; y: number }` | Pins the node at an explicit canvas coordinate and opts it out of Dagre auto-layout. Set automatically when the user drags a node or after running auto-layout. Cleared by a full auto-layout reset. **Do not set this by hand unless you want a fixed position.** |

### `subflow` node keys

| Key | Type | Purpose |
|-----|------|---------|
| `subflowRef` | `string` | Path to the linked `.gen-e2.flow` file, **relative to the current flow file's location**. Use `./{{NN}}-{{flow-kebab-name}}.gen-e2.flow` for files in the same folder, `../{{sibling-folder}}/{{NN}}-{{flow-kebab-name}}.gen-e2.flow` for files in a sibling folder. Renders the "Open flow" button on the node. Also settable via the file-picker in the properties panel, which writes the correct relative path automatically. |
### `wireframe` node keys

| Key | Type | Purpose |
|-----|------|------|
| `wfRef` | `string` | Path to the linked `.gen-e2.wf` file, **relative to the current flow file's location**. Prefer the file-picker in the properties panel — it writes the correct relative path automatically. Once set, the editor resolves the wireframe's linked design system (if any) and renders a scaled preview of the screen on the canvas node. |

> **Transient fields (do not set by hand):** `wfContent` and `wfTokens` are runtime fields injected by the extension when it loads the flow — they are never written to the `.gen-e2.flow` JSON file.
### `note` node keys

| Key | Type | Purpose |
|-----|------|---------|
| `width` | `number` (px) | Persisted width of the note card. Default: `160`. Set automatically when the user resizes the note. |
| `height` | `number` (px) | Persisted height of the note card. Default: `160`. Set automatically when the user resizes the note. |
| `color` | `'yellow' \| 'blue' \| 'green' \| 'pink' \| 'purple' \| 'orange' \| ''` | Background colour of the note. Omit or set to `''` for the default (theme-neutral) appearance. The last-used colour is remembered by the editor and pre-applied to new notes. |

**Example — a pre-coloured note with explicit size:**

```json
{
  "id": "{{note-node-id}}",
  "type": "note",
  "label": "{{Annotation text}}",
  "data": {
    "color": "yellow",
    "width": 200,
    "height": 120
  }
}
```

## Exemplar

A well-formed flow has:
- Exactly **one** `start` node
- All decision nodes with **≥ 2** outgoing edges
- A **primary path** marked with `isPrimary: true` and `priority: 'main'` edges
- At least **one** `end` node on a happy path
- `end` node(s) also on error/timeout paths where relevant
- Actors defined for every node (or a `defaultActor` set in meta)
- Layout direction appropriate for the flow's shape

Look for existing `.gen-e2.flow` files in the current project's `01-discover/05-flows/` folder to use as a reference.
