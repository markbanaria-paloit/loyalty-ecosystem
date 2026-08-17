# Project Detection — Conventions Scan

The factory detects **how this project organises components** so the generated skill speaks the project's language. Stack detection itself is delegated to `create-design-system-skill`; this file focuses on **component-layer conventions**.

Run in priority order. Stop at first confident signal per category. Always state what was detected and how.

---

## Inputs (in priority order)

1. **User statement** — anything the user explicitly says wins
2. **Workspace scan** — manifest files, directory shape, existing component samples
3. **Conversation history** — imports, file extensions, patterns shown earlier
4. **Adjacent skills** — `.github/skills/*-design-system/` for stack + tokens
5. **Ask once** — only if a category is still ambiguous and material to the output

---

## Detection Categories

### 1. Stack (delegated)

Look for `.github/skills/*-design-system/SKILL.md` first. If present, **read its frontmatter and per-stack reference filenames** — those are the authoritative stacks.

**Cross-check before trusting it.** Do a lightweight workspace scan even when a design-system skill exists. If the workspace shows a stack the design-system skill does not declare (or vice versa) — e.g. the skill says Flutter but `package.json` now has React — surface the mismatch and ask the user which stacks are authoritative for *this* generation. Never blindly trust a stale skill.

**Multiple design-system skills.** If the glob matches more than one (`acme-design-system` and `legacy-design-system`), do not pick alphabetically. Ask the user which one applies. "Adjacent" elsewhere in this document means **`.github/skills/` in the same workspace root** (not subprojects, not parents).

If no design-system skill exists, do a lightweight scan only to know what filename idioms to use:

| Signal | Stack |
|---|---|
| `pubspec.yaml` with `flutter:` key | Flutter / Dart |
| `package.json` with `"react-native"` | React Native |
| `package.json` with `"next"` | Next.js / React |
| `package.json` with `"react"` (no RN/Next) | React |
| `package.json` with `"vue"` | Vue |
| `svelte.config.js` / `.svelte` files | Svelte / SvelteKit |
| `angular.json` | Angular |
| `*.xcodeproj` / `Package.swift` + `SwiftUI` import | SwiftUI |
| `build.gradle.kts` + `@Composable` | Jetpack Compose |
| `kotlin("multiplatform")` | KMP |

Multiple stacks = monorepo. Generate **one component skill per stack** (separate folders).

### 2. Component directory pattern

Scan for the dominant existing component location. Stop at first non-trivial match:

| Pattern | Likely convention |
|---|---|
| `lib/ui/components/<name>/` or `lib/features/<feat>/components/` | Flutter feature-first |
| `lib/widgets/<name>.dart` | Flutter flat widgets |
| `src/components/<name>/` | Web component-folder |
| `app/components/<name>/` | Next.js app router |
| `components/<name>.vue` | Vue flat |
| `Sources/<Module>/Components/<Name>/` | Swift SPM module |
| `app/src/main/java/<pkg>/ui/components/<name>/` | Android Compose |
| (none found) | Suggest stack-idiomatic default; confirm with user |

Record: **base directory**, **per-component folder vs flat file**.

### 3. File naming convention

Sample 3-5 existing component files. Detect:

| Observed | Convention |
|---|---|
| `metric_card.dart` | snake_case |
| `MetricCard.kt` / `MetricCard.swift` | PascalCase |
| `metric-card.tsx` / `metric-card.vue` | kebab-case |
| `MetricCard.tsx` | PascalCase (React common) |

Record component / model / stubs / preview / test naming if patterns exist (e.g., `*.stories.tsx`, `*_test.dart`, `*Tests.swift`).

**Mixed codebases.** If the sample is not homogeneous (e.g., 2 files in `PascalCase`, 3 in `snake_case`), do not pick a winner silently. Mark the row as `inferred — please confirm` and show the split to the user: "Your components mix snake_case (3) and PascalCase (2). Which is the standard going forward?" The chosen convention is recorded in the generated skill; legacy files are left untouched.

### 4. State-management library

Scan dependency manifests:

