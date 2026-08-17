# NTUC Club Loyalty — Member PWA — Research Plan

Last updated: 2026-08-17
Status: **cycle 1 — first wave executed.** Four activities complete or part-complete
(RA-01 instrument, RA-05 desk pass, RA-07, RA-09 part 1, RA-10). Five remain blocked on
client access.
Scope: Member platform (`apps/pwa`). Merchant, Admin and Studio surfaces are separate engagements.

---

## Current Unknowns

*Rewritten 2026-08-17 after the first wave. This reflects the current open state, not the
original state — see the git history of this file for the cycle-1 opening position.*

The starting asymmetry still holds: the **business** context is documented to unusual depth
while the **member** remains entirely unresearched. What the first wave changed is the
technical and market picture. Everything that could be learned without client access has
been, and the residue is now sharply defined: **five of the nine original unknowns are
untouched because they all require people we cannot yet reach.**

Two findings have moved from unknown to escalation and now need decisions rather than
research:

- **BR-P1-017 (multiple redemptions per transaction) has no Open Loyalty mechanism.** Not a
  configuration gap — the API has no field for it. Unbudgeted member- and merchant-surface
  engineering.
- **Two of five mandated notification triggers (birthday, lapsed-visit) have no webhook**,
  so the Notification Service as architected cannot originate its own requirements. Cheap to
  fix now, structural to fix later.

The unknowns still open, in the order they gate design decisions:

1. **What members actually want from a loyalty programme at their "third place"** — no
   evidence exists for any of the three named segments, nor for union members as a group.
   The instrument to find out is written and blocked on recruitment access.
2. **What happens at the till** — the earn and redeem moments are described in two
   incompatible ways across the BRD and the solutioning deck, and neither has been observed.
   Benchmarking sharpened rather than answered this: the market holds *three* incompatible
   models of the card moment, and BR-P1-001 picked the most demanding one.
3. **Whether Tier 2 means anything to a member.** Now evidenced as a real risk rather than a
   suspicion — no Singapore comparator runs a status tier with neither an earn nor a
   redemption differential, and NTUC's Tier 2 has the lowest threshold in the set. There is
   now a candidate answer (redemption-value uplift) that needs testing, not just a worry.
4. **The end-to-end service, including its failure paths** — unchanged, and now with two
   more failure paths to draw: the refund exception with no engine equivalent (R015) and
   the multi-redemption partial failure (I016).
5. **What Open Loyalty can express at runtime.** The API surface is now mapped; what remains
   is semantics the specification cannot state — point-consumption order, refund effects,
   whether the deprecated status route has a successor, and which release the tenant runs.
6. **The organisational answers only stakeholders hold** — unchanged, and now carrying three
   further questions: the accessibility conformance standard (I013), whether an assisted
   enrolment path is in scope (A011), and whether retrospective receipt capture is in scope
   (I011, raised to major).
7. ~~How comparable Singapore programmes solve this~~ — **closed by RA-07** for the earn,
   redeem, tier and expiry dimensions. Residual: FRx figures need primary verification
   (D013), and no comparator publishes activation or first-redemption rates, so the Phase 1
   KPI targets cannot be benchmarked from desk research and must come from RA-04.
8. **Whether the enrolment flow works for the people most exposed by it** — unchanged, and
   now with concrete defects to test against rather than a general concern.
9. **What the product looks like** — still no brand assets of any kind. Now compounded: the
   tender specifies no accessibility standard either, and a QR needs a light field on a
   dark-first app.

Six client decisions remain open and block parts of the design regardless of research:
rebate yield (I004 — now with a benchmarked recommendation), tier retention rules (I006),
NTUC member eligibility (I012), the Phase 1 launch footprint (I001), the parking entitlement
unit (I003), and the delivery channel — PWA, native, or both (I009). Three more have been
added by this wave: the accessibility conformance target (I013), the QR-versus-dark-theme
question (I014), and the Tier 2 threshold-or-content decision (I018).

