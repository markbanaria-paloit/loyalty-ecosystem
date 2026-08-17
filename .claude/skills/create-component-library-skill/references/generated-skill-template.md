# Generated SKILL.md Template

Template for the dispatcher SKILL.md the factory writes to `<skills-path>/<project>-component-library/SKILL.md` (skills-path inferred from design-system skill location). Curly-brace placeholders are substituted at generation time.

---

```markdown
---
name: {{project-name}}-component-library
description: "Use when building, refactoring, or reviewing any UI component in {{project-display}}. Enforces component structure, exhaustive state modeling, design tokens, accessibility, previews, models/stubs, and tests for {{stack}}. Load before creating any component, widget, screen, or view. Use when: creating components, adding previews, writing component tests, refactoring components, building screens, reviewing component quality."
---

# {{project-display}} Components Skill

Builds, reviews, and refactors UI components in {{project-display}} with the project's structure, tokens, accessibility, previews, and tests.

## When to Use

- Building a new component, widget, screen, or view
- Refactoring an existing component
- Adding previews or tests to a component
- Reviewing component quality against the project's standards
- Per-component construction during atomic-UI decomposition (invoked automatically by the `atomic-ui` skill when installed)
- Any request to create or improve a UI component in this project

## Detected Project Context

{{detected-context-table}}

## Stack References

Always load **[component-rules.md](./references/component-rules.md)** (universal principles) alongside this skill, then load the reference for the stack you are working in:

{{stack-routing-table}}

{{design-system-clause}}

## Atomic-UI Integration

{{atomic-ui-clause}}

## Procedure

1. **Understand the component.** Confirm purpose (one-sentence verb), atomic level (Atom / Molecule / Organism / Template / Page), composition children, and the data model it operates on. Load [component-rules.md](./references/component-rules.md) for the full structural rules.

2. **Design the API surface.** Define props/parameters, callbacks, slots/children, and composition. Apply this project's naming and file conventions (see your stack's reference file above). See `## Single Responsibility & API Surface` in component-rules.md.

3. **Model the state exhaustively.** Use the language's sum-type mechanism. Cover Idle / Loading / Loaded / Error / Empty for data-driven components; pure-display Atoms skip this. See `## Exhaustive State Modeling` in component-rules.md.

4. **Create the data model and stubs.** Immutable model + Loaded, Empty, Error, Loading, Long-content, and List stubs. Realistic data only — no `test123` or Lorem ipsum. See `## Data Models & Stubs`.

5. **Wire design tokens.** {{tokens-clause}} Never hardcode colours, spacing, typography, elevation, radius, or motion. See `## Design Tokens` and `## Internationalisation (i18n)` in component-rules.md.

6. **Apply accessibility rules.** Roles, labels, touch targets, contrast, motion, focus, screen reader, text-scaling, RTL. Mandatory for every component. See `## Accessibility (Mandatory)`.

7. **Build the component, previews, and tests** following the conventions in [component-rules.md](./references/component-rules.md) and your stack's reference file. Previews cover all states + dark mode + 2× text + RTL + narrow width. Tests cover render, state, a11y, and interactions, using the same stubs.

8. **Run the self-audit checklist** at the end of component-rules.md before reporting done.

## Hard Rules

- **Never hardcode appearance values.** All colours, spacing, type, elevation, radius, and motion come from semantic tokens.
- **Never hardcode user-visible strings.** {{i18n-hard-rule}}
- **Always model state exhaustively.** Compiler-checked sum types. No invalid states possible.
- **Accessibility is mandatory, not optional.** Roles, labels, targets, contrast, motion, focus — from day one.
- **Component layer stays library-agnostic.** Data in via parameters, events out via callbacks. Never reach into global state.
- **Use this project's conventions** for directory, naming, file structure, and tooling — as detected and listed above.
- **Previews use shared stubs.** Never inline test data in previews or tests.
- **Test by semantics first.** Query by role / label / text; test IDs are an escape hatch.

## Related Skills

Load these alongside this skill for complete quality coverage:

| Skill | When to load |
|---|---|
| `accessibility` | Always — mandatory for every component; provides platform-specific WCAG 2.2, Apple HIG, Material rules |
| `visual-quality` | During design review; when auditing layout, hierarchy, spacing, or contrast |
| `motion-interactions` | When adding any animation, transition, gesture, or press-state feedback |
| `content-design` | When authoring or reviewing any visible copy, labels, errors, or empty states |
| `atomic-ui` | When decomposing a screen into atomic components (invokes this skill automatically per component) |