| Manifest match | Library |
|---|---|
| `flutter_riverpod`, `hooks_riverpod` | Riverpod |
| `flutter_bloc`, `bloc` | BLoC |
| `provider` | Provider |
| `get` | GetX |
| `zustand` | Zustand |
| `@reduxjs/toolkit`, `redux-toolkit` | Redux Toolkit |
| `jotai` | Jotai |
| `mobx`, `mobx-react` | MobX |
| `recoil` | Recoil |
| `@tanstack/react-query`, `swr` | Server-state lib (note alongside client lib) |
| `androidx.lifecycle:lifecycle-viewmodel` + `kotlinx.coroutines` | ViewModel + StateFlow |
| `ComposableArchitecture` in `Package.swift` | TCA |
| (none) | Local-state-only / unstated — note it |

Always state: "Component layer stays library-agnostic; this is recorded so the project skill can reference the project's wiring conventions."

### 5. Test framework

| Signal | Framework |
|---|---|
| `flutter_test` in `dev_dependencies` | flutter_test |
| `jest` in devDeps | Jest |
| `vitest` in devDeps | Vitest |
| `@testing-library/react` | RTL (React) |
| `@testing-library/react-native` | RTL (RN) |
| `@testing-library/vue` | RTL (Vue) |
| `XCTest` import / `*Tests.swift` files | XCTest / Swift Testing |
| `androidTest/` + Compose Test deps | Compose UI test |
| `vue-test-utils` | Vue Test Utils |
| `karma` / `jasmine` / Angular Testing | Angular Testing Utils |

Also detect: snapshot tooling (`swift-snapshot-testing`, `Roborazzi`, `Paparazzi`, Storybook test-runner, golden_toolkit).

### 6. Preview / story tool

| Signal | Tool |
|---|---|
| `package:flutter/widget_previews.dart` import, `@Preview` / `MultiPreview` annotations, or a `ComponentPreview` helper in `.dart` files | Flutter Widget Previewer |
| `widgetbook`, `widgetbook_annotation`, or `widgetbook_generator` in `pubspec.yaml` | Widgetbook (brownfield — see the Flutter note below) |
| `@storybook/*` in devDeps | Storybook (note variant: react / react-native / vue / svelte / angular) |
| `histoire` in devDeps | Histoire |
| inline `#Preview` macros | Xcode Previews |
| `@Preview` annotations in `.kt` files | Compose Previews |
| (none) | **Ask the user** — mark as `inferred — please confirm` in the output block |

**When no tool is detected**, do not assume. Ask:

> No preview / story tool was found in your project. Previews are a core part of the component skill (every component needs a preview for all states). Which tool would you like to use?
>
> Suggested for your stack: **{{stack-idiomatic-preview}}**
>
> Options: Flutter Widget Previewer / Storybook / Histoire / Xcode Previews / Compose Previews / Widgetbook (Flutter — brownfield only) / None (skip previews for now)

Then record the user’s answer. If the user selects a tool they haven’t installed yet, note the install command in the Step J summary (do not write any config files — only note what to install).

**Stack-idiomatic preview defaults** (use to fill in `{{stack-idiomatic-preview}}` above):

| Stack | Suggested tool | Install hint |
|---|---|---|
| Flutter | Flutter Widget Previewer | Built-in from Flutter 3.35+ (IDE support 3.38+); no extra dep — use `@Preview` from `package:flutter/widget_previews.dart`, run `flutter widget-preview start` |
| Jetpack Compose | Compose Previews | Built-in — no extra dep; use `@Preview` annotations |
| SwiftUI | Xcode Previews | Built-in — no extra dep; use `#Preview` macros |
| React / Next.js | Storybook | `npx storybook@latest init` |
| React Native | Storybook | `npx storybook@latest init` (RN flavour) |
| Vue | Histoire | `npm install -D histoire @histoire/plugin-vue` |
| Svelte | Storybook | `npx storybook@latest init` |
| Angular | Storybook | `npx storybook@latest init` |
| (other) | Storybook | `npx storybook@latest init` |

**Flutter preview tool — default and branches:**