---

## Gap Classification

Gaps are classified using the six-category taxonomy in `gen-e2-gap-analysis`. Priority is
`high` only where both risk and impact are high — those must close before design decisions
are made.

| ID | Gap | Category | Risk | Impact | Priority | Method | Artefact |
|---|---|---|---|---|---|---|---|
| **G01** | We don't know what members are trying to achieve when they visit an NTUC Club property, or what would make them return more often. | User & Behavioural | high | high | **high** | Screener survey + JTBD interviews | `.gen-e2.persona`, `.gen-e2.research` |
| **G02** | We don't know how members and tenant staff actually behave at the point of payment — whether the card gets presented, when redemption is decided, and what goes wrong. | User & Behavioural; Systems & Service | high | high | **high** | Contextual inquiry | `.gen-e2.jm` |
| **G03** | We don't know whether Tier 2 reads as genuine recognition to a member who earns at the same rate as Tier 1 and was placed there automatically. | User & Behavioural | high | high | **high** | JTBD interviews (union-member cohort) | `.gen-e2.research`, `.gen-e2.persona` |
| **G04** | We don't know the end-to-end service across member, tenant staff, Open Loyalty, Salesforce and NTUC HQ — particularly the failure paths: identity-match exception, offline till, refund reversal, points expiry, member dispute. | Systems & Service | high | high | **high** | Service blueprint workshop | `.gen-e2.bp`, `.gen-e2.flow` |
| **G05** | ~~We don't know what Open Loyalty can natively express to a member.~~ **Partially closed 2026-08-17.** API surface mapped by the RA-05 desk pass; residual is runtime semantics only — consumption order, refund effects, status-route successor, tenant release version. | Systems & Service | high | high | **high** | Expert interview + technical spike against a real instance | `.gen-e2.arch` |
| **G06** | We don't know the organisational answers: the definition of "activation", numeric KPI targets, the launch tenant list, identity-exception handling, union eligibility rules, and the parking coupon lifecycle. | Market & Strategic; Product & Scope | high | high | **high** | Stakeholder interviews | `.gen-e2.research` |
| ~~G07~~ | ~~We don't know how comparable Singapore programmes solve the card, earn and redeem moments, or where the proposed rebate yield sits against the market.~~ **CLOSED 2026-08-17** by RA-07 for the mechanics, earn/redeem, tier and expiry dimensions. Residual: FRx figures need primary verification (D013); activation and first-redemption benchmarks are unobtainable by desk research — no comparator publishes them. | Market & Strategic | medium | high | ~~medium~~ **closed** | Competitor analysis / benchmarking | `.gen-e2.research` ✅ |
| **G08** | We don't know whether the enrolment flow completes for the people most exposed by it — five sign-in paths, SingPass redirect, PWA install and QR presentation, including for members aged 60+. | User & Behavioural; Product & Scope | high | high | **high** | Prototype + usability testing | `.gen-e2.flow` |
| **G09** | We don't know whether members accept 12-month points expiry and automatic refund reversal, or what disclosure makes them acceptable. | User & Behavioural | high | high | **high** | JTBD interviews + concept testing | `.gen-e2.research` |
| ~~G10~~ | ~~We don't know what the existing Member PWA does well or badly against usability heuristics and WCAG.~~ **CLOSED 2026-08-17** by RA-10. Produced no product direction, as intended — but did surface accessibility habits that gate the build (R012). | Systems & Service | low | medium | ~~low~~ **closed** | Heuristic evaluation + accessibility audit | `.gen-e2.he` ✅ |
| **G11** | We don't know the design language. **Widened 2026-08-17** by RA-09: beyond the missing brand assets, the tender specifies *no accessibility conformance standard at all* (I013) and a scannable QR conflicts with the dark-first member surface (I014). Impact raised. | Design & System | medium | **high** | medium | Design system audit + definition workshop | `.gen-e2.ds` |
| **G12** | We don't know whether members receive an installable PWA, native apps, or both — the BRD leaves it "architectural decision pending" and the solutioning deck implies all three. | Product & Scope | high | medium | medium | Desk research + stakeholder decision (folded into RA-04) | — |

