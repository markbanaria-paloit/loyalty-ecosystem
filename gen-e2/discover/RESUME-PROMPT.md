# Resume prompt — loyalty-pwa Member PWA discovery

Paste the block below after restarting Claude Code.

---

```
Resume the loyalty-pwa gen-e2 discovery. Read your memory files first
(MEMORY.md — gen-e2-method, loyalty-pwa-engagement, loyalty-pwa-discovery-scope).

Setup is done: gh authed, gen-e2-marketplace registered with APM, 30 skills +
7 agents in /Users/mjbanaria/loyalty-pwa/.claude/, poppler installed.

Start the Discover phase for the Member PWA (apps/pwa).

Context: this is NTUC Club's Customer Loyalty Programme (tender NC-CT00008).
PALO IT is proposing Phase 1 — a free two-tier points programme, Member +
Merchant platforms plus the integration layer to Open Loyalty's engine,
targeting a 1 Dec launch. apps/pwa is the Member platform.

Ingest these ALREADY-EXTRACTED text files in
gen-e2/discover/general-references/extracted/ — do NOT re-read the PDFs:

  - tender-BRD-requirements.txt        (7.2k words) — the BRD, 54 numbered
                                        requirements: BR-P1 x34, BR-P2 x11,
                                        BR-P3 x7, BR-DI x7. MoSCoW-tagged,
                                        phase-tagged. THE primary source.
  - solutioning.txt                    (2.1k words) — PALO IT's Phase 1 scope
  - tender-statement-of-compliance.txt (1.3k words) — compliance obligations

  tender-NC-CT00008.txt is the full 20.8k-word extract — the first ~1,540 lines
  are contract boilerplate with no product content. Only consult it if the BRD
  leaves a gap.

Also available: repo README, apps/pwa source, spec/openloyalty-openapi.json
(195 paths, 352 schemas).

Run /strategy-run (or invoke strategy-agent directly) and take it through
ingest -> framing -> research plan. Focus framing on BR-P1 requirements that
touch the member experience. Confirm the workspace folder structure with me
before writing artefacts.
```

---

## Notes

- If `/strategy-run` does not autocomplete, the vendored `gen-e2-strategy` skills
  did not register — check `.claude/skills/strategy-run/` placement.
- `strategy-agent` will propose a workspace folder layout on first run and
  persist it to `CLAUDE.md` under `## Gen-e2 Folder Structure`. It won't re-ask,
  so confirm a layout you're happy with long-term.
- The solutioning deck is slide-based; its **diagrams are not in the text
  extract**. If architecture detail is needed, read those pages as images from
  `solutioning.pdf`.
