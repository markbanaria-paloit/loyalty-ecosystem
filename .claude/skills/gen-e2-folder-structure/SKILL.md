---
name: gen-e2-folder-structure
description: 'Derive, propose, and persist the project folder structure for a Gen-e2 discovery workspace. On first run: scans the workspace, proposes structure options, and writes the confirmed choice as a durable rule to the project agent/instructions file. On subsequent runs: reads the persisted rule without re-prompting. Use whenever an agent needs to place an output file. Triggers on: folder structure, where to place files, discovery workspace, project structure, first run placement, workspace root.'
argument-hint: 'No argument needed — the skill auto-detects whether this is a first run or subsequent run from the presence or absence of a persisted rule.'
user-invocable: false
---

# Gen-e2® Folder Structure Skill

## When to Use
- At the start of every agent session, before writing any output file to the workspace
- When determining where to place any discovery output (product brief, research plan, personas, journeys, RAID log, synthesis boards, etc.)
- When the project workspace root or subfolder convention is not yet clear

---

## Step 1 — Check for a Persisted Rule

Before scanning the workspace or proposing anything, look for a rule that was already agreed and written in a previous session. Search the following files at the project root for a `## Gen-e2 Folder Structure` section:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `copilot-instructions.md`

**If a `## Gen-e2 Folder Structure` section is found in any of these files:**
- Read the structure defined there in full
- Use it as the authoritative placement rule for this session
- Do NOT re-scan, re-propose, or re-prompt — the structure is already agreed
- Skip Steps 2–4 entirely and return the persisted structure to the calling agent

**If no persisted rule exists** in any of these files: proceed to Step 2.

---

## Step 2 — Scan the Workspace

Scan the workspace to understand what already exists:

1. List all top-level folders and files at the project root and one level deep
2. Note any gen-e2 artefact files (`.gen-e2.*`) and where they are located
3. Look for numbered folders (e.g. `01-*`, `02-*`) or any recognisable naming pattern
4. Check whether a discovery workspace folder already exists (e.g. `discovery/`, `gen-e2-discovery/`, `01-discover/`, a folder whose name matches the engagement or client name)

**If existing artefacts are already placed in a recognisable structure:**
- Describe what you see to the human
- Propose that structure as the convention to persist — skip Option A and Option B in Step 3
- Proceed to Step 3 with "Option C — follow what's already here" as the default choice

---

## Step 3 — Propose Structure Options

If no structure is established, present the following options to the human and wait for an explicit choice or an alternative instruction before proceeding:

> *"I don't see a folder structure rule for this project yet. Here are three options — please pick one or describe your preference:*
>
> **Option A — Phase-numbered (recommended for new projects)**
> ```
> <engagement-slug>.gen-e2.brief        ← product brief at workspace root
>
> 01-discover/
>   01-research/     ← research notes, synthesis boards, heuristics
>   02-personas/     ← .gen-e2.persona files
>   03-journeys/     ← .gen-e2.jm files
>   04-blueprints/   ← .gen-e2.bp files
>   05-flows/        ← .gen-e2.flow files
>
> 02-define/
>   02-raid.gen-e2.raid
>
> 03-ideate/
>   ← story maps, wireframes, design systems, concept flows
> ```
>
> **Option B — Flat discovery folder (simpler)**
> ```
> gen-e2-discovery/
>   <engagement-slug>.gen-e2.brief
>   research-plan.md
>   research/
>   personas/
>   journeys/
>   blueprints/
>   flows/
>   raid.gen-e2.raid
> ```
>
> **Option C — Follow what's already in the repo**
> [Describe the existing structure found in Step 2 here]
>
> *Or describe your preferred structure and I'll use that instead."*

**Do not create any folders or write any files until the human has confirmed a choice.** If no confirmation is possible (e.g. the agent is running unattended), use the default placement defined below and log a RAID entry: *"Folder structure not yet confirmed — files placed at default location pending human review."*

---

## Step 4 — Persist the Chosen Structure

Once the human has confirmed a structure:

### 4a — Locate the agent/instructions file

Check for the following in order of preference:

1. `AGENTS.md` at the project root
2. `CLAUDE.md` at the project root
3. `.github/copilot-instructions.md`
4. `copilot-instructions.md` at the project root

If none exists, create `AGENTS.md` at the project root.

### 4b — Append the structure rule

Add the following block to the end of the chosen file:

```markdown
## Gen-e2 Folder Structure

Confirmed on [YYYY-MM-DD]. All gen-e2 agents must follow this layout when placing output files.

[PASTE THE CONFIRMED STRUCTURE HERE — use the exact folder and file paths as agreed]

### Placement Rules
- Place every gen-e2 output in the location shown above.
- Only create a subfolder when the first file for that category is ready to be written — never scaffold empty folders.
- If a new output type is needed with no defined location, propose a placement to the human and update this block once confirmed.
- To change this structure, edit this section with explicit human approval and update the date (YYYY-MM-DD).
```

### 4c — Confirm to the human

*"I've written the folder structure rule to [filename]. All gen-e2 agents will follow this layout from now on. You can change it at any time by editing the `## Gen-e2 Folder Structure` section in that file."*

---

## Default Placement — Before Structure is Confirmed

If a file must be written before the human has confirmed a structure (e.g. the session cannot pause), use these safe defaults to avoid blocking the work:

| Output type | Default location |
|---|---|
| Product brief | Project root — `<engagement-slug>.gen-e2.brief` |
| Research plan | Project root — `research-plan.md` |
| RAID log | Project root — `raid.gen-e2.raid` |
| Any other artefact | Project root — using the full filename (e.g. `provisional-persona.gen-e2.persona`) |

Log a RAID entry for every file written to the default location:
> *"[filename] placed at project root pending folder structure confirmation. Move to agreed location once structure is set."*

---

## Migration — After Structure is Confirmed

After a structure is confirmed, check whether any files were placed at the root using default placement and offer to move them:

> *"During the initial session I placed the following files at the project root before the folder structure was agreed: [list]. Now that we have a structure, I can move them to their correct locations: [list proposed destinations]. Shall I do that now?"*

Wait for explicit confirmation before moving any file. Never move files without human sign-off.

---

## Constraints

- NEVER write files to a new subfolder without a confirmed structure rule or explicit human approval for that specific location
- NEVER re-prompt for structure if a persisted rule already exists in the agent/instructions file — read it and use it
- NEVER create empty scaffold folders — only create a folder when the first file for that category is ready to be written
- ALWAYS write the persisted rule to the agent/instructions file once confirmed — do not hold it in memory only
- ALWAYS offer to migrate default-placement root files after a structure is confirmed
- NEVER move files without explicit human confirmation
- NEVER create a `## Gen-e2 Folder Structure` block in a file that already has one — update the existing block instead
