---
name: create-component-library-skill
description: "Generates a project-specific component skill tailored to the project's stack, directory layout, naming, state-management library, test framework, and preview tool — for any framework (Flutter, React, Vue, Angular, SwiftUI, Compose, and more). Works on single-stack and monorepo projects. Generates a self-contained skill that future component work loads automatically. Use when: setting up component rules for a new project, initialising a component skill, regenerating after convention changes, or chaining from a design-system skill setup. Produces one SKILL.md + one references/component-rules.md and idempotently updates the project's agent instruction file."
argument-hint: "Project name or stack override (optional — the skill will detect both automatically)"
---

# Component Library Meta Skill — Factory

Generates a **project-specific component library skill** from universal component principles + the project's detected conventions. The generated skill is what the project's day-to-day component work uses; this factory runs once (or on convention changes).

## When to Use

- "Set up component library rules for this project"
- "Create a component library skill for this project"
- "Initialise / generate a component library skill"
- "Regenerate the component library skill" (after a stack change, naming change, design-system install)
- Immediately after `create-design-system-skill` has run, to pair the two skills
- Reviewing or updating an existing `<project>-component-library` skill

## What This Produces

```
<skills-path>/<project>-component-library/
├── SKILL.md                    # ~100–180 lines: dispatcher, routing table, procedure
└── references/
    ├── component-rules.md      # ~1000–1400 lines: universal component principles
    └── <stack>.md              # ~30–70 lines per stack: conventions, file structure, tool notes
```

`<skills-path>` is inferred from the location of the adjacent design-system skill (e.g., `.claude/skills/`, `.github/skills/`). If no design-system skill is found, it defaults to `.github/skills/`.

Plus an idempotent single-line append to the project's **primary agent instruction file** (inferred from `<skills-path>`: `copilot-instructions.md` for `.github/skills/`, `CLAUDE.md` for `.claude/skills/`, `AGENTS.md` otherwise) and any existing secondary files.

## Procedure

1. **Detect project conventions.** Load [project-detection.md](./references/project-detection.md). Fill in every category: stack, component directory, file naming, state-management lib, test framework, preview tool, animation lib, i18n lib, design-system skill, existing component skill. Note: the `atomic-ui` skill is always available as part of the gen-e2-design plugin — no detection needed.

2. **Check for an existing generated skill** at `<skills-path>/<project>-component-library/` (same path as the design-system skill). If present, follow the overwrite flow in [generation-procedure.md](./references/generation-procedure.md) Step B — **never silently overwrite**. Ask: regenerate / skip / cancel.

3. **Present the Detected Project Context** to the user and confirm. Any line marked `inferred — please confirm` must be confirmed before proceeding. Accept corrections.

4. **Resolve the project name slug.** Priority: user override → adjacent `<design>-design-system` skill prefix → `package.json` `name` / `pubspec.yaml` `name:` / Xcode project name → repo folder name. Ask once if all are missing.

   Sanitisation rules (applied in order):
   - If `name` starts with `@scope/...`, strip the scope: `@acme/ui-kit` → `ui-kit`
   - Lowercase
   - Replace whitespace and underscores with `-`
   - Strip any character not in `[a-z0-9-]`
   - Collapse consecutive `-` to a single `-`
   - Strip leading/trailing `-`
   - Validate the result matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is non-empty
   - Reject and re-ask if the result is empty, longer than 40 chars, or collides with an existing unrelated skill folder under `.github/skills/`

5. **Load source material** as listed in [generation-procedure.md](./references/generation-procedure.md) Step D: the 7 `principles/` files, the two templates, and `output-spec.md`.

6. **Render `SKILL.md`** from [generated-skill-template.md](./references/generated-skill-template.md) — substitute every `{{placeholder}}` including `{{stack-routing-table}}` (the routing table mapping file-context signals to stack reference file links). Validate no placeholder remains.

