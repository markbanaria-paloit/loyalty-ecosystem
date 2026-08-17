# Output Specification — Generated Design System Skill Files

All generated files follow fixed structural patterns. Substitute extracted values in place of `[PLACEHOLDER]` markers.

The generated skill always contains `tokens.md` (universal) + one reference file per detected stack. See [stack-detection.md](./stack-detection.md) for which stacks are detected and how.

---

## File 1: `references/tokens.md`

**Purpose:** Single source of all design tokens. Loaded by every stack reference.  
**Constraint:** No implementation details — only token names, values, and roles.

````markdown
# [Design Name] — Universal Token Reference

All design tokens used across every tech stack in this project.
**Every implementation must map to one of these tokens. No exceptions.**

---

## Color Tokens

| Token name | Value | Role |
|------------|-------|------|
| `[token-1]` | `#XXXXXX` | [role] |
| `[token-2]` | `#XXXXXX` | [role] |

These [N] values are the complete palette. Do not use any other color value.

---

## Spacing Tokens

| Token | Value |
|-------|-------|
| `space-1` | `[N]px` |
| `space-2` | `[N]px` |

Do not use spacing values outside this scale.

---

## Typography Scale

| Element | Size | Weight | Line-height | Letter-spacing |
|---------|------|--------|-------------|----------------|
| [element] | [Npx] | [N] | [X] | [Xem or 0] |

Do not interpolate intermediate sizes.

---

## Elevation

| Level | Value |
|-------|-------|
| [name] | `[shadow string]` |
````

**Population rules:**
- Include all color groups in one flat table; add a heading comment if groups are meaningful (e.g. `<!-- Status colors -->`)
- If both light and dark palettes exist, add a second `## Dark Theme Color Tokens` section
- `rgba(...)` opacity tokens: include as-is with a note in the role column

---

## File 2: `references/<stack>.md` (one per detected stack)

**Filename:** Use the identifier from [stack-detection.md](./stack-detection.md), e.g. `flutter-dart.md`, `react.md`, `swift-swiftui.md`.

**Purpose:** Stack-specific rules. Every rule must be actionable in the target language/framework.  
**Constraint:** Rules must reference `tokens.md` names, not raw values. No raw hex, no raw numbers.

### Required sections (all stacks)

````markdown
# [Design Name] — [Stack Display Name] Reference

Apply these rules to every [stack file extension(s)] file that contains UI code.

---

## Token Mapping — Colors

[How to reference color tokens in this stack: named constants, CSS vars, theme values, etc.]

For each token, identify:
- **Palette constant** — the typed constant / CSS variable / asset that *defines* the value (e.g. `AppColors.primary`, `--color-primary`, `Color.brandPrimary`)
- **Theme/system API slot** — how components *consume* the color (e.g. `colorScheme.primary`, `var(--color-primary)`, `MaterialTheme.colorScheme.primary`)

If the stack has a theming layer (Material, SwiftUI environment, CSS custom properties, design tokens runtime), always prefer the theme API in component/widget code. Use palette constants **only** for tokens that have no theme API equivalent.

| Token | Palette constant | Theme API slot (widget use) |
|-------|-----------------|-----------------------------|
| `[token-1]` | `[palette-constant]` | `[theme.slot]` |
| `[token-2]` | `[palette-constant]` | `— (use palette constant directly)` |

### Forbidden patterns

```[lang]
// ❌ Never — raw value
[example of forbidden raw color in this stack]

// ❌ Never — palette constant in component code when a theme slot exists
[example of palette constant used directly in a component]

// ✅ Correct — theme API for mapped tokens
[example of correct theme API access]

// ✅ Correct — palette constant only for unmapped tokens (e.g. status/accent)
[example of direct palette constant for a token with no theme slot]
```

---

## Token Mapping — Spacing

[How to reference spacing tokens in this stack]

| Token | [Stack] equivalent | Value |
|-------|-------------------|-------|
| `space-1` | `[reference]` | `[N]` |

```[lang]
// ❌ Forbidden — arbitrary value
[example]

// ✅ Correct
[example]
```

---

## Token Mapping — Typography