**Gaps that must close before design decisions:** G01, G02, G03, G04, G05, G06, G08, G09.
**Closed in the first wave:** G07, G10. **Partially closed:** G05 (API surface mapped;
runtime semantics open), G11 (inventory done; brand and standard both still absent).

**New gap surfaced by the first wave:**

| ID | Gap | Category | Risk | Impact | Priority | Method | Artefact |
|---|---|---|---|---|---|---|---|
| **G13** | We don't know what accessibility standard applies, and the existing code has no foundations to build one on — no focus, disabled, spacing or line-height tokens, no `autocomplete`, no live regions. Nine features are due in ~15 weeks against no agreed bar. *Surfaced by: RA-09, RA-10.* | Design & System; Regulatory | high | high | medium | Client decision (via RA-04) + token foundations | `.gen-e2.ds` |

---

## Research Activities

### ✅ Completed

- [x] **RA-07 — Competitor benchmarking** — Completed 2026-08-17
  → Finding: *0.5% is the Singapore mall/airport entry rate, but it is also the rate every
    tiered programme escalates away from; the two clubhouse estates NTUC Club structurally
    resembles pay 1–2%; and no SG comparator runs a status tier with neither an earn nor a
    redemption differential.*
  → Output: [`findings/RA-07-competitor-benchmarking.gen-e2.research`](findings/RA-07-competitor-benchmarking.gen-e2.research)
  → Closed G07. Updated RAID I004, A004, A005, A006, H008; corroborated R004; raised I011;
    contradicted A003; created I018, H010, D013.

- [x] **RA-10 — Heuristic evaluation and accessibility audit** — Completed 2026-08-17
  → Finding: *Baseline established against WCAG 2.2 AA: 1 critical and 5 high accessibility
    defects, 5 contrast failures, and one severity-4 heuristic issue — the redeemed coupon is
    destroyed by navigation. The whole app contains one ARIA attribute, and several passes are
    library defaults rather than intent. The membership card does not exist and has no baseline.*
  → Output: [`findings/RA-10-heuristic-accessibility.gen-e2.he`](findings/RA-10-heuristic-accessibility.gen-e2.he)
  → Closed G10. Created RAID R012, A009; updated R002, R010, H003.

### 🔄 In Progress

- [ ] **RA-01 — Participant screener and recruitment** — *Instrument prepared 2026-08-17;
      not fielded* | Owner: [HUMAN TO ASSIGN]
  → Discussion guide: [`discussion-guides/RA-01-participant-screener.md`](discussion-guides/RA-01-participant-screener.md)
  → Blocked on trigger only (D010), not on materials. Also blocked on the legal position (D012).
  → **Success criteria amended 2026-08-17** to stop the plan's own wording implying a
    three-bucket recruit: participants are recruited against a behavioural grid (regular /
    occasional / lapsed / rare-or-never), with the three named segments recorded as a post-hoc
    classification rather than a recruitment frame, plus cross-cutting minima — ≥5 union
    (≥2 of them lapsed or non-visiting), ≥4 aged 60+ (≥2 showing low device signal), ≥4
    households with under-16s, ≥3 non-users of loyalty programmes, ≥3 non-English preferred.
  → Escalation rule: if the lapsed and non-visiting cells cannot be filled after a full
    recruitment window, **stop and escalate** rather than running a 16-person sample of
    current visitors as evidence for an acquisition programme.

