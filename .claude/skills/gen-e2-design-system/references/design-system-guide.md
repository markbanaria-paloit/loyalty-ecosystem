# Gen-e2™ Design System — Field Guide

## Purpose

The Design System file (`.gen-e2.ds`) stores design tokens in the [DTCG (Design Token Community Group)](https://design-tokens.github.io/community-group/format/) standard format. It is the single source of truth for all visual design decisions — colours, typography, spacing, shadows, motion, and opacity.

---

## Root Metadata Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `$schema` | string | Recommended | `https://www.designtokens.org/schemas/2025.10/format.json` |
| `name` | string | ✓ | Human-readable design system name |
| `version` | string | ✗ | Semantic version — e.g. `1.0.0`, `2.4.0` |
| `lastUpdated` | string | ✗ | ISO date `YYYY-MM-DD` |
| `description` | string | ✗ | Free text overview |

---

## Token Tree Structure

The file is an arbitrary-depth JSON tree. Nodes are either **folders** (plain objects) or **tokens** (objects containing `$type` or `$value`).

**Keys starting with `$`** are always token metadata — never folder names.

```
{
  "collection": {           ← folder
    "group": {              ← folder
      "token-name": {       ← token leaf
        "$type": "color",
        "$value": "#3b82f6",
        "$description": "Optional description"
      }
    }
  }
}
```

**Recommended collection structure:**

| Collection | Purpose |
|---|---|
| `core` | Primitive, source-of-truth values — never use aliases here |
| `semantic` | Contextual aliases that reference `core` tokens by path |
| `component` | Component-specific tokens (optional, for mature design systems) |

---

## Token Types and `$value` Shapes

### `color`
```json
{ "$type": "color", "$value": "#3b82f6" }
```
- Value: hex string (`#RRGGBB` or `#RRGGBBAA`), `rgb()`, `hsl()`, or alias
- Use lowercase hex for consistency

### `dimension`
```json
{ "$type": "dimension", "$value": { "value": 16, "unit": "px" } }
```
- Value: `{ value: number, unit: "px" | "rem" | "em" | "%" }`
- Used for spacing, sizing, border-radius, font-size

### `fontFamily`
```json
{ "$type": "fontFamily", "$value": "Inter, system-ui, sans-serif" }
```
- Value: CSS font-family string

### `typography`
```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": { "value": 16, "unit": "px" },
    "fontWeight": 400,
    "lineHeight": 1.5
  }
}
```
- Compound token — all four fields are expected

### `shadow`
```json
{
  "$type": "shadow",
  "$value": [
    {
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": 4, "unit": "px" },
      "blur":    { "value": 12, "unit": "px" },
      "spread":  { "value": 0, "unit": "px" },
      "color":   "#00000015"
    }
  ]
}
```
- Value: array of shadow layer objects (supports multi-layer shadows)

### `duration`
```json
{ "$type": "duration", "$value": { "value": 300, "unit": "ms" } }
```
- Value: `{ value: number, unit: "ms" | "s" }`
- Used for animation/transition durations

### `cubicBezier`
```json
{ "$type": "cubicBezier", "$value": [0.4, 0, 0.2, 1] }
```
- Value: `[x1, y1, x2, y2]` — four numbers representing a CSS cubic-bezier curve
- x1 and x2 must be in range [0, 1]

### `opacity`
```json
{ "$type": "opacity", "$value": 0.4 }
```
- Value: number in range `0` (fully transparent) to `1` (fully opaque)

### `border`
```json
{
  "$type": "border",
  "$value": {
    "width": { "value": 1, "unit": "px" },
    "style": "solid",
    "color": "#000000"
  }
}
```
- Value: `{ width: DimensionValue, style: string, color: string }`
- `style` is a CSS border-style keyword (e.g. `solid`, `dashed`, `dotted`)

### `gradient`
```json
{
  "$type": "gradient",
  "$value": {
    "type": "linear",
    "angle": 90,
    "stops": [
      { "color": "#3b82f6", "position": 0 },
      { "color": "#8b5cf6", "position": 1 }
    ]
  }
}
```
- Value: `{ type: "linear" | "radial", angle?: number, stops: Array<{ color: string, position: number }> }`

### `transition`
```json
{
  "$type": "transition",
  "$value": {
    "duration": { "value": 300, "unit": "ms" },
    "timingFunction": [0.4, 0, 0.2, 1]
  }
}
```
- Value: `{ duration: DimensionValue, timingFunction: [x1, y1, x2, y2] }`
- Combines a duration and easing curve into a single shorthand token

### `number`
```json
{ "$type": "number", "$value": 4 }
```
- Value: any numeric value (unitless)
- Used for z-index scales, font-weight integers, line-height multipliers, etc.

### `boolean`
```json
{ "$type": "boolean", "$value": true }
```
- Value: `true` or `false`
- Used for feature flags or conditional token switches

### `string`
```json
{ "$type": "string", "$value": "uppercase" }
```
- Value: any string that does not fit another type
- Used for text-transform, cursor values, or custom string constants

---

## Alias Syntax

Any `$value` can reference another token using dot-separated path wrapped in curly braces:

```json
{ "$type": "color", "$value": "{core.color.primitive.blue.500}" }
```

**Rules:**
- Path must use dot notation matching the exact JSON key path from root
- Aliases are not validated for resolution at schema level
- Circular aliases are not permitted (A → B → A)
- Alias keys starting with digits must be quoted in JSON but remain unquoted in alias strings: `{core.dimension.scale.16}`

---

## Naming Conventions

| Level | Convention | Example |
|---|---|---|
| Collection | lowercase single word | `core`, `semantic`, `component` |
| Category | lowercase single word | `color`, `dimension`, `typography` |
| Group | camelCase or kebab-case | `primitive`, `fontFamily`, `easeInOut` |
| Token name | camelCase or numeric | `canvas`, `500`, `primary` |

**Avoid:**
- Spaces in key names
- Keys starting with `$` (reserved for DTCG metadata)
- Deeply nested paths beyond 5 levels (harder to alias)

---

## Validation Rules

1. `name` at root must be a non-empty string
2. Every token leaf must have `$type`
3. `$type` must be one of: `color`, `dimension`, `fontFamily`, `typography`, `shadow`, `duration`, `cubicBezier`, `opacity`, `border`, `gradient`, `transition`, `number`, `boolean`, `string`
4. `$value` must match the shape for its `$type` (or be an alias string)
5. Alias strings must match pattern `{path.to.token}` (curly braces, dot-separated)
6. `opacity` values must be `0 ≤ n ≤ 1`
7. `cubicBezier` arrays must have exactly 4 elements
8. `border` value must have `width` (DimensionValue), `style` (string), and `color` (string)
9. `gradient` value must have `type` (`linear` or `radial`), optional `angle`, and a `stops` array
10. `transition` value must have `duration` (DimensionValue) and `timingFunction` (4-element array)

---

## Structural Guidance

**Primitive layer (core):**
- Define all raw values here — never use aliases
- Organise by type: `core.color`, `core.dimension`, `core.typography`, `core.shadow`, `core.motion`
- Use numeric scale keys for colour shades: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`

**Semantic layer:**
- Map component/context names to primitives using aliases
- Support light/dark mode by duplicating under `semantic.color.light` and `semantic.color.dark`
- Prefer semantic names: `background.canvas`, `text.primary`, `accent.primary`

**Component layer (optional):**
- Only add when primitives and semantics are stable
- Component tokens reference semantic tokens: `{semantic.color.light.background.canvas}`
