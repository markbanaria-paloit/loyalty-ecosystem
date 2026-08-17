# Stack-Specific Patterns — Per-Stack Additions

When generating a `<stack>.md` reference file, find the section for the detected stack below and add those patterns on top of the universal File 2 template from [output-spec.md](./output-spec.md).

> **This list is not exhaustive.** If the stack is not listed here, use the **Unlisted Stack** section at the bottom — it provides a first-principles procedure for generating a valid reference file for any platform or language.

Only consult the section(s) for the detected stack(s) — not all sections at once.

---

### Flutter / Dart (`flutter-dart.md`)

**Color section additions:**
- Map every token to an `AppColors.[camelCase]` constant (defined in `app_colors.dart`). These constants are for *defining* the palette and assembling `ThemeData` — **they are not the access point in widget code**.
- **Theme-first rule (mandatory):** In any widget, all color access must go through `Theme.of(context).colorScheme.*` whenever the token has a `ColorScheme` semantic slot. Direct `AppColors.*` references inside widget trees are forbidden for those tokens.
- Include a three-column token mapping table: `token name` → `AppColors constant` (definition/theme assembly use) → `colorScheme.*` slot (widget use). Tokens with no `ColorScheme` slot (status, accent) must be explicitly marked `— (use AppColors.* directly)`.
- Generate a forbidden/correct code snippet that shows:
  - ❌ `AppColors.primaryXxx` used directly inside a widget tree (wrong for mapped tokens)
  - ✅ `Theme.of(context).colorScheme.primary` (correct for mapped tokens)
  - ✅ `AppColors.statusXxx` (correct *only* for tokens with no ColorScheme equivalent)
- Show `withOpacity()` rules: permitted only on status/accent tokens for light-fill surfaces; forbidden on primary or neutral colors.

**Typography section additions:**
- Map to `AppTextStyles.[name]` constants
- Rule: `.copyWith(color:)` only; never change `fontSize`, `fontWeight`, `letterSpacing`, `height`

**Spacing section additions:**
- Map to `AppSpacing.s[N]` constants
- Add BorderRadius snapping rule: must snap to nearest token value

**Theme section additions:**
- `AppTheme.light` sets all component themes; do not override `AppBar`, `Chip`, `Card`, `TextField` properties inline
- Exception list: tokens explicitly marked with no `ColorScheme` equivalent (status colors, accent colors) — these are the *only* cases where `AppColors.*` is used directly in widget code

**Extra checklist items:**
- No `Color(0xFF…)` literals anywhere outside `app_colors.dart`
- No `AppColors.*` direct references in widget trees for tokens that have a `colorScheme.*` mapping
- `Theme.of(context).colorScheme.*` used for all semantically mapped colors in widgets
- No `TextStyle(…)` raw construction
- No inline `AppBar`, `Chip`, `Card` style overrides

---

### React / Next.js (`react.md` or `next.md`)

**Color section additions:**
- Palette constants: CSS custom properties declared in `:root {}` in `globals.css` / `tokens.css` — these are the *definition* layer
- **Theme-first rule:** components always consume colors via `var(--token-name)` in CSS/Tailwind classes; never import raw hex constants directly into component files
- Tailwind: map tokens to `tailwind.config` `colors` keys and always use utility classes (`bg-brand-primary`, `text-ink`) — never `style={{ color: '#...' }}`
- Inline style objects: if CSS classes are insufficient, use typed constants from a `tokens.ts` file; never raw hex strings

**Typography section additions:**
- Map to Tailwind `fontSize`/`fontWeight` utilities or CSS classes
- No `style={{ fontSize: N }}` inline overrides

**Component section additions:**
- shadcn/ui and Radix components: configure via CSS variables in `globals.css`; do not override via inline `style` prop

---

### Vue (`vue.md`)

**Color section additions:**
- Palette constants: CSS custom properties in `:root {}` — the *definition* layer; never duplicated in component `<style>` blocks
- **Theme-first rule:** always consume via `var(--token-name)` in `<style scoped>` or utility classes; never bind raw hex in `:style` or `<script setup>`
- Composable-based design tokens: if a runtime token composable exists (`useDesignTokens()`), use it — never raw hex in `<script setup>`

