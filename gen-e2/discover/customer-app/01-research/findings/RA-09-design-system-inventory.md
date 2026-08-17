# RA-09 — Design System and Brand Audit — Inventory (Part 1 of 2)

**Activity:** RA-09 — Design system audit + component inventory
**Targeting gap:** G11 — "We don't know the design language: no NTUC Club brand assets, design system or component library for the programme has been provided or found in the repository."
**Date:** 2026-08-17
**Evaluator:** Gen-e2 Research Agent
**Status:** **Partial — inventory complete, definition blocked.**
**Research plan:** [`../02-research-plan.md`](../02-research-plan.md)
**Companion output:** [`RA-10-heuristic-accessibility.gen-e2.he`](RA-10-heuristic-accessibility.gen-e2.he)

---

## 1. Why this is half an activity

RA-09's trigger in the approved plan is *"NTUC Club brand guidelines obtained — not present in the ingested pack."* **They have still not been provided.** The trigger has not fired.

The plan states two success criteria. Two of the three parts are achievable without the guidelines and are delivered here:

| Success criterion | Status |
|---|---|
| An inventory of what exists (NTUC Club brand assets, NTUC Enterprise group design standards, the ad-hoc styles in `apps/pwa/src/styles.css`) | **Delivered** — sections 3–6 |
| Accessibility contrast requirements settled at this point rather than retrofitted | **Delivered as a constraint set** — section 7. The *failures in the current placeholder palette* are measured and reported; the *requirement* is stated so the incoming palette is tested on arrival rather than after build |
| A stated position on whether the programme inherits a group design language or defines its own | **BLOCKED** — section 8. This is not a research finding. It is a client decision that cannot be made without the guidelines |

Part 2 of RA-09 — the definition workshop and the `.gen-e2.ds` token library — remains **planned**, gated on the same trigger.

---

## 2. Method and coverage

Static inspection of the repository at 2026-08-17, plus a full-text search of the ingested tender pack.

**Searched:**
- The whole repository for stylesheets, token files, theme modules, Tailwind/Panda/Style-Dictionary configs, and font, image and vector assets (excluding `node_modules`, `dist`, `dev-dist`, `apm_modules`).
- All four extracted tender documents: `tender-BRD-requirements.txt`, `tender-NC-CT00008.txt`, `tender-statement-of-compliance.txt`, `solutioning.txt`.
- The four member/staff-facing app packages: `apps/pwa`, `apps/admin`, `apps/merchant`, `apps/studio`.

**Not searched (out of reach):** any design file outside the repository — Figma, Sketch, InVision, a brand portal, a printed guideline PDF. If NTUC Club brand assets exist, they exist somewhere this audit cannot see. That possibility is exactly what makes section 8 a blocker rather than a conclusion.

---

## 3. Inventory A — NTUC Club brand assets

### Nothing. Zero assets found.