7. **Render `references/component-rules.md`** from [generated-rules-template.md](./references/generated-rules-template.md) — inline each principle file under its section, apply project substitutions. Sections §2 and §10 are fixed delegate notes (no generated table or tree). Validate no placeholder remains; size 1000–1400 lines.

8. **Render `references/<stack>.md`** for each detected stack from [generated-stack-reference-template.md](./references/generated-stack-reference-template.md) — substitute conventions, file tree, and tool notes for that stack. Validate no placeholder remains; size 30–70 lines per file.

9. **Write all files** to `<skills-path>/<project>-component-library/` (same path as the design-system skill; default `.github/skills/`). Atomic write order: component-rules.md first, then stack reference(s), then SKILL.md last. On any failure, roll back all written files from this run.

9. **Idempotently update agent instructions.** Resolve the primary instruction file from the skills-path ecosystem (see Step H in [generation-procedure.md](./references/generation-procedure.md)): `.github/skills/` → `copilot-instructions.md`; `.claude/skills/` → `CLAUDE.md`; other → `AGENTS.md`. Also update any existing secondary files. Append the exact line: `` Before creating, refactoring, or reviewing any UI component, load the `<project>-component-library` skill. `` Never edit other content. One line for the whole project regardless of stack count.

10. **Self-audit** using the checklist in [output-spec.md](./references/output-spec.md). Fix any failure before declaring done.

11. **Print summary** per the format in [generation-procedure.md](./references/generation-procedure.md) Step J: files written (including all stack reference files), instructions updated, detected stacks, next steps.

## Hard Rules

- **Never silently overwrite** an existing generated skill — always ask first (Step 2).
- **Agent instruction updates are idempotent** — append-only to the primary file (derived from skills-path) and existing secondary files; never edit other content.
- **Generated skill must be self-contained** — zero links to this factory or to `create-component-library-skill/`. The principle content is **inlined**, not linked back.
- **Stack detection is delegated** — if a design-system skill is installed, defer to its stack; otherwise do the minimum scan needed to name file conventions. This factory does not duplicate stack-specific knowledge.
- **Tokens are delegated to the design-system skill** — the generated component-rules.md references it for actual values, or hints to run `create-design-system-skill` if absent. The component skill enforces *that* tokens are used, not *which* tokens.
- **Confirm before writing.** No file is created until the detected context is shown and accepted.
- **Stop on ambiguity.** Ask once for any unresolved category that materially affects output (project name, stack with no design-system skill, conflicting naming conventions).

## Reference Files

| File | Purpose |
|---|---|
| [project-detection.md](./references/project-detection.md) | Detect stack + project conventions |
| [output-spec.md](./references/output-spec.md) | Exact output file tree, frontmatter, naming, conditional rules, self-audit |
| [generation-procedure.md](./references/generation-procedure.md) | End-to-end algorithm (detect → render → write → update → audit) |
| [generated-skill-template.md](./references/generated-skill-template.md) | Template for output `SKILL.md` |
| [generated-rules-template.md](./references/generated-rules-template.md) | Template for output `references/component-rules.md` |
| [principles/component-anatomy.md](./references/principles/component-anatomy.md) | Universal: structure, API surface, composition |
| [principles/state-modeling.md](./references/principles/state-modeling.md) | Universal: exhaustive sum-type state |
| [principles/token-integration.md](./references/principles/token-integration.md) | Universal: semantic token usage |
| [generated-stack-reference-template.md](./references/generated-stack-reference-template.md) | Template for output `references/<stack>.md` (per-stack conventions, file tree, tool notes) |
| [principles/models-and-stubs.md](./references/principles/models-and-stubs.md) | Universal: immutable models + stubs |
| [principles/preview-catalog.md](./references/principles/preview-catalog.md) | Universal: preview coverage matrix |
| [principles/testing-strategy.md](./references/principles/testing-strategy.md) | Universal: test categories + query priority |
