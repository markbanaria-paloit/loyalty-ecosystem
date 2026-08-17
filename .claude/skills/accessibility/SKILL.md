---
name: accessibility
description: 'Audit and improve interfaces for accessibility compliance across web and native mobile platforms. Use when reviewing a UI, flow, component, or wireframe for accessibility issues; generating accessible markup or component specs; checking WCAG compliance; or producing accessibility annotations. Targets WCAG 2.2 Level AA for web, Apple HIG for iOS native, Material Design accessibility guidelines for Android native, and both in parallel for cross-platform. Triggers on: accessibility, a11y, WCAG, screen reader, VoiceOver, TalkBack, accessible, contrast ratio, touch target, Dynamic Type, focus order, keyboard navigation, alt text, ARIA, inclusive design, accessibility audit, accessibility review.'
---

# Accessibility

A consultancy-grade accessibility skill applicable across web, iOS native, Android native, and cross-platform solutions. Framework-agnostic and brand-agnostic.

**Relationship to design system skills**: When a project-scoped design system skill is also present, defer to it for specific token values (colour, type sizes, spacing). This skill applies accessibility requirements on top of whatever tokens that system defines. Where a token conflicts with a WCAG or platform requirement, this skill takes precedence and the conflict should be flagged.

---

## Step 0: Assess the Platform

Before applying any accessibility guidance, determine the solution type. The standard to apply depends on the platform being built.

### How to determine the platform

Review available context in order:
1. **Explicit statement** — Has the user or brief named the platform (web, iOS, Android, React Native, Flutter)?
2. **Tech stack or framework** — File extensions, imports, or config files indicating the environment (`.html`, `.swift`, `.kt`, `react-native`, `flutter`).
3. **File structure or naming conventions** — Folders named `ios/`, `android/`, `web/`, or platform-specific patterns.
4. **Component language** — References to `UIViewController`, `Activity`, `<div>`, or equivalent.

**If the platform cannot be determined from context, ask before proceeding. Never assume web by default.**

### Platform → Standard mapping

| Platform | Standard to apply |
|---|---|
| Web (browser) | WCAG 2.1 / 2.2, target Level AA, minimum Level A. Four core principles: Perceivable, Operable, Understandable, Robust. |
| iOS native | Apple iOS Human Interface Guidelines (HIG) accessibility principles: VoiceOver, Dynamic Type, 44×44pt minimum touch targets, system accessibility setting support. |
| Android native | Google Material Design accessibility guidelines: TalkBack, scalable text, 48×48dp minimum touch targets, system accessibility setting support. |
| Cross-platform (React Native, Flutter, etc.) | Apply iOS and Android guidelines in parallel. Meet native expectations on each platform — do not default to the lowest common denominator. |

---

## 1. Web Accessibility (WCAG 2.1 / 2.2)

Target: Level AA. Minimum baseline: Level A.

Organised by the four core principles: **Perceivable, Operable, Understandable, Robust**.

---

### 1.1 Perceivable

Users must be able to perceive all information and interface components.

**Principles**
- Every non-text content element (images, icons, charts, illustrations) must have a text alternative that serves the equivalent purpose. Decorative elements must be hidden from assistive technology (`alt=""` or `aria-hidden="true"`).
- Captions are required for all pre-recorded audio or video. Live audio requires live captions.
- Do not use colour as the only means of conveying information, indicating an action, prompting a response, or distinguishing a visual element. Always pair colour with a second signal: label, icon, pattern, or position.
- Text must meet minimum contrast ratios: **4.5:1** for normal text (below 18pt / 14pt bold); **3:1** for large text (18pt+ or 14pt+ bold) and for UI components and graphical objects that convey meaning.
- Text must be resizable up to 200% without loss of content or functionality. Avoid fixed pixel heights that clip or overflow on zoom.
- Content must reflow to a single column at 320px-equivalent width without horizontal scrolling (WCAG 2.2, 1.4.10). Do not rely on two-dimensional scrolling for reading content.
- Do not use text rendered in images. Use actual text where possible.

**Checks**
- Does every meaningful image have a text alternative that serves the same purpose?
- Are there any colour-only signals (e.g. red = error, green = success with no other differentiator)?
- Does all body text meet 4.5:1 contrast? Do all large text and UI components meet 3:1?
- Does the layout reflow cleanly at 320px width?
- Are captions or transcripts provided for all media?

---

### 1.2 Operable

Users must be able to operate all interface components and navigation.

