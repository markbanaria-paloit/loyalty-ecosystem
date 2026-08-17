---
name: atomic-ui
description: "Build, refactor, or decompose any UI into Atomic Design components. Use when: building a screen, breaking down a design, creating components, refactoring UI, analyzing a Figma source, reviewing component structure. Supports all stacks: React, Vue, Svelte, Solid, Angular, Flutter, React Native, SwiftUI, Jetpack Compose, Kotlin Multiplatform, Tauri, Electron, WinUI, AppKit, Qt, and more. Enforces: single responsibility, composition over inheritance, library-atom reuse, accessibility from day one, design token styling. Use when asked to 'build this UI', 'break down this screen', 'create components for', 'refactor this component', 'decompose this design'."
argument-hint: "Screen, feature, or component description — or paste/attach the design"
---

# Atomic UI Skill

Decomposes any UI into a clean Atomic Design hierarchy and builds every component with strict single-responsibility, library-reuse, and accessibility rules across any tech stack.

## When to Use

- "Build this screen / feature / component"
- "Break down / decompose this UI"
- "Refactor these components"
- "Create components for this design"
- Analysing a Figma source, screenshot, or written description
- Any UI request regardless of platform or framework

---

## Procedure

### Step 1 — Detect stack and component library

→ Load [library-detection.md](./references/library-detection.md)

The reference lists common stacks as examples — it is **not a closed list**. If the stack or library is not covered, reason from first principles: what are this platform's primitive UI elements? Apply the same detection and decomposition logic regardless.

Scan in priority order:
1. Explicit user statement ("in my Flutter app", "we use shadcn/ui")
2. Workspace signals: `pubspec.yaml`, `package.json`, `build.gradle.kts`, `*.xcodeproj`, framework config files
3. Conversation history (previously generated code, imports, file extensions)

Output a one-line confirmation before proceeding:
```
Stack: [framework] | Library: [detected library or "none detected — using [suggested library]"]
```

If the stack is genuinely ambiguous, ask once — then proceed with the user's answer.

### Step 2 — Analyse the design source

If the source is a Figma file (via MCP or attachment):
- Do **not** assume it is well-structured. Treat it as raw visual information.
- Walk each frame/group and infer component boundaries from visual repetition and containment.
- Ignore Figma layer names as ground truth; derive the logical structure from what is visible.

If the source is a screenshot, description, or written spec:
- Identify every distinct visual element before classifying anything.

### Step 3 — Decompose (always output this before any code)

→ Load [atomic-levels.md](./references/atomic-levels.md)

Produce the decomposition in this exact format:

```
## Decomposition — [Screen / Feature Name]

### Atoms
- [Name] — [one-line purpose] — Reuse from [Library] / Add via `[command]` / New
- ...

### Molecules
- [Name] — [one-line purpose] — composed of: [Atom, Atom]
- ...

### Organisms
- [Name] — [one-line purpose] — composed of: [Molecule, Atom, ...]
- ...

### Template
- [Name] — layout skeleton — arranges: [Organism, Organism, ...]

### Page
- [Name] — live instance of [Template] with real data and states
```

Then show the component tree:
```
Page
└── Template
    ├── Organism A
    │   ├── Molecule X
    │   │   ├── Atom 1
    │   │   └── Atom 2
    │   └── Atom 3
    └── Organism B
        └── ...
```

**Decomposition rules (non-negotiable):**
- Gray-area rule: if unsure of level, choose the lower one.
- For every Atom: state "Reuse from [Library]" or "Add via [command]" or "New" — never silently create a custom atom that already exists in the detected library.
- If a library atom is missing, add it via the library's official method before using it.

### Step 4 — Build bottom-up

Build in this order: Atoms → Molecules → Organisms → Template → Page.

For every component, use the **Component Spec Format**:
→ Load [component-spec.md](./references/component-spec.md)

### Step 5 — Self-audit before finishing

- [ ] Every Atom either reuses a library primitive or provides an explicit reason why a new one is justified
- [ ] No component does more than one thing (single responsibility)
- [ ] Every component has all required states listed (Default, Hover/Pressed, Focused, Active, Disabled, Loading, Error, Empty)
- [ ] Accessibility requirements are stated for each component
- [ ] All styling uses design tokens — no hard-coded color values or spacing literals
- [ ] Higher-level components compose from the lower ones defined in this decomposition
- [ ] If a design system skill is active in this project, all token usage complies with it

---

## Core Principles (never violate)

| Principle | Rule |
|-----------|------|
| Single Responsibility | Every component does exactly one thing |
| Composition over Inheritance | Build upward by combining smaller components |
| Reusability First | Every piece must be drop-in usable in any other screen or app |
| Platform Agnostic Default | Describe in high-level terms unless the stack is known |
| Separation of Concerns | UI in component; business logic passed in via props/callbacks; styling via tokens only |
| Accessibility Built-in | WCAG/ARIA for web; VoiceOver/TalkBack semantics for mobile; keyboard + touch + voice |
| Adaptive Design | Support different screen sizes, orientations, and input methods from the start |

---

## Common Pitfalls to Avoid

- Duplicating an Atom that already exists in the project's component library
- Creating a custom `Button` / `Input` / `Text` when shadcn/ui, MUI, Flutter Material, or equivalent is present
- Skipping the decomposition step and going straight to code
- Treating Figma layer names as the definitive component structure
- Hard-coding colors or spacing instead of using design tokens
- Omitting loading, error, and empty states
- Skipping accessibility annotations
