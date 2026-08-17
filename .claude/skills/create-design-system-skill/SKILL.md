---
name: create-design-system-skill
description: "Creates a complete VS Code Copilot design-system skill from any design source — a file, URL, description, or existing codebase. Use when: bootstrapping design enforcement for a project, generating token references and self-audit checklists, enforcing brand rules across any tech stack. Detects the project's stack automatically or accepts it from the user. Produces: SKILL.md dispatcher, tokens.md, one stack-specific reference per detected stack, and an optional PostToolUse enforcement hook."
argument-hint: "Design source (file path, URL, description) and optionally a stack name"
---

# Create Design System Skill

Reads any design source and generates a complete VS Code Copilot skill package that enforces the design system across the project's actual tech stacks.

## When to Use

- Starting or onboarding any project that has a design spec (file, URL, brand guidelines, or described verbally)
- Adding machine-enforced design token rules to an existing codebase
- Generating a skill for any framework: Flutter, React, Next.js, Vue, Svelte, Swift/SwiftUI, Kotlin/Compose, Angular, plain CSS, or any other

## Output Structure

```
.github/skills/<design-name>-design-system/
├── SKILL.md                        # Dispatcher — identifies stack → loads reference
└── references/
    ├── tokens.md                   # Universal token table (colors, spacing, type, elevation)
    └── <stack>.md                  # One file per detected stack, with rules + self-audit checklist
```

Example stack reference filenames: `flutter-dart.md`, `react.md`, `vue.md`, `swift-swiftui.md`, `android-compose.md`, `angular.md`, `css.md`

Optional:
```
.github/hooks/design-token-check.json
.github/hooks/scripts/design-token-check.sh
.github/hooks/scripts/design-token-check.ps1
```

---

## Procedure

### 1. Read the design source

→ Load [extraction-guide.md](./references/extraction-guide.md)

The source can be anything:
- A file path (any format: Markdown, JSON, YAML, plain text, CSS variables, design tokens JSON)
- A URL (raw GitHub file, public web page, Figma export)
- A verbal or pasted description from the user
- The project's existing codebase (extract tokens from current theme/style files)

Verify that at minimum a **color palette** and a **visual identity** can be extracted. Typography scale and spacing are strongly preferred but optional — defaults can be inferred from component examples if the source doesn't define them explicitly.

### 2. Detect the tech stack(s)

→ Load [stack-detection.md](./references/stack-detection.md)

Scan the workspace for stack signals, or use the stack the user explicitly stated.
Produce a list of stacks that need a reference file (there may be more than one).

**Also resolve the target platform** — `mobile-web`, `responsive-web`, `desktop-web`, `ios-native`, `android-native`, `cross-platform-native`, or `desktop-app`. Use the value passed in by the caller (the Design Agent resolves this before invoking this skill), else read `target-platform` from a `## Project tooling` block in the project's agent instruction file, else ask the user. It is separate from the stack — a React codebase can target phones, desktops, or both — and it determines the breakpoint set, base density, and touch target minimum generated in step 3. Do not default to desktop.

### 3. Extract tokens

Produce a structured extraction with:
- **Design name** — lowercase hyphenated (e.g. `stripe`, `discord`, `airbnb`)
- **Color tokens** — every named entry → value + semantic role
- **Spacing scale** — every step → token name + value
- **Type scale** — every entry → element, size, weight, line-height, letter-spacing
- **Elevation** — every shadow level → name + shadow string
- **Breakpoints** — required for all web and desktop-app targets. Name each step and give its min-width. For `mobile-web` and `responsive-web`, define them **mobile-first** (min-width, ascending) with the smallest step as the base case.
- **Touch target minimum** — a single token holding the platform's minimum interactive size: 44 px/pt for web and iOS, 48 dp for Android, the stricter of the two for cross-platform. Every interactive component references this token rather than a raw value.
- **Theme character** — dominant surface (light/dark?), primary accent, 3–5 key constraints from the source's Do/Don't rules

### 4. Determine output path

Skill folder: `.github/skills/<design-name>-design-system/`

The `name` field in the generated `SKILL.md` frontmatter **must match the folder name exactly**.

### 5. Generate the files

→ Follow [output-spec.md](./references/output-spec.md) for file templates and structure.  
→ When writing each `<stack>.md`, also load [stack-patterns.md](./references/stack-patterns.md) and apply only the section(s) matching the detected stack(s).

Generate in this order:

| Order | File |
|-------|------|
| 1 | `references/tokens.md` |
| 2 | `references/<stack>.md` × N (one per detected stack) |
| 3 | `SKILL.md` (lists all generated stack references) |

### 6. (Optional) Generate enforcement hook

If the user requests it, or if `.github/hooks/` already exists in the project:
→ Follow [hook-spec.md](./references/hook-spec.md)

### 7. Update agent instructions

Resolve the **primary instruction file** from the skills-path ecosystem:

| skills-path | Primary | Secondary (append-only if they already exist) |
|---|---|---|
| `.github/skills/` | `copilot-instructions.md` | `.github/instructions/*.instructions.md` |
| `.claude/skills/` | `CLAUDE.md` | `AGENTS.md` |
| anything else | `AGENTS.md` | `copilot-instructions.md`, `CLAUDE.md` |

If the primary exists → append. If the primary does not exist but secondary files do → append to those. If nothing exists → create the primary. Append the line:

```markdown
Before writing any UI code, load the `<design-name>-design-system` skill.
```

Idempotent: skip if the line is already present. Never edit other content.

### 8. Self-audit the generated files

- [ ] Every color from the design source is present in `tokens.md`
- [ ] A stack reference file exists for every detected stack
- [ ] Skill `name` field matches the folder name
- [ ] `description` is ≤ 1024 characters and contains relevant trigger keywords
- [ ] Every stack reference file ends with a numbered self-audit checklist
- [ ] All links inside the generated `SKILL.md` use `./references/` relative paths
- [ ] Hard Rules in the generated `SKILL.md` include design-specific constraints (not just the universal ones)
- [ ] The generated `SKILL.md` lists the correct stack reference filenames in its Procedure section

### 9. Report to the user

State:
1. The skill path and all files created
2. Stacks detected and which reference file covers each
3. How to invoke it: describe a UI task, or type `/` to find the skill by name
4. One example test prompt
5. Whether the enforcement hook was created and what patterns it blocks
6. Any codebase prerequisites (token classes, CSS variables, theme files) the developer must create before the rules are fully enforceable

---

> **Tip — Personal scope:** To use this skill across *all* your projects (not just this one), copy the folder to `~/.copilot/skills/create-design-system-skill/` or `~/.agents/skills/create-design-system-skill/`.