**Principles**
- Every interactive element must be reachable and operable by keyboard alone. Test Tab, Shift+Tab, Enter, Space, and arrow key navigation.
- Focus must be visible at all times on keyboard-navigable elements. Do not use `outline: none` without providing an equivalent visible focus indicator. The focus indicator must meet a minimum contrast ratio of 3:1 against adjacent colours.
- Focus order must follow a logical, meaningful sequence — typically matching the visual reading order of the page.
- Do not create keyboard traps: users must be able to navigate into and out of every component using only the keyboard.
- Skip navigation links must be provided to allow keyboard users to bypass repeated navigation blocks and reach the main content directly.
- All functionality that uses multi-point or path-based gestures (e.g. pinch, swipe, drag) must have a single-pointer alternative (WCAG 2.1, 2.5.1).
- Touch targets must be at least **24×24px** (WCAG 2.2, 2.5.8 Level AA).
- Do not make pointer down the trigger for action where the pointer up event can be used instead. This allows users to cancel accidental interactions (WCAG 2.1, 2.5.2).

**Checks**
- Can every interactive element be reached and activated by keyboard alone?
- Is focus always visible? Does the focus indicator meet 3:1 contrast?
- Does the focus order match the logical reading order?
- Are there any keyboard traps?
- Do all interactive touch targets meet the 24×24px minimum (WCAG 2.5.8)?
- Is there a skip navigation link?
- Are multi-point gestures accompanied by single-pointer alternatives?

---

### 1.3 Understandable

Users must be able to understand the information and how to operate the interface.

**Principles**
- The language of the page must be declared in the `<html lang>` attribute. Language changes within the page must be marked up with `lang` on the relevant element.
- Do not trigger context changes (page redirects, form submissions, focus shifts) on input alone without warning. Changes should be triggered by explicit user action (e.g. pressing a Submit button).
- Provide clear labels for all form inputs. Labels must be programmatically associated (not just visually adjacent). Placeholder text alone does not constitute a label.
- Error messages must identify which field contains the error and describe what the user needs to do to correct it. Do not use colour alone to indicate errors.
- Error suggestions must be provided where known (e.g. "Date must be in DD/MM/YYYY format").
- For critical, irreversible actions (e.g. deleting an account, submitting a legal form), provide a confirmation step, review opportunity, or the ability to reverse the action.
- Use plain language. Avoid jargon where possible. Reading level should be appropriate for the target audience.

**Checks**
- Is `lang` set on the `<html>` element and on any language-switch regions?
- Do all form inputs have a programmatically associated label?
- Are error messages specific, actionable, and not colour-only?
- Does any input change trigger an unexpected context change?
- Are destructive or irreversible actions confirmed or reversible?

---

### 1.4 Robust

Content must be robust enough to be reliably interpreted by a wide variety of user agents, including assistive technology.

**Principles**
- Use valid, well-formed HTML. Parsing errors can cause assistive technology to mis-read or skip content.
- All interactive components must have a programmatically determinable name, role, and state. Use native HTML elements where possible; supplement with ARIA only where native semantics are insufficient.
- Follow the ARIA authoring practices for custom component patterns (e.g. modal dialogs, comboboxes, tabs, accordions). Do not use ARIA roles that conflict with native HTML semantics.
- Status messages (e.g. form submission confirmations, live search result counts) must be programmatically determinable without requiring focus, using `aria-live` regions or equivalent (WCAG 2.1, 4.1.3).
- Interactive elements must communicate their current state to assistive technology: expanded/collapsed, selected/unselected, checked/unchecked, invalid, disabled.

**Checks**
- Are all interactive components using appropriate semantic HTML or ARIA roles?
- Do all form controls, buttons, and links have discernible names?
- Are dynamic state changes (e.g. modals opening, toasts appearing) announced to screen readers?
- Are there any ARIA misuses (e.g. `role="button"` on a non-interactive element, missing required ARIA properties)?

---

## 2. iOS Native Accessibility (Apple HIG)

**Principles**
- All interactive and informational elements must be accessible to VoiceOver. Elements without visible labels must have an `accessibilityLabel`. Elements whose visible label is insufficient must have an `accessibilityHint`.
- Every interactive element must have a minimum touch target of **44×44pt**. Elements smaller than this must have their touch target extended programmatically (`contentEdgeInsets` or similar) without altering visual appearance.
- Support **Dynamic Type** across all text in the interface. Do not use fixed font sizes. Use UIFont text styles (`.body`, `.headline`, `.caption1`, etc.) and test at the smallest and largest Dynamic Type sizes, including Accessibility sizes.
- Ensure all custom UI components expose their accessibility traits correctly: buttons must have the `.button` trait; headers must have the `.header` trait; selected states must report correctly.
- Support system accessibility settings: Bold Text, Increase Contrast, Reduce Transparency. Do not suppress or override these settings.
- Interactive elements must be navigable in a logical order via VoiceOver's swipe navigation. Use `accessibilityViewIsModal` for modals to prevent VoiceOver from reaching content behind the overlay.
- Images and icons that convey meaning must have descriptive `accessibilityLabel` values. Purely decorative images must set `isAccessibilityElement = false`.
- Custom gestures (e.g. swipe to dismiss) must have a VoiceOver-accessible alternative action.
- Avoid placing critical information solely in imagery — VoiceOver cannot interpret visual-only information.
- Group related elements using `accessibilityElements` or `shouldGroupAccessibilityChildren` where appropriate to reduce VoiceOver verbosity.