- [ ] **RA-05a — Open Loyalty capability desk pass** — *Completed 2026-08-17 (spec-based)*
  → Output: [`findings/RA-05-openloyalty-capability-desk-pass.gen-e2.research`](findings/RA-05-openloyalty-capability-desk-pass.gen-e2.research)
  → Recommended artefact changed from `.gen-e2.arch` to `.gen-e2.research` for evidence;
    `.gen-e2.arch` is retained for the eventual decision, after RA-05b.
  → Verdicts: voucher wallet **native w/ config** (cheaper than assumed); expiry-cohort
    visibility **native but on a deprecated route**; refund reversal **native w/ config, three
    gaps**; webhooks **3 of 5 native**; multi-redemption **no engine mechanism**.
  → Escalated: I016 (BR-P1-017), I017 (notification origination). Created R014–R018, A010;
    narrowed R008; raised urgency on D005.

- [ ] **RA-09 — Design system and brand audit** — *Part 1 (inventory) complete 2026-08-17;
      part 2 blocked* | Owner: [HUMAN TO ASSIGN]
  → Output: [`findings/RA-09-design-system-inventory.md`](findings/RA-09-design-system-inventory.md)
  → No `.gen-e2.ds` generated, deliberately: the only tokens available are dev scaffolding
    (verifiably Tailwind defaults), and emitting an artefact would promote them to programme
    design system. Ten contrast constraints written to apply to the real palette on arrival.
  → Part 2 (definition workshop, `.gen-e2.ds`) remains blocked on the unchanged trigger —
    brand guidelines, now tracked as D011. Created R013, I013, I014, I015.

### 📋 Planned

Prioritised by risk and impact. All owner fields are `[HUMAN TO ASSIGN]` — assigning them
requires team context the agent does not have.

---

*RA-01, RA-05a, RA-07, RA-09 part 1 and RA-10 have moved to Completed or In Progress above.*

- [ ] **RA-02 — Member JTBD interviews** — User interview / JTBD interview | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G01, G03, G09 (and informs G07)
  → Recommended artefact: `.gen-e2.persona`, `.gen-e2.research`
  → Trigger: RA-01 complete
  → Tests: RAID H002, H004, H006, H007, H008; validates or breaks assumptions A002, A005, A006
  → Discussion guide: [`discussion-guides/RA-02-member-jtbd.md`](discussion-guides/RA-02-member-jtbd.md)
  → Success criteria: 12–15 completed interviews. Outcome statements collected in
    direction-of-improvement + unit-of-measure form for every participant. At least three
    distinct jobs identified and evidenced across more than one participant each. A clear
    read on whether Tier 2 carries perceived value, and on whether the 0.5% rebate yield is
    worth pursuing in members' own terms.
  → **Discussion guide amendments required before fielding (added 2026-08-17 from RA-07):**
    (a) test the Tier 2 redemption-value uplift ($5 vs $10 per 1,000 points, hypothesis H010)
    as a *third* concept alongside flat 0.5% and flat 1% — the rebate question now has three
    options, not two; (b) re-word the SingPass question to present a genuine choice rather than
    a presumed default, since no benchmarked SG programme uses SingPass for enrolment and A003's
    practice-based justification is contradicted.

- [ ] **RA-03 — Contextual inquiry at tenant tills** — Contextual inquiry | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G02 (and evidences G04)
  → Recommended artefact: `.gen-e2.jm`
  → Trigger: Launch tenant list confirmed and site access arranged (RAID D006, **D014** —
    till access was split out of D010 on 2026-08-17, being a different ask to different people)
  → Tests: RAID H001, H005; validates or breaks assumption A004; resolves issue I007
  → Discussion guide: [`discussion-guides/RA-03-till-contextual-inquiry.md`](discussion-guides/RA-03-till-contextual-inquiry.md)
  → Success criteria: 2–3 sites observed across different property types (clubhouse F&B,
    Downtown East retail, an attraction), at least one at peak. Enough observed
    transactions to state whether redemption is member-initiated or staff-initiated, how
    long a member has at the counter, and what the physical and connectivity conditions
    around the card actually are.
  → **Observation target sharpened 2026-08-17 (RA-07):** record specifically whether members
    present *unprompted* when the only reward is 0.5%. Changi's presentation habit — the
    behaviour A004 assumes transfers — is underwritten by 9% GST absorption gated on the same
    scan, roughly 16x the points value. The habit may not survive without it.

