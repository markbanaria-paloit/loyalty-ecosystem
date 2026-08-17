# Stack Detection Guide

Determine which tech stacks are present in the workspace so the correct reference files are generated. Check in priority order: user statement first, then workspace signals.

---

## Priority Order

1. **User explicitly states the stack** — use exactly what they say; skip workspace scanning
2. **Workspace scan** — look for the signals below
3. **Fallback** — if ambiguous, generate for the most common stack evident in file extensions

---

## Detection Signals

| Stack | Reference filename | Workspace signals (any match) |
|-------|--------------------|------------------------------|
| Flutter / Dart | `flutter-dart.md` | `pubspec.yaml` with `flutter:` key; `*.dart` files; `lib/main.dart` |
| React | `react.md` | `package.json` with `"react"` dep; `*.jsx`, `*.tsx` files; `create-react-app` or `vite` config |
| Next.js | `next.md` | `next.config.js/ts`; `pages/` or `app/` directory with `page.tsx` |
| Vue | `vue.md` | `package.json` with `"vue"` dep; `*.vue` files; `vite.config.ts` with vue plugin |
| Svelte / SvelteKit | `svelte.md` | `svelte.config.js`; `*.svelte` files; `@sveltejs/kit` in deps |
| Angular | `angular.md` | `angular.json`; `*.component.ts` + `*.component.html` pairs |
| Swift / SwiftUI | `swift-swiftui.md` | `*.xcodeproj` or `*.xcworkspace`; `*.swift` files; `Package.swift` |
| Android / Compose | `android-compose.md` | `build.gradle` or `build.gradle.kts`; `*.kt` files; `@Composable` usage |
| Kotlin Multiplatform | `kotlin-multiplatform.md` | `build.gradle.kts` with `kotlin("multiplatform")`; `commonMain` source set |
| React Native / Expo | `react-native.md` | `package.json` with `"react-native"` dep; `app.json` or `app.config.ts`; `*.tsx` with RN imports |
| Solid / Qwik / Astro | `solid.md` / `qwik.md` / `astro.md` | `"solid-js"`, `"@builder.io/qwik"`, or `"astro"` in `package.json` |
| Tauri | `tauri.md` + web stack reference | `tauri.conf.json`; `src-tauri/` directory |
| Electron | `electron.md` + web stack reference | `"electron"` in `package.json`; `main.js` / `preload.js` |
| WinUI 3 | `winui.md` | `*.csproj` with `Microsoft.UI.Xaml` reference; `MainWindow.xaml` |
| macOS AppKit | `appkit.md` | `*.xcodeproj` targeting macOS; `import AppKit` in Swift files |
| Plain CSS / SCSS | `css.md` | `*.css`, `*.scss`, `*.sass` files without a JS framework above |
| Tailwind CSS | `tailwind.md` | `tailwind.config.js/ts`; `@tailwind` directives in CSS |
| Plain HTML | `html.md` | `*.html` files without any framework above |

---

## Multi-stack Projects

A project may need more than one reference file. Common combinations:

| Scenario | Generate |
|----------|---------|
| Flutter app | `flutter-dart.md` only |
| Next.js with Tailwind | `next.md` + `tailwind.md` |
| React SPA with plain CSS | `react.md` + `css.md` |
| Monorepo: Flutter + web dashboard | `flutter-dart.md` + `react.md` |
| Marketing site (HTML/CSS) + React components | `html.md` + `react.md` |
| KMP app with Compose + SwiftUI | `kotlin-multiplatform.md` + `swift-swiftui.md` |
| Tauri app (Rust + React frontend) | `tauri.md` + `react.md` |
| Electron app (web renderer) | `electron.md` + detected web stack |

Generate a reference file for every detected stack. If two stacks share a CSS layer (e.g. React + plain CSS), one `css.md` is sufficient for the shared layer.

---

## When the Stack Is Not in the Table

If the user's stack is not listed above (e.g. SolidJS, Elm, Kotlin Multiplatform, Unity C#, etc.):

1. Use the generic stack reference template from [output-spec.md](./output-spec.md)
2. Name the file after the framework: `solid.md`, `elm.md`, `unity-csharp.md`
3. Adapt the token-reference patterns to the framework's idioms:
   - How are color constants defined? (module exports, static fields, enums, etc.)
   - How are they consumed? (CSS-in-JS, theme provider, platform API, material theme, etc.)
   - What is the forbidden pattern? (inline hex string, raw integer color, unnamed literal, etc.)
4. Add a `<!-- Stack: [name], not in default detection table -->` comment at the top of the generated file

---

## Reference Filename Conventions

| Pattern | Example |
|---------|---------|
| `<framework>.md` | `react.md`, `vue.md`, `angular.md` |
| `<platform>-<framework>.md` | `flutter-dart.md`, `swift-swiftui.md`, `android-compose.md` |
| Layer files (shared) | `css.md`, `tailwind.md`, `html.md` |

All reference filenames are lowercase hyphenated and must match the bullet point in the generated `SKILL.md` Procedure section step 2.
