# Gen-e2 Marketplace — Claude Code package catalogue

**Source:** https://dev.marketplace.paloitcloud.com.sg/?tool=claude-code (login required)
**Captured:** 2026-08-17 · **Filter:** Compatible tool = Claude Code
**Machine-readable companion:** [`gen-e2-marketplace.json`](./gen-e2-marketplace.json)

## Totals

| Metric | Value |
|---|---|
| Packages (plugins) | 51 |
| `Gen-e2 core` (CORE flag) | 7 |
| `Community` | 44 |
| Skills / Agents / MCPs / Commands / Hooks | 181 / 76 / 36 / 9 / 3 |
| Readiness: Ready to run / Needs setup / Not recorded | 14 / 14 / 23 |

## The PDLC stages

The Gen-e2 product development lifecycle runs in order: **Discover → Build → Operate → Evolve → Scale**. Each stage draws on and adds to a shared product context. A package can be registered for several stages; 4 packages have no stage set.

| Stage | Packages | What the marketplace says the stage is for |
|---|---|---|
| Discover | 22 | Framing the problem, research, definition, presales/discovery artefacts |
| Build | 35 | System design, writing code, automated checks, keeping it working as you build |
| Operate | 28 | Releases, monitoring, incidents, documentation once live |
| Evolve | 13 | Turning feedback into action, next round of improvements, tech debt |
| Scale | 11 | Growth, governance, and cross-cutting hardening |
| *(none set)* | 4 | `implementation-plan`, `android`, `initialize-context` (rules copy), `testing-toolkit` |

---

## Core packages (origin = `Gen-e2 core`) — 7

| Package | Version | Stages | Contents | Readiness |
|---|---|---|---|---|
| **presales-fleet** | 0.1.0 | Discover | 18 Skills · 6 Agents · 5 MCPs | Ready to run |
| **gen-e2-strategy** | 1.0.0 | Discover | 9 Skills · 5 Agents | Ready to run |
| **gen-e2-edith** | 1.0.0 | Discover, Build | 13 Skills | Ready to run |
| **gen-e2-design** | 1.0.0 | Build | 7 Skills · 2 Agents | Ready to run |
| **data-engineering-fleet** | 0.1.0 | Build, Operate | 17 Skills · 7 Agents · 5 MCPs | Ready to run |
| **devops-fleet** | 0.1.0 | Build, Operate, Evolve | 3 Skills · 4 Agents · 4 MCPs | Ready to run |
| **html-presentation** | 0.1.0 | all 5 | 1 Skill | Ready to run |

All seven are `Ready to run` and work in GitHub Copilot (VS Code), Claude Code, Codex and Cursor. Everything else in the catalogue is `Community` and, with two exceptions (`android`, which is also multi-tool), Claude-Code-only.

---

## All packages by stage

### Discover (22)

| Package | Core? | Stages | Contents | Readiness |
|---|---|---|---|---|
| presales-fleet | ✅ core | Discover | 18S · 6A · 5M | Ready to run |
| gen-e2-strategy | ✅ core | Discover | 9S · 5A | Ready to run |
| gen-e2-edith | ✅ core | Discover, Build | 13S | Ready to run |
| html-presentation | ✅ core | all 5 | 1S | Ready to run |
| initialize-context | — | Discover | 1S · 1A | Needs setup (repo) |
| html-planner-and-presentation | — | Discover | 3S | Ready to run |
| full-stack-fleet | — | Discover, Build, Operate | 2S · 3A · 3M | Needs setup (terminal + creds) |
| fortran77-explainer | — | Discover, Build | 1A | Not recorded |
| document-to-markdown | — | Discover, Operate | 1S | Not recorded |
| docs-standards | — | Discover, Operate, Evolve, Scale | 3S | Needs setup (repo) |
| discovery-fleet | — | Discover, Build | 7S · 8A · 6M | Not recorded |
| figma-design-to-code | — | Discover, Build | 2S | Not recorded |
| lucid-diagram | — | all 5 | 1S | Ready to run |
| mermaid-diagram | — | all 5 | 1S | Ready to run |
| design-toolkit | — | Discover, Build | 3S · 1M | Not recorded |
| delivery | — | Discover, Build, Operate | 7S · 2A · 1M | Not recorded |
| migration-implementation-plan | — | Discover, Build | 1S | Ready to run |
| research-suite | — | all 5 | 2S | Ready to run |
| agentic-workflows *(marketplace copy)* | — | Discover, Build, Operate | 3S | Needs setup (repo + terminal + creds) |
| spec-and-tech-design | — | Discover, Build | 3S · 2A | Not recorded |
| accessibility-wcag | — | Discover, Build | 1S · 1A | Not recorded |
| pptx-themes | — | Discover, Operate | 1S | Ready to run |

### Build (35)