- [ ] **RA-04 — Stakeholder interviews** — Stakeholder interview | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G06, G12 (and inputs to G04, G11)
  → Recommended artefact: `.gen-e2.research`
  → Trigger: none — can start immediately; not dependent on participant recruitment
  → Resolves or advances: RAID I001, I003, I005, I006, I008, I009, I011, I012; A008; D002, D004, D006, D007, D008
  → Discussion guide: [`discussion-guides/RA-04-stakeholder-interviews.md`](discussion-guides/RA-04-stakeholder-interviews.md)
  → Success criteria: Marketing, CX, Finance, NTUC HQ/Group IT and a tenant operations
    representative each interviewed. "Activation" defined and all four Phase 1 KPIs given
    numeric targets or explicitly deferred with an owner. Every open item in the RAID issues
    list either answered or assigned a named decision owner and date.
  → **Scope additions 2026-08-17.** RA-04 is now the unblocking path for RA-09 as well, and it
    absorbed nine new questions from the first wave:
    *From RA-09/RA-10* — (1) what accessibility conformance standard applies (I013/A009); the
    tender names none. (2–7) six brand and design-language questions: do we inherit an NTUC
    Enterprise design language or define one, who owns the brand assets, when do they arrive
    (D011), should the four programme surfaces share a system (I015), and how is the QR-on-dark
    conflict resolved (I014).
    *From RA-07* — (8) is an assisted or counter-based enrolment path in scope, given every
    tenant will already have a scanner and CapitaStar still runs counters at 1.8M members
    (A011)? (9) is retrospective earn via receipt submission in scope — the market standard,
    currently unscoped as I011 and now raised to major?
    *From RA-05* — Finance must also model the liability of the three rebate options (H010).
  → Note: no comparator publishes activation or first-redemption rates, so the Phase 1 KPI
    targets **cannot** be benchmarked from desk research. RA-04 is the only route to them.

- [ ] **RA-05b — Open Loyalty live-instance spike** — Technical spike | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G05 (residual — runtime semantics)
  → Recommended artefact: `.gen-e2.arch` (the decision, once the evidence is verified)
  → Trigger: access to a real Open Loyalty instance, not the in-repo mock (RAID D005 — urgency raised)
  → Addresses: RAID R008 (narrowed), R014, R015, R016, R018, A010; sizes escalations I016, I017
  → *Split from RA-05 on 2026-08-17 so RA-06's trigger can be stated precisely. The desk pass
    (RA-05a) mapped the API surface; this verifies behaviour.*
  → Success criteria: the 10-item "test this first" list in the RA-05a findings executed against
    a live instance, ordered by unbudgeted work at stake. The three that gate the most: (T1) does
    the deprecated `GET /member/{member}/status` have a successor, (T2) is point consumption FIFO
    or nearest-expiry, (T3) what is the multi-redemption failure path. Every desk verdict either
    confirmed or overturned, with the escalations sized rather than merely named.

- [ ] **RA-05c — Open Loyalty expert interview** — Expert interview | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G05 (the part no instance can answer)
  → Trigger: **none — can be booked immediately, in parallel with instance access**
  → *Surfaced by: RA-05a desk pass.*
  → Success criteria: four questions answered that the specification cannot state and testing
    cannot reveal — the successor to the deprecated status route, the documented point-consumption
    order, whether any supported multi-redemption pattern or roadmap item exists, and which
    release version the tenant will run (R018). Booking this alongside rather than after D005
    is the single cheapest schedule saving available.

