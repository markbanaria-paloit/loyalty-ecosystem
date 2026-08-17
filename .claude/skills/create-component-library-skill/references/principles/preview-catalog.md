# Preview Catalog — Visual Documentation Rules

Previews/stories are the primary documentation of a component. They prove it works across all states, themes, and accessibility configurations before it reaches users.

---

## Purpose

Previews serve three roles simultaneously:

1. **Documentation** — shows developers every state and variant at a glance
2. **Visual testing** — screenshot/snapshot tests capture these renders as baselines
3. **Validation** — confirms the component handles edge cases before code review

---

## State Coverage 🔴

Every component must have previews covering ALL states from its state model:

| State | Preview shows |
|-------|-------------|
| Idle | Initial appearance before any data operation is triggered |
| Loading | Skeleton, spinner, or shimmer |
| Loaded / Success | Happy-path data |
| Error | Error message, retry action |
| Empty | Operation succeeded but returned no data (zero items) |
| Long content | Text overflow, list overflow, very long names |
| All enum variants | Every variant of any display enum (trend: up/down/flat, priority: high/medium/low) |

**Rule:** if a state exists in the model, it must be visible in a preview. No state may be "code-only."

---

## Configuration Matrix 🟡

Beyond states, test visual correctness across system configurations:

| Dimension | Variations |
|-----------|-----------|
| **Theme** | Light + Dark |
| **Text scale** | Default (1.0×) + Large (2.0× or largest accessibility size) |
| **Layout direction** | LTR + RTL |
| **Width** | Standard + Narrow (compact/small screen) |
| **Accessibility** | Reduce motion, high contrast, bold text (where applicable) |

### Minimum preview matrix

For a component with N states, the full matrix is N × 2 (theme) × 2 (text) × 2 (direction) × 2 (width) = N × 16. This is often excessive.

**Practical approach:**

1. **All states** in default configuration (light, 1×, LTR, standard width)
2. **Happy-path state** in every other configuration (dark, large text, RTL, narrow)
3. **Error/empty states** in dark mode (they're commonly missed)

This gives excellent coverage with manageable preview count.

---

## Stub Usage 🔴

- Previews consume the **same stubs** defined in the model layer (see models-and-stubs.md)
- **Never** create one-off inline data in previews — it drifts from test data
- **Never** use network, database, ViewModel, or any live dependency
- Stubs are deterministic → previews render identically on every machine

---

## Preview Isolation 🔴

Each preview is completely self-contained:

- No app initialization required
- No navigation stack
- No global state
- No authenticated session
- Theme/locale/accessibility settings injected via preview wrapper, not app bootstrap

---

## Platform Preview Mechanisms

| Platform | Tool | Notes |
|----------|------|-------|
| Compose | `@Preview` + `@PreviewParameter` | Multi-preview annotations for matrix |
| Flutter | Flutter Widget Previewer (interactive catalogue); widget tests + golden files for visual regression | `@Preview` / `MultiPreview` annotations for catalogue coverage; `pumpWidget`/goldens for test baselines |
| SwiftUI | `#Preview` macro | Environment modifiers for variants |
| React Native | Storybook (CSF format) | Decorators for theme/locale/scale |

→ See the loaded platform guide for idiomatic preview structure and modifiers.

Golden tests are visual-regression baselines, not the interactive catalogue — never treat them as the preview/story tool. Group each component's variations under a named group (by component and state) so related variants cluster together instead of rendering as separate top-level previews; the tool-specific grouping mechanism lives in your stack reference file.

---

## Multi-Preview Strategy

Instead of writing N × M individual previews:

1. **Define stubs** as a collection of all states
2. **Use platform's parameterized preview** to iterate over stubs automatically
3. **Use a multi-configuration wrapper** to apply all theme/scale/direction variants in one declaration

This produces exhaustive visual coverage with minimal code.

---

## Preview File Organisation

Previews/stories live co-located with the component:

```
component-name/
├── Component source
├── Model + Stubs
├── Previews / Stories  ← here
└── Tests (which reuse the same stubs)
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Preview only shows loaded state | Misses error/empty/loading rendering issues | Cover all states |
| Preview uses live data/network | Non-deterministic, slow, breaks offline | Use stubs only |
| Preview creates inline stub data | Diverges from test stubs over time | Import shared stubs |
| Only testing in light mode | Dark mode regressions undetected | Include dark mode in matrix |
| No large-text preview | Layout breaks at scale undetected | Include 2× text scale |
| No RTL preview | Mirroring bugs ship | Include RTL variant |
| Preview requires full app bootstrap | Slow, fragile, couples preview to infra | Inject only theme + locale |
| Static-only previews | Interactive states (hover, pressed, focused) untested | Include interaction states where possible |

---

## Checklist

- [ ] Every model state has a corresponding preview
- [ ] Happy-path rendered in dark mode
- [ ] Happy-path rendered at 2× text scale
- [ ] Happy-path rendered in RTL
- [ ] Happy-path rendered at narrow width
- [ ] Long-content edge case previewed
- [ ] All previews use shared stubs (not inline data)
- [ ] No network/database/ViewModel in previews
- [ ] Preview renders instantly (< 1 second)
