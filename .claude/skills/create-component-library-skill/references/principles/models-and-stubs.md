# Data Models & Stubs — Component Data Layer

How to define the data models components consume and the stub factories used in previews, stories, and tests.

---

## Data Model Design 🔴

### Principles

1. **Plain data** — models are immutable data containers, not living objects with behaviour
2. **No framework dependencies** — models never import UI framework code
3. **No side effects** — models don't trigger network calls, write to disk, or navigate
4. **Type-safe state** — use sum types for states (see state-modeling.md), not optional/nullable fields
5. **Serializable** — models can be serialized/deserialized without framework coupling

### Structure

A component model contains:

| Field Type | Purpose | Example |
|-----------|---------|---------|
| Required data | What the component must display | `title: String`, `amount: Decimal` |
| State enum | Current display mode | `state: LoadState<Data>` |
| Optional metadata | Extra context when available | `subtitle: String?`, `badge: Badge?` |
| Display helpers | Pre-computed presentation values | `formattedDate: String`, `trendIcon: Icon` |

### Naming

- Model name matches the component: `MetricCard` → `MetricCardModel` or `MetricCardState`
- Enum variants are named for what they represent: `Loaded`, `Error`, `Empty` — not `Case1`, `State2`
- Associated data in a variant is named for its content: `Loaded(value: T)`, `Error(message: String)`

---

## Immutability 🔴

- All model fields are **final / let / val / readonly**
- Updates produce **new instances**, not mutations
- This guarantees:
  - Safe sharing across threads/isolates
  - Predictable rendering (component re-renders on new instance)
  - Easy equality checks for skip-optimization (memoization, recomposition skipping)

Mark models as immutable/stable using the platform mechanism so the framework can skip re-renders when data hasn't changed:

| Platform | Mechanism |
|----------|-----------|
| Compose | `@Immutable` or `@Stable` annotation |
| Flutter | `@immutable` annotation + all `final` fields |
| SwiftUI | Value type (struct) |
| React/RN | Object reference equality (`React.memo` shallow compare) |

---

## Stub Factories 🔴

Every model exposes **static factory methods** for test/preview data.

### Required Stubs

Every model provides factory methods or constants (naming follows platform convention) for these scenarios:

| Stub | What it provides |
|------|-----------------|
| Loaded / happy-path | Realistic data with all fields populated |
| Empty | Valid but empty state (zero items, no content) |
| Error | Error state with realistic message |
| Loading | Loading/in-progress state |
| Long content | Edge case: very long text, many items (tests overflow) |
| List (count) | Multiple varied instances (for list previews) |

> **Platform naming:** Kotlin/Dart may use `.stub()` / `.empty()`; Swift may use `static var stub: Self`; TypeScript may use standalone factory functions. Follow platform guide naming conventions.

### Rules for Stub Data

1. **Deterministic** — same stub returns identical data every time (no random, no Date.now())
2. **Realistic** — use plausible values ("Emily Chen", "$4,521.30"), not placeholders ("Test", "Lorem ipsum")
3. **Self-contained** — no network, database, or system dependency
4. **Varied** — list stubs use different names, amounts, states (not N copies of the same item)
5. **Reusable** — previews, stories, unit tests, and screenshot tests ALL consume the same stubs

### Placement

Stubs live alongside the model, either:
- As static members on the model type itself
- In a companion/extension file co-located with the model
- In a dedicated `*.stubs.*` file in the same directory

---

## Extensions / Computed Properties 🟡

Add presentation logic as **extensions or computed properties** on the model — not inside the component body:

- Formatting: `model.formattedAmount` → "$4,521.30"
- Derived state: `model.isPositive` → `amount > 0`
- Display helpers: `model.trendIcon` → appropriate icon for the trend direction

### Why extensions, not component logic

- **Testable** in isolation (unit test on the model, no UI framework needed)
- **Reusable** across multiple components that display the same data
- **Single source of truth** — format once, display everywhere consistently

---

## When to Skip a Dedicated Model

Not every component needs its own model type:

| Scenario | Model needed? |
|----------|--------------|
| Atom with 1–2 primitive props (icon, label) | No — use direct parameters |
| Component with 3+ related fields | Yes |
| Component with state enum | Yes — the enum IS the model |
| List item | Yes — model per item |
| Screen-level data with many sources | Yes — aggregate model |

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Mutable model fields | Race conditions, unpredictable UI | All fields immutable |
| Model fetches its own data | Couples data layer to presentation | Model is passive data; fetching happens elsewhere |
| Stubs use random/Date.now() | Non-deterministic previews and test flakiness | Hard-coded realistic values |
| Stubs import production services | Breaks preview isolation | Stubs are pure data, no imports |
| Model contains UI framework types | Can't unit-test without UI dependencies | Plain language types only |
| Single stub for all tests | Doesn't exercise edge cases | Dedicated stubs per scenario |
