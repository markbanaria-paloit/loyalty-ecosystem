# Generated component-rules.md Template

Template for the reference file the factory writes to `<skills-path>/<project>-component-library/references/component-rules.md` (skills-path inferred from design-system skill location).

It is the self-contained body of component knowledge for the project. Inline the principle files; substitute project specifics; never link back to the factory.

---

## Build Order

For each section below, **read the named principle file from the factory's `principles/` directory** and inline its content into the section, applying the substitutions listed. `{{inline: principles/<file>.md}}` is an **inlining directive** (not a runtime placeholder): at render time, replace the entire directive line with the full file content (do not summarise). After rendering, no `{{inline: ...}}` directive may remain in the output — if any does, the render failed.

| Section | Source | Substitutions |
|---|---|---|
| §2 Project Conventions | — (delegate note) | Write a fixed pointer to the stack reference file(s); do not generate a table here |
| §3 Single Responsibility & API Surface | `principles/component-anatomy.md` | Stack name; example signatures use detected naming |
| §4 Exhaustive State Modeling | `principles/state-modeling.md` | Example uses detected stack's sum-type syntax |
| §5 Design Tokens | `principles/token-integration.md` | Append the "Project Tokens" subsection (variant A or B) |
| §6 Internationalisation (i18n) | — (conditional) | Variant A (i18n lib detected): hard rule + access pattern pointer. Variant B (not detected): soft guidance. Use `{{i18n-enforcement-section}}` |
| §7 Accessibility | — (delegate block, do not inline) | Write the fixed delegate block; reference the standalone `accessibility` skill |
| §8 Data Models & Stubs | `principles/models-and-stubs.md` | Filenames use detected naming convention |
| §9 Previews / Stories | `principles/preview-catalog.md` | Universal strategy only; no tool pointer (tool notes live in the stack reference file) |
| §10 Testing | `principles/testing-strategy.md` | Universal strategy only; no framework pointer (framework notes live in the stack reference file) |
| §11 File Structure for This Project | — (delegate note) | Write a fixed pointer to the stack reference file(s); do not generate a tree here |
| §12 Component Spec Template | — (template below) | unchanged |
| §13 Self-Audit Checklist | — (template below) | one bullet per Hard Rule; include i18n item using `{{i18n-lib-or-fallback}}` |

---

## Skeleton

```markdown
# Component Rules — {{project-display}}

The complete rules for building any component in this project. Self-contained. Load alongside SKILL.md.

---

## 1. Purpose

Every component in {{project-display}} follows these rules: single responsibility, exhaustive state, semantic tokens, mandatory accessibility, comprehensive previews, and stub-driven tests. The rules below apply to every Atom, Molecule, Organism, Template, and Page.

## 2. Project Conventions

Stack-specific conventions — component directory, file naming, state-management library, test framework, preview tool, file-structure tree — live in the stack reference file for your stack. See `## Stack References` in SKILL.md to find the right file.

## 3. Single Responsibility & API Surface

{{inline: principles/component-anatomy.md}}

## 4. Exhaustive State Modeling

{{inline: principles/state-modeling.md}}

## 5. Design Tokens

{{tokens-prerequisite-notice}}

{{inline: principles/token-integration.md}}

### Project Tokens

{{project-tokens-clause}}

## 6. Internationalisation (i18n)

{{i18n-enforcement-section}}

## 7. Accessibility (Mandatory)

Accessibility is enforced via the standalone **`accessibility`** skill — load it alongside this component library skill for comprehensive, platform-specific guidance (WCAG 2.2 AA, Apple HIG, Material Design guidelines).

**Non-negotiable component requirements (no exceptions):**
- Semantic roles and labels on all interactive and informative elements
- Touch/tap targets ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android) / 44 × 44 px (web)
- Colour contrast ≥ 4.5:1 body text, ≥ 3:1 large text and UI components
- Focus order follows the visual/logical reading order; no focus traps
- Motion: honour `prefers-reduced-motion` / `isReduceMotionEnabled` / `AccessibilityService.isAnimationEnabled`
- Screen reader: test with VoiceOver / TalkBack / NVDA; all interactive elements reachable and labelled
- Text scaling: layout must not break at 2× Dynamic Type / Large Text; use relative units only
- RTL: layout mirrors correctly for right-to-left locales

For complete platform-specific rules and the full audit checklist, **always load the `accessibility` skill**.

## 8. Data Models & Stubs

{{inline: principles/models-and-stubs.md}}

## 9. Previews / Stories

{{inline: principles/preview-catalog.md}}

For tool-specific conventions (file naming, how to run previews), see your stack reference file.

## 10. Testing

{{inline: principles/testing-strategy.md}}

For framework-specific conventions (query priority, run command), see your stack reference file.

## 11. File Structure for This Project

Concrete file-structure trees (directory layout and naming for an example component) are in the stack reference file for your stack — see `## Stack References` in SKILL.md.

## 12. Component Spec Template

When documenting a component (optional but recommended for Organisms and above):

```markdown
# <ComponentName>

**Purpose:** <one-sentence verb statement>
**Atomic level:** Atom | Molecule | Organism | Template | Page
**Composition:** <child components>

## Props
| Name | Type | Required | Default | Description |
|---|---|---|---|---|

## States
- Idle / Loading / Loaded / Error / Empty (and others as needed)

## Accessibility
- Role: ...
- Label: ...
- Touch target: ...
- Notable: ...

## Tokens Used
- color: ...
- typography: ...
- spacing: ...

## Edge Cases
- [ ] Long content
- [ ] Empty data
- [ ] Error state
- [ ] 2× text scale
- [ ] RTL
- [ ] Narrow width
- [ ] Dark mode
```

