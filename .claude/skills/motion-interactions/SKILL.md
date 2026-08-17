---
name: motion-interactions
description: 'Apply purposeful, subtle animations and interaction states that improve comprehension and feel — without adding noise or slowing users down. Use when reviewing or implementing motion, transitions, animations, interaction feedback, press states, loading states, hover effects, or reduced motion support across web, iOS, Android, or cross-platform apps. Triggers on: animation, motion, transition, easing, duration, interaction state, press state, tap feedback, active state, hover effect, button animation, micro-interaction, loading state, skeleton loader, spinner, haptic, feedback, reduced motion, prefers-reduced-motion, spring animation, gesture, drag, swipe gesture, swipe to dismiss, pull to refresh, page transition, screen transition, navigation animation, UIKit animation, SwiftUI animation, Material motion, React Native animation, Flutter animation, feels janky, feels slow, feels unresponsive.'
---

# Motion & Interactions

Purposeful motion that improves comprehension and feel — without adding noise or slowing users down.

**Relationship to design system skills**: When a project-scoped design system skill is also present, defer to it for animation tokens (durations, easing curves, spring configs). Apply the decision frameworks and interaction principles below on top of whatever the design system defines. This skill does not own tokens — it governs when and how to apply them.

---

## Step 1: Assess the Platform

Before applying any guidance, determine what is being built. Platform conventions differ significantly, and applying web animation patterns to a native app (or vice versa) produces uncanny results.

**Assess using available context in this order:**
1. File extensions — `.swift`, `.kt`, `.dart`, `.tsx`, `.jsx`, `.vue`, `.astro`, etc.
2. Framework imports — `SwiftUI`, `UIKit`, `Jetpack Compose`, `React Native`, `Flutter`, `framer-motion`, etc.
3. Package files — `pubspec.yaml` (Flutter), `Podfile`/`Package.swift` (iOS), `build.gradle` (Android), `package.json` (web/RN)
4. Explicit platform mentions in the conversation or brief

**Platform determination outcomes:**

| Detection | Apply |
|-----------|-------|
| Web framework (React, Vue, Angular, Svelte, HTML/CSS) | [`references/web.md`](references/web.md) |
| Swift / SwiftUI / UIKit | [`references/ios.md`](references/ios.md) |
| Kotlin / Jetpack Compose / Android SDK | [`references/android.md`](references/android.md) |
| React Native | [`references/cross-platform.md`](references/cross-platform.md) — plus the iOS and Android references for per-platform conventions |
| Flutter | [`references/cross-platform.md`](references/cross-platform.md) — plus the iOS and Android references for per-platform conventions |
| Unclear / ambiguous | **Ask before proceeding. Never assume web.** |

Load only the reference for the confirmed platform. The universal principles below always apply.

---

## Universal Principles

These apply regardless of platform.

### Motion must be purposeful

Every animation needs a defensible answer to: *why does this animate?*

Valid purposes:
- **Spatial continuity** — showing where an element came from or where it is going
- **State communication** — confirming that the interface received an action
- **Orientation** — helping the user understand what changed and why
- **Preventing jarring changes** — softening sudden appearance or disappearance

If the purpose is "it looks cool" and the user will see it many times, do not animate.

### High-frequency interactions should not animate

The more often a user triggers an action, the less animation it should carry. An interaction used 100+ times per day should have no meaningful animation — it makes the interface feel slow and disconnected.

| Frequency | Motion budget |
|-----------|---------------|
| Continuous / 100+ per day | No animation |
| Tens of times per day | Minimal or none |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, celebrations) | Can carry delight |

### Reduced motion is mandatory, not optional

Every platform provides a system-level setting that signals the user's motion sensitivity. Respecting it is a baseline requirement, not an enhancement. Reduced motion means fewer and gentler animations — not zero. Opacity and colour transitions that aid comprehension may remain. Position-based and scale-based movement should be removed.

### All interactive elements need a visible response

A user action that produces no visible response feels broken. Every pressable element must confirm it received input. This includes tap, click, hover (where applicable), and focus states. See platform sections for the appropriate response type.

### Do not override framework defaults without a clear reason

Component libraries and UI frameworks ship with sensible animation defaults. Do not replace them unless there is a demonstrable quality improvement. Overriding for the sake of customisation introduces inconsistency and maintenance cost.

---

## Platform Guidance

After Step 1 identifies the platform, load the matching reference — decision frameworks, duration tables, code patterns, gesture rules, and reduced-motion handling live there:

- [`references/web.md`](references/web.md) — animation decision framework, interaction states, springs, gestures, hover gating, asymmetric timing
- [`references/ios.md`](references/ios.md) — SwiftUI/UIKit conventions, animation reference, haptics, gestures
- [`references/android.md`](references/android.md) — Material motion patterns, Compose animation reference, ripple, gestures
- [`references/cross-platform.md`](references/cross-platform.md) — React Native and Flutter

---

## Review Format

When reviewing animation or interaction code, output a markdown table:

| Before | After | Why |
|--------|-------|-----|
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify properties; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nowhere |
| `ease-in` on appearing element | `ease-out` or `spring()` | `ease-in` starts slow — feels unresponsive |
| No press state on button | `scale(0.97)` on `:active` / `.pressed` | All tappable elements must confirm input |
| 400ms modal animation | 250–300ms | UI animations should stay under 300ms |
| Keyframes on dynamically added toast | CSS transition | Transitions retarget on interruption; keyframes restart |
| Hover animation without pointer check | Gated with `@media (hover: hover) and (pointer: fine)` | Touch devices trigger hover on tap |
| Framer Motion `animate={{ x: 100 }}` under load | `animate={{ transform: "translateX(100px)" }}` | Shorthand is not hardware-accelerated |
| Same duration for enter and exit | Enter slower, exit fast (200ms max) | System responses should always feel snappy |

---

## Self-Audit Quick Check

Run this during implementation self-audit (Design Agent Step 9). It is a lightweight gate — not a replacement for the Review Checklist below, which remains the standard for full platform-specific motion reviews.

**Skip entirely** if the component has no interactive states, animations, or loading behaviour.

**First: confirm platform** (per Step 1). Apply the universal checks plus the section matching the confirmed platform.

### Universal
- [ ] Every interactive element has a visible response to input (press scale, colour change, ripple, or equivalent)
- [ ] High-frequency interactions (used 10+ times per session) carry minimal or no animation
- [ ] Reduced motion is handled at the system level — movement-based transitions removed, opacity fades kept
- [ ] Every animation has a named purpose (spatial continuity / state feedback / orientation / softened appearance) — "it looks good" is not a purpose
- [ ] Default framework/library animations are preserved unless there is a clear, demonstrable improvement

### Web
- [ ] Only `transform` and `opacity` animated — no `padding`, `margin`, `height`, or `width`
- [ ] `ease-in` absent from all entering elements — `ease-out` or spring used instead
- [ ] Durations within range: button press 100–160ms; dropdowns 150–250ms; modals 200–350ms
- [ ] Hover animations gated with `@media (hover: hover) and (pointer: fine)`

### iOS native
- [ ] Standard UIKit/SwiftUI transition conventions preserved for navigation and modal presentation
- [ ] Springs used rather than `easeIn` for UI animations
- [ ] `UIAccessibility.isReduceMotionEnabled` / `accessibilityReduceMotion` checked before movement-based animations

### Android native
- [ ] Correct Material motion pattern applied (container transform / shared axis / fade through / fade)
- [ ] Ripple effect intact on all clickable surfaces
- [ ] `animator duration scale` setting affects animation durations

### Cross-platform
- [ ] Platform conventions applied per platform — not a shared compromise across both
- [ ] `useReducedMotion` / `MediaQuery.disableAnimations` applied and respected on both platforms

---

## Review Checklist

### Universal
- [ ] Does every interactive element have a visible response to input?
- [ ] Do high-frequency interactions have minimal or no animation?
- [ ] Is reduced motion respected at the system level?
- [ ] Are default framework/library animations preserved unless there's a clear improvement?
- [ ] Is the animation purposeful — can you name what it communicates?

### Web only
- [ ] Are only `transform` and `opacity` being animated?
- [ ] Is `ease-in` absent from all entering elements?
- [ ] Are durations under 300ms for UI elements?
- [ ] Are hover animations gated with `@media (hover: hover) and (pointer: fine)`?
- [ ] Are rapidly-triggered elements using CSS transitions (not keyframes)?
- [ ] Are popovers using origin-aware `transform-origin`?
- [ ] Are Framer Motion `x`/`y` props replaced with `transform` strings where GPU performance matters?
- [ ] Does `prefers-reduced-motion` remove movement while preserving opacity fades?

### iOS native only
- [ ] Are standard UIKit/SwiftUI transition conventions preserved for navigation?
- [ ] Are springs used rather than `easeIn` curves?
- [ ] Is `UIAccessibility.isReduceMotionEnabled` checked before movement-based animations?
- [ ] Is haptic feedback reserved for meaningful moments (not every tap)?
- [ ] Is there a press/active state on every custom tappable element?

### Android native only
- [ ] Is the correct Material motion pattern used (container transform, shared axis, fade through, fade)?
- [ ] Is the ripple effect intact on all clickable surfaces?
- [ ] Does the `animator duration scale` setting affect animation durations?
- [ ] Is haptic feedback appropriate and not used on routine taps?

### Cross-platform only
- [ ] Are platform conventions applied per-platform, not uniformly?
- [ ] Does the app use `Platform.OS` or equivalent to branch animation behaviour?
- [ ] Is `useReducedMotion` / `MediaQuery.disableAnimations` applied?
- [ ] Are navigation transitions using platform defaults rather than custom web-like animations?

---

## Output Format

Structure output as assessment followed by changes:

```
## Motion & Interaction Assessment

### Platform Detected
[Platform and basis for detection — file types, imports, etc.]

### What's Working
- [Element/pattern]: [Why it's correct]

### Issues Found
| Priority | Element | Issue | Fix |
|----------|---------|-------|-----|
| High | ... | ... | ... |
| Medium | ... | ... | ... |
| Low | ... | ... | ... |

## Changes Applied
[Description of changes made, grouped by element. Each references the principle it addresses.]

### Design System Notes
[Any conflicts or gaps with the active design system skill, if applicable.]
```
