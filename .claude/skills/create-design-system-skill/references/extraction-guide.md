# Extraction Guide — Any Design Source → Structured Tokens

The source can be a Markdown file, a JSON token file, a URL, a pasted brand description, a CSS stylesheet, a Figma export, or the project's existing codebase. The extraction process adapts to what's available.

---

## Step 1 — Classify the Source

Before extracting, identify what kind of source you have and how structured it is:

| Source type | Signals | Extraction strategy |
|-------------|---------|--------------------|
| Structured design doc (Markdown with tables) | Color table, type scale table, spacing table | Read section by section (see sections below) |
| Design tokens JSON (`style-dictionary`, `theo`, W3C format) | `.tokens.json`, `tokens.json`, `design-tokens.json` | Parse `value` and `type` fields directly |
| CSS variables file | `:root { --token: value; }` | Extract all `--` declarations; infer roles from names |
| Tailwind config | `tailwind.config.js/ts`, `colors`, `spacing`, `fontSize` keys | Map Tailwind scale to token names |
| Figma export (JSON) | `fills`, `strokes`, `typography`, `effects` keys | Extract style values; ignore component-level data |
| Codebase with theme file | `theme.ts`, `tokens.ts`, `colors.swift`, `Color.kt`, etc. | Read existing constants; produce tokens.md from them |
| Verbal / pasted description | No file — user describes the brand | Ask clarifying questions (see below), then synthesize |
| URL | GitHub raw, public web page, hosted design doc | Fetch and classify; treat fetched content as above |

---

## Step 2 — Extract Colors

**Goal:** A flat list of named tokens, each with a value and a semantic role.

### From a structured Markdown doc
Look for tables with columns similar to `Token | Hex | Role` or `Name | Value | Usage`.  
There may be multiple sub-tables (Foundation, Brand, Status, Dark Scale, etc.) — collect all rows.

### From design tokens JSON (W3C / Style Dictionary)
```json
{ "color": { "brand": { "primary": { "$value": "#0071E3", "$type": "color" } } } }
```
Flatten the path into a token name: `color.brand.primary` → `brand-primary`.

### From CSS variables
```css
:root {
  --color-primary: #0071E3;  /* → token: primary */
  --ink: #1D1D1F;             /* → token: ink */
}
```
Strip `--color-` or `--` prefix; keep the rest as the token name.

### From a Tailwind config
```js
colors: { brand: { DEFAULT: '#0071E3', hover: '#0066CC' } }
```
Map: `brand.DEFAULT` → `brand`, `brand.hover` → `brand-hover`.

### From a verbal description
If the user says "our brand uses a deep navy (`#061B31`) on white, with a vivid violet accent (`#635BFF`)", synthesize tokens from those statements:
- `navy` → `#061B31` — deep dark surface / primary text
- `white` → `#FFFFFF` — canvas
- `violet` → `#635BFF` — primary accent / CTA

**Clarifying questions to ask if colors are missing:**
1. What is the primary background color?
2. What is the primary text color?
3. What color is used for CTAs/links/buttons?
4. Is there a hover/active state variant?
5. Are there any dark or inverse surfaces?

### Token naming rules
- Use lowercase hyphenated names: `brand-primary`, `text-muted`, `surface-elevated`
- Drop redundant brand-name prefix when it equals the design name: `apple-blue` → `blue`
- Keep numeric suffixes from design systems that use scales: `brand-500`, `gray-100`
- `rgba(...)` tokens: include as-is; note in role column that they are opacity-only, not a solid hex

---

## Step 3 — Extract Spacing

**Goal:** An ordered scale of named tokens with absolute values.

### From any source
Look for: spacing tables, a `spacing` key in config, `--space-*` CSS variables, or `EdgeInsets`/`padding` constants in code.

If the source only has component-level padding examples (e.g. `padding: 16px` in a button), infer the scale from the values that appear across multiple components. Common scales:

| Pattern | Scale |
|---------|-------|
| 4-based | 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| 8-based | 8, 16, 24, 32, 48, 64, 96 |
| 2-based (compact) | 2, 4, 8, 12, 16, 24, 32, 48, 64 |

Name sequentially regardless of source naming: `space-1`, `space-2`, etc.

**If no spacing scale is defined at all**, generate a 4-based scale and note it as synthesized.

---

## Step 4 — Extract Typography

**Goal:** A type scale table with size, weight, line-height, and letter-spacing per element.

### From a structured doc
Look for a table with columns: `Element | Size | Weight | Line Height | Letter Spacing | Color`.

### From CSS or config
```css
--font-size-hero: 80px;
--font-weight-hero: 600;
```
Group by element name or by usage description.

### From a Tailwind `fontSize` config
```js
fontSize: { hero: ['80px', { lineHeight: '1.02', letterSpacing: '-0.04em' }] }
```
Map each key to a type-scale row.

### From component examples only (no explicit scale)
Inspect CSS or code snippets for `font-size`, `font-weight`, `line-height`, `letter-spacing` values used across headings, body, and labels. Group distinct combinations into named levels.

**If no font stack is specified**, leave it empty in the generated tokens.md with a `<!-- TODO: specify font stack -->` comment.

---

## Step 5 — Extract Elevation / Shadows

**Goal:** Named shadow levels with their full shadow string.

Look for: `box-shadow` values in CSS, shadow constants in Swift (`NSShadow`, `.shadow()`), shadow in Compose (`elevation`), `BoxDecoration` in Flutter.

If the source has no elevation system, set elevation to `none` and note it. Never invent shadow levels.

---

## Step 6 — Extract Design Character / Constraints

**Goal:** 3–5 hard rules for the generated skill’s "Don’t" list.

Look for: a Do’s and Don’ts section, a "Design Principles" or "Guidelines" section, or brand tone descriptions.  
If the source has none, derive rules from the visual character:

| Character signal | Derived rule |
|-----------------|-------------|
| Dark-dominant theme | "Never use a light canvas on primary surfaces." |
| Pill-shaped buttons | "All CTAs must use the pill radius token; sharp corners are forbidden." |
| Low-drama shadows | "No heavy shadows; only the defined elevation levels are allowed." |
| Gradient-heavy brand | "Gradients are permitted only using the defined gradient tokens." |
| Gradient-free brand (Apple) | "No decorative gradients; only functional overlay scrims are permitted." |
| High-density UI | "Minimum spacing of `space-1`; never collapse to zero." |

---

## Step 7 — Produce Extraction Summary

Before generating files, output a brief summary for the user to confirm:

```
Design name:     [name]
Colors:          [N] tokens extracted
Spacing:         [N] steps ([min]px – [max]px)
Type scale:      [N] levels
Elevation:       [N] levels
Theme character: [light/dark]-dominant, accent=[#hex], density=[low/medium/high]
Hard rules:      [3–5 bullet points]
Source quality:  [complete / partial — spacing inferred / type scale synthesized]
```

If the source is partial, state what was inferred and why. The user can correct before files are written.