## 13. Self-Audit Checklist

Run before declaring a component done.

1. [ ] Single responsibility — one sentence, one verb
2. [ ] All props typed; required vs optional explicit; defaults stated
3. [ ] State modelled with the language's sum-type mechanism (or skipped for pure-display Atoms with a one-line note)
4. [ ] All applicable states present: Idle, Loading, Loaded, Error, Empty (+ interaction states)
5. [ ] Zero hardcoded colours, spacing, type, elevation, radius, or motion values
6. [ ] All token access goes through the project's token source ({{token-source}})
7. [ ] Zero hardcoded user-visible strings — all labels, messages, and accessible names go through {{i18n-lib-or-fallback}}
8. [ ] Accessibility: role, label, touch target, contrast, focus, motion, text scaling, RTL all verified
9. [ ] Models defined as immutable data; stubs cover Loaded, Empty, Error, Loading, Long-content, List
10. [ ] Stubs use realistic data — no `test123`, no Lorem ipsum
11. [ ] Previews exist for every state + dark mode + 2× text + RTL + narrow width, using shared stubs
12. [ ] Tests cover render, state transitions, a11y, interactions — using shared stubs
13. [ ] Test queries prefer semantics (role / label / text); test IDs only as escape hatch
14. [ ] Files follow the naming + directory conventions for this stack (see your stack reference file §Project Conventions)
15. [ ] No leaf component imports state-management primitives directly — data in via parameters, events out via callbacks (library-specific types stay in containers, not leaf components)
16. [ ] Composition: higher-level components reuse smaller components, never duplicate
```

---

## Substitution Reference

| Placeholder | Source |
|---|---|
| `{{tokens-prerequisite-notice}}` | **Variant A (design-system skill detected):** empty string. **Variant B (no design system):** `> ⚠️ **No design-system skill is installed.** The principles below describe token best practices but cannot be fully enforced until a token system exists. Run \`create-design-system-skill\` first. Until then, use the platform’s default theme API exclusively — no literal colour, spacing, or typography values.` |
| `{{project-display}}` | Title-cased project name |
| `{{stack}}` | Detected stack name(s) — used only in generic principle substitutions |
| `{{project-tokens-clause}}` | Variant A or B (below) |
| `{{token-source}}` | "the {{design-name}}-design-system skill" OR "the platform default theme" |
| `{{stack-theme-api-hint}}` | Stack theme API name (used only in variant B). See the lookup table in `generated-skill-template.md`. |
| `{{i18n-enforcement-section}}` | **Variant A (i18n lib detected):** The hard-rule block below. **Variant B (not detected):** The soft-guidance block below. |
| `{{i18n-lib-or-fallback}}` | **Variant A (i18n lib detected):** `` `{{i18n-lib}}` `` (the detected library name, formatted as inline code). **Variant B (not detected):** `the platform’s string resource mechanism (no i18n lib detected — centralise in a constants file)` |

> All per-stack placeholders (component-dir, naming, file patterns, state-mgmt, test-framework, preview-tool, animation-lib, i18n-lib, design-system-skill, component-tree-example, test-location, tool pointers) have moved to `generated-stack-reference-template.md`.

### `{{i18n-enforcement-section}}` — variant A (i18n lib detected)

```markdown
**Hard rule: no hardcoded user-visible strings.** Every label, button text, message, placeholder, tooltip, and accessible name that a user can read or hear must go through `{{i18n-lib}}`. String literals inside widget or component code are a bug.

- See your stack reference file (`## i18n Access Pattern`) for the exact accessor expression and how to add new string keys.
- Never compose user-visible text via string interpolation outside the localisation system.
- Never mix localised and hardcoded strings in the same component.
- Every string that is a user-visible accessible label or description must also be localised — not just visible text.
```

### `{{i18n-enforcement-section}}` — variant B (not detected)

```markdown
No i18n library was detected in this project. If the project targets a single locale, centralise any text constants in a dedicated constants file rather than scattering string literals across components. If multilingual support is added later, run `create-component-library-skill` to regenerate this section with full enforcement rules for the chosen library.
```

### `{{project-tokens-clause}}` — variant A (design-system skill detected)

```markdown
This project's tokens are defined in the `{{design-name}}-design-system` skill:
- Colour, type, spacing, elevation, radius values → `../{{design-name}}-design-system/references/tokens.md`
- Stack-specific API examples → `../{{design-name}}-design-system/references/{{stack-file}}.md`

The principles above describe **what** to use; the design-system skill provides **the values**. Never bypass it — every appearance value in a component must trace back to a token in those files.
```

### `{{project-tokens-clause}}` — variant B (no design-system skill)

```markdown
No design-system skill is installed. Until one exists:
- Use only the platform's default theme API ({{stack-theme-api-hint}}) — never literal colour / spacing / typography values
- Treat any project-local `theme.*` / `tokens.*` / `Colors.*` file as the source of truth and reference it consistently
- Strongly consider running `create-design-system-skill` once token decisions are stable, so future components have a single source of truth

If you find yourself reaching for a literal value because "the design system doesn't have it yet," stop and either (a) add it to the existing theme file or (b) flag a design-system gap for the team to resolve.
```

---

## Validation

After substitution:
- No unsubstituted `{{...}}` placeholders
- File size 1000–1400 lines (full principle content inlined; §2 and §10 are delegate notes, not generated content)
- Zero links to `create-component-library-skill/` (the factory)
- Every section in the skeleton is present and non-empty
- No frontmatter (this is a reference file, not a skill dispatcher)
