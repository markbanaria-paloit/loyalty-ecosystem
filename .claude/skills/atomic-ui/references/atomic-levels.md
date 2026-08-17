# Atomic Design Levels — Decision Rules

Use these rules to classify every element during decomposition. Classify **top-down** (start by asking "could this be a Page?"), but **build bottom-up** (Atoms first).

---

## The Five Levels

### Atom
**Question:** Is this the smallest possible building block that loses meaning if broken further?

An atom has no children from this decomposition. It maps directly to a single interactive or display element.

| Platform | Atom examples |
|----------|--------------|
| Web | Button, Input, Checkbox, Radio, Select, Label, Badge, Avatar, Icon, Divider, Spinner, Tooltip, Textarea |
| Flutter | ElevatedButton, TextField, Checkbox, Radio, Switch, Icon, CircularProgressIndicator, Divider, Chip |
| SwiftUI | Button, TextField, Toggle, Picker, Image, Text, Label, ProgressView, Divider |
| Compose | Button, TextField, Checkbox, RadioButton, Switch, Icon, CircularProgressIndicator, Divider |
| React Native | TouchableOpacity/Pressable, TextInput, Switch, Image, ActivityIndicator |

**Library rule:** For every Atom, first check if the detected library provides it. If yes → reuse. If no → add via library's official method. Only create a truly new Atom if it doesn't exist in any form in the library.

---

### Molecule
**Question:** Does this combine 2–4 atoms into one cohesive, simple functional unit with a single job?

A molecule is the smallest useful composition. It should still be easy to reason about at a glance.

| Example | Atoms it combines |
|---------|------------------|
| Search field | Input + Icon button |
| Form field | Label + Input + Error text |
| Card header | Avatar + Name text + Subtitle text |
| Menu item | Icon + Label + optional Badge |
| Rating row | 5× Star icon + Review count text |
| Stepper control | Minus button + Count text + Plus button |

**Gray-area check:** If you need more than 4 atoms or the unit has multiple distinct jobs, it's an Organism.

---

### Organism
**Question:** Is this a self-contained, reusable UI section representing a distinct feature?

An organism is independently meaningful — it could be lifted from one screen and placed in another without modification.

| Example | Contains |
|---------|---------|
| Product card | Card header (molecule) + Image (atom) + Price text (atom) + CTA button (atom) |
| Navigation bar | Logo (atom) + Nav links (molecule) + CTA button (atom) + Menu toggle (atom) |
| Data table | Table header row (molecule) × N + Data row (molecule) × N + Pagination (molecule) |
| Comment thread | N× Comment item (molecule) + Reply input (molecule) |
| Sidebar | Section title (atom) + N× Nav item (molecule) |
| Login form | Email field (molecule) + Password field (molecule) + Submit button (atom) + Error banner (molecule) |

**Self-containment test:** Can a developer use this organism in a different screen without changes? If yes → Organism. If it depends on page-specific context to work → it may need to be split.

---

### Template
**Question:** Is this a layout skeleton that arranges organisms into a full-page structure without real data?

A template defines **where** things go, not **what** they contain. It holds slots/placeholders.

| Template | Organisms it places |
|----------|-------------------|
| Dashboard layout | Sidebar + Header + Content area + Footer |
| Product listing grid | Filter sidebar + Sort bar + Card grid + Pagination |
| Auth layout | Centered card container + Logo area |
| Settings layout | Tab navigation + Content panel + Action bar |

**Implementation note:** In code, a Template is often a layout component that accepts children/slots, or a route-level layout wrapper.

---

### Page
**Question:** Is this a fully populated instance of a Template with real (or representative) data, complete states, and navigation integration?

A Page is the actual screen the user sees. It combines the Template with real data, state management, and route awareness.

| Page | Template it instantiates |
|------|------------------------|
| `/dashboard` | Dashboard layout Template |
| `/products` | Product listing grid Template |
| `/login` | Auth layout Template |

**Implementation note:** In code, a Page is typically the route component or screen widget. It fetches/receives data and passes it down. It should contain **no** presentational logic — only wiring.

---

## Gray-Area Decision Rules

| Situation | Rule |
|-----------|------|
| "Is this an Atom or Molecule?" | Can it be broken into smaller meaningful units? If yes → Molecule. If no → Atom. |
| "Is this a Molecule or Organism?" | Does it have more than 4 atoms, or does it represent a distinct UI feature on its own? If yes → Organism. |
| "Is this an Organism or Template?" | Does it define layout positions for multiple organisms? If yes → Template. |
| Still unsure | **Choose the lower level.** Under-classifying is always safer than over-classifying. |

---

## Anti-patterns to Avoid

| Anti-pattern | Correct approach |
|-------------|-----------------|
| "God component" — one component for a whole section | Decompose into Organism → Molecule → Atom |
| Atom that wraps another atom with no added meaning | That's still an Atom; don't wrap unnecessarily |
| Organism that only works in one specific screen | Extract the page-specific logic; make the organism accept it as props |
| Skipping Template and going straight to Page | Always define the layout skeleton separately |
| Molecule with 8 atoms and complex internal logic | It's an Organism |