**Checks**
- Do all interactive elements have a 44×44pt touch target?
- Is Dynamic Type supported throughout, including Accessibility text sizes?
- Do all custom components expose the correct accessibility traits?
- Does VoiceOver navigate in a logical, meaningful order?
- Are modals trapping VoiceOver correctly within their bounds?
- Are system accessibility settings (Increase Contrast, Bold Text, Reduce Transparency) respected?
- Do all meaningful images have `accessibilityLabel` values?

---

## 3. Android Native Accessibility (Material Design / TalkBack)

**Principles**
- All interactive and informational elements must be accessible to TalkBack. Elements without visible labels must have `contentDescription` set. Elements that should be skipped by TalkBack must set `importantForAccessibility="no"`.
- Every interactive element must have a minimum touch target of **48×48dp**. Smaller elements must have their touch target extended (e.g. using `minWidth`/`minHeight` or `TouchDelegate`) without altering visual size.
- Support scalable text throughout the interface. Use `sp` units for all text sizes, never `dp` or `px` for font sizes. Test at system font scales of 1.0× (default) and 2.0× (maximum).
- Ensure all custom UI components expose correct accessibility semantics via `AccessibilityNodeInfoCompat`. Use `ViewCompat.setAccessibilityDelegate` for custom roles and states.
- Support system accessibility settings: Large Text, High Contrast Text, Colour Correction. Do not suppress these settings.
- Interactive elements must be navigable in a logical order via TalkBack's linear navigation. Use `android:accessibilityTraversalAfter` / `Before` to correct ordering where the natural DOM/view hierarchy does not match visual reading order.
- Images and icons that convey meaning must have a `contentDescription`. Decorative images must set `contentDescription=""` or `importantForAccessibility="no"`.
- Custom gestures must have accessible alternatives navigable via TalkBack.
- Avoid conveying state changes only through animation. State changes must be announced via `AccessibilityEvent` or `announceForAccessibility`.

**Checks**
- Do all interactive elements have a 48×48dp touch target?
- Is scalable text using `sp` units throughout? Tested at 2× font scale?
- Do all custom components expose correct accessibility semantics?
- Does TalkBack navigate in a logical, meaningful order?
- Are system accessibility settings (Large Text, High Contrast, Colour Correction) respected?
- Do all meaningful images have `contentDescription` values?
- Are state changes announced programmatically?

---

## 4. Cross-Platform (React Native, Flutter, and equivalents)

Apply iOS and Android guidelines in parallel. Do not default to the lowest common denominator.

**Principles**
- Meet native expectations on each target platform, not a compromise position between them.
- Touch target minimums are platform-specific and must be met independently: **44×44pt on iOS**, **48×48dp on Android**. Specify both values in design specifications rather than a single shared target.
- Scalable text: support Dynamic Type on iOS; use `sp`-equivalent scaling on Android. Never fix font sizes in cross-platform code if the framework allows system font scaling.
- Screen reader support: VoiceOver on iOS, TalkBack on Android. Use the framework's accessibility API (`accessibilityLabel`, `accessibilityHint`, `accessibilityRole` in React Native; `Semantics` widget in Flutter) and verify behaviour on both platforms with both screen readers.
- Do not use a single `accessibilityLabel` where platform conventions differ. Test announcements on both platforms and adjust if the output is misleading or verbose on either.
- For platform-specific accessibility gaps (e.g. a feature the framework does not bridge natively), implement platform-specific overrides rather than accepting the gap.

**Checks**
- Do design specs call out 44×44pt (iOS) and 48×48dp (Android) touch targets independently?
- Is scalable text working on both iOS (Dynamic Type) and Android (sp scaling)?
- Are screen reader labels correct when tested with VoiceOver and with TalkBack separately?
- Are platform accessibility settings respected on both platforms?
- Have any framework-level accessibility gaps been addressed with platform overrides?

---

## Audit & Improve Procedure

This skill operates in two phases: **audit first, then improve**. Do not jump to improvements without completing the audit.

### Phase 1: Audit

