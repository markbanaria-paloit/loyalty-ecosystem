## Cross-Platform Apps

Reference standard: Platform-native conventions per target. iOS on iOS. Android on Android.

### React Native

Do not force a single animation style across both platforms. Use `Platform.OS` to branch where conventions differ.

```js
import { Platform } from 'react-native';
import Animated, { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

// Platform-appropriate spring config
const springConfig = Platform.OS === 'ios'
  ? { damping: 15, stiffness: 150 }      // iOS: slightly bouncier
  : { damping: 20, stiffness: 180 };     // Android: crisper, less bounce

// Reduced motion check
import { useReducedMotion } from 'react-native-reanimated';
const shouldReduceMotion = useReducedMotion(); // reads system setting on both platforms
```

**Navigation transitions**: Use `react-navigation` platform defaults (`native` stack). Do not override `headerBackTitleVisible`, slide animations, or modal presentation styles with custom web-like transitions.

**Haptics**: Use `react-native-haptic-feedback` or Expo Haptics. Map to the correct haptic type per platform:
- iOS: use `UIFeedbackGenerator` types (impact light/medium, notification success/warning/error, selection)
- Android: use `VibrationEffect` patterns; default to `EFFECT_CLICK` for selections

### Flutter

Use `AnimationController` with platform-aware curves:

```dart
// iOS-appropriate easing
CurvedAnimation(parent: controller, curve: Curves.easeOut)

// Android-appropriate (Material)
CurvedAnimation(parent: controller, curve: Curves.fastOutSlowIn)

// Platform-conditional
final curve = Theme.of(context).platform == TargetPlatform.iOS
    ? Curves.easeOut
    : Curves.fastOutSlowIn;
```

Use `Hero` animations for container-transform-style transitions (card → detail). On Android this aligns with Material's container transform; on iOS it aligns with the spatial navigation convention.

Reduced motion:
```dart
final reduceMotion = MediaQuery.of(context).disableAnimations;
final duration = reduceMotion ? Duration.zero : const Duration(milliseconds: 300);
```

---
