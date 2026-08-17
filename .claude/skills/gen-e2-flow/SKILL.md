---
name: gen-e2-flow
description: 'Create or update Gen-e2 user flow files (.gen-e2.flow). Use when designing user flows, interaction diagrams, decision trees, screen flows, or mapping subflows during product discovery.'
argument-hint: 'Describe the flow (e.g. onboarding, checkout, data upload) and any known actors or starting/ending conditions'
---

# Gen-e2™ Flow Skill

## When to Use
- Creating a new user flow or interaction diagram during the Discover phase
- Updating an existing flow with new screens, decisions, or actors
- Mapping a subflow branched from a parent flow
- Visualising error paths, timeout conditions, or callback routes

## Procedure

### 1. Gather Context
Before creating a flow, collect:
- **Flow name and scope**: What is being mapped? (e.g. "MVP Onboarding", "Data Upload – Error Path")
- **Actors**: Who (or what) participates? (user, system, GP portal, etc.)
- **Entry condition**: What triggers this flow?
- **Exit condition**: What does completion look like?
- **Direction**: Derive from flow complexity — use **TB** if the flow has ≥ 2 decision nodes or any parallel branches; use **LR** only for straight, unbranching sequences of ≤ 8 steps with at most one decision. When uncertain, default to **TB**.

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If working from scratch, ask the team:
1. Where does this flow begin? (trigger or start node)
2. What steps does the user take in sequence?
3. Where are the decision points? What conditions lead each way?
4. Are there any error, timeout, or callback paths?
5. Which steps are the most important / primary path?
6. Are there any sub-processes that should be collapsed into a subflow node?
7. Which actors are involved and at which steps?
8. What related artefacts exist? (personas, journeys, tickets, design system)

### 3. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/flow-guide.md](./references/flow-guide.md) for field guidance, node kinds, edge kinds, and evidence standards
2. Read [./templates/flow.json](./templates/flow.json) for the canonical JSON schema
3. Create the file populated with the gathered context — replacing all `{{placeholder}}` values

**File path**: Place the file alongside existing flow artefacts, or follow the project's agreed folder structure. Flows can appear in any phase folder depending on scope — alongside discovery artefacts for problem-space flows, or alongside concept artefacts for design-specific flows. If the repo already has flows at a different path, place the new file alongside existing ones.

### 4. Node Conventions

> **Valid `type` values**: `start`, `end`, `action`, `decision`, `subflow`, `event`, `wireframe`, `note`. These are the only accepted values — any other string will fail schema validation.

- Every flow must have exactly one `start` node and at least one `end` node
- Decision nodes must have at least two outgoing edges (one per branch). There is no upper limit — a decision can have 3 or 4 branches. Assign each branch a **different `sourceHandle` side** for visual clarity; with four sides available, up to four branches can exit cleanly without overlap. If two branches unavoidably target nodes in the same direction, they can share a side — ReactFlow separates the lines after the exit point.
- `subflow` nodes link to another `.gen-e2.flow` file via `data.subflowRef` (renders the "Open flow" button); use `refs` for contextual cross-document links (personas, journeys, tickets) shown in the properties panel only
- `wireframe` nodes link to a `.gen-e2.wf` file via `data.wfRef` — the extension renders a scaled, read-only preview of the screen on the canvas, styled with the wireframe's linked design system tokens. Prefer the file-picker in the properties panel to set the path; it writes the correct relative path (relative to the flow file, not the project root) automatically
- `note` nodes are floating annotations — they need no edges. Use `data.color` (`'yellow'`, `'blue'`, `'green'`, `'pink'`, `'purple'`, `'orange'`) to colour-code them, and `data.width` / `data.height` to pre-set their size (default: `160 × 160`)
- Use `isPrimary: true` on the main/happy path nodes
- Use `priority: 'high'` on critical user actions
- Add `images` only when a screenshot or mockup meaningfully illustrates the step
- Use `sourceRef` to trace a node back to one or more source artefacts (test recordings, specifications, database records, source files). The properties panel renders each entry as a **"View source"** action. Add multiple entries when a node is derived from more than one source. The `selector` uses the natural format for the source type:
  - XML → XPath expression (e.g. `//Step[@Method='SaveNewBusiness']`)
  - JSON → JSONPath expression (e.g. `$.steps[?(@.method=='submit')]`)
  - Source code → GitHub fragment notation (e.g. `#L42-L89`)
  - DB record → a filter expression (e.g. `WHERE JobID = 'DIRDEBIT'`)
  - Include the optional `count` field when the occurrence count is meaningful (e.g. a test step executed 59 times in a recording).