**Typography section additions:**
- CSS utility classes (e.g. `.type-card-title`) instead of inline `style` bindings

---

### Swift / SwiftUI (`swift-swiftui.md`)

**Color section additions:**
- Palette constants: `Color` extension constants (`Color.brandPrimary`) or named Asset Catalog entries — the *definition* layer
- **Theme-first rule:** SwiftUI's environment is the theme layer; prefer semantic environment values (`.foregroundStyle(.primary)`, `Color.accentColor`, `Color("SemanticName")`) over directly calling `Color.brandPrimary` in views whenever an environment-level semantic exists. List which tokens map to SwiftUI semantic slots and which are palette-only.
- No `Color(hex:)` inline calls anywhere

**Typography section additions:**
- Custom `Font` extension: `Font.appHeroDisplay`, `Font.appBody` — no `.system(size:weight:)` inline calls
- `foregroundColor` / `.foregroundStyle` must use a `Color.*` token, not a literal

**Spacing section additions:**
- `CGFloat` constants: `Spacing.s16`, `Spacing.s24` — no raw number literals in `.padding()` or `.frame()`

---

### Android / Compose (`android-compose.md`)

**Color section additions:**
- Palette constants: token constants in `Color.kt` — the *definition* layer and theme assembly only
- **Theme-first rule (mandatory):** composables must read colors from `MaterialTheme.colorScheme.*`; direct `Color.kt` constant references inside composables are forbidden for any token that has a `colorScheme` slot. Use constants directly only for non-semantic tokens (e.g. status surfaces) that have no `colorScheme` equivalent.
- No `Color(0xFF…)` literals in composables

**Typography section additions:**
- `MaterialTheme.typography.*` for type scale; custom `Type.kt` for extended levels
- No `TextStyle(fontSize = N.sp)` inline construction in composables

**Spacing section additions:**
- `Dp` constants in `Spacing.kt`: `Spacing.s16`, `Spacing.s24`
- No raw `.dp` literals: `16.dp` → `Spacing.s16`

---

### Angular (`angular.md`)

**Color section additions:**
- Palette constants: CSS custom properties defined in `:root` (global styles) — the *definition* layer
- **Theme-first rule:** components consume colors only via `var(--token-name)` in their `.scss`/`.css`; never bind raw hex via `[style.color]`; never import a TypeScript color constant into a component just for a style binding

**Typography section additions:**
- Utility CSS classes applied via `[class]` binding, not inline `style`

---

### Plain CSS / SCSS (`css.md`)

**Color section additions:**
- All tokens as `--[token-name]: [value]` in `:root {}`
- No raw hex outside that block

**Typography section additions:**
- One utility class per type-scale level; never inline `font-size` / `font-weight` in component styles

**Spacing section additions:**
- CSS custom properties: `--space-1: [N]px;` in `:root {}`; all component spacing via `var(--space-N)`

---

### Svelte / SvelteKit (`svelte.md`)

**Color section additions:**
- Palette constants: CSS custom properties in `:root {}` (in `app.css` or a global stylesheet) — the *definition* layer; never duplicated in component `<style>` blocks
- **Theme-first rule:** consume via `var(--token-name)` in component `<style>` or `<style scoped>`; never bind raw hex in `:style=` or `<script>` variables
- Tailwind (if also detected): use utility classes; never `style="color: #..."` inline attributes

**Typography section additions:**
- CSS utility classes or `var(--type-*)` custom properties; no inline `style="font-size: N"`

**Spacing section additions:**
- `var(--space-N)` from `:root`; no raw pixel literals in `<style>` blocks

**Extra checklist items:**
- No raw hex values in `<style>` blocks
- No inline `style=` bindings for values that have a token

---

### React Native / Expo (`react-native.md`)

**Color section additions:**
- Palette constants: a typed `colors.ts` (or `tokens.ts`) module that exports all color values — the *definition* and *only* usage layer (React Native has no CSS variable runtime)
- **Theme-first rule:** if the project uses a design system runtime (React Native Paper `MD3Theme`, Tamagui token system, NativeBase theme), read colors from the theme object (`useTheme().colors.*`) in components; import raw constants only for tokens with no theme slot
- No inline `color: '#XXXXXX'` in `StyleSheet.create()` calls

