# Testing Strategy — Component Test Rules

How to test components thoroughly. Tests validate behaviour, accessibility, visual correctness, and interaction — not implementation details.

---

## Testing Pyramid

| Level | Volume | What it validates | Speed |
|-------|--------|-------------------|-------|
| **State / Logic** | Many | State transitions, model transformations, computed properties | Instant |
| **Render / Widget** | Moderate | Correct output for each state, accessibility attributes present | Fast |
| **Snapshot / Golden** | Moderate | No unintended visual changes across states and configurations | Fast |
| **Interaction** | Some | User gestures trigger correct callbacks and state changes | Medium |
| **Integration** | Few | Component works correctly within parent (screen-level) | Slower |

---

## Test Categories

### 1. State Logic Tests 🔴

Test the state model and its transitions in isolation (no UI framework needed):

- Exhaustive enum construction — every variant can be created
- Computed properties return correct values for each state
- Extensions format data correctly
- Model equality / hash work correctly
- Invalid state combinations are impossible to construct

### 2. Render Tests 🔴

Verify the component renders the correct structure for each state:

- Each state produces the expected content (text, icons, visibility)
- Loading state shows loading indicator
- Error state shows error message and retry action
- Empty state shows empty message
- Loaded state displays all data fields correctly
- Hidden/disabled states remove content from the tree

### 3. Accessibility Tests 🔴

Verify accessibility attributes are correct:

- Interactive elements have accessibility labels
- Roles are declared (button, heading, link, etc.)
- Touch targets meet minimum size
- State is communicated (disabled, selected, checked)
- Decorative elements are hidden
- Grouping is applied to semantic units
- Contrast requirements are met (where testable)

### 4. Snapshot / Golden Tests 🟡

Capture visual output as reference images and detect unintended changes:

- Use the **same stubs** as previews (single source of truth)
- Capture all meaningful states
- Capture dark mode, large text, RTL variants
- Keep golden files in version control
- Update intentionally (not blindly)

### 5. Interaction Tests 🟡

Verify user gestures produce the correct outcomes:

- Tap triggers `onTap` / `onPress` callback with correct data
- Text input updates bound value
- Swipe triggers dismissal / action
- Long press shows menu / context options
- Disabled state blocks interaction (callback NOT fired)
- State changes after interaction produce correct re-render

---

## Test Query Strategy 🔴

Query elements the way assistive technology does — by semantics, not implementation:

| Priority | Query | When to use |
|----------|-------|------------|
| 1 | By role + name | Interactive elements (button with label) |
| 2 | By label / content description | Labeled elements without explicit role |
| 3 | By text content | Visible text (headings, body) |
| 4 | By hint / description | Elements with supplementary description |
| 5 | By test ID | **Escape hatch** — only when semantic queries fail |

**Rule:** if you can't query a component by semantics, the component has an accessibility bug. Fix the component, don't add test IDs.

---

## What NOT to Test

- **Internal implementation details** (private state variables, internal component names)
- **Platform framework behaviour** (animation timing, layout engine, framework internals)
- **Third-party library correctness** (the theme provider works, the i18n library translates)
- **Exact pixel positions** (unless layout accuracy is the feature being tested)

---

## Test Data 🔴

- Reuse the **same stubs** from the model's stub factories (see models-and-stubs.md)
- Never create parallel test fixtures that duplicate stub data
- Test realistic data (real names, plausible amounts), not "test123"

---

## Test Identifiers

When a test ID is needed (the escape hatch):

- Define in a shared constants file/enum — not as inline strings
- Use semantic names: `"metric-card-retry-button"` not `"btn1"`
- Keep in sync between component and test via shared reference

---

## Platform Test Frameworks

| Platform | Unit | Component | Snapshot | A11y |
|----------|------|-----------|----------|------|
| Compose | JUnit | Compose Test (`onNode...`) | Roborazzi / Paparazzi | Semantic tree assertions |
| Flutter | test | Widget test (`find.*`, `expect`) | Golden files (`matchesGoldenFile`) | Semantic tree + guideline checks |
| SwiftUI | XCTest | ViewInspector / XCUITest | Snapshot testing lib | Accessibility Inspector |
| React Native | Jest | @testing-library/react-native | Storybook snapshot / Chromatic | `toHaveAccessibleName`, role checks |

→ See the loaded platform guide for idiomatic test structure, assertions, and configuration.

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Testing implementation | Brittle tests break on refactor | Test behaviour and output, not internals |
| No accessibility tests | A11y bugs ship undetected | Test labels, roles, targets in every component |
| Test uses production services | Slow, flaky, non-deterministic | Use stubs, mock boundaries only |
| Duplicated test data | Stubs drift from preview data | Single shared stubs |
| Only happy-path tests | Error/empty states untested | Cover ALL states in tests |
| Test ID instead of semantic query | Masks accessibility gaps | Fix a11y, then query semantically |
| Snapshot-only testing | Can't tell if behaviour is correct from pixels alone | Combine with logic + render tests |
| No dark mode testing | Color/contrast issues in dark mode | Include dark-mode snapshot/golden |

---

## Checklist

- [ ] State logic tested: all variants construct correctly, computed properties work
- [ ] Render tested: each state produces correct output
- [ ] Accessibility tested: labels, roles, targets, grouping
- [ ] Interaction tested: callbacks fire correctly, disabled blocks input
- [ ] Snapshot/golden for all meaningful states
- [ ] Dark mode variants in snapshot suite
- [ ] Large text (2×) variants in snapshot suite
- [ ] RTL layout verified in snapshots
- [ ] Narrow-width rendering verified in snapshots
- [ ] All tests use shared stubs (not parallel fixtures)
- [ ] Tests query by semantics (not test IDs unless unavoidable)
- [ ] No test imports production services or network
