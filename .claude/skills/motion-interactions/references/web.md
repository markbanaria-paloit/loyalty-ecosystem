## Web Applications

Reference standard: Emil Kowalski's design engineering philosophy. Web motion should feel fast, purposeful, and physically grounded.

### The animation decision framework

Answer these questions in order before writing any animation code:

**1. Should this animate at all?**
Apply the frequency table above. Never animate keyboard-initiated actions — these are repeated constantly and animation makes them feel sluggish.

**2. What is the purpose?**
Name it explicitly. If you cannot articulate the purpose, do not animate.

**3. What easing curve?**

| Situation | Easing |
|-----------|--------|
| Element entering (appearing) | `ease-out` — starts fast, feels immediately responsive |
| Element exiting (disappearing) | `ease-in` (for exits only — the user's attention has moved) |
| Moving/morphing on screen | `ease-in-out` |
| Hover or colour change | `ease` |
| Constant motion (marquee, progress bar) | `linear` |
| Default | `ease-out` |

Use custom easing curves — CSS built-ins are too weak for intentional UI:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

**Never use `ease-in` for UI elements entering the screen.** It starts slow — the exact moment the user is watching — and makes the interface feel unresponsive.

**4. How long?**

| Element type | Duration |
|--------------|----------|
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–350ms |
| Marketing / explanatory | Can be longer |

Keep UI animations under 300ms. Perceived responsiveness matters as much as actual speed.

### Interaction states

**Button press**: `transform: scale(0.97)` on `:active`. Keep scale between 0.95–0.98. This is the minimum viable interaction feedback for any clickable element.

```css
.button {
  transition: transform 160ms var(--ease-out);
}
.button:active {
  transform: scale(0.97);
}
```

**Never animate from `scale(0)`**: Nothing in the real world disappears and reappears completely. Start from `scale(0.9)` or higher, combined with opacity.

```css
/* Bad */
.entering { transform: scale(0); }

/* Good */
.entering { transform: scale(0.95); opacity: 0; }
```

**Popovers are origin-aware; modals are not**: Popovers should scale from their trigger. Modals appear centered in the viewport regardless of trigger.

```css
/* Radix UI */
.popover { transform-origin: var(--radix-popover-content-transform-origin); }

/* Base UI */
.popover { transform-origin: var(--transform-origin); }
```

**Tooltips after first open**: Once one tooltip is open, adjacent tooltips should appear instantly (no delay, no animation). Use `transition-duration: 0ms` when a `data-instant` attribute is set.

**Stagger for list entry**: When multiple elements appear together, stagger by 30–80ms per item. Keep delays short — stagger is decorative and must never block interaction.

### Performance rules

- **Only animate `transform` and `opacity`**. These skip layout and paint, running on the GPU. Never animate `padding`, `margin`, `height`, or `width`.
- **CSS animations beat JS under load**. CSS animations run off the main thread. Use CSS for predetermined animations; JS (Framer Motion, WAAPI) for dynamic, interruptible ones.
- **Framer Motion `x`/`y` shorthand is not hardware-accelerated**. Use `transform: "translateX()"` for hardware acceleration under load.
- **CSS transitions over keyframes for dynamic UI**. Transitions can be interrupted and retargeted mid-animation. Keyframes restart from zero.
- **Avoid updating CSS variables on parent elements during animation**. It triggers style recalculation on all children. Update `transform` directly instead.

### Springs (web)

Use springs for:
- Drag interactions with momentum
- Elements that should feel physically alive
- Gestures that can be interrupted mid-animation

Spring configuration:
```js
// Apple-style (easier to reason about)
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

Keep `bounce` between 0.1–0.3. Avoid bounce in most UI contexts; reserve it for drag-to-dismiss and intentionally playful interactions.

### Gesture and drag (web)

**Momentum-based dismissal**: Do not require dragging past a fixed pixel threshold. Track velocity: `Math.abs(dragDistance) / elapsedTime`. If velocity exceeds ~0.11 (px/ms), dismiss regardless of distance — a quick flick should be enough.

```js
const timeTaken = Date.now() - dragStartTime;
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

**Damping at boundaries**: When a user drags past a natural boundary (e.g. dragging a bottom drawer further up than its open position), apply progressive damping — the element should move less than the finger moves. Things in the real world slow before stopping; they do not hit invisible walls.

**Pointer capture**: Once a drag begins, call `element.setPointerCapture(event.pointerId)`. This ensures the drag continues even if the pointer leaves the element bounds mid-gesture.

**Multi-touch protection**: Ignore additional touch points once a drag has started. A second finger mid-drag causes the element to jump to the new position.

```js
function onPointerDown(e) {
  if (isDragging) return; // block second touch
  isDragging = true;
  element.setPointerCapture(e.pointerId);
}
```

**Transition on release, not during drag**: While dragging, update `transform` directly (no `transition`). Re-enable the transition only on pointer-up so the snap-back or dismiss animates smoothly.

```js
// During drag — no transition
element.style.transition = 'none';
element.style.transform = `translateY(${offset}px)`;

// On release — animate back or dismiss
element.style.transition = 'transform 300ms var(--ease-out)';
element.style.transform = shouldDismiss ? 'translateY(100%)' : 'translateY(0)';
```

### Reduced motion (web)

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    /* Keep opacity transitions for comprehension */
    transition: opacity 0.2s ease;
    /* Remove transform-based movement */
  }
}
```

```js
// React / Framer Motion
const shouldReduceMotion = useReducedMotion();
const exitX = shouldReduceMotion ? 0 : '-100%';
```

### Hover states (web)

Gate hover animations behind the pointer media query to avoid false positives on touch devices:

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

### Asymmetric enter/exit timing

Slow where the user is deciding; fast where the system is responding. Enter animations can be unhurried. Exit animations should always be fast (200ms or less).

```css
/* Enter: can be deliberate */
.overlay { transition: clip-path 2s linear; }

/* Exit: always snappy */
.overlay { transition: clip-path 200ms var(--ease-out); }
```

---