- **Default (greenfield / no preview tool detected):** Flutter Widget Previewer. Scaffold previews with the `@Preview` annotation and a shared `ComponentPreview` helper. Never default a Flutter project to Widgetbook.
- **Brownfield (Widgetbook already present) — ASK every time, default still Previewer:** use Widgetbook **if and only if** (a) `widgetbook*` dependencies already exist in `pubspec.yaml` **and** (b) the user explicitly confirms keeping it. The ask is mandatory even when detected: tell the user Flutter Widget Previewer is the default for new work, then ask whether to keep Widgetbook or switch generated guidance to the previewer. If they do not clearly choose Widgetbook — or Widgetbook is not already present — default to Flutter Widget Previewer. Never add Widgetbook to a project that doesn't already have it.
- **Version below requirement — ASK, do not fall back:** the previewer needs Flutter 3.35+ (IDE support 3.38+). If the detected Flutter version is lower, ask whether to update Flutter or pick another preview tool. Never silently fall back to Widgetbook.

### 7. Animation library

| Signal | Library |
|---|---|
| `flutter_animate`, `animations` (Flutter package) | flutter_animate / animations |
| `react-native-reanimated` | Reanimated |
| `framer-motion` | Framer Motion |
| `lottie-react`, `lottie-react-native`, `lottie` (Flutter) | Lottie |
| `@vueuse/motion`, `motion` | Vue Motion |
| (none) | Platform default (built-in implicit animations) |

### 8. i18n library

| Signal | Library |
|---|---|
| `flutter_localizations` + `intl` | Flutter i18n |
| `react-i18next`, `i18next` | i18next |
| `vue-i18n` | vue-i18n |
| `expo-localization` | Expo i18n |
| `Localizable.xcstrings` / `Localizable.strings` | Apple string catalogs |
| `res/values/strings.xml` | Android string resources |
| `@angular/localize` | Angular i18n |

### 9. Design-system skill

```
.github/skills/*-design-system/SKILL.md
```

If found, record the **skill folder name** and the **per-stack reference filename**. The generated component skill will instruct readers to consult those files for token values. If multiple matches exist, see §1 — ask the user to pick one.

### 10. Atomic-UI skill

The `atomic-ui` skill is always available as part of the gen-e2-design plugin — no filesystem scan required. The generated skill always notes that atomic-ui invokes it per-component during decomposition.

### 11. Existing component skill (re-run detection)

Scan for `*-component-library/SKILL.md` in the same skills path as the design-system skill (or `.github/skills/` by default).

If found, read the `<!-- Generated by create-component-library-skill vX.Y on YYYY-MM-DD -->` trace comment. Trigger the **overwrite flow** in `generation-procedure.md` rather than silent regeneration.

---

## Output: Detected Project Context

Print this block to the user for confirmation **before** writing any file:

```
**Detected Project Context**
- Stack:                [Flutter / React / ... | from design-system skill | inferred]
- Component dir:        [lib/ui/components/<name>/ | src/components/<name>/ | ...]
- File naming:          [snake_case | PascalCase | kebab-case]
- State management:     [Riverpod | none detected]
- Test framework:       [flutter_test]
- Preview tool:         [Flutter Widget Previewer (default) | Widgetbook (brownfield, confirmed) | inferred — please confirm | not installed (user opted out)]
- Animation library:    [flutter_animate | platform default]
- i18n library:         [intl]
- Design-system skill:  [acme-design-system | not detected]
- Atomic-UI skill:      always available (gen-e2-design plugin)
- Existing skill:       [none | acme-component-library — generated 2026-04-12]
```

Each line is one of: a detected value (with source), `not detected`, or `inferred — please confirm`. Inferred values **must** be confirmed before generation.

---

## Unlisted / Unknown Signals

Never refuse. If a stack or library is not in the tables above:
1. Detect what you can (file extensions, manifest deps you don't recognise)
2. State assumptions transparently
3. Treat unknown signals as "platform default" and proceed
4. Note the unknown in the generated skill as `<!-- unverified: ... -->` for the user to correct
