# loyalty-pwa

NTUC Club Customer Loyalty Programme (tender NC-CT00008). PALO IT is delivering
Phase 1 — a free, two-tier points programme comprising the Member platform
(`apps/pwa`), the Merchant platform (`apps/merchant`) and the integration layer
bridging both to Open Loyalty's engine. Target go-live: **1 December 2026**.

npm workspaces monorepo. React 18 + Vite + TypeScript for `pwa`, `admin`,
`merchant`, `studio`; Express + TypeScript for `backend` and `mock-openloyalty`.
Node >= 20. OpenLoyalty is used headlessly; `spec/openloyalty-openapi.json` is the
vendored source of truth.

## Gen-e2 Folder Structure

Confirmed on 2026-08-17. All gen-e2 agents must follow this layout when placing
output files.

```
gen-e2/
  discover/
    general-references/            ← shared source material across all surfaces
      NC-CT00008 Tender Documents.pdf
      solutioning.pdf
      extracted/                   ← plain-text extracts of the above
    customer-app/                  ← Member PWA (apps/pwa) engagement
      ntuc-member-pwa.gen-e2.brief ← product brief (living document)
      raid.gen-e2.raid             ← RAID log
      01-research/                 ← research plan, discussion guides,
                                     findings, synthesis boards
      02-personas/                 ← .gen-e2.persona
      03-journeys/                 ← .gen-e2.jm
      04-flows/                    ← .gen-e2.flow
      05-blueprints/               ← .gen-e2.bp
  build/                           ← reserved; engineering context only
```

Each product surface gets its own engagement folder as a sibling of
`customer-app/` (e.g. `merchant-app/`, `admin-cockpit/`, `campaign-studio/`),
sharing `general-references/`.

### Placement Rules

- Place every gen-e2 output in the location shown above.
- Only create a subfolder when the first file for that category is ready to be
  written — never scaffold empty folders.
- If a new output type is needed with no defined location, propose a placement to
  the human and update this block once confirmed.
- To change this structure, edit this section with explicit human approval and
  update the date (YYYY-MM-DD).

### Discovery / build separation

`gen-e2/discover/` accumulates discarded directions and unvalidated options by
design. Do not read from it when generating production code — move an artefact
into `gen-e2/build/` deliberately, and treat that move as a validation step.