[How to reference type-scale tokens in this stack]

| Scale | [Stack] equivalent |
|-------|-------------------|
| [element] | `[reference]` |

```[lang]
// ❌ Forbidden — raw TextStyle / inline font
[example]

// ✅ Correct
[example]
```

---

## Theme & System Integration

[Stack-specific guidance for how tokens plug into the framework's theming system.]

This section must answer three questions:
1. **How are palette constants defined?** (e.g. `AppColors`, CSS `:root` vars, `Color.kt`, `Assets.xcassets`)
2. **How is the theme assembled?** (e.g. `ThemeData`, `tailwind.config`, `MaterialTheme`, SwiftUI `environment`)
3. **How do components consume colors?** — This is the key rule: components must read from the theme API, not from palette constants, for every token that has a theme slot. Palette constants in component code are only valid for tokens with no theme slot.

[Include the correct pattern for consuming theme colors vs. using palette constants, and list which tokens (if any) are only available as palette constants.]

---

## Self-Audit Checklist

Before finalizing any [stack] UI file:

1. [ ] No raw color values — every color references a token
2. [ ] Theme-first: all tokens with a theme API slot are consumed via the theme (e.g. `colorScheme.*`, `var(--token)`, `MaterialTheme.*`) — never via palette constants in component code
3. [ ] Palette constants used directly only for tokens explicitly marked with no theme slot (status, accent, etc.)
4. [ ] No arbitrary spacing values — all spacing from the token scale
5. [ ] No raw font constructions — only named type-scale references with color overrides only
6. [ ] No component style overrides that the framework theme already handles
7. [ ] [Design-specific rule 1 from Don'ts]
8. [ ] [Design-specific rule 2 from Don'ts]
````

---

## Stack-Specific Additions per Stack

→ Load [stack-patterns.md](./stack-patterns.md)

When generating a `<stack>.md` reference file, load `stack-patterns.md` and apply only the section(s) matching the detected stack(s). Do not load all sections at once.

---

## File 3: `SKILL.md` (generated dispatcher)

**Constraint:** `description` ≤ 1024 characters, must be YAML-quoted (contains colons).

````markdown
---
name: [design-name]-design-system
description: "Use when writing, reviewing, or auditing any UI code for this project. Enforces the [Design Name] Design System: color tokens, typography scale, spacing tokens, component patterns, elevation, and layout. Load before creating any screen, component, or style. Use when: building screens, updating themes, adding widgets, styling components, reviewing design token usage, auditing for off-palette colors or wrong spacing."
---

# [Design Name] Design System Skill

This skill enforces the [Design Name] Design System across all tech stacks used in this project.

## Procedure

Before writing **any** UI code:

1. Identify the tech stack for the file being created or edited.
2. Load the matching reference:
[for each stack reference file generated:]
   - **[Stack display name]** → [[stack].md](./references/[stack].md)
3. Load the universal token table → [tokens.md](./references/tokens.md)
4. Apply the rules from the reference exactly. Do not invent values.
5. After writing code, self-audit using the checklist in the relevant reference.

## Hard Rules (apply to all stacks)

- **Never invent a color.** Every color must map to a named token in [tokens.md](./references/tokens.md).
- **Never use arbitrary spacing.** Every spacing value must come from the token scale.
- **Never use arbitrary font sizes or weights.** Match the type scale exactly.
- **Theme first, palette as fallback.** For stacks with a theming system (Flutter `colorScheme`, Compose `MaterialTheme`, SwiftUI `Color` asset catalog, etc.), always read colors through the theme API. Use raw token constants (e.g. `AppColors.*`) only for tokens that have no semantic slot in the theme (status colors, accent colors). Never use raw token constants in widget/component code for tokens that are mapped to the theme.
- [Design-specific rule 1 from Don'ts]
- [Design-specific rule 2 from Don'ts]
````

**Population rules:**
- The Procedure section step 2 lists one bullet per generated stack reference file
- Add 2–3 design-specific Hard Rules from the source’s Don’ts (e.g. “No decorative gradients”, “Use [accent-token] for all CTAs”, “Never use light canvas on dark surfaces”)
- `name` must exactly match the folder name
