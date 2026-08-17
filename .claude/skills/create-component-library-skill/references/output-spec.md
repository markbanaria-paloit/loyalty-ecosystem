# Output Spec — What the Factory Generates

The factory produces **one project-specific component skill** that is self-contained, stack-agnostic in code, and aware of the project's conventions.

---

## File Tree

```
<skills-path>/<project>-component-library/
├── SKILL.md                    # Dispatcher: routing table, procedure
└── references/
    ├── component-rules.md      # Universal component principles (anatomy, state, tokens, a11y, models/stubs, previews, testing)
    └── <stack>.md              # Per-stack conventions — one file per detected stack (e.g., flutter.md, react.md)
```

Example for a Flutter + React monorepo:

```
<skills-path>/<project>-component-library/
├── SKILL.md
└── references/
    ├── component-rules.md
    ├── flutter.md
    └── react.md
```

`<skills-path>` is inferred from the location of the adjacent design-system skill. Default: `.github/skills/`.

- Minimum three files for single-stack (SKILL.md + component-rules.md + one stack reference). Multi-stack adds one `<stack>.md` per additional stack — the skill folder never splits.
- Folder name = `<project>-component-library` (lowercase-hyphenated, ASCII `[a-z0-9-]+`). MUST equal SKILL.md `name:` field.
- `<project>` derivation, in priority order:
  1. User-provided name
  2. Adjacent design-system skill prefix (e.g., `acme-design-system` → `acme`)
  3. `package.json` `name` field / Flutter `pubspec.yaml` `name:` / Xcode project name
  4. Repository folder name
  5. Ask once if all four are absent

---

## Frontmatter

Minimal, exactly two keys. No `argument-hint`, no `applyTo`, no tools list.

```yaml
---
name: <project>-component-library
description: "Use when building, refactoring, or reviewing any UI component in [Project]. Enforces component structure, exhaustive state modeling, design tokens, accessibility, previews, models/stubs, and tests. Load before creating any component, widget, screen, or view. Use when: creating components, adding previews, writing component tests, refactoring components, building screens, reviewing component quality."
---
```

Constraints:
- `description` YAML-quoted (contains colons)
- ≤ 1024 chars
- Contains trigger keywords: `creating`, `refactoring`, `reviewing`, `previews`, `tests`, `component`
- `name` MUST exactly equal folder name

---

## SKILL.md Sections (in order)

1. YAML frontmatter
2. `# <Project> Components Skill` (H1 = display name)
3. `## When to Use` — 5–7 trigger bullets
4. `## Detected Project Context` — project-wide summary (stacks detected, design system, atomic-UI)
5. `## Stack References` — routing table: always load component-rules.md + file-context signals → stack reference link(s)
6. Design-system clause
7. `## Atomic-UI Integration`
8. `## Procedure` — numbered steps referencing component-rules.md and the stack reference
9. `## Hard Rules`
10. `## Related Skills`
11. `<!-- Generated ... -->` trace comment (last line)

Size budget: 100–180 lines.

---

## component-rules.md Sections (in order)

Inlined universal principle content. Self-contained — never links back to the factory. Per-stack conventions live in the stack reference file(s).

1. `# Component Rules` + 1-line purpose
2. `## Project Conventions` — **delegate note** pointing to the stack reference file(s); no table here
3. `## Single Responsibility & API Surface` ← from `principles/component-anatomy.md`
4. `## Exhaustive State Modeling` ← from `principles/state-modeling.md`
5. `## Design Tokens` ← from `principles/token-integration.md`, with a Project Tokens subsection pointing to the design-system skill (or noting its absence)
6. `## Accessibility (Mandatory)` ← **delegate block** pointing to standalone `accessibility` skill; do NOT inline `principles/accessibility-rules.md`
7. `## Data Models & Stubs` ← from `principles/models-and-stubs.md`
8. `## Previews / Stories` ← from `principles/preview-catalog.md`; universal strategy only (tool notes are in the stack reference)
9. `## Testing` ← from `principles/testing-strategy.md`; universal strategy only (framework notes are in the stack reference)
10. `## File Structure for This Project` — **delegate note** pointing to the stack reference file(s); no tree here
11. `## Component Spec Template` — short template (purpose, props, states, a11y notes, tokens used, edge cases)
12. `## Self-Audit Checklist` — numbered, must pass every item

Size budget: 1000–1400 lines.

---

## Stack Reference File Sections (one per detected stack)

Filename follows the same convention as `create-design-system-skill` (e.g., `flutter.md`, `react.md`). See `generated-stack-reference-template.md` for the full template.

1. `# Component Conventions — <Stack> (<Project>)` + 1-line purpose
2. `## Project Conventions` — full table: component dir, file naming, state-mgmt, test fw, preview tool, animation lib, i18n lib
3. `## File Structure` — concrete file tree for one example component (`MetricCard`)
4. `## Preview Tool Notes` — file naming pattern + how to run/open the preview tool
5. `## Test Framework Notes` — query priority + run command

Size budget: 30–70 lines per stack file.

---

## Multi-Stack (Monorepo) Output

Multi-stack projects use a **single** `<project>-component-library` skill folder. Universal principles in `component-rules.md` apply to all stacks. Stack-specific conventions live in separate reference files in the same `references/` folder — one file per detected stack.

Confirm reference filenames with the user before writing. Use the same naming conventions as `create-design-system-skill`:

| Stack | Reference filename |
|---|---|
| Flutter | `flutter.md` |
| React / Next.js | `react.md` |
| Vue | `vue.md` |
| Svelte | `svelte.md` |
| Angular | `angular.md` |
| React Native | `react-native.md` |
| SwiftUI | `swift-swiftui.md` |
| Jetpack Compose | `android-compose.md` |
| KMP | `kmp.md` |
| (other) | lowercase-hyphenated stack name |

Layout for a Flutter + React monorepo:

```
<skills-path>/<project>-component-library/
├── SKILL.md
└── references/
    ├── component-rules.md
    ├── flutter.md
    └── react.md
```

The SKILL.md `## Stack References` routing table maps file-context signals (file extension, directory) to the correct reference file. **The project's agent instruction file gets one trigger line for the whole project** — not one per stack. The target file is derived from the skills-path ecosystem (see `generation-procedure.md` Step H).

When re-running the factory to add a new stack to an existing skill, add the new `<stack>.md` to the existing `references/` folder. The SKILL.md routing table is updated (following the Step B regenerate/skip/cancel flow). No folder renaming required.

Idempotency: per-stack-file (check whether `references/<stack>.md` already exists before writing).

---

## Conditional Generation Rules

| Item | Emitted when |
|---|---|
| `## Detected Project Context` row | Always; each row is either a detected value or `not detected` |
| Design-system reference paragraph | Only if `.github/skills/*-design-system/` exists |
| "Run `create-design-system-skill`" hint | Only if no design-system skill detected |
| Atomic-UI chaining note | Always (atomic-ui is part of the gen-e2-design plugin) |
| State-management library mention in File Structure | Only if a state-mgmt lib detected (otherwise generic "props in, callbacks out") |
| Preview tool name in Previews section | Use detected tool; otherwise name the stack-idiomatic default |
| `<!-- unverified: ... -->` comments | Only for fields that were inferred but not confirmed |
| Stack-specific example snippets | Use detected stack's idiom; otherwise generic pseudo-code |
| `§6 Internationalisation (i18n)` in component-rules.md | Always present; Variant A (hard rule + pointer) when i18n lib detected, Variant B (soft guidance) when not |
| `## i18n Access Pattern` in stack reference file | Only when i18n lib detected; omit section and heading entirely when not detected |
| Flutter preview guidance (Widget Previewer default, `ComponentPreview` helper, mobile default size, `"<Component> / <State>"` grouping) | Only when a Flutter stack is detected; Widgetbook guidance only when Widgetbook detected **and** user-confirmed |
| Agent instruction file append (primary + any existing secondary) | See `generation-procedure.md` Step H (idempotent, ecosystem-aware) |

---

## `component-rules.md` has NO frontmatter

It is a reference file, not a skill dispatcher. Plain Markdown only, starts with `# Component Rules — <Project>`.

---

## NOT Generated

- Per-platform syntax cheatsheets (LLM training + design-system skill cover stack syntax)
- Component spec files per component (template is in `component-rules.md`; actual specs are produced per component)
- Hooks / enforcement scripts (out of scope; design-system skill owns runtime enforcement)
- Worked-example component code (bloats output; users invoke the skill to build their own)
- Stack detection logic (delegated to design-system skill or done lightly only to name file conventions)

---

## Intra-Skill Links

All links inside the generated skill use `./references/` relative paths:

```markdown
[component-rules.md](./references/component-rules.md)
```

The generated skill must contain **zero** links to:
- `create-component-library-skill/` (the factory)
- `components-meta/` (deleted)
- Any absolute paths

The generated skill **may** link to:
- A detected design-system skill: `.github/skills/<design-name>-design-system/references/...`
- Official framework documentation (external HTTPS)

---

## Self-Audit (run after writing, before reporting done)

- [ ] Folder name equals `name:` field
- [ ] Frontmatter has exactly `name` and `description`
- [ ] Description ≤ 1024 chars and quoted
- [ ] All required sections present in SKILL.md (including `## Stack References`)
- [ ] Stack routing table covers all detected stacks
- [ ] All required sections present in component-rules.md
- [ ] One stack reference file per detected stack, all non-empty
- [ ] Detected Project Context block is filled in (no unsubstituted placeholders)
- [ ] No `{{...}}` placeholders remain in any output file (including no leftover `{{inline: ...}}` directives)
- [ ] Zero links to the factory or `components-meta/`
- [ ] Trace comment present at end of SKILL.md and includes the factory version (`v1.0`)
- [ ] Agent instruction update is idempotent (one trigger line for the whole project, regardless of stack count; target file derived from skills-path per Step H)
- [ ] All output files exist and are non-empty (no partial write)
- [ ] `component-rules.md` size in 1000–1400 line budget
- [ ] Each stack reference file size in 30–70 line budget
- [ ] **(Flutter stack only)** Preview guidance defaults to Flutter Widget Previewer; Widgetbook appears only if detected and user-confirmed
- [ ] **(Flutter stack only)** `flutter.md` documents the `ComponentPreview` helper (extends `Preview`, default mobile `Size`, at `lib/preview/component_preview.dart`) and the `flutter widget-preview start` command
- [ ] **(Flutter stack only)** Preview variations are grouped as `"<Component> / <State>"` (not a flat list); preview files are co-located `<component>_preview.dart`; previews use shared stubs