| Asset class | Found | Notes |
|---|---|---|
| NTUC Club logo or wordmark (any format) | **None** | The only logo files in the repo are PALO IT's, inside `.claude/skills/html-presentation/reference/assets/` and its `apm_modules` mirror — tooling assets, unrelated to the product |
| Brand colour specification | **None** | |
| Licensed or specified typeface (`.woff`, `.woff2`, `.ttf`, `.otf`) | **None** | Zero font files anywhere in the repo. Every surface uses the OS system stack |
| Photography, illustration or icon library | **None** | Iconography is currently OS emoji (see 5.6) |
| Tone-of-voice or copy guidance | **None** | |
| Property sub-brand assets (Downtown East, D'Resort, Wild Wild Wet, OCC, ACC, My Golf Kaki) | **None** | Phase 2/3 will need these; Phase 1 does not, but the programme's naming relationship to them is undefined |

### What the tender pack does say about brand

Four fragments, and that is the entirety of the brand direction available:

| Source | Content |
|---|---|
| BRD §3.3 | Brand promise: **"Your Third Place Rewards You More"** |
| BRD §3.3 | Proposition line: *"Your favourite place to eat, play and connect — the more you visit, the more rewarding every visit becomes."* |
| BRD §3.3 | Tagline direction **under consideration**: *"Your next visit will always be more rewarding"* — explicitly not settled |
| BRD §4 (Project Objectives) | *"Deliver a **branded loyalty platform under the NTUC Club identity**, whether through a white-label or equivalent configurable solution…"* |

**The BRD §4 line is the important one.** Carrying the NTUC Club identity is a stated project objective — a compliance item that will attract a Compliant / Partially Compliant verdict in the Statement of Compliance (RAID R011). PALO IT is contractually committed to delivering an NTUC Club-branded platform and currently holds no NTUC Club brand asset of any kind. That is a delivery dependency, not a design preference.

There are also **no visual references anywhere in the pack**. The Changi Rewards App is named in BRD §4 as the usability and feature-maturity benchmark, but no screens, no comparators and no mood direction accompany it.

---

## 4. Inventory B — NTUC Enterprise / group design standards

### Nothing found in the ingested materials.

| Looked for | Found |
|---|---|
| NTUC Enterprise or NTUC Club group design system, brand portal, or component library | **None** |
| Group web/mobile UI standards, or a reference to one | **None** |
| Group accessibility standard or conformance policy | **None** — see 4.1 |
| Group front-end technology or framework mandate | **None** |

The pack does establish that group-level governance exists in adjacent domains — BRD §6, §12.5 and §17.3 apply NTUC Group data governance and cybersecurity standards, and the NTUC Club IT Outsource Security Requirement Checklist v3.xlsx is a submission requirement (itself missing from the pack — already logged as RAID I010). **A group that maintains a security standards checklist plausibly maintains brand standards too.** Whether it does is unknown, and it is a question for RA-04 (NTUC HQ / Group IT and Marketing are both already on the interview list).

### 4.1 There is no accessibility requirement in the tender — at all

This is a distinct finding and it belongs in RA-09, because it determines what a contrast standard is being tested against.

**BRD §12.3 is titled "Usability & Accessibility" and contains no accessibility requirement.** Its three entries are:

| Req ID | Requirement | Priority |
|---|---|---|
| NFR-008 | Simple, low-friction enrolment | Must Have |
| NFR-009 | Mobile-first design | Must Have |
| NFR-010 | Multi-language support | Nice to Have |

All three are usability requirements. A full-text search across all four extracted documents returns **zero occurrences** of `WCAG`, `screen reader`, `assistive`, `disability`, `a11y`, `Section 508` or `EN 301 549`.

**Consequence:** the programme has no contracted accessibility conformance target. RA-10 therefore audits against **WCAG 2.2 Level AA as an assumed benchmark, not an agreed one**. For a public-facing programme run by a union-affiliated organisation, with a deliberately recruited 60+ cohort (RA-08) and a family/multi-generational segment named in NFR-010, the absence is conspicuous.

**The conformance target must be agreed before a palette is chosen.** Choosing colours and then discovering the standard is the definition of the retrofit the plan's success criteria are written to avoid. This is a question for RA-04, not a decision for this audit.

---

## 5. Inventory C — the de-facto token set in `apps/pwa/src/styles.css`

**370 lines. 12 CSS custom properties. No design system, and no claim to be one.** What follows is extracted, not designed: it is what a developer building a demo reached for. It is reported at this granularity so that (a) the real system has a documented starting point and a documented set of gaps, and (b) nothing here is silently inherited into the production build by default.

> **Provenance:** this palette is the Tailwind default `indigo`/`violet`/`emerald`/`red` family (`#6366f1` = indigo-500, `#4f46e5` = indigo-600, `#7c3aed` = violet-600, `#34d399` = emerald-400, `#f87171` = red-400). It is a framework default, not a chosen brand. **It has no relationship to NTUC Club.**

### 5.1 Colour — the 12 declared custom properties (`styles.css:1–13`)

| Token | Value | Role in the code |
|---|---|---|
| `--bg` | `#0b1020` | Page background. Near-black navy |
| `--surface` | `#151b30` | Card, list item, stat, reward card |
| `--surface-2` | `#1d2540` | Input fill, default button, segmented track, toast |
| `--text` | `#eef1f8` | Primary text; also the active tab |
| `--muted` | `#94a0be` | Secondary text, labels, inactive tab, dates |
| `--primary` | `#6366f1` | Link, reward cost figure, focus border, toast border |
| `--primary-strong` | `#4f46e5` | Primary button, active segment, gradient start, `theme-color` |
| `--pos` | `#34d399` | Positive points delta |
| `--neg` | `#f87171` | Negative points delta, error text |
| `--radius` | `16px` | Card radius (see 5.3 — inconsistently applied) |
| `--maxw` | `480px` | App shell max width |

### 5.2 Colour used but **not** tokenised

Nine hard-coded values sit outside the token set — the clearest evidence that this is scaffolding rather than a system:

| Value | Where | Note |
|---|---|---|
| `#7c3aed` | `.points-card` gradient end (`:240`) | The gradient terminus of the app's hero component is untokenised |
| `#fff` | 7 declarations | Button, segment, points card, tier row, progress fill |
| `rgba(21,27,48,0.92)` | `.tabbar` (`:100`) | `--surface` with alpha, restated by hand |
| `rgba(255,255,255,0.06)` | `.tabbar` border (`:102`) | |
| `rgba(255,255,255,0.2)` | `.tier-badge` fill (`:266`) | |
| `rgba(255,255,255,0.25)` | `.progress` track (`:275`) | |
| `rgba(255,255,255,0.85)` | `.tier-row .muted` (`:263`) | An inverse `--muted` with no token |
| `#4f46e5` | `index.html:8` `<meta name="theme-color">`, `vite.config.ts:18` manifest `theme_color`, and all three SVG icons | Duplicated in four files with no shared source |
| `#0b1020` | `vite.config.ts:19` manifest `background_color` | Duplicated |

**No semantic layer exists.** There is no `--danger`, `--warning`, `--success`, `--info`, `--border`, `--focus`, `--disabled`, `--overlay` or `--on-primary`. `--pos`/`--neg` are the closest, and they are used both for points direction *and* for error text — one token carrying two unrelated meanings.

### 5.3 Radius — seven values, one token

`8px`, `10px`, `12px`, `14px`, `16px` (`--radius`), `20px`, `999px`. Only `16px` is tokenised, and it is used in just 2 of 12 radius declarations. There is no scale.

### 5.4 Typography

- **One family**, declared once (`:27–28`): `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`. No web font, no licence, no fallback strategy for the non-Latin scripts NFR-010 implies (Chinese, Malay, Tamil).
- **Base 16px.** All sizes in `rem` — which is why text scaling works (RA-10 records this as a pass).
- **No `line-height` declared anywhere.** Every text block uses the browser default. This is the most consequential typographic gap: line-height is the primary lever on readability for the 60+ cohort and it is currently unspecified.
- **No `letter-spacing`** except one hand-tuned `-1px` on the points value.

Fourteen distinct sizes, with no scale behind them:

| rem | ≈px | Weight | Applied to |
|---|---|---|---|
| 3 | 48 | — | `.brand-logo` (emoji) |
| 2.6 | 41.6 | 800 | `.points-value` — `letter-spacing: -1px` |
| *(UA 2em)* | *32* | — | `h1` — **no size declared**; browser default |
| 1.5 | 24 | — | `.page-head h2` |
| 1.4 | 22.4 | 700 | `.stat-value` |
| 1.2 | 19.2 | — | `.tab-icon` |
| 1.05 | 16.8 | — | `.reward-body h3` |
| 1 | 16 | 600 | `.section-head h3`, `input`, `.btn` |
| 0.95 | 15.2 | 600 | `.item-title` |
| 0.9 | 14.4 | — | `.error`, `.toast` |
| 0.85 | 13.6 | — | `.link`, `label`, `.btn.ghost`, `.btn.sm`, `.points-label` |
| 0.82 | 13.1 | — | `.small` |
| 0.8 | 12.8 | 700 | `.tier-badge` |
| 0.72 | 11.5 | — | `.tab` label |

Weights in use: 400 (default), 600, 700, 800.

### 5.5 Spacing, layout, elevation, motion

| Dimension | State |
|---|---|
| **Spacing** | Fifteen raw pixel values — 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 48, 96 — with no scale and no token. Mostly 4-multiples, but 2, 6, 14, 18 and 22 break any 4pt or 8pt grid |
| **Layout** | `--maxw: 480px`, centred. Single column throughout. `.stat-grid` is the only grid (`1fr 1fr`, fixed) |
| **Breakpoints** | **None.** Zero `@media` queries in 370 lines. Responsiveness comes from `max-width` and flow alone. No tablet or desktop consideration |
| **Elevation** | **None.** Zero `box-shadow` declarations. Depth is expressed only by surface fill — and `--surface` against `--bg` is 1.11:1, so the hierarchy is very nearly invisible (see 7) |
| **Motion** | **None.** Zero `transition`, zero `animation`, zero `@keyframes`. Every state change is instant. Consequently no `prefers-reduced-motion` guard exists — and none is currently needed |
| **Effects** | One `linear-gradient(135deg, …)` on the points card; one `backdrop-filter: blur(12px)` on the tab bar. No `prefers-reduced-transparency` handling |
| **Theme** | **Dark only.** Zero `prefers-color-scheme` queries. No light mode. See 8.1 |
| **Focus** | One rule: `input:focus { outline: none; border-color: var(--primary) }`. **No focus token exists.** Nothing else in the app has an authored focus state |
| **Disabled** | One rule: `opacity: 0.5` on `.btn.primary:disabled`. No disabled token |

### 5.6 Component patterns present

Eleven recurring patterns are identifiable in the CSS. They are the honest starting inventory for an atomic decomposition:

| Pattern | Class | Variants |
|---|---|---|
| App shell | `.app-shell` / `.content` | Fixed max-width, bottom-padded for the tab bar |
| Bottom tab bar | `.tabbar` / `.tab` | active / inactive |
| Card | `.card` | Also `.reward-card`, `.stat`, `.list-item` — four near-duplicates differing only in radius and padding |
| Hero balance card | `.points-card` | The only gradient surface in the app |
| Button | `.btn` | `.primary`, `.ghost`, `.block`, `.sm`, `:disabled` — five modifiers, ad-hoc sizing |
| Segmented control | `.segmented` | active / inactive; **state is colour-only** (RA-10 A11Y-01) |
| Text input | `input` + wrapping `label` | Single style; boundary contrast 1.13:1 (RA-10 A11Y-08) |
| List | `.list` / `.list-item` / `.item-title` / `.delta` | `.pos` / `.neg` |
| Badge / pill | `.tier-badge` | Single variant |
| Progress bar | `.progress` / `.progress-fill` | No `role="progressbar"` (RA-10 A11Y-09) |
| Toast | `.toast` | **One neutral style for both success and failure** (RA-10, heuristic 9) |

**Iconography is OS emoji** — `🎁` as the brand mark (`LoginPage.tsx:34`) and `🏠 🎁 📜` as tab icons (`TabBar.tsx:4–6`). Emoji render differently on every OS, cannot be weight- or colour-controlled, and shift appearance across OS releases. `🎁` is additionally used for two different things on the same product. There is no icon set to inventory.

### 5.7 The three app icons (`apps/pwa/public/`)

| File | Content |
|---|---|
| `icon.svg` | 512×512, `rx=96`, `#4f46e5` field, white gift-box glyph |
| `icon-maskable.svg` | 512×512, square, same glyph inset for the maskable safe zone |
| `favicon.svg` | 64×64, `rx=14`, `#4f46e5` field, the letter **"L"** in `system-ui` |

All three are placeholders and all three hard-code `#4f46e5`. `favicon.svg` renders the initial of "Loyalty Rewards" — the placeholder product name (`index.html:9`, `LoginPage.tsx:35`, and the manifest `name`/`short_name`). **No NTUC Club naming exists anywhere in the member surface.**

---

## 6. Inventory D — the four programme surfaces do not share a design language

The monorepo contains four front-end surfaces for one programme. Each declares its own unrelated palette, in its own naming convention, in its own `src/styles.css`. **There is no shared design package, no shared token file, and no import relationship between them.**

| | `apps/pwa` (Member) | `apps/admin` (Cockpit) | `apps/merchant` (Tenant) | `apps/studio` (Campaign) |
|---|---|---|---|---|
| Mode | **Dark** | Light | Light | Light |
| Page bg | `#0b1020` | `#f1f5f9` | `#f7f9f8` | `#faf9fc` |
| Surface | `#151b30` | `#ffffff` | `#ffffff` | `#ffffff` |
| Text token | `--text` `#eef1f8` | `--ink` `#0f172a` | `--ink` `#0b1f1a` | `--ink` `#1a1327` |
| Muted | `#94a0be` | `#64748b` | `#6b7f79` | `#6b6180` |
| Accent token | `--primary` `#6366f1` (indigo) | `--accent` `#0284c7` (sky) | `--brand` `#065f46` (emerald) | `--brand` `#4c1d95` (violet) |
| Border token | *(none)* | `--line` `#e2e8f0` | `--line` `#dfe8e5` | `--line` `#e6e1ef` |
| Radius | `16px` | `12px` | `12px` | `14px` |
| Semantic set | `--pos` / `--neg` | `--pos` / `--neg` | `--accent` / `--warn` / `--neg` | `--ok` / `--warn` / `--neg` |

Four palettes, four naming conventions (`--text`/`--primary` vs `--ink`/`--accent` vs `--ink`/`--brand`), four radius values, four different semantic sets. Only two things are common: the `system-ui` font stack and the `box-sizing`/`height` reset.

**Why this matters beyond tidiness.** The merchant surface is operated by tenant staff at the same counter where the member presents their card. Two apps from the same programme, side by side at the point of sale, currently look like products from different companies. The member surface is also the only dark one — and, per RA-10, the one that will need to display a scannable QR code.

This is a real finding, but note its limit: it is evidence that **no design language has been chosen yet**, not evidence that the surfaces should be unified. Whether the member and staff surfaces *should* share a visual language is itself part of the blocked decision in section 8.

---

## 7. Contrast — settled now, as the plan requires

Full computed results, including all non-text pairs and the alpha-composited values, are in [`RA-10-heuristic-accessibility.gen-e2.he`](RA-10-heuristic-accessibility.gen-e2.he) → `accessibility.contrastResults`. Computed 2026-08-17 from the declared stylesheet values using the WCAG relative-luminance formula.

### 7.1 Failures in the current placeholder palette

| # | Pair | Ratio | Required | Criterion |
|---|---|---|---|---|
| 1 | `--primary` `#6366f1` on `--bg` — the "See all" link, 13.6px | **4.24:1** | 4.5:1 | 1.4.3 (AA) |
| 2 | `--primary` on `--surface` — the reward cost figure "850 pts", 16px bold | **3.82:1** | 4.5:1 | 1.4.3 (AA) |
| 3 | `#fff` on `.tier-badge` fill (`rgba(255,255,255,0.2)` over the gradient ⇒ `#8566ed`) | **4.10:1** | 4.5:1 | 1.4.3 (AA) |
| 4 | Input fill `--surface-2` against card `--surface` — the boundary of every text field | **1.13:1** | 3:1 | 1.4.11 (AA) |
| 5 | Progress track (`rgba(255,255,255,0.25)` over the gradient) against the card | **1.63:1** | 3:1 | 1.4.11 (AA) |

Advisory (WCAG-exempt but consequential): disabled `.btn.primary` at `opacity: 0.5` gives **3.96:1** on the "Not enough" label — a disabled control that carries information the member needs.

Informational: `--surface` against `--bg` is **1.11:1**. Cards are not user-interface components so 1.4.11 does not apply, but with no `box-shadow` and no border anywhere in the stylesheet, the entire surface hierarchy rests on a 1.11:1 fill difference. It will not survive a bright clubhouse.

**Do not patch these five individually.** The palette is Tailwind's default and is being replaced. Their value is as a constraint on whatever replaces it.

### 7.2 What passes, and is worth keeping as a habit

Every text pair on `--text` and `--muted` clears 4.5:1 comfortably (5.77:1 to 16.74:1), including the 11.5px tab labels. `#fff` on the primary button and across the full gradient range clears 4.5:1 (5.70:1 at the worst point). Whoever wrote this stylesheet was checking body-text contrast. The failures are concentrated in **accent colour used as text** and in **non-text boundaries** — the two categories that are easiest to miss and that a token-level rule can prevent permanently.

### 7.3 Requirements to apply to the incoming palette on arrival

Written as constraints so that they can be applied on the day brand guidelines land, before any component is built:

1. **Text 4.5:1, large text (≥24px, or ≥18.7px bold) 3:1** against every surface the token is permitted to appear on. Test each foreground against *all* of `--bg`, `--surface` and `--surface-2` — failure #2 exists precisely because a colour that passed on one surface was reused on another.
2. **Accent colours are not text colours until proven.** Both text failures are the brand accent used as a text fill. Split the token: a `--primary` for fills and a separate, contrast-verified `--primary-text` — do not let one hex serve both.
3. **Non-text 3:1** for every control boundary, focus ring, icon carrying meaning, chart element and progress track (1.4.11).
4. **Define a focus token and give it 3:1 against both the control and the surface behind it, at minimum 2px.** None exists today. This is the cheapest permanent fix in the whole audit.
5. **Do not express disabled state with opacity.** Define a disabled token that stays legible, and move information out of disabled labels.
6. **Never let colour be the only signal** (1.4.1). The segmented control currently fails this (RA-10 A11Y-01) and the toast expresses success and failure identically.
7. **Verify alpha-composited values, not the source colour.** Three of the five failures involve `rgba()` over a gradient. A token library that stores only opaque hexes will not catch them.
8. **Gradients must be tested at both endpoints**, not the midpoint.
9. **Verify the palette against a QR code on a light field** — see 8.1. This is the one contrast requirement that is not a WCAG criterion and is the most likely to be forgotten.
10. **Define `line-height` as a token.** It is absent from the stylesheet entirely and it is a first-order readability lever for the 60+ cohort.

---

## 8. The open position — stated, not resolved

> **BLOCKER — this is a client decision and it cannot be made from the evidence available.**
>
> Whether the NTUC Club loyalty programme **inherits an NTUC Enterprise / NTUC Club group design language** or **defines its own** cannot be determined without the brand guidelines. Nothing in the repository, and nothing in the four ingested tender documents, answers it.
>
> **What is known:** BRD §4 commits the vendor to "a branded loyalty platform under the NTUC Club identity, whether through a white-label or equivalent configurable solution". That establishes the programme carries NTUC Club identity. It does not establish whether that identity is a documented system to inherit or a direction to create — and "white-label or equivalent" is broad enough to cover either.
>
> **What is not known, and must be answered by the client:**
> 1. Do NTUC Club or NTUC Enterprise brand guidelines exist, and in what form (portal, PDF, Figma library, none)?
> 2. Is there a group digital design system, or precedent from another NTUC digital product, that this programme is expected to follow?
> 3. Does the loyalty programme get its own visual identity within the NTUC Club family, or must it be visually indistinguishable from the parent?
> 4. What is the naming and visual relationship to the seven properties (Downtown East, D'Resort, WWW, OCC, ACC, MGK, the Clubhouses) — one identity, or a host with sub-brands?
> 5. **What accessibility conformance standard is the programme held to?** (See 4.1 — the tender specifies none.)
> 6. Do the member surface and the tenant-facing merchant surface share a visual language, or are they deliberately distinct? (See section 6.)
>
> All six are in scope for **RA-04 (stakeholder interviews)** — Marketing owns the customer proposition and NTUC HQ / Group IT owns group standards, and both are already on the interview list. RA-04 has no trigger and can start immediately. **Adding these six questions to the RA-04 guide is the fastest route to unblocking RA-09.**

### 8.1 One design consequence that is already forced, before any brand decision

The current member surface is **dark-first** (`--bg #0b1020`, no light mode, no `prefers-color-scheme`). The single most important component in the product does not yet exist: the digital membership QR (brief `f1`, BR-P1-019), presented at a till to earn and to redeem.

**A QR code needs dark modules on a light field with a quiet zone of at least four modules.** Light-on-dark inverted codes are not reliably decodable by many POS scanners or by camera apps without inversion support. So one of the following must be true, and it is a design-system decision rather than an implementation detail:

- the card view **breaks the theme** with a light panel behind the code; or
- the programme is **not dark-first**.

This constraint holds regardless of which brand direction the client chooses, so it can be settled now and should be carried into the definition workshop as a fixed input. It is also the reason section 7.3 item 9 exists.

*(Related, and also independent of the brand decision: a dark UI is generally less comfortable for ageing eyes, and the plan deliberately recruits a 60+ cohort in RA-08. That is a preference to test, not a constraint to assert — noted so RA-08 can test it rather than inherit it.)*

---

## 9. Output-format decision

Per `gen-e2-output-format` Step 2, the artefact for this content is `.gen-e2.ds`. Per `gen-e2-artefact-decision`, `.gen-e2.ds` is materials-first and generates when *"design tokens, colour palette, typography, or component patterns are present in **ingested designs or brand guidelines**"*.

**The threshold is not met.** Tokens are present — but in *development scaffolding*, not in ingested designs or brand guidelines. Section 5 establishes that the palette is a Tailwind default with no relationship to NTUC Club, that no semantic layer exists, that no spacing, focus, elevation, motion, line-height or breakpoint tokens exist, and that four sibling surfaces disagree with each other. **Emitting a `.gen-e2.ds` from this would promote placeholder scaffolding to the status of a programme design system** — precisely the failure mode the artefact-decision skill exists to prevent, and it would be read downstream as a decision that has not been made.

The `Otherwise` column instructs: *"Log as design-system gap in research plan — defer to Experience Designer."*

**Gap note (per Step 4):** A `.gen-e2.ds` is the right artefact for RA-09. The evidence missing is the NTUC Club brand guidelines and an answer to the inherit-vs-define question in section 8. The research activity that produces it is RA-09 part 2 (the definition workshop), gated on the guidelines arriving, with the six blocking questions routed through RA-04 in the meantime. **No design tokens have been invented in this document. Every value reported is extracted from the codebase and cited to its line.**

This document is therefore an inventory and a constraint set — the honest output — and part 2 remains `Planned`.

---

## 10. Evidence and confidence

| Finding | Confidence | Source |
|---|---|---|
| No NTUC Club brand assets exist in the repository | `validated` | Repository-wide asset search, 2026-08-17 |
| No NTUC Enterprise group design standard in the ingested pack | `validated` | Full-text search of all four extracts, 2026-08-17. **Scoped to the ingested pack — absence here is not proof of absence at the client** |
| The tender specifies no accessibility conformance standard | `validated` | BRD §12.3; zero `WCAG`/`accessib`/`assistive`/`screen reader` matches across all four extracts, 2026-08-17 |
| The `apps/pwa` token set is a Tailwind default with no semantic layer | `validated` | `apps/pwa/src/styles.css:1–13`, values cross-checked against Tailwind's default palette |
| Five WCAG contrast failures in the current palette | `validated` | Computed from declared stylesheet values, WCAG relative-luminance formula, 2026-08-17 |
| The four surfaces share no design language | `validated` | Direct comparison of the four `src/styles.css` files, 2026-08-17 |
| A QR code requires a light field, constraining the dark-first direction | `strong-signal` | QR/barcode scanner decoding convention; not verified against the specific tenant POS hardware, which is unknown (RAID D006) |
| Whether the programme inherits or defines a design language | **unknown — blocked** | No evidence available. Do not resolve without the client |
