# Generated Stack Reference Template

Template for each `references/<stack>.md` file the factory writes to
`<skills-path>/<project>-component-library/references/<stack>.md`.
One file per detected stack — contains the stack's project conventions,
file-structure tree, and tool-specific notes for previews and testing.

---

```markdown
# Component Conventions — {{stack-display}} ({{project-display}})

Stack-specific conventions for {{project-display}}. Load this file alongside
[component-rules.md](./component-rules.md) when working on {{stack-display}} components.

---

## Project Conventions

| Aspect | Convention |
|---|---|
| Stack | {{stack}} |
| Component directory | {{component-dir}} |
| File naming | {{naming}} |
| Component file | {{component-file-pattern}} |
| Model file | {{model-file-pattern}} |
| Stubs file | {{stubs-file-pattern}} |
| Preview file | {{preview-file-pattern}} |
| Test file | {{test-file-pattern}} |
| State management | {{state-mgmt}} |
| Test framework | {{test-framework}} |
| Preview tool | {{preview-tool}} |
| Animation library | {{animation-lib}} |
| i18n library | {{i18n-lib}} |
| Design-system skill | {{design-system-skill}} |

---

## File Structure

For an example `MetricCard` component:

```
{{component-tree-example}}
```

Tests live at: `{{test-location}}`

---

## Preview Tool Notes

**Tool:** {{preview-tool}}

{{preview-tool-pointer}}

---

## Test Framework Notes

**Framework:** {{test-framework}}

{{test-framework-pointer}}

---

## i18n Access Pattern

> ⚠️ **Emit this section only when `{{i18n-lib}}` is not `not detected`.** Omit the section entirely (including the heading) if no i18n library was detected.

**Library:** {{i18n-lib}}

{{i18n-access-pattern}}

### Adding a new string key

{{i18n-new-string-instructions}}
```

---

## Substitution Reference

| Placeholder | Source |
|---|---|
| `{{stack}}` | Detected stack identifier (e.g., `Flutter`, `React`, `Vue`) |
| `{{stack-display}}` | Human-readable stack label (e.g., "Flutter / Dart", "React / Next.js") |
| `{{project-display}}` | Title-cased project display name |
| `{{component-dir}}` | Detected base directory (e.g., `lib/ui/components/<name>/`) |
| `{{naming}}` | snake_case / PascalCase / kebab-case |
| `{{component-file-pattern}}` | e.g., `<name>.dart`, `<Name>.tsx` |
| `{{model-file-pattern}}` | e.g., `<name>_data.dart`, `<Name>Models.kt` |
| `{{stubs-file-pattern}}` | e.g., `<name>_stubs.dart`, `<Name>Stubs.swift` |
| `{{preview-file-pattern}}` | e.g., `<name>_previews.dart`, `<Name>Previews.kt` |
| `{{test-file-pattern}}` | e.g., `<name>_test.dart`, `<Name>Test.kt`, `<name>.test.tsx` |
| `{{state-mgmt}}` | Detected lib name or "library-agnostic (none detected)" |
| `{{test-framework}}` | Detected test framework |
| `{{preview-tool}}` | Confirmed preview/story tool (user-confirmed in Step C) |
| `{{animation-lib}}` | Detected lib or "platform default" |
| `{{i18n-lib}}` | Detected lib or "not detected" |
| `{{design-system-skill}}` | `<name>-design-system` or "not installed" |
| `{{component-tree-example}}` | Concrete file tree for one example component (`MetricCard`) using detected dir + naming |
| `{{test-location}}` | Concrete test file path for the `MetricCard` example |
| `{{preview-tool-pointer}}` | 1–2 sentences: file naming pattern + how to run/open the preview tool |
| `{{test-framework-pointer}}` | 1–2 sentences: query priority for this framework + run command |
| `{{i18n-access-pattern}}` | The exact accessor expression for reading a localised string in this stack with the detected library. Include a one-line code example (e.g., `AppLocalizations.of(context)!.myLabel` for Flutter gen_l10n / `t('my.key')` for i18next). Omit the entire `## i18n Access Pattern` section if `{{i18n-lib}}` is `not detected`. |
| `{{i18n-new-string-instructions}}` | 1–2 sentences: which file to edit and the key format to use (e.g., “Add a new key to `lib/l10n/app_en.arb` using the `"key": "value"` format, then run `flutter gen-l10n`”). Omit with the section if i18n lib is not detected. |

---

## Stack Reference Filename

Use the same naming conventions as `create-design-system-skill`:

| Stack | Reference filename |
|---|---|
| Flutter / Dart | `flutter.md` |
| React / Next.js | `react.md` |
| Vue | `vue.md` |
| Svelte / SvelteKit | `svelte.md` |
| Angular | `angular.md` |
| React Native | `react-native.md` |
| SwiftUI | `swift-swiftui.md` |
| Jetpack Compose | `android-compose.md` |
| KMP | `kmp.md` |
| (other) | lowercase-hyphenated stack name |

---

## Context Signals for `{{stack-routing-table}}` in SKILL.md

Used when populating the routing table in `generated-skill-template.md`:

| Stack | File context signals |
|---|---|
| Flutter | `.dart` files / `lib/` directory |
| React / Next.js | `.tsx` / `.jsx` files; `app/` or `src/components/` directory |
| Vue | `.vue` files |
| Svelte | `.svelte` files |
| Angular | `.component.ts` files |
| React Native | `.tsx` files in a React Native project |
| SwiftUI | `.swift` files / `Sources/` directory |
| Jetpack Compose | `.kt` files with `@Composable` |
| KMP | `.kt` (shared) / mix of Swift + Kotlin signals |
| (other) | File extension or directory distinctive to the stack |

For **single-stack** projects, use a single row: `Any component file → [<stack>.md](./references/<stack>.md)`.

---

## Validation

After substitution:
- No unsubstituted `{{...}}` placeholders
- File size 30–70 lines (project conventions + tree + tool notes)
- No frontmatter (this is a reference file, not a skill dispatcher)
- No links back to `create-component-library-skill/` (the factory)
- Starts with `# Component Conventions —` heading
