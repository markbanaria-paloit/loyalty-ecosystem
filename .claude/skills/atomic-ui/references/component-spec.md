# Component Spec Format

Every component you output — Atom, Molecule, Organism, Template, or Page — must use this exact spec format. Populate every section; never omit one.

---

## Format Template

````markdown
### Component: [Name] — [Level: Atom / Molecule / Organism / Template / Page]

**Purpose**
One sentence. What is the single responsibility of this component? Start with a verb.

---

**Library Reuse**
- Detected library: [library name, or "none"]
- Action: one of:
  - `Import from [library]` — e.g. `import { Button } from "@/components/ui/button"`
  - `Run: npx shadcn@latest add button` — then import
  - `Use: ElevatedButton` (Flutter Material) / `Button` (SwiftUI) / `Button` (Compose)
  - `Create new` — justified because: [reason why no library equivalent exists]

(Molecules and above: list which library atoms are composed within)

---

**Props / Inputs**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `propName` | `type` | ✅ / ➖ | `value` | What it controls |

(Use platform-appropriate type syntax: TypeScript for web, Dart for Flutter, Swift for SwiftUI, Kotlin for Compose.)
(Omit this table for Pages — they receive route params and context, not props.)

---

**States**

| State | Trigger | Visual / Behavioural change |
|-------|---------|----------------------------|
| Default | Initial render | [describe] |
| Hover / Pressed | Pointer over / touch down | [describe] |
| Focused | Keyboard focus / accessibility focus | [describe] |
| Active / Selected | User selects / activates | [describe] |
| Disabled | `disabled` prop true | [describe] |
| Loading | Async operation pending | [describe] |
| Error | Validation or network failure | [describe] |
| Empty | No data / zero items | [describe] |

(Remove states that are genuinely not applicable with a note, e.g. "Hover: N/A — touch-only platform".)

---

**Accessibility & Inclusivity**

- **Role / Semantic**: [e.g. `role="button"`, `accessibilityRole="button"`, SwiftUI `.accessibility(label:)`]
- **Label**: [how the accessible name is set or derived]
- **Keyboard / focus**: [Tab order, Enter/Space triggers, arrow-key behaviour if applicable]
- **Screen reader**: [what is announced on activation, on state change]
- **Touch target**: [minimum 44×44pt / 48×48dp where applicable]
- **Motion**: [respects `prefers-reduced-motion` / `accessibilityReduceMotion` if animated]
- **Contrast**: [token pair used; must meet WCAG AA 4.5:1 for text, 3:1 for UI elements]
- **Platform note**: [any platform-specific requirement — VoiceOver, TalkBack, NVDA, etc.]

---

**Composition**

(For Atoms: "Atomic — no sub-components.")
(For Molecules and above: list exact children.)

```
[ComponentName]
├── [Child Component or Library Atom] — [role in this composition]
├── [Child Component or Library Atom] — [role in this composition]
└── [Child Component or Library Atom] — [role in this composition]
```

---

**Theming & Styling**

| Property | Token | Notes |
|----------|-------|-------|
| Background | `[token-name]` | e.g. `colorScheme.primary`, `--color-brand`, `AppColors.blue` |
| Text color | `[token-name]` | |
| Border | `[token-name]` | |
| Border radius | `[token-name]` | |
| Padding | `[token-name]` | |
| Shadow / Elevation | `[token-name]` | |
| Focus ring | `[token-name]` | |

- Supports light / dark / system themes via tokens: [yes / note exceptions]
- Variants (if any): [list variant → token mapping]

---

**Usage Example**

(Default: high-level pseudocode or composition sketch.)
(If the stack and library are known: provide clean, idiomatic code for that platform.)

```[lang]
// [Stack-aware example here]
```

---

**Variants / Modifiers**

| Variant | Difference from default |
|---------|------------------------|
| [variant name] | [what changes visually or behaviourally] |

---

**When to use**
- [Scenario A]
- [Scenario B]

**When NOT to use**
- [Anti-pattern A — use [alternative] instead]
- [Anti-pattern B]

---

**Edge Cases & Polish**

- [ ] Empty state handled: [yes / describe]
- [ ] Loading state handled: [yes / describe]
- [ ] Error state handled: [yes / describe]
- [ ] Long text / overflow: [truncation, wrapping, or scrolling strategy]
- [ ] RTL / bidirectional text: [supported / mirrored / not applicable]
- [ ] Internationalisation: [dynamic text lengths, locale-specific formatting]
- [ ] Performance: [virtualisation, lazy loading, memoisation — if applicable]
- [ ] Platform input methods: [mouse, touch, stylus, keyboard, voice — which apply]
````

---

## Section-by-section Notes

### Library Reuse — critical for Atoms
- If the library has the atom: **import it, period**. Do not write a custom one.
- shadcn/ui: run `npx shadcn@latest add <component>` then import from `@/components/ui/<component>`
- MUI: import directly from `@mui/material`
- Flutter: use the Material or Cupertino widget directly from the SDK
- SwiftUI / Compose: use the native primitive
- If creating a new atom is justified, state the reason explicitly

### Props / Inputs
- Use the target platform's exact type syntax
- Mark required props clearly
- Callback/event props (e.g. `onPress`, `onChange`, `onClick`) always have their signature shown
- Do not list internal/private state — only the public API

### States
All eight states must be addressed. "N/A" with a reason is acceptable. Missing states are not.

### Theming & Styling
- **Never hard-code** a color hex, a spacing px value, or a font size
- Always reference a token name
- If this project has an active design-system skill, tokens must align with that skill's `tokens.md`

### Usage Example
- Platform-agnostic: describe composition in pseudocode
- Platform-known: write idiomatic code (JSX, Dart widget tree, SwiftUI View body, Composable function, etc.)
- Show a realistic usage — not a trivial `<Component />` with no props

### Edge Cases
Address all checklist items. If one is genuinely not applicable, say why.

---

## Compact Format for Atoms with Full Library Reuse

When an Atom is a direct library import with no customisation, use this compact form instead of the full template:

```markdown
### Component: [Name] — Atom (Library)

**Purpose**: [one sentence]
**Library**: Import `[ComponentName]` from `[library]` — no custom implementation.
**Props / Inputs**: Refer to [library] documentation.
**States**: Handled by [library] (Default, Hover, Focused, Disabled — all built in).
**Accessibility**: Built into [library] primitives.
**Theming**: Configure via [library]'s theme/token system.
**Usage**: `<ComponentName variant="..." size="..." />`
```

Use the compact form **only** when the library atom requires zero customisation. If even one prop or style is project-specific, use the full format.