- [ ] **RA-07a — FRx Elite primary verification** — Desk research | Priority: Medium | Owner: [HUMAN TO ASSIGN — research]
  → Targeting gap: G07 residual
  → Trigger: none — can run immediately
  → *Surfaced by: RA-07.* Addresses RAID D013.
  → Success criteria: the FRx Basic/Elite redemption split ($2.50 vs $5.00 per 1,000 points) and
    the $8,000 Elite threshold confirmed from a primary source — install the app or email
    FRHelp@frasersproperty.com. Low effort, but it is the load-bearing evidence for the I004
    recommendation and currently secondary-sourced. **Blocks client-facing use of that
    recommendation**, not the recommendation itself.

- [ ] **RA-11 — Accessibility conformance target and design-system foundations** — Client decision + definition | Priority: Medium | Owner: **[UNASSIGNED — currently owned by nobody and gates all twelve features]**
  → Targeting gap: G13 (new)
  → Recommended artefact: `.gen-e2.ds`
  → Trigger: the conformance question can go to RA-04 immediately; the token work needs D011
  → *Surfaced by: RA-09, RA-10.* Addresses RAID I013, A009, R012.
  → Success criteria: an agreed WCAG target confirmed with the client (or A009 replaced), and
    focus, disabled, spacing, line-height and touch-target tokens defined **before component work
    begins**. RA-10 found the existing code has none of these and one ARIA attribute in total;
    establishing them now is cheap and retrofitting them across twelve features is not.

- [ ] **RA-06 — Service blueprint workshop** — Service blueprint workshop | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G04
  → Recommended artefact: `.gen-e2.bp`, `.gen-e2.flow`
  → Trigger: RA-03 and **RA-05b** complete — **clarified 2026-08-17: the desk pass does NOT
    satisfy this trigger.** The refund and multi-redemption failure paths the blueprint exists
    to draw are precisely what remains unverified. Running RA-06 on spec readings would produce
    a blueprint of an engine nobody has observed.
  → Resolves: RAID I007, I008; addresses R007, R010, R015, R016
  → Success criteria: frontstage, backstage and support layers mapped for enrolment, earn,
    redeem and the parking entitlement, with every failure path explicitly drawn: identity-match
    exception, offline till, offline member device, refund reversal, expiry, and member dispute.
    Each failure path has a named member-facing behaviour or an explicit open question.
  → **Two failure paths added 2026-08-17 (RA-05):** the refund-with-points-already-redeemed
    exception, which BR-P1-012 requires and the engine cannot express (R015); and the
    multi-redemption partial failure — what the member sees when redemption 2 of 3 fails after
    points are spent (I016).

- [ ] **RA-08 — Enrolment prototype and usability testing** — Prototype + usability testing | Priority: **High** | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G08
  → Recommended artefact: `.gen-e2.flow`
  → Trigger: RA-02 complete and a testable enrolment prototype built; requires the channel
    decision (I009) and ideally the SingPass approval position (R001)
  → **Recruitment note 2026-08-17:** the participant pool for this activity (≥4 aged 60+ with
    a device/SingPass spread) is established at **RA-01**, not RA-02. A recruitment failure at
    RA-01 propagates here five weeks later, when there is no time to re-recruit.
  → Tests: RAID H001, H003, H009
  → Success criteria: 10 participants including at least 4 aged 60+. Measured completion of
    enrolment through to a displayed, scannable membership card without assistance. The
    identity-match exception path tested deliberately, not just the happy path. Consent
    screen tested for deliberate per-channel choice rather than blanket accept or dismiss.

- [ ] **RA-09 part 2 — Design language definition workshop** — Definition workshop | Priority: Medium | Owner: [HUMAN TO ASSIGN]
  → Targeting gap: G11
  → Recommended artefact: `.gen-e2.ds`
  → Trigger: **unchanged and still unmet** — NTUC Club brand guidelines obtained (RAID D011)
  → Success criteria: a stated position on whether the programme inherits a group design language
    or defines its own, the QR-versus-dark-theme conflict resolved (I014), and a decision on
    whether the four programme surfaces share a system (I015). The inventory and the ten contrast
    constraints are already done — see RA-09 part 1 in *In Progress* above.