{{trace-comment}}
```

---

## Substitution Reference

| Placeholder | Source |
|---|---|
| `{{project-name}}` | resolved slug (lowercase-hyphenated) |
| `{{project-display}}` | display name (Title Case) |
| `{{stack}}` | detected stack(s) — single: one name; multi: comma-separated list |
| `{{detected-context-table}}` | Project-wide summary table: stacks detected, design-system skill, atomic-UI skill. Per-stack details (dirs, naming, test fw, preview) live in the stack reference file(s). |
| `{{stack-routing-table}}` | Markdown table mapping file-context signals to stack reference file links. **Single-stack:** one row (`Any component file → [<stack>.md](./references/<stack>.md)`). **Multi-stack:** one row per stack (`.<ext> files / <dir>/ → [<stack>.md](./references/<stack>.md)`). Signals defined in `generated-stack-reference-template.md`. |
| `{{design-system-clause}}` | one of the two paragraphs below |
| `{{tokens-clause}}` | "Tokens come from the `<design>-design-system` skill — see `references/<stack>.md` there." OR "No design-system skill detected; use the platform default theme exclusively." |
| `{{i18n-hard-rule}}` | **Variant A (i18n lib detected):** `All labels, messages, errors, and accessible names go through \`{{i18n-lib}}\`. See \`## Internationalisation (i18n)\` in component-rules.md.` **Variant B (not detected):** `No i18n library detected — centralise any string constants in a dedicated file rather than scattering literals across components.` |
| `{{atomic-ui-clause}}` | Always: "This skill is invoked per-component by the `atomic-ui` skill during screen decomposition. Build atoms first, compose up to molecules and organisms." (No variant logic — `atomic-ui` is always available as part of the gen-e2-design plugin.) |
| `{{stack-theme-api-hint}}` | Stack-specific theme API name — used only by `{{design-system-clause}}` variant B. See table below. |
| `{{trace-comment}}` | `<!-- Generated by create-component-library-skill v1.0 on YYYY-MM-DD. Stack: X. Design-system: Y. Atomic-UI: Z. -->` |

### `{{stack-theme-api-hint}}` lookup

| Stack | Hint |
|---|---|
| Flutter | `Theme.of(context)` / `ThemeData` |
| Jetpack Compose | `MaterialTheme` (colorScheme / typography / shapes) |
| SwiftUI | Asset Catalog colours + `.font(.body)` / Dynamic Type |
| React / Next.js | CSS variables / Tailwind theme / `useTheme()` |
| React Native | Context-based `useTheme()` |
| Vue | CSS variables / `useTheme()` |
| Svelte | CSS variables |
| Angular | CSS variables / Angular Material theme |
| (other) | The stack's idiomatic theme/style system |

### `{{design-system-clause}}` — variant A (design-system skill detected)

```markdown
**Tokens.** This project uses the [`{{design-name}}-design-system`](../{{design-name}}-design-system/SKILL.md) skill. For colour, type, spacing, elevation, and radius values, load that skill's `references/tokens.md` and `references/{{stack-file}}.md`. The component rules in this skill enforce that you reach for those tokens; the design-system skill provides the actual values.
```

### `{{design-system-clause}}` — variant B (no design-system skill)

```markdown
**Tokens.** No design-system skill is installed in this project. The component rules below require semantic tokens but there is no single source of truth.

**Strongly recommended:** run `create-design-system-skill` *before* building more components — it will scan the project, extract or scaffold tokens, and emit a skill this one can reference.

If you decline, the project owner must commit to **one** of the following and tell future component authors where to find it:
- A theme file using the stack's idiomatic API ({{stack-theme-api-hint}})
- A token file (e.g., `src/theme/tokens.ts`, `lib/theme/tokens.dart`, `Theme.kt`) checked into the repo

Either way, **never inline raw hex, magic numbers, or unscaled spacing values** into a component. If the token does not exist yet, add it to the chosen source first.
```

### `{{atomic-ui-clause}}` — variant A (atomic-ui detected)

```markdown
**Chaining.** The `atomic-ui` skill calls this skill per-component during bottom-up screen decomposition (Atom → Molecule → Organism → Template → Page).
```

---

## Validation

After substitution, the rendered SKILL.md must:
- Have no unsubstituted `{{...}}` placeholders
- Have exactly two frontmatter keys (`name`, `description`)
- Be 80–150 lines (header + body)
- End with the `<!--` trace comment