**Typography section additions:**
- Typed `typography.ts` constants for every type-scale entry; no inline `fontSize: N` in `StyleSheet.create()`
- If using React Native Paper: use `Text` variant prop (`<Text variant="titleLarge">`) instead of raw style

**Spacing section additions:**
- Typed `spacing.ts` constants: `Spacing.s16`, `Spacing.s24`; no raw number literals in `StyleSheet` margin/padding
- No Tailwind (not supported in RN without additional tooling like NativeWind — note if NativeWind is detected)

**Extra checklist items:**
- No `StyleSheet.create({ … color: '#…' })` raw hex
- No raw numeric spacing literals in StyleSheet

---

### Tailwind CSS (`tailwind.md`)

**Color section additions:**
- All tokens mapped to `tailwind.config` `theme.extend.colors` — use semantic keys (`brand-primary`, `ink-default`, `surface-card`) that match `tokens.md`
- **Theme-first rule:** always use Tailwind utility classes (`bg-brand-primary`, `text-ink-default`); never use `style={{ color: '#...' }}` or arbitrary `[#hex]` Tailwind values
- Arbitrary values (e.g. `bg-[#1a1a1a]`) are forbidden — if a color isn't in the config, add it as a named token first

**Typography section additions:**
- Map type scale to `tailwind.config` `theme.extend.fontSize` / `fontWeight` keys; use the named classes (`text-card-title`, `font-semibold`) — never arbitrary `text-[18px]`

**Spacing section additions:**
- Map spacing scale to `tailwind.config` `theme.extend.spacing`; use the named scale (`p-4`, `gap-6`) — never arbitrary `p-[17px]`

**Extra checklist items:**
- No arbitrary `[value]` Tailwind classes for anything that has a named token
- No `style=` attribute containing a design value that could be a class

---

### Plain HTML (`html.md`)

**Color section additions:**
- All tokens declared as `--[token-name]: [value]` in `:root {}` in the page stylesheet
- No `color="#..."` attributes; no `style="color: #..."` inline attributes; all color via CSS classes or `var(--token)`

**Typography section additions:**
- Named CSS classes for every type-scale level (`.type-hero`, `.type-body`); never `style="font-size: Npx"`

**Spacing section additions:**
- `var(--space-N)` from `:root`; no raw px values in `style=` attributes

**Extra checklist items:**
- No presentational HTML attributes (`color`, `bgcolor`, `width`, `height`) — CSS only
- No inline `style=` for anything that has a token

---

### Solid / Qwik / Astro (`solid.md` / `qwik.md` / `astro.md`)

Treat as React-like. Apply the React / Next.js rules as the baseline, then adapt idioms:

- **Solid:** no virtual DOM; use `createSignal`-based state; CSS Modules or `class:` directive for styling — same token rules as React
- **Qwik:** serializable components; same CSS-in-JS / Tailwind token rules as React
- **Astro:** `.astro` files use `<style>` scoped blocks — same CSS custom property rules as Vue/Svelte for the style layer; any component islands follow their own framework's rules (React island → React rules, Vue island → Vue rules)

No raw hex in any component file. All colors via CSS variables or typed constants per the React pattern.

---

### Kotlin Multiplatform (`kotlin-multiplatform.md`)

**Color section additions:**
- Shared palette constants in `commonMain`: `Color.kt` with `val BrandPrimary = Color(0xFF…)` — the *definition* layer only
- **Platform split:** Compose targets (Android, Desktop) → `MaterialTheme.colorScheme.*` in composables (same as `android-compose.md`); iOS/SwiftUI targets → `Color.*` extensions (same as `swift-swiftui.md`)
- No `Color(0xFF…)` literals inside any composable or SwiftUI view

**Typography section additions:**
- Shared `Typography.kt` or `Type.kt` for Compose targets; `Font.*` extension for SwiftUI targets
- No raw `TextStyle(fontSize = N.sp)` in composables

**Spacing section additions:**
- Shared `Spacing.kt` with `Dp` constants for Compose; `CGFloat` / `Spacing.swift` for SwiftUI targets

**Extra checklist items:**
- Platform-specific UI code follows the platform's own reference (see `android-compose.md` / `swift-swiftui.md`)
- Shared business logic must not contain UI color or style references