---

## Sequencing and Estimated Timeline

Agent-estimated from gap count and complexity. Owners, and therefore real capacity, are the
human's to assign — treat this as a shape, not a commitment. The compression is deliberate:
solution design sign-off is targeted at Q3 2026 and go-live is 1 December 2026, roughly 15
weeks from this plan's date.

**Revised 2026-08-17 after the first wave.** Track C is now largely spent — everything
achievable without client access has been done. The schedule below therefore starts from a
harder truth than the original: **the critical path is now entirely made of things only the
client can unblock.**

| Week | Track A — Members | Track B — Organisation & Technical | Track C — Desk |
|---|---|---|---|
| 0 | ✅ RA-01 instrument prepared | ✅ RA-05a desk pass | ✅ RA-07; ✅ RA-10; ✅ RA-09 pt 1 |
| 1–2 | RA-01 **fielding** (needs D010 + D012) | RA-04 stakeholder interviews begin; RA-05c expert interview *(no trigger — book now)*; RA-05b on D005 | RA-07a FRx verification |
| 2–3 | RA-02 JTBD interviews | RA-04 continues; RA-05b continues | RA-11 conformance target via RA-04 |
| 3–4 | RA-02 completes; RA-03 contextual inquiry (needs D014) | RA-04 completes | RA-09 pt 2 if D011 arrives |
| 4–5 | RA-03 completes | RA-06 service blueprint workshop *(needs RA-03 + RA-05b)* | — |
| 5–6 | RA-08 enrolment prototype testing | — | — |
| 7 | **Synthesis** — hand to `synthesis-agent` | | |

**RA-01 fielding now spans two weeks, not one.** The community and senior-centre routes and
the lapsed-member cell cannot be recruited at the pace the original single-week slot assumed.

**Three things can start immediately with no client dependency at all:** RA-05c (the Open
Loyalty expert interview — book it in parallel with instance access rather than after it),
RA-07a (FRx verification), and the conformance-target question inside RA-04.

**RA-04 remains the highest-leverage activity and has grown.** It is still the only route to
the six open client decisions, and it now also carries the accessibility standard, six brand
questions, the assisted-enrolment scope question, and the receipt-capture scope question —
and it is the only possible source of the Phase 1 KPI targets, since no comparator publishes
activation or first-redemption rates. It has no trigger. It should already have started.

**D005 is now the tightest technical constraint.** It blocks RA-05b, which blocks RA-06,
which is where the two live escalations get sized. The desk pass bought a week of clarity;
it cannot buy the verification.

---

## Owner Assignment

Every activity above carries `[HUMAN TO ASSIGN]`. Assigning owners requires knowledge of team
composition, availability and client relationships that this plan does not have.

**Status 2026-08-17.** The first wave ran unowned because it was agent-executable desk work.
Everything remaining is not. Owner assignment is now the binding constraint on the whole plan,
alongside four client dependencies: **D010** (recruitment access), **D012** (the legal position
on research data), **D005** (Open Loyalty instance access) and **D011** (brand guidelines).

Two items need an owner more urgently than the rest:

- **RA-11** is currently owned by nobody and gates all twelve features.
- **The two escalations (I016, I017)** need a named decision owner, not a research owner. They
  are scope decisions about unbudgeted work, and they do not resolve by being researched further.

---

## Update Rules

- New gap identified → add to *Planned*; never delete an existing item.
- Activity starts → move to *In Progress*, add start date and owner.
- Activity completes → move to *Completed*, add completion date and a one-line finding.
- A completed activity surfacing a new unknown → add a new *Planned* item noting
  *"Surfaced by: [activity]"*.
- **Current Unknowns** is rewritten each cycle to reflect the current open state, not the
  original state.
