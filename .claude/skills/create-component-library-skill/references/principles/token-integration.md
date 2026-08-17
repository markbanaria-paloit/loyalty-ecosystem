# Design Token Integration — Theming Rules

How every component consumes the design system: colors, typography, spacing, elevation, and shape. No component may contain hardcoded appearance values.

---

## The Cardinal Rule 🔴

**Never hardcode a color, font size, spacing value, or elevation literal.** Every appearance value is resolved from a semantic token at render time.

Hardcoded values:
- Break when themes change (dark mode, brand themes, dynamic color)
- Require find-and-replace across the codebase for design updates
- Cannot be overridden by the design system

---

## Token Resolution Order

When styling a component, resolve tokens in this priority order:

1. **Component-level token** — the design system defines a specific token for this component (e.g., `button.background.primary`)
2. **Semantic token** — a role-based token (e.g., `color.primary`, `color.surface`, `color.error`)
3. **Scale token** — a value from the spacing/radius/elevation scale (e.g., `spacing.md`, `radius.lg`)
4. ❌ **Raw literal** — a hex code, pixel value, or magic number → **never allowed**

---

## Color Tokens 🔴

### Semantic Color Roles

Components reference **intent**, not raw values. The exact role names vary by platform (these are based on Material Design 3 — see your platform guide for the equivalent names):

| Role | Usage |
|------|-------|
| `primary` | Primary brand action (buttons, links, FAB) |
| `onPrimary` | Content on primary surfaces |
| `surface` | Default background |
| `onSurface` | Content on surface |
| `surfaceContainer` | Elevated/nested backgrounds |
| `error` | Error states |
| `onError` | Content on error backgrounds |
| `outline` | Borders and dividers |
| `outlineVariant` | Subtle borders (works in dark mode) |

> **Note:** SwiftUI uses `primary`, `secondary`, `background`, `label`; CSS uses custom properties with project-specific naming. Always use your platform's semantic role vocabulary.

### Light & Dark Mode

- **Same token names** resolve to different values per theme — components use roles, the theme resolves actual colors
- **Never branch** on current theme to select colors (`if dark then X else Y` in component code is an anti-pattern)
- **Legitimate theme checks**: selecting between asset variants (illustration-light.svg vs illustration-dark.svg), not color picking

### Custom Tokens

When the design system needs a token not in the standard set:

1. Define it through the platform's extension mechanism (ThemeExtension, CompositionLocal, custom theme context property, Asset Catalog)
2. Provide variants for ALL required appearances: light, dark, high-contrast light, high-contrast dark
3. Access it through the same theme resolution path — never via a global constant

→ See loaded platform guide for the exact extension mechanism.

---

## Typography Tokens 🔴

### Type Scale Roles

Use semantic typography roles, never raw font sizes. The exact names vary by platform (these are based on Material Design 3 — see your platform guide for equivalents):

| Role | Typical Use |
|------|-------------|
| `displayLarge/Medium/Small` | Hero text, large numbers |
| `headlineLarge/Medium/Small` | Section headings |
| `titleLarge/Medium/Small` | Card titles, dialog titles |
| `bodyLarge/Medium/Small` | Paragraph text, descriptions |
| `labelLarge/Medium/Small` | Buttons, captions, badges |

### Text Scaling 🔴

- **All text must scale** with the user's system text-size preference. No exceptions for body content.
- Never set a fixed text size that ignores user preferences
- Use the platform's scaling unit (sp, dynamic type, `allowFontScaling`, etc.)
- `maxFontSizeMultiplier` / size caps are only acceptable for tiny, non-content elements (badges, icons) — never for readable text

### Custom Fonts

- Reference by semantic role, not by font family + size
- Register custom fonts through the platform's font system
- Use `relativeTo` or equivalent to inherit scaling behaviour

---

## Spacing Tokens 🟡

### The Scale

Define and use a consistent spacing scale throughout the app:

| Token | Value (illustrative) | Usage |
|-------|---------------------|-------|
| `xxs` | 2 | Minimal internal separation |
| `xs` | 4 | Tight internal padding |
| `sm` | 8 | Standard internal padding |
| `md` | 16 | Standard section spacing |
| `lg` | 24 | Section gaps |
| `xl` | 32 | Major section separation |
| `xxl` | 48 | Page-level margins |

> Use the project's actual spacing scale if defined. These values are a common baseline.

### Rules

- **Never use magic numbers**: `padding(16)` → `padding(Spacing.md)`
- **Never compute from screen dimensions**: no `screenWidth * 0.9` for content width. Use fill/stretch/maxWidth constraints.
- **Directional spacing**: Use `start`/`end` (not `left`/`right`) to support RTL layout mirroring
- **Consistent gap property**: Use the parent's gap/spacing mechanism for uniform child spacing (not margins on each child)

---

## Elevation & Shape Tokens 🟡

### Elevation Scale

| Token | Usage |
|-------|-------|
| `none` | Flat content |
| `sm` | Cards, tiles |
| `md` | Bottom sheets, dropdowns |
| `lg` | Dialogs, modals |
| `xl` | Popovers, tooltips |

### Dark Mode Elevation

Shadows become invisible on dark backgrounds. Strategy:

- Use **surface tint / surfaceContainer** roles that lighten with elevation
- Add `outlineVariant` borders for definition
- Never rely solely on shadows for visual hierarchy

### Border Radius

Use a radius scale (`none`, `sm`, `md`, `lg`, `full`) — never magic numbers like `borderRadius: 12`.

---

## Animation & Motion Tokens 🟡

Animation durations and easing curves are design tokens, not hardcoded values:

| Token | Typical Value | Usage |
|-------|--------------|-------|
| `duration.fast` | 100–150ms | Micro-interactions (hover, press) |
| `duration.normal` | 200–300ms | State transitions (show/hide, expand) |
| `duration.slow` | 400–500ms | Major transitions (page change, modal) |
| `easing.standard` | ease-in-out | Most transitions |
| `easing.enter` | ease-out | Elements appearing |
| `easing.exit` | ease-in | Elements disappearing |

### Rules

- **Never hardcode durations** — reference from the token scale
- **State-driven animation**: animations respond to state changes, not imperative triggers
- **Reduce-motion**: when system reduce-motion preference is on, set all durations to 0 or near-0. See accessibility-rules.md.
- **Layout animation**: when content changes (loaded → empty, list reorder), animate the transition. Use the platform's layout animation mechanism.

---

## Audit Checklist

Before shipping a component, verify:

- [ ] Zero hardcoded color literals (hex, rgb, named colors)
- [ ] Zero hardcoded font sizes
- [ ] Zero magic-number spacings
- [ ] All text scales with system font preferences
- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] Component renders correctly in high-contrast mode (if platform supports)
- [ ] Custom tokens defined with all required appearance variants
- [ ] Elevation is visible/functional in both light and dark modes
- [ ] Directional spacing uses `start`/`end`, not `left`/`right`
