# Library Detection — Stack & Component Library Identification

> **This list is not exhaustive.** It covers the most common stacks and libraries as examples. If you encounter a stack, framework, or library not listed here, apply the same detection logic: scan workspace signals, check dependency manifests, infer from imports and file extensions, then reason from first principles about what that platform's idiomatic primitive components are. Always state what you detected and why.

Scan in priority order and stop at the first confident match. Multiple stacks may be active (e.g. a React web app + a Flutter mobile app in a monorepo — generate references for both).

---

## Detection Priority

1. **Explicit user statement** — "we use shadcn/ui", "this is a Flutter app" → use exactly what they say
2. **Workspace file signals** — scan for the files listed below
3. **Conversation / code history** — look at imports, component names, file extensions in previous turns
4. **Ask** — if still ambiguous after steps 1–3, ask once before proceeding

---

## Web Stacks

### React / Next.js / Remix
**Signals:** `package.json` with `"react"` dep; `.jsx`/`.tsx` files; `next.config.*`; `vite.config.ts` with react plugin

**Library detection (check `package.json` dependencies):**

| Library | `package.json` key | Atom usage |
|---------|-------------------|-----------|
| shadcn/ui | `"@radix-ui/react-*"` + `components/ui/` folder | Run `npx shadcn@latest add <component>`; import from `@/components/ui/<component>` |
| Material UI (MUI) | `"@mui/material"` | `import { Button, TextField } from "@mui/material"` |
| Ant Design | `"antd"` | `import { Button, Input } from "antd"` |
| Chakra UI | `"@chakra-ui/react"` | `import { Button, Input } from "@chakra-ui/react"` |
| Radix UI + Tailwind | `"@radix-ui/react-*"` (no shadcn) | Use Radix primitives + Tailwind classes |
| Mantine | `"@mantine/core"` | `import { Button, TextInput } from "@mantine/core"` |
| daisyUI | `"daisyui"` in Tailwind plugins | Use Tailwind class API |
| Headless UI | `"@headlessui/react"` | Import from `@headlessui/react` |
| None detected | — | Suggest shadcn/ui for React; confirm with user |

---

### Vue
**Signals:** `package.json` with `"vue"`; `.vue` files; `vite.config.ts` with vue plugin; `nuxt.config.ts`

| Library | Signal | Atom usage |
|---------|--------|-----------|
| Vuetify | `"vuetify"` | `<v-btn>`, `<v-text-field>`, etc. |
| Quasar | `"quasar"` | `<q-btn>`, `<q-input>`, etc. |
| PrimeVue | `"primevue"` | `<Button>`, `<InputText>`, etc. |
| shadcn-vue | `"radix-vue"` + `components/ui/` | Same pattern as shadcn/ui |
| None | — | Suggest Vuetify or shadcn-vue |

---

### Svelte / SvelteKit
**Signals:** `svelte.config.js`; `.svelte` files

| Library | Signal | Atom usage |
|---------|--------|-----------|
| shadcn-svelte | `"bits-ui"` + `components/ui/` | `import { Button } from "$lib/components/ui/button"` |
| Skeleton UI | `"@skeletonlabs/skeleton"` | Import from `@skeletonlabs/skeleton` |
| None | — | Suggest shadcn-svelte |

---

### Angular
**Signals:** `angular.json`; `*.component.ts` + `*.component.html` pairs

| Library | Signal | Atom usage |
|---------|--------|-----------|
| Angular Material | `"@angular/material"` | `MatButtonModule`, `MatInputModule`, etc. |
| PrimeNG | `"primeng"` | `<p-button>`, `<p-inputText>`, etc. |
| None | — | Suggest Angular Material |

---

### Solid / Qwik / Astro / Other web
**Signals:** `solid-js`, `@builder.io/qwik`, `astro` in `package.json`

- Treat as framework-specific React-like stack
- Check for any UI library in `package.json` deps
- If none, suggest the framework's recommended UI lib or Tailwind + headless primitives
- Use platform-agnostic component spec if no library is detected

---

### Tailwind CSS (any web stack)
**Signals:** `tailwind.config.*`; `@tailwind` directives in CSS

Note: Tailwind is a styling utility, not a component library. Detect it in addition to the component library above. When present, use Tailwind class names in usage examples.

---

## Mobile Stacks

### Flutter / Dart
**Signals:** `pubspec.yaml` with `flutter:` key; `*.dart` files; `lib/main.dart`

| Package | `pubspec.yaml` dep | Atom usage |
|---------|-------------------|-----------|
| Material (built-in) | Always present | `ElevatedButton`, `TextField`, `Checkbox`, `Switch`, `Chip`, etc. |
| Cupertino (built-in) | Always present | `CupertinoButton`, `CupertinoTextField`, etc. |
| flutter_bloc | `flutter_bloc` | Use BLoC pattern for state; pass data down as props |
| go_router | `go_router` | Page-level routing |
| Custom design system | Project-specific `AppTheme` / `AppColors` | Use project tokens (check for active design-system skill) |

**Rule:** Always use Material or Cupertino primitives for Atoms. Never wrap them unnecessarily. If the project has an active design-system skill, all theming goes through `ThemeData` / `AppTheme`.

