## iOS Native Apps

Reference standard: Apple Human Interface Guidelines for animation and feedback.

### Core conventions

- **Use standard UIKit/SwiftUI curves**. Do not invent custom easing for standard navigations. The system curves are tuned for the platform.
- **Platform transitions are sacred**. Push/pop navigation, modal presentation (sheet, fullscreen), and tab switching have established conventions. Do not replace them with custom animations unless there is a strong, user-visible reason.
- **Spring animations are the iOS default feel**. SwiftUI's `.spring()` and `.interactiveSpring()` match platform expectations. Use them for most UI animations.

### SwiftUI animation reference

```swift
// Standard spring — most UI elements
.animation(.spring(response: 0.35, dampingFraction: 0.7), value: isExpanded)

// Snappy — small, fast interactions
.animation(.spring(response: 0.2, dampingFraction: 0.8), value: isPressed)

// Smooth — large elements, modals
.animation(.spring(response: 0.5, dampingFraction: 0.75), value: isVisible)
```

Avoid `.easeIn` for elements appearing — prefer `.easeOut` or `.spring()`.

### Interaction feedback

- **Scale on press**: Apply a subtle scale-down (0.95–0.97) on press for any custom tappable element. For standard `Button`, use `buttonStyle` with a press effect rather than gesture-based overrides.
- **Loading states**: Use `ProgressView` for indeterminate loading. Disable the control and show a visual indicator — never leave a tapped button with no response.
- **Haptic feedback**: Use `UIFeedbackGenerator` (or SwiftUI `.sensoryFeedback`) for meaningful interactions — not decoration. 

| Haptic type | When to use |
|-------------|-------------|
| `UIImpactFeedbackGenerator` (light) | Selecting an item, toggling |
| `UIImpactFeedbackGenerator` (medium) | Confirming an action |
| `UINotificationFeedbackGenerator` (success/error/warning) | Completion, failure |
| `UISelectionFeedbackGenerator` | Scrolling through options |

Do not use haptics on every tap — it loses meaning and drains battery. Reserve for moments where tactile confirmation has clear value.

### Reduced motion (iOS)

```swift
// Check system setting
if UIAccessibility.isReduceMotionEnabled {
    // Use simpler, cross-fade-only transitions
} else {
    // Full animation
}

// SwiftUI
@Environment(\.accessibilityReduceMotion) var reduceMotion
```

When reduced motion is on: replace movement-based transitions with cross-fades. Retain opacity changes.

### Gesture interactions (iOS)

**Momentum-based dismissal**: A fast flick should dismiss regardless of distance. Track velocity using `DragGesture`'s `predictedEndLocation` or manual velocity calculation, and dismiss if the gesture exceeds a velocity threshold even when the distance threshold has not been reached.

```swift
.gesture(
    DragGesture()
        .onChanged { value in
            offset = value.translation.height
        }
        .onEnded { value in
            let velocity = value.predictedEndTranslation.height
            if offset > 150 || velocity > 400 {
                dismiss()
            } else {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    offset = 0
                }
            }
        }
)
```

**Rubber-banding at boundaries**: When a user drags past a natural stop, apply a damping formula so the element resists movement rather than hard-stopping. The platform's native sheets do this automatically — replicate it for custom drag surfaces.

```swift
// Damped drag: past the boundary, movement is reduced
let rubberBandOffset = dragAmount > 0
    ? dragAmount
    : dragAmount * 0.3  // resistance when dragging against the natural direction
```

**Swipe-to-dismiss**: Use the system sheet or `NavigationStack` where possible — they include the correct animation, rubber-banding, and velocity logic by default. Only build custom swipe-to-dismiss when the component cannot use a system container.

**Pull-to-refresh**: Use `refreshable` modifier in SwiftUI. Do not build a custom pull-to-refresh implementation unless the design requires a non-standard indicator — the system version already matches platform expectations for threshold, animation, and haptic feedback.

```swift
List(items) { item in
    ItemRow(item: item)
}
.refreshable {
    await viewModel.refresh()
}
```

**Multi-touch protection**: If a custom drag interaction is active, ignore additional simultaneous touches. SwiftUI's `simultaneousGesture` and `highPriorityGesture` modifiers control gesture priority — use them to prevent secondary touches from conflicting with an in-progress drag.

---
