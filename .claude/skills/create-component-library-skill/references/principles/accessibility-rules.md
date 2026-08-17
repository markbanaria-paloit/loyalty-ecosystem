# Accessibility Rules — Mandatory A11y Requirements

Every component must be accessible to all users by default. Accessibility is not a feature — it is a baseline requirement.

---

## Semantic Labels 🔴

Every meaningful interactive or informative element must have a text description for assistive technology.

| Element Type | Rule |
|-------------|------|
| Interactive (button, link, toggle) | **Must** have a clear, concise label describing its action |
| Meaningful image | **Must** have a description of what it conveys |
| Decorative image | **Must** be hidden from assistive tech |
| State indicator (badge, progress) | **Must** announce its current value |
| Dynamic updates (toast, live data) | **Must** use live region/announcement to notify |

### Label Quality

- Describe **what**, not **how**: "Delete message" not "Tap to delete"
- Keep labels short: 2–4 words for buttons, brief sentence for complex elements
- Include state when relevant: "Favorite, selected" not just "Favorite"
- Never use technical terms: "Submit" not "POST request"
- Labels must be localized (from translation system, not hardcoded)

---

## Semantic Roles 🔴

Interactive elements must declare their semantic type so assistive technology knows how to present and operate them:

| Role | When to apply |
|------|--------------|
| **Button** | Any tappable element that triggers an action |
| **Link** | Navigates to another screen/page |
| **Heading** | Section titles (enables heading-based navigation) |
| **Image** | Meaningful visual content |
| **Switch / Toggle** | On/off controls |
| **Checkbox** | Multi-select options |
| **Slider** | Range selection |
| **Tab** | Tab bar items |
| **Alert** | Important notifications |
| **Summary** | Grouped semantic content |

**Rule:** if a component is interactive but doesn't use a platform-native interactive element (e.g., a custom tappable container), you **must** explicitly declare its role.

---

## Touch Targets 🔴

| Requirement | Minimum |
|-------------|---------|
| Touch target size | 44×44pt (iOS) / 48×48dp (Android/RN) — use the platform's minimum |
| Spacing between targets | 8 units minimum |

### Expanding targets without visual change

When the visual element is smaller than the minimum (icon buttons, chips):
- Use the platform's hit-area expansion mechanism (hitSlop, sizeIn, contentShape)
- The **visual** size can be small; the **touch** area must meet the minimum
- Never sacrifice visual design, but always maintain accessibility

---

## Grouping & Merging 🟡

### When to group

A set of related elements that form one semantic unit (card = icon + title + value) should be read as **one stop** by the screen reader:
- Group reduces noise and improves navigation speed
- The group gets a single combined label

### When NOT to group

- Elements with independent actions (a card with separate buttons) stay separate
- Don't over-merge: if an element inside needs its own interaction, it stays independent

---

## Hiding Decorative Content 🔴

- Dividers, background shapes, ornamental icons → **hidden** from assistive tech
- If an icon accompanies text and the text alone conveys the meaning → icon is decorative, hide it
- If an icon is the **only** indicator of meaning → it is NOT decorative, give it a label

---

## Text Scaling Adaptation 🔴

Users increase system font size for readability. The component must adapt:

| Font Scale | Adaptation Required |
|------------|-------------------|
| 1.0× – 1.3× | Standard layout (no changes expected) |
| 1.3× – 1.5× | Text may wrap; ensure graceful wrapping |
| 1.5× – 2.0× | **Switch horizontal layouts to vertical** (row → column) |
| 2.0×+ | Verify nothing clips, overlaps, or becomes unreadable |

### Rules

- Never use fixed-height containers for text — use minHeight or intrinsic sizing
- Read the system font scale factor and adapt layout axis when ≥ 1.5×
- Use overflow protection (ellipsis, scroll) as last resort, not first choice
- **Test** at the largest text size the platform supports (AX5/200%/3×)

---

## Color & Contrast 🔴

- **WCAG AA minimum**: 4.5:1 for body text, 3:1 for large text and UI elements
- **Never convey meaning by color alone** — always pair with a shape, icon, or text label
  - ✅ Error: red color + error icon + "Failed" text
  - ❌ Error: red color only (invisible to color-blind users)
- Use semantic color tokens (which are designed to meet contrast requirements)

---

## Motion & Animation 🔴

- **Respect reduce-motion preference**: when the user enables this system setting, skip or shorten all non-essential animation
- Essential motion (showing/hiding content that changes the layout) can remain, but should be faster
- Decorative motion (parallax, bounce, auto-advancing carousels) must stop completely
- Check the platform's accessibility setting API for reduce-motion flag
- Auto-playing media or carousels must provide pause/stop controls

---

## Motor Accessibility 🟡

- **No complex gestures required for core actions** — every action achievable via complex gesture (multi-finger, long-press-drag) must also be achievable via a simple alternative (single tap, button)
- **No time limits** for completing actions (or provide option to extend)
- **Switch Access / alternative input** — all interactive elements must be reachable via sequential focus traversal (Switch Access, keyboard tab, D-pad)
- **Gesture alternatives** — shake-to-undo or motion-based triggers must have on-screen alternatives

---

## Cognitive Accessibility 🟡

- **Clear labels** — use simple, common language (not technical jargon)
- **Predictable behaviour** — same action produces same result; no unexpected context changes
- **Error prevention** — destructive actions require confirmation
- **Progress indication** — multi-step flows show current position and total steps
- **Consistent navigation** — repeated patterns maintain same position and behaviour across screens

---

## Focus & Keyboard Navigation 🟡

- Every interactive element must be reachable via keyboard/D-pad/Switch Access
- Focus order follows visual layout order (top-to-bottom, leading-to-trailing)
- Focused elements show a visible focus indicator
- Modal dialogs trap focus inside them (no escape to background)
- After a state change, focus moves to the relevant new element (not lost to page top)

---

## RTL / Bidirectional Support 🟡

- All layouts must mirror correctly in RTL locales
- Use directional properties: `start`/`end`, never `left`/`right`
- Icons with directional meaning (arrows, progress) flip in RTL
- Icons without directional meaning (checkmark, close X) do NOT flip
- Test with an RTL locale to verify mirroring

---

## Platform-Specific Implementation

Each platform provides different APIs for accessibility. Refer to the loaded platform guide for:
- Label/hint/value modifier syntax
- Role declaration API
- Grouping/merging mechanism
- Decorative-hiding mechanism
- Live region/announcement API
- System accessibility setting queries

---

## Audit Checklist

- [ ] Every interactive element has an accessibility label
- [ ] Roles declared on all custom interactive elements
- [ ] Touch targets ≥ platform minimum (44pt / 48dp)
- [ ] 8+ units spacing between adjacent targets
- [ ] All decorative content hidden from assistive tech
- [ ] Component tested at 2× font scale without clipping/overlap
- [ ] No meaning conveyed by color alone
- [ ] Reduce-motion preference respected for all non-essential animation
- [ ] Focus order follows logical visual order
- [ ] Dynamic content updates announced via live region
- [ ] Layout mirrors correctly in RTL
- [ ] Contrast meets WCAG AA (4.5:1 body text, 3:1 large text/UI)