1. **Confirm platform** — Apply Step 0. If platform is unclear, stop and ask.
2. **Structural pass** — Review semantic structure, heading hierarchy, landmark regions (web) or view hierarchy (native). Does the structure communicate meaning without visual styling?
3. **Colour and contrast pass** — Check all text and UI components against the relevant contrast minimums. Check for colour-only signals.
4. **Interactive element pass** — Check touch target sizes, keyboard operability (web), focus order, and focus visibility.
5. **Labels and names pass** — Verify all interactive and informational elements have discernible programmatic names.
6. **State and feedback pass** — Check that dynamic states (expanded, selected, error, loading) are communicated to assistive technology.
7. **Form and error pass** (web or native forms) — Check label association, error identification, and error suggestion.
8. **Platform-specific checks** — Apply the platform-specific checklist from section 1, 2, 3, or 4 as appropriate.

Tie every issue to a specific criterion or principle. Do not flag preferences as accessibility issues.

### Phase 2: Improve

Apply improvements in priority order:

- **Critical**: Failures that block assistive technology users entirely (no accessible name, keyboard trap, missing captions for essential content). Fix before any other work.
- **High**: Failures against WCAG Level A (web) or equivalent platform minima. These represent non-compliance with the baseline standard.
- **Medium**: Failures against WCAG Level AA (web) or best-practice platform guidance. These represent the compliance target.
- **Low**: Enhancements beyond the target standard that improve experience but are not required for compliance.

When making improvements:
- Reference the specific criterion or principle being addressed for each change.
- Prefer semantic HTML and native platform components over custom solutions with ARIA or accessibility overrides.
- Where a design system token conflicts with an accessibility requirement, flag the conflict explicitly rather than silently overriding.
- Do not introduce new accessibility issues while fixing existing ones (e.g. adding `aria-label` that conflicts with visible text).

---

## Output Format

Structure output as audit followed by improvements:

```
## Accessibility Assessment — [Platform]

### Standard Applied
[WCAG 2.2 Level AA | Apple HIG | Material Design Accessibility | Cross-platform (iOS + Android)]

### What's Working
- [Criterion / Principle]: [Observation — why it passes]

### Issues Found
| Priority | Criterion / Principle | Platform | Observation | Recommended Fix |
|---|---|---|---|---|
| Critical | WCAG 1.3.1 / Role | Web | Button rendered as `<div>` — no role or keyboard access | Replace with `<button>` or add `role="button"` + `tabindex="0"` + keyboard handler |
| High | WCAG 1.4.3 / Contrast | Web | Body text #767676 on white fails 4.5:1 (actual: 4.48:1) | Use #757575 or darker |
| Medium | iOS HIG / Touch target | iOS | Icon button 32×32pt — below 44×44pt minimum | Extend touch target to 44×44pt |
| Low | WCAG 2.4.6 / Headings | Web | Section headings present but not descriptive | Make headings describe their section content |

## Improvements Applied
[Description of changes made, grouped by criterion. Each change references the issue it resolves.]

### Design System Notes
[Any token conflicts with the active design system skill that require resolution.]

### Open Items
[Issues that require human decision, content, or platform verification before they can be resolved.]
```

---

## Self-Audit Quick Check

Run this during implementation self-audit (Design Agent Step 9). It is a lightweight gate — not a replacement for Phase 1 Audit, which remains the standard for full standalone accessibility reviews.

**First: confirm platform** (Step 0). Apply the universal checks plus the section matching the confirmed platform.

### Universal
- [ ] Every interactive element has a discernible programmatic name (`aria-label`, `accessibilityLabel`, `contentDescription`, or associated visible label)
- [ ] No colour-only signals — every colour indicator is paired with a second signal (icon, label, pattern, or position)
- [ ] Dynamic states (error, loading, expanded, selected, disabled) are communicated to assistive technology — not visually only
- [ ] Destructive or irreversible actions require explicit user confirmation — not triggered by input alone
- [ ] Reduced motion is respected wherever animations are present

### Web
- [ ] Text contrast meets 4.5:1 for normal text; 3:1 for large text and UI components
- [ ] Every interactive element is keyboard-reachable and operable (Tab, Enter, Space, arrow keys); focus indicator visible with 3:1 contrast against adjacent colours
- [ ] All form inputs have a programmatically associated, always-visible label — placeholder text alone is not a label
- [ ] Interactive targets meet the 24×24px minimum (WCAG 2.5.8)

### iOS native
- [ ] All custom tappable elements have a 44×44pt minimum touch target
- [ ] Dynamic Type supported throughout — no fixed font sizes; tested at largest Accessibility text size
- [ ] VoiceOver navigates in logical order; modals trap VoiceOver focus within their bounds

### Android native
- [ ] All interactive elements have a 48×48dp minimum touch target
- [ ] All text uses `sp` units; layout tested at 2× font scale
- [ ] TalkBack navigates in logical order; state changes announced programmatically

### Cross-platform
- [ ] Touch target minimums specified independently: 44×44pt (iOS) and 48×48dp (Android)
- [ ] Screen reader behaviour tested separately with VoiceOver (iOS) and TalkBack (Android)