---

### Tauri (`tauri.md`)

Tauri's design system enforcement applies to the **web frontend only**. The Rust backend has no UI.

- Detect the web stack used in the renderer (React, Vue, Svelte, Solid, plain HTML, etc.)
- Apply that stack's reference file for all UI code
- This file (`tauri.md`) serves as a redirect note — include one bullet in the generated `SKILL.md`: "Tauri app — UI in [detected web stack]: apply `[web-stack].md`"
- No special token mappings; token rules are fully inherited from the renderer stack

---

### Electron (`electron.md`)

Same pattern as Tauri. Electron's design system enforcement applies to the **renderer process** (web frontend) only.

- Detect the renderer web stack (React, Vue, Svelte, Angular, plain HTML, etc.)
- Apply that stack's reference file for all renderer UI code
- This file serves as a redirect note — include: "Electron app — renderer uses [detected web stack]: apply `[web-stack].md`"
- Main process / preload scripts are not UI code; no token rules apply there

---

### WinUI 3 (`winui.md`)

**Color section additions:**
- Palette constants: static `Color` resources in a `ResourceDictionary` XAML file (`Colors.xaml`) or C# static class — the *definition* layer
- **Theme-first rule:** consume colors via `{StaticResource TokenName}` or `{ThemeResource TokenName}` in XAML; never inline `Background="#XXXXXX"` attributes
- `ApplicationTheme` / `ElementTheme` provides light/dark switching — map tokens to both `Light` and `Dark` resource dictionary sections when applicable

**Typography section additions:**
- Named `TextBlock` styles in ResourceDictionary (`HeroTextStyle`, `BodyTextStyle`); no `FontSize="N"` inline attributes

**Spacing section additions:**
- `Thickness` resource entries: `<Thickness x:Key="SpaceS16">16</Thickness>`; use `{StaticResource SpaceS16}` in `Padding`/`Margin`; no raw numeric literals

**Extra checklist items:**
- No inline XAML color attributes (`Background="#..."`, `Foreground="#..."`)
- No inline `FontSize=` or `FontWeight=` outside a named style

---

### macOS AppKit (`appkit.md`)

**Color section additions:**
- Palette constants: `NSColor` extension constants (`NSColor.brandPrimary`) or named Asset Catalog colors — the *definition* layer
- **Theme-first rule:** prefer semantic `NSColor` system colors (`.labelColor`, `.secondaryLabelColor`, `.controlAccentColor`) when they express the design intent; use `NSColor.brandPrimary` only for tokens with no semantic system equivalent
- Asset Catalog named colors support automatic dark mode — use them for any token with both light and dark values

**Typography section additions:**
- `NSFont` extension constants (`NSFont.appBody`, `NSFont.appHeroDisplay`); no `.systemFont(ofSize: N)` inline calls

**Spacing section additions:**
- `CGFloat` constants (`Spacing.s16`); no raw number literals in `NSView` constraint constants or `NSStackView.spacing`

**Extra checklist items:**
- No `NSColor(hex:)` or raw `NSColor(red:green:blue:)` in view code
- Appearance-sensitive assets must use Asset Catalog, not runtime `if effectiveAppearance` branches

---

### Unlisted Stack

If the stack is not listed above:

1. Use the universal required sections template (File 2 in [output-spec.md](./output-spec.md)) as the base
2. Adapt the token mapping patterns to the platform's idioms:
   - **Color:** how are color constants defined in this platform/language? (CSS vars, typed constants, XML resources, enum values, etc.)
   - **Theming:** does this platform have a runtime theme system? (CSS custom properties, Material theming, SwiftUI environment, etc.) — if yes, mandate theme-first access; if no, typed constants are the access layer
   - **Typography / Spacing:** how are these consumed? (utility classes, `StyleSheet`, `TextStyle`, XML attributes, etc.)
3. Name the file after the framework: `elm.md`, `unity-csharp.md`, `qt-qml.md`, etc.
4. Add a comment at the top of the generated file: `<!-- Stack: [name], not in default list — rules derived from first principles -->`
5. The forbidden pattern section must still show: ❌ raw literal, ✅ named constant/token
