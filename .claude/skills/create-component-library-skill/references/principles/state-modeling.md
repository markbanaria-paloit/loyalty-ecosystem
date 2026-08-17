# State Modeling — Exhaustive, Type-Safe Component State

How to model component state so it is exhaustive, impossible to be invalid, and clearly communicates every possible display mode.

---

## The Core Rule 🔴

**Make illegal states unrepresentable.**

Model state as a **sum type** (sealed interface / sealed class / enum / discriminated union) where:
- Each variant represents one mutually exclusive state
- Data relevant to a state lives only inside that variant
- The compiler forces exhaustive handling — adding a new state produces errors at every unhandled site

---

## Why Sum Types, Not Boolean Flags

| Approach | Problem |
|----------|---------|
| `isLoading: Bool, isError: Bool, isEmpty: Bool` | 2³ = 8 combinations, most invalid. What does `isLoading && isError` mean? |
| `data: T?, error: String?` | Nullable combinations are ambiguous. Is `data == null` loading or empty? |
| `state: "loading"` (raw string) | No compiler checking. Typos compile fine. No associated data. |
| **Sealed/enum/union with variants** | Exactly N valid states. Compiler-checked. Data co-located with its state. |

---

## Required States

Every component that displays data from an external source must handle these states:

| State | What it represents | Associated data |
|-------|--------------------|----------------|
| **Idle** | Initial state before any action | None |
| **Loading** | Async operation in progress | Optional progress |
| **Loaded / Success** | Data available | The data itself |
| **Error** | Operation failed | Error message, optional retry action |
| **Empty** | Succeeded but returned no data | Optional message or CTA |

**Pure-display components** (Atoms that only render what they receive) may not need their own state model — they render props directly. Their **parent** owns the state model.

**Interactive components** add as needed:

| State | When applicable |
|-------|----------------|
| Focused | Component has input focus |
| Disabled | Interaction blocked |
| Selected / Active | Item is selected |
| Pressed / Hover | Pointer/touch feedback |
| Validating | Async validation in progress |
| Valid / Invalid | Validation result |

---

## Platform Mechanism

Each platform provides a language feature for exhaustive sum types:

| Platform | Mechanism | Exhaustiveness |
|----------|-----------|---------------|
| Kotlin (Compose) | `sealed interface` + `data class` / `data object` variants | `when` expression is exhaustive |
| Dart (Flutter) | `sealed class` + subclasses | Pattern-matching `switch` is exhaustive |
| Swift (SwiftUI) | `enum` with associated values | `switch` is exhaustive |
| TypeScript (React/RN) | Discriminated union (`type: 'idle' \| 'loading' \| ...`) | `switch` + `never` exhaustive check |

→ See the loaded platform guide for idiomatic syntax and patterns.

---

## State Hoisting Rules

### Component owns (UI state)
- Animation progress, hover/pressed/focus state
- Local toggles (expanded/collapsed, show/hide)
- Scroll position, text cursor position

### Parent owns (business state)
- Data loading / loaded / error / empty
- Selected items in a list
- Form field values (when parent needs them)
- Navigation decisions

### The boundary

The component **receives** business state via parameters and **reports** user actions via callbacks. It never fetches data, navigates, or writes to global state internally.

---

## When to Use State Machines vs Simple Sum Types

### Simple sum type (most components)
Use when transitions are straightforward: idle → loading → loaded/error. No formal state machine needed.

### State machine (complex flows)
Use when:
- There are **guards** (transition only allowed under certain conditions)
- There are **side effects** tied to transitions (start timer, send analytics)
- The same event produces different outcomes depending on current state
- The flow has **cycles** (retry → loading → error → retry)

For most UI components, **a simple sum type with exhaustive switch is sufficient**.

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Separate boolean flags | Impossible combinations compile fine | Single sum type |
| Nullable data + nullable error | Ambiguous null semantics | Sum type with data in correct variant |
| String-typed state | No compiler safety, no associated data | Enum or sealed type |
| State owned inside component | Component fetches its own data | Hoist to parent; pass state as parameter |
| Missing empty state | Only handles loaded and loading | Always define empty as a variant |
| Missing idle state | Component starts in loading—but what if not triggered? | Idle is the initial state |
