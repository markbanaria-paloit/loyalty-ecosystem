## Android Native Apps

Reference standard: Material Design 3 motion system.

### Material motion patterns

Use the appropriate pattern for the context:

| Pattern | Use when |
|---------|----------|
| **Container transform** | An element expands into a new surface (card → detail screen) |
| **Shared axis** | Navigation with a spatial relationship (tabs, steppers, wizards) |
| **Fade through** | Unrelated destination screens (bottom nav switching) |
| **Fade** | Elements appearing/disappearing with no spatial relationship (tooltips, snackbars) |

### Jetpack Compose animation reference

```kotlin
// Standard spring for most UI — matches Material feel
AnimationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)

// For transitions between screens
val transition = updateTransition(targetState = screen, label = "screen")

// Fade through pattern
AnimatedContent(
    targetState = currentScreen,
    transitionSpec = {
        fadeIn(animationSpec = tween(220, delayMillis = 90)) +
        scaleIn(initialScale = 0.92f, animationSpec = tween(220, delayMillis = 90)) togetherWith
        fadeOut(animationSpec = tween(90))
    }
)
```

### Duration guidelines (Material 3)

| Transition type | Duration |
|-----------------|----------|
| Simple enter/exit (small elements) | 100–200ms |
| Complex enter/exit (large elements, cards) | 300–500ms |
| Full-screen transitions | 300–500ms |
| Emphasis animations | 500–1000ms |

### Interaction feedback

- **Ripple effect**: Use Material's built-in ripple (`Indication` / `rememberRipple`) for all clickable surfaces. Do not disable ripple without replacing it with an equivalent feedback mechanism.
- **Press state**: The ripple provides press feedback. For custom components without ripple, use a scale-down (0.97) on press.
- **Haptic feedback**: Use `HapticFeedbackType` in Compose, or `Vibrator`/`VibrationEffect` in Views.

| Pattern | Android equivalent |
|---------|--------------------|
| Selection confirmation | `HapticFeedbackType.LongPress` |
| Success/error notification | Custom `VibrationEffect` pattern |
| Text cursor positioning | `HapticFeedbackType.TextHandleMove` |

Do not use vibration for routine taps on standard UI elements — it is disorienting and overrides user expectations.

### Gesture interactions (Android)

**Momentum-based dismissal**: Use velocity tracking to determine dismissal — a fast flick should dismiss regardless of drag distance. In Compose, `VelocityTracker` provides the final velocity on drag end.

```kotlin
val velocityTracker = remember { VelocityTracker() }

PointerInput(Unit) {
    detectDragGestures(
        onDrag = { change, dragAmount ->
            velocityTracker.addPosition(change.uptimeMillis, change.position)
            offset += dragAmount.y
        },
        onDragEnd = {
            val velocity = velocityTracker.calculateVelocity().y
            if (offset > 150f || velocity > 1000f) {
                dismiss()
            } else {
                // Snap back
                animateTo(0f)
            }
        }
    )
}
```

**Damping at boundaries**: Apply resistance when a user drags past a natural stop. Multiply the raw drag delta by a factor less than 1 (typically 0.3–0.5) beyond the boundary point.

```kotlin
val dampedOffset = if (rawOffset > 0) rawOffset else rawOffset * 0.3f
```

**Swipe-to-dismiss**: Use Compose's `SwipeToDismissBox` for list items or dismissable surfaces. It handles threshold, velocity, and animation according to Material conventions.

```kotlin
SwipeToDismissBox(
    state = rememberSwipeToDismissBoxState(
        confirmValueChange = { it == SwipeToDismissBoxValue.EndToStart }
    ),
    backgroundContent = { DismissBackground() }
) {
    ItemContent()
}
```

**Pull-to-refresh**: Use `PullToRefreshBox` from Material 3 (Compose). Do not build a custom pull-to-refresh — the system component matches platform threshold, animation, and indicator expectations.

```kotlin
PullToRefreshBox(
    isRefreshing = isRefreshing,
    onRefresh = { viewModel.refresh() }
) {
    LazyColumn { /* content */ }
}
```

**Multi-touch protection**: Use `awaitFirstDown()` to capture the initial pointer and then filter subsequent pointer events. Ignore additional pointers once a drag is in progress to prevent position jumps.

### Reduced motion (Android)

```kotlin
// Check system animator duration scale
val animatorDurationScale = Settings.Global.getFloat(
    context.contentResolver,
    Settings.Global.ANIMATOR_DURATION_SCALE,
    1f
)

// Scale animation durations accordingly
val duration = (300 * animatorDurationScale).toLong()

// In Compose
val isReduceMotionEnabled = LocalContext.current.let {
    Settings.Global.getFloat(it.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
}
```

When the animator duration scale is 0, skip all transition animations. Use instant state changes with an opacity fade if needed for comprehension.

---
