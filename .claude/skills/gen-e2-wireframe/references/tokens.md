# Wireframe Design Tokens Reference

The wireframe canvas consumes tokens from a linked `.gen-e2.ds` file. All tokens are injected as CSS custom properties (`--token-{hyphenated-path}`) on the canvas wrapper and are also available for resolution in node `props` via `{token.path}` syntax.

Tokens follow the DTCG naming convention: `collection.category.group.name`.

---

## Semantic — Background

| Token path | CSS property applied to |
|---|---|
| `semantic.color.light.background.canvas` | Page node background; canvas area behind the device frame |
| `semantic.color.light.background.surface` | Card fill; tab content area; checkbox and radio control fill |
| `semantic.color.light.background.subtle` | Sidebar background; table header row; empty-container fill |
| `semantic.color.light.background.sunken` | Deeper recessed fill on empty containers |

## Semantic — Text

| Token path | CSS property applied to |
|---|---|
| `semantic.color.light.text.primary` | General text; table headers; form labels; input foreground |
| `semantic.color.light.text.secondary` | Table cell text; footer / secondary labels |
| `semantic.color.light.text.tertiary` | Empty-container hints; image placeholder label; input placeholder |

## Semantic — Border

| Token path | CSS property applied to |
|---|---|
| `semantic.color.light.border.default` | Standard borders — tabs, table rows, image frames, checkbox, radio |
| `semantic.color.light.border.muted` | Divider line colour; progress bar track background; sidebar right border; empty-container dashed outline |
| `semantic.color.light.border.brand` | Selected-node highlight ring (2 px solid) |

## Semantic — Accent

| Token path | CSS property applied to |
|---|---|
| `semantic.color.light.accent.primary` | Radio dot fill; image-placeholder diagonal stripe tint |

## Core — Shadow

| Token path | CSS property applied to |
|---|---|
| `core.shadow.lg` | Drop shadow on the selected node |

---

## Semantic — Dimension (spacing scale)

These are the tokens intended for use directly in node **`props`** (`gap`, `padding`) via `{semantic.dimension.spacing.X}` syntax. They are resolved at render time and applied as CSS `gap` and `padding` on container nodes.

> **`$value` format**: dimension tokens must use the DTCG structured object — **not** a plain CSS string.
> `{ "$type": "dimension", "$value": { "value": 16, "unit": "px" } }` — ✅ correct
> `{ "$type": "dimension", "$value": "16px" }` — ❌ will trigger `INVALID_DIMENSION_VALUE` warnings

| Token path | Resolved CSS value | Typical use in node props |
|---|---|---|
| `semantic.dimension.spacing.xs` | `4px` | Tight gaps between icons |
| `semantic.dimension.spacing.sm` | `8px` | Compact button-group or tag-row gaps |
| `semantic.dimension.spacing.md` | `16px` | Default card padding; flex container gap |
| `semantic.dimension.spacing.lg` | `24px` | Section-level gaps; hero frame gap |
| `semantic.dimension.spacing.xl` | `40px` | Page-level padding |

---

## Component — Navigation

| Token path | CSS property applied to |
|---|---|
| `component.navigation.header.background` | Navbar (`wf-el-navbar`) background |
| `component.navigation.header.title` | Navbar text and icon colour |
| `component.navigation.tabBar.background` | Tab bar strip background |
| `component.navigation.tabBar.activeColor` | Active tab bottom-border indicator and text colour |
| `component.navigation.tabBar.inactiveColor` | Inactive tab text colour |

## Component — Card

| Token path | CSS property applied to |
|---|---|
| `component.card.background` | Card fill |
| `component.card.border` | Card border shorthand (e.g. `1px solid #e2e8f0`) |
| `component.card.borderRadius` | Card corner radius |
| `component.card.shadow` | Card drop shadow |

## Component — Button

| Token path | CSS property applied to |
|---|---|
| `component.button.primary.background` | Primary button fill |
| `component.button.primary.text` | Primary button label colour |
| `component.button.primary.borderRadius` | Primary button corner radius |
| `component.button.primary.shadow` | Primary button glow / shadow |
| `component.button.secondary.background` | Secondary button fill |
| `component.button.secondary.border` | Secondary button border shorthand |
| `component.button.secondary.text` | Secondary button label colour |
| `component.button.secondary.borderRadius` | Secondary button corner radius |
| `component.button.ghost.text` | Ghost and link button text colour |
| `component.button.danger.background` | Danger button fill |
| `component.button.danger.text` | Danger button label colour |

## Component — Input

| Token path | CSS property applied to |
|---|---|
| `component.input.border` | Input field border shorthand |
| `component.input.background` | Input field fill |
| `component.input.borderRadius` | Input field corner radius |

---

## Notes

- **Total: 37 tokens** consumed by the canvas renderer.
- All tokens have VS Code theme fallbacks (`var(--vscode-*)`) so the canvas renders correctly even without a linked DS file.
- Token paths use dot-separated notation. camelCase segments (e.g. `tabBar`) are converted to kebab-case for the CSS custom property (`--token-component-navigation-tab-bar-background`).
- **`dimension` `$value` must be `{ value: number, unit: string }` — never a plain CSS string like `"16px"`.** The "Resolved CSS value" column above shows what the renderer produces from the token, not the `$value` shape to write in the DS file.
- `borderRadius` tokens (card, button, input) are also `$type: dimension` and must use the same `{ value, unit }` format.
- The `$type` for colour tokens should be `color`; shadow tokens should be `shadow`.
- Component tokens (`component.*`) may use alias syntax to reference semantic tokens — e.g. `"$value": "{semantic.color.light.background.surface}"`.
