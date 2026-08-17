---
name: strategy-run
description: "Entry point for the Gen-e2 product-discovery workflow. Use when starting a new discovery, resuming an in-progress engagement, checking which stage is next, or understanding what each agent produces and in what order. Trigger phrases: 'start discovery', 'run discovery', 'begin a discovery', 'how do I run the strategy workflow', 'resume discovery', 'where am I in discovery', 'gen-e2 strategy workflow', 'what comes after research', 'what agent do I run next'."
argument-hint: "'new' to start a fresh engagement, or describe your current state (e.g. 'research is done, what next?') to get a recommended next step"
disable-model-invocation: true
---

# Strategy Run — Workflow Entry Point

This skill is the human entry point for a Gen-e2 product discovery. It does not produce discovery documents itself — it tells you what to run and hands off to `strategy-agent`.

`disable-model-invocation: true` means the model must not auto-route here. The human triggers it as a slash command (`/gen-e2-strategy:strategy-run`).

## When to use

- Starting a new discovery from client materials
- Resuming an in-progress engagement and not sure which stage is next
- Wanting the pipeline map before any agent runs

## Quick start — new engagement

Bring whatever you have (decks, analytics, past research, org charts, support data, transcripts). Then invoke the orchestrator:

```
strategy-agent: here's the client's pitch deck and support export — start a discovery
```

`strategy-agent` does ingest, framing, and research planning itself, then dispatches the later stages as sibling specialists. You do not invoke `research-agent`, `synthesis-agent`, `definition-agent`, or `deliver-agent` yourself unless `strategy-agent` cannot spawn (it will return a `NEXT: <agent>` block).

## Pipeline

| Stage | Who runs it | What it produces |
|---|---|---|
| Ingest → frame → research plan | `strategy-agent` | Product brief, research plan, RAID, discussion guides |
| Research execution | `research-agent` (dispatched by strategy) | Transcripts, tagged findings, emerging themes |
| Synthesis | `synthesis-agent` (dispatched by strategy) | `.gen-e2.research` board, gap map, proceed-or-loop recommendation |
| Update cycle | `strategy-agent` itself | Brief/plan/RAID updated from synthesis |
| Definition | `definition-agent` (dispatched by strategy) | Product proposition, execution plan |
| Deliver | `deliver-agent` (dispatched by strategy) | RACI, AI governance checklist, playback pack |

Specialists return a `NEXT:` block and stop. They never invoke each other.

## Resume a partial run

1. Look at what already exists in the discovery workspace (brief, research plan, findings, synthesis board, proposition, delivery pack).
2. Invoke `strategy-agent` and describe the current state. It has a resume table and will dispatch the next sibling — or return `NEXT: <agent>` if it cannot spawn.

Do not start a specialist yourself to "skip ahead" unless strategy has already returned that `NEXT:` block.

## Dispatch

Once you know you want the orchestrator, invoke it directly:

```
strategy-agent: <what you have, or where you are>
```