| Package | Core? | Stages | Contents | Readiness |
|---|---|---|---|---|
| devops-fleet | ✅ core | Build, Operate, Evolve | 3S · 4A · 4M | Ready to run |
| gen-e2-edith | ✅ core | Discover, Build | 13S | Ready to run |
| data-engineering-fleet | ✅ core | Build, Operate | 17S · 7A · 5M | Ready to run |
| html-presentation | ✅ core | all 5 | 1S | Ready to run |
| gen-e2-design | ✅ core | Build | 7S · 2A | Ready to run |
| java | — | Build | 2S · 3A | Needs setup (repo) |
| tdd-orchestrator | — | Build, Operate | 1S · 1A | Needs setup (repo) |
| golang | — | Build | 1S · 3A | Needs setup (repo) |
| full-stack-fleet | — | Discover, Build, Operate | 2S · 3A · 3M | Needs setup (terminal + creds) |
| fortran77-explainer | — | Discover, Build | 1A | Not recorded |
| journey-recording-browser | — | Build, Operate, Evolve | 1S | Not recorded |
| kotlin | — | Build, Operate | 8S · 3A | Needs setup (repo) |
| discovery-fleet | — | Discover, Build | 7S · 8A · 6M | Not recorded |
| journey-recording-mobile | — | Build, Evolve | 1S | Not recorded |
| figma-design-to-code | — | Discover, Build | 2S | Not recorded |
| lucid-diagram | — | all 5 | 1S | Ready to run |
| mermaid-diagram | — | all 5 | 1S | Ready to run |
| design-toolkit | — | Discover, Build | 3S · 1M | Not recorded |
| delivery | — | Discover, Build, Operate | 7S · 2A · 1M | Not recorded |
| mgf-agentic-ai | — | Build, Operate, Scale | 1S | Not recorded |
| migration-implementation-plan | — | Discover, Build | 1S | Ready to run |
| azure-devops-rest-no-mcp | — | Build, Operate | 1S | Not recorded |
| nextjs | — | Build, Operate | 2S · 3A | Needs setup (repo) |
| architecture-reviewer | — | Build, Evolve | 2S · 1A | Needs setup (repo) |
| powershell-safe-scripting | — | Build | 1S | Not recorded |
| angular | — | Build, Operate | 2S · 3A | Needs setup (repo + terminal) |
| ai-engineering-fleet | — | Build, Operate, Scale | 4S · 6A · 3M | Needs setup (repo + terminal + creds) |
| research-suite | — | all 5 | 2S | Ready to run |
| agentic-workflows *(marketplace copy)* | — | Discover, Build, Operate | 3S | Needs setup |
| agentic-workflows *(rules copy)* | — | Build, Evolve | 3S | Not recorded |
| adyen | — | Build, Operate, Scale | 2S | Not recorded |
| ai-coding-agent | — | Build, Operate | 2S · 1 Hook | Not recorded |
| spec-and-tech-design | — | Discover, Build | 3S · 2A | Not recorded |
| accessibility-wcag | — | Discover, Build | 1S · 1A | Not recorded |
| autogen | — | Build, Operate | 2S | Not recorded |

### Operate (28)

devops-fleet ✅ · data-engineering-fleet ✅ · html-presentation ✅ · tdd-orchestrator · full-stack-fleet · document-to-markdown · journey-recording-browser · docs-standards · kotlin · lucid-diagram · mermaid-diagram · delivery · mgf-agentic-ai · cloud-iac *(Operate only)* · azure-devops-rest-no-mcp · ms-learn-no-mcp · atlassian-rest-no-mcp · nextjs · angular · ai-engineering-fleet · research-suite · agentic-workflows *(marketplace copy)* · security · adyen · ai-coding-agent · sre · autogen · pptx-themes

### Evolve (13)

devops-fleet ✅ · html-presentation ✅ · journey-recording-browser · docs-standards · journey-recording-mobile · lucid-diagram · mermaid-diagram · ms-learn-no-mcp · atlassian-rest-no-mcp · architecture-reviewer · research-suite · agentic-workflows *(rules copy)* · sre

### Scale (11)

html-presentation ✅ · docs-standards · lucid-diagram · mermaid-diagram · mgf-agentic-ai · ms-learn-no-mcp · atlassian-rest-no-mcp · ai-engineering-fleet · research-suite · security · adyen

### Phase not set (4)

implementation-plan · android · initialize-context *(rules copy)* · testing-toolkit

---

## Stage-spanning packages (all five stages)

`html-presentation` (core), `lucid-diagram`, `mermaid-diagram`, `research-suite` — cross-cutting authoring/research utilities, all `Ready to run` with no terminal or repository required.

---

## Gotchas for downstream agents

1. **Duplicate names.** `agentic-workflows` and `initialize-context` each appear twice, from different source repos and with different stage registrations. Disambiguate by `id` or by the repo in `install_command`.
2. **Three source repos.** `gen-e2-marketplace` (47 packages), `gen-e2-rules` (3: agentic-workflows, initialize-context, autogen), `gen-e2-plugins` (1: pptx-themes).
3. **Literal `SKILL` names.** `design-toolkit`, both `agentic-workflows`, `autogen`, and the rules copy of `initialize-context` publish their skills as the literal string `SKILL`. The JSON adds a parenthesised label for readability — resolve the real slugs from the plugin repo before invoking.
4. **Readiness gates.** 23 packages are `Not recorded` (requirements unknown); 14 need setup (repo open, terminal, and/or credentials). Only 14 are `Ready to run` with nothing required.
5. **Fleet packages are orchestrators.** `presales-fleet`, `discovery-fleet`, `devops-fleet`, `data-engineering-fleet`, `full-stack-fleet`, `ai-engineering-fleet` each ship an orchestrator agent that dispatches to specialist sub-agents — invoke the orchestrator, not the specialists.
6. **TDD contract family.** `tdd-orchestrator` is the language-agnostic loop; `java`, `golang`, `kotlin`, `nextjs`, `angular` supply the per-stack `{test-writer, code-writer, code-reviewer}` trios it delegates to.
7. **Install form.** `apm install GLOBAL-PALO-IT/<repo>/plugins/<name>#main --target claude` (marketplace proxy; writes into the project's `.claude/` folder).
8. **Component descriptions** are the marketplace card text, truncated by the site at ~220 characters. Treat them as routing hints, not full specs.