### 5. Edge Conventions
- Use `kind: 'success'` for happy-path exits from decision nodes
- Use `kind: 'error'` for failure/validation paths
- Use `kind: 'timeout'` for time-based fallbacks
- Use `kind: 'callback'` for async return paths (animated in the editor)
- Set `priority: 'main'` on the primary path edges

#### Handle Rules by Layout

> **Spatial rule — this is the primary rule.** Before assigning handles, determine which direction the target node will be placed relative to the source. The `sourceHandle` must point **toward** the target; the `targetHandle` is always the **opposite face** (e.g. exit `"right"` → enter `"left"`; exit `"top"` → enter `"bottom"`). Always set both — without an explicit `targetHandle`, ReactFlow defaults to `"top"` regardless of actual node position.

> **Handle pairing rule:** `sourceHandle` and `targetHandle` are always mirror opposites for straight connections. The only exception is arcing back-edges where you deliberately want the edge to curve around the side of the target — set `targetHandle: "left"` or `"right"` instead of the direct opposite to force the arc.

**Multi-branch decisions (3+ outgoing edges):**
A decision node has four sides, so up to four branches can exit cleanly. Assign sides by the spatial position of each target — apply the same spatial rule as always:

| Branch | `sourceHandle` | `targetHandle` |
|--------|----------------|----------------|
| Main path (same row) | `"right"` | `"left"` |
| Short alt path (above) | `"top"` | `"bottom"` |
| Error / below path | `"bottom"` | `"top"` |
| Back-edge / retry | `"left"` | `"right"` |

If two branches target nodes in the same direction, they can share a `sourceHandle` — ReactFlow routes the lines separately after the exit point.

**Predicting Dagre placement for decision branches (LR layout):**
Dagre places nodes on ranked columns. When a decision node has two branches that both converge at the same end node:
- The **longer branch** (more intermediate nodes) stays on the **main horizontal row**
- The **shorter branch** is placed **above** the main row

So for a decision → [long path: A → B → C → end] and [short path: X → end], the short path X will be above. Use `sourceHandle: "top"`, `targetHandle: "bottom"` to reach X, and `sourceHandle: "right"`, `targetHandle: "left"` (or `sourceHandle: "bottom"`, `targetHandle: "top"`) to reach A.

**TB layout**
- Sequential edges: `sourceHandle: "bottom"`, `targetHandle: "top"`
- Branch toward node to the right: `sourceHandle: "right"`, `targetHandle: "left"`
- Branch toward node to the left: `sourceHandle: "left"`, `targetHandle: "right"`
- Branch toward node below: `sourceHandle: "bottom"`, `targetHandle: "top"`
- Back-edges (retry loops going upward): `sourceHandle: "top"`, `targetHandle: "left"` (arcs around the left side)

**LR layout**
- Sequential edges: `sourceHandle: "right"`, `targetHandle: "left"`
- Decision branch toward node in same row: `sourceHandle: "right"`, `targetHandle: "left"`
- Decision branch toward node placed above: `sourceHandle: "top"`, `targetHandle: "bottom"`
- Decision branch toward node placed below: `sourceHandle: "bottom"`, `targetHandle: "top"`
- Back-edges (retry loops going leftward): `sourceHandle: "left"`, `targetHandle: "right"`

### 6. Cross-Updates
After creating/updating a flow:
- Check if the journey map has a matching stage — flows are typically scoped to one journey stage
- Check if the service blueprint needs a new system/support lane for automation steps
- Log any new assumptions in RAID (e.g. assumed system behaviour in error paths)
- Update architecture if new services or integrations are revealed

## Reference
See [./references/flow-guide.md](./references/flow-guide.md) for the flow field guide and exemplar.
