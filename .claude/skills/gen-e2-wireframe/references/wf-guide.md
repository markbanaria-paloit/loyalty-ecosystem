# Wireframe Field Guide

## Document Structure

Every `.gen-e2.wf` file has three required top-level keys and one optional one:

| Key | Required | Purpose |
|-----|----------|---------|
| `meta` | Yes | Ownership and version metadata |
| `viewport` | Yes | Target device dimensions |
| `designSystem` | No | Workspace-relative path to a `.gen-e2.ds` token file (e.g. `"./tokens/brand.gen-e2.ds"`). When set, the editor resolves the DTCG token tree and applies tokens to the canvas at render time. |
| `root` | Yes | Hierarchical component tree — the single root node |

---

## `meta` Fields

| Field | Required | Format | Guidance |
|-------|----------|--------|----------|
| `title` | Yes | Free text | Screen or surface name — be specific (e.g. "Health Check Dashboard – Desktop v1") |
| `owner` | No | Name or handle | Person responsible for this artefact |
| `date` | No | ISO 8601 (`"2025-04-09"`) | Creation or last-update date |
| `version` | No | Free text (e.g. `"v1.0"`) | Increment when layout changes significantly |

---

## `viewport` Fields

| Field | Required | Notes |
|-------|----------|-------|
| `device` | No (validated as warning) | `"desktop"` \| `"tablet"` \| `"mobile"` |
| `width` | Yes | Canvas width in pixels |
| `height` | Yes | Canvas height in pixels |

### Standard Presets

| Device | Width | Height |
|--------|-------|--------|
| `desktop` | 1440 | 900 |
| `tablet` | 768 | 1024 |
| `mobile` | 390 | 844 |

---

## `root` — Component Node Tree

The wireframe is a **tree of component nodes**. Each node has:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Unique string within the document |
| `type` | Yes | Component type (see table below) |
| `props` | No | Key-value map of visual properties |
| `children` | No | Array of child nodes (containers only) |

### Component Types

#### Containers (support `children`)

| Type | Use For | Key Props |
|------|---------|----------|
| `page` | Root layout frame | `padding` |
| `frame` | Generic layout section | `direction` (`row`\|`column`), `gap`, `padding`, `justify`, `align`, `width`, `height` |
| `container` | Generic flex box (JSON only — not in toolbar) | `direction` (`row`\|`column`), `gap`, `padding`, `justify`, `align`, `width`, `height` |
| `flex` | Row or column flex container | `direction` (`row`\|`column`), `gap`, `padding`, `justify`, `align`, `width`, `height` |
| `grid` | Multi-column grid | `columns`, `gap`, `padding`, `width`, `height` |
| `navbar` | Top navigation bar | `justify`, `links` (array of link labels — metadata only, not visually rendered) |
| `sidebar` | Side navigation panel | `width`, `height` |
| `card` | Content card | `padding`, `gap`, `width`, `height` |
| `tabs` | Tabbed content area | `count`, `width`, `height` |
| `modal` | Overlay dialog | `padding`, `gap`, `width`, `height` |
| `list` | Ordered/unordered list container | `direction` (`row`\|`column`), `gap`, `width`, `height` |

#### Leaf Components (no `children`)

| Type | Use For | Key Props |
|------|---------|----------|
| `text` | Headings and body copy | `variant` (`h1`–`h6`, `body`, `caption`), `align` (`left`, `center`, `right`, `justify`), `content` |
| `button` | Actions | `variant` (`primary`, `secondary`, `ghost`, `danger`, `link`), `label` |
| `input` | Form fields | `type` (`text`, `email`, `password`, `number`, `tel`, `url`, `search`, `textarea`), `placeholder` |
| `image` | Image placeholder | `aspectRatio`, `label`, `width`, `height` |
| `icon` | Icon glyph | `name` — see [icons.md](./icons.md) for valid values |
| `progress` | Step or load progress bar | `value` (0–100, default 50), `height` (px, default 8), `color` (CSS/token value — defaults to accent token) |
| `divider` | Horizontal or vertical rule | `orientation` (`horizontal` \| `vertical`, default `horizontal`) |
| `table` | Data table preview | `columns`, `rows` |
| `checkbox` | Boolean option | `label` |
| `radio` | Single-select option | `label` |

### Text Variants

| Variant | Rendered Size | Typical Use |
|---------|--------------|-------------|
| `h1` | 26 px bold | Page title |
| `h2` | 20 px bold | Section title |
| `h3` | 16 px bold | Card heading |
| `h4` | 14 px bold | Subsection heading |
| `h5` | 13 px bold | Small heading |
| `h6` | 11 px bold | Eyebrow / label |
| `body` | 12 px | Normal body text |
| `caption` | 10 px | Helper text, copyright |

### Design Token References

Use `{semantic.token.path}` syntax in any `props` value to reference a design token. Token values are displayed as read-only badges in the properties panel.

When the wireframe has a `designSystem` field pointing to a `.gen-e2.ds` file, the editor resolves all token references using that file's DTCG token tree. Token paths must match the dot-separated path in the DS file (e.g. `"{semantic.spacing.component.padding.md}"` resolves to `"16px"` in the Pawlicy DS).

Common tokens (fallback built-ins, always available without a DS file):
- Spacing: `{semantic.dimension.spacing.sm}`, `.md`, `.lg`, `.xl`
- Colour: `{semantic.color.light.background.canvas}`

---

## Layout Tips

- **Always start with `page` as root**: it establishes the canvas boundary at `viewport.width × viewport.height`
- **`flex` + `direction: row`** for horizontal strips (navbar items, button groups, stat rows)
- **`grid` + `columns: N`** for even multi-column layouts (feature cards, stat tiles)
- **`sidebar` + `frame` inside a row `flex`** for the classic sidebar + main-content layout
- **Consistent spacing**: prefer design tokens (`{semantic.dimension.spacing.*}`) over hard-coded pixel numbers
- **Labels on containers**: containers render their `type` name as a small label — no extra `text` node needed for section headings on layout containers

### Spacing Anti-Pattern — never use empty frames as spacers

> **Do not insert empty `frame`, `flex`, or `container` nodes solely to push content apart.** Spacing between siblings is always controlled by the parent container's `gap` prop; spacing inside a container is controlled by `padding`.

| Instead of… | Use… |
|-------------|------|
| Empty `frame` between two buttons | `gap` on the parent `flex` |
| Empty `frame` at top of a card for top padding | `padding` on the `card` |
| Nested `frame` just to add margin around a child | `padding` on the parent container |

Example — correct:
```json
{ "id": "actions", "type": "flex", "props": { "direction": "row", "gap": "{semantic.dimension.spacing.md}" },
  "children": [
    { "id": "btn-cancel", "type": "button", "props": { "label": "Cancel", "variant": "ghost" } },
    { "id": "btn-submit", "type": "button", "props": { "label": "Submit", "variant": "primary" } }
  ]
}
```

Example — **wrong** (empty spacer frame):
```json
{ "id": "actions", "type": "flex", "props": { "direction": "row" },
  "children": [
    { "id": "btn-cancel", "type": "button", "props": { "label": "Cancel", "variant": "ghost" } },
    { "id": "spacer", "type": "frame", "props": { "width": 16 } },
    { "id": "btn-submit", "type": "button", "props": { "label": "Submit", "variant": "primary" } }
  ]
}
```

---

## Naming Convention

`{NN}-{kebab-description}.gen-e2.wf`

Examples:
- `01-home-screen-mobile.gen-e2.wf`
- `02-health-check-dashboard-desktop.gen-e2.wf`
- `03-onboarding-step1-tablet.gen-e2.wf`