---

### React Native / Expo
**Signals:** `package.json` with `"react-native"`; `app.json` or `app.config.ts`; `.tsx` files with RN imports

| Library | Signal | Atom usage |
|---------|--------|-----------|
| React Native Paper | `"react-native-paper"` | `<Button>`, `<TextInput>`, `<Chip>`, etc. |
| NativeBase | `"native-base"` | `<Button>`, `<Input>`, etc. |
| Tamagui | `"tamagui"` | `<Button>`, `<Input>`, etc. |
| Expo components | `"expo"` | `<Pressable>`, `<TextInput>`, built-ins |
| None | — | Suggest React Native Paper |

---

### SwiftUI
**Signals:** `*.xcodeproj` or `*.xcworkspace`; `*.swift` files; `import SwiftUI`

| Source | Atom usage |
|--------|-----------|
| SwiftUI native | `Button`, `TextField`, `Toggle`, `Picker`, `List`, `NavigationStack`, etc. — always use native first |
| Custom design system | Project `AppTheme`, `Color` extensions, `Font` extensions — check for tokens |
| Third-party (rare) | Check `Package.swift` or `.xcodeproj` for SPM deps |

**Rule:** Prefer native SwiftUI primitives for all Atoms. Use the project's `Color.*` and `Font.*` token extensions for styling.

---

### Jetpack Compose / Android
**Signals:** `build.gradle.kts`; `*.kt` files with `@Composable`; `compose.kotlinx.coroutines`

| Source | Atom usage |
|--------|-----------|
| Material 3 (Compose) | `Button`, `TextField`, `Checkbox`, `RadioButton`, `Switch`, `TopAppBar`, etc. |
| Material 2 (Compose) | Legacy — note version when detected |
| Custom tokens | `MaterialTheme.colorScheme.*`, `MaterialTheme.typography.*`, custom `Color.kt` |

---

### Kotlin Multiplatform (KMP)
**Signals:** `build.gradle.kts` with `kotlin("multiplatform")`; `commonMain` source set

- Compose Multiplatform: use Material 3 Compose atoms (same as above)
- Decompose to shared UI components; flag platform-specific implementations

---

## Desktop Stacks

### Tauri (Rust + Web frontend)
**Signals:** `tauri.conf.json`; `src-tauri/`

- Frontend: treat as the detected web stack (React, Vue, Svelte, etc.)
- Native layer: not a UI concern for component decomposition

### Electron
**Signals:** `electron` in `package.json`; `main.js` / `preload.js`

- Treat as the detected web stack for the renderer process

### WinUI 3
**Signals:** `*.csproj` with WinUI; `Microsoft.UI.Xaml`

- Use WinUI controls as Atoms: `Button`, `TextBox`, `CheckBox`, `ComboBox`, etc.

### macOS AppKit / SwiftUI (macOS target)
**Signals:** `.xcodeproj` targeting macOS; `import AppKit`

- For SwiftUI macOS: same as SwiftUI above
- For AppKit: use `NSButton`, `NSTextField`, etc.

---

## No Library Detected

When no library is detected and the user hasn't specified one:

1. Suggest the most idiomatic library for the inferred stack (see table below)
2. State the suggestion clearly: "No component library detected. I'll proceed with [library] — run `[install command]` to add it."
3. Proceed with the suggestion unless the user corrects it

| Stack | Suggested library |
|-------|-----------------|
| React / Next.js | shadcn/ui |
| Vue | Vuetify |
| Svelte | shadcn-svelte |
| Angular | Angular Material |
| React Native | React Native Paper |
| Flutter | Material (built-in) |
| SwiftUI | Native primitives |
| Compose | Material 3 (built-in) |

---

## Unlisted Stack or Library

If the stack or library is not in any section above:

1. State what you found: `"Detected [X] — not in the reference list."`
2. Reason about its primitives: what does this platform call its lowest-level interactive elements? (buttons, inputs, toggles, text, icons, containers)
3. Treat those primitives as Atoms and apply the same Atomic Design decomposition rules
4. For libraries not listed, check the library's docs for its component API and note it in the detection output
5. Do **not** refuse or stop — proceed with best judgment and be transparent about assumptions

Examples of unlisted stacks you might encounter (non-exhaustive):
- **Qt / QML** — use `QtQuick.Controls` primitives (Button, TextField, etc.)
- **MAUI / Blazor** — use `Microsoft.Maui.Controls` or Blazor component libraries
- **Unity UI Toolkit** — use `VisualElement`, `Button`, `Label` as Atoms
- **Ionic** — treat as the detected web stack + Ionic component wrappers
- **NativeScript** — treat as the detected web stack with NativeScript view primitives
- **wxPython / Tkinter / GTK** — native widgets as Atoms; no design system assumed
- Any new or niche framework — apply first-principles reasoning

---

## Output Format

Always output the stack+library detection result before the decomposition:

```
**Stack:** [Framework name and version if detectable]
**Component library:** [Library name] — [detected via: explicit / package.json / workspace signals / suggested]
**Design system skill:** [active / not detected]
**Action required:** [none / install command / confirmation needed]
```
