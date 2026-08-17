# Component Anatomy — Structure & API Design Rules

Universal rules for how every component is structured, regardless of platform. The loaded platform guide provides idiomatic syntax; this document provides the principles.

---

## Single Responsibility 🔴

Every component has **exactly one job**. State it in one sentence starting with a verb.

- ✅ "Displays a user's avatar with optional online indicator"
- ✅ "Collects and validates a single form field with label and error message"
- ❌ "Handles user profile display and editing" → two components
- ❌ "Shows a card with data fetching" → separate UI from data source

**Test:** if you need "and" to describe it, split it.

**Split threshold:** if the component body exceeds ~60–80 lines or the constructor/initializer takes more than ~5–6 parameters, extract sub-components or introduce slot APIs.

---

## Unidirectional Data Flow 🔴

Data flows **down** through parameters. Events flow **up** through callbacks. This is the foundational pattern across all UI frameworks.

- Component receives immutable data and optional callbacks
- Component never fetches data, navigates, or writes to global state internally
- Component never imports or instantiates a ViewModel, service, or singleton
- Parent decides what to do with events; component only reports them

**Screen-level components** (composers) are the exception — they own the ViewModel/state holder, collect state, and wire child components. They get 2–3 integration previews; exhaustive coverage lives on child components.

---

## Composition Strategy 🟡

Every platform offers three primary composition tools. Choose based on what changes the hierarchy:

| Mechanism | Use When | Examples |
|-----------|----------|---------|
| **Cross-cutting behaviour** | Applying appearance/behaviour to any component without changing its structure (padding, elevation, shimmer) | Modifier (Compose), ViewModifier (SwiftUI), wrapper function, HOC |
| **Wrapper component** | Composing multiple children into a new semantic unit (label + field + validation = LabeledField) | Widget subclass, View struct, functional component |
| **Slot API** | Letting the caller supply content into named positions without dictating what goes there | `@Composable` lambdas, `@ViewBuilder`, `children`/render props, `child`/`builder` |

**Decision rule:** if functionality applies to any component and does *not* add/remove children, make it a behaviour modifier. If it *must* add children, it's a wrapper.

**Internal layout test:** if changing the internal layout direction (horizontal ↔ vertical) would break the public API, you've exposed too much. Expose *intent* (`isCompact`, `variant`), not structure.

---

## API Surface Design 🟡

### Required vs Optional Parameters

- **Required**: data the component cannot function without (primary content, essential callbacks)
- **Optional**: customisation, variants, styling overrides — always provide sensible defaults
- **Rule**: a component should render something useful with only its required parameters

### Parameter Categories

| Category | Naming Pattern | Examples |
|----------|---------------|---------|
| Data | Noun describing the content | `title`, `amount`, `user`, `items` |
| Boolean state | `is*` / `has*` / adjective | `isLoading`, `hasError`, `disabled` |
| Callbacks | `on*` + event name | `onTap`, `onChanged`, `onDismiss`, `onSubmit` |
| Slots/builders | Noun describing the slot | `leading`, `trailing`, `header`, `content` |
| Style override | Platform convention | `modifier` (Compose), `style` (RN), `className` (web) |

### Callback Signatures

Always declare the full type — never use bare `Function` / `() => void` when the callback carries data:

- ✅ `onItemSelected: (item: Item) -> Unit` — caller knows what data arrives
- ❌ `onItemSelected: Function` — opaque, untyped

### Platform-Specific Entry Point

Every platform has one conventional "hook" for external styling that the component must accept:

| Platform | Entry point |
|----------|------------|
| Compose | `modifier: Modifier = Modifier` as first optional param |
| Flutter | Named params; `Key? key` via super |
| SwiftUI | Initializer properties; view modifiers applied externally |
| React / RN | `style?: StyleProp<ViewStyle>` on the container; spread unknown props |

→ See the loaded platform guide for exact conventions.

---

## Slot-Based Composition

Components above Atom level should expose **named slots** rather than accepting raw data for sub-sections:

- Use **data parameters** for Atoms and simple Molecules with fixed internal structure
- Use **slots** for Organisms and Templates that need layout flexibility
- Use **builder/factory callbacks** when slot content depends on index or runtime data (lists, grids)

---

## Component File Organisation

### Co-location (recommended default)

Place the component, its model, previews/stories, and tests together:

```
feature/component-name/
├── Component (implementation)
├── Model (data + stubs)
├── Previews/Stories (all states)
└── Tests (all categories)
```

### Separation (when project convention requires)

Follow the project's existing convention if it separates by type (`components/`, `models/`, `tests/`).

**Rule:** follow the existing project pattern. If none exists, co-locate.

---

## API Stability 🟡

- Keep the public API minimal — fewer parameters = easier to maintain
- New features are added as **optional parameters with defaults** — never break existing callers
- Extract internal sub-components as private — they are not part of the contract
- If a component needs more than ~8 required parameters, it likely needs decomposition

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| God component | Does too many things, 200+ lines | Split by responsibility |
| Prop drilling | Passing data through 3+ layers untouched | Use platform context/DI, or restructure composition |
| Stringly typed | Using strings for variant/state selection | Use enum / sealed type / union |
| Boolean blindness | `isLoading, isError, isEmpty` as separate bools | Single state enum/sealed type (see state-modeling.md) |
| Hidden dependencies | Component internally fetches data or reads singletons | Accept data and callbacks via parameters |
| Style leaking | Component applies styles that affect its parent's layout | Styles stay within bounds; parent controls placement |
| Inheritance abuse | Subclassing a framework component to add features | Compose with slots, wrappers, or modifiers |
