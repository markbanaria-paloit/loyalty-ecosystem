# RA-04 — Stakeholder Interview Guide

**Version:** v0.1 draft — 2026-08-17
**Activity:** RA-04, NTUC Club Loyalty Member PWA research plan
**Gaps targeted:** G06 (organisational answers), G12 (delivery channel); inputs to G04, G11
**RAID items this activity must resolve or assign:** I001, I003, I005, I006, I008, I009,
I011, I012; A008; D002, D004, D006, D007, D008
**Format:** 45–60 minutes each, 1:1 or small group by function
**Priority:** Start immediately — this activity has no dependency on participant recruitment,
and it is the only one that closes the six open client decisions gating design.

---

## How to use this guide

Six separate conversations, one per function. Sections below are per stakeholder; run only
the relevant section.

**The job is decisions, not opinions.** Every open item below currently reads "to be
confirmed" somewhere in the BRD. A pleasant conversation that ends without either an answer
or a named owner and date has failed. Close each interview by reading back what was decided
and what was not.

**Where a document contradicts itself, show both readings and ask which is right.** Do not
paraphrase — quote the two passages. Three of the highest-impact items (I001, I002, I003) are
internal contradictions in the client's own BRD, and the client may not know they are there.

---

## S1 — Marketing (programme owner)

The most important interview. Marketing owns MVP success criteria, the customer proposition
and campaigns, and holds most of the open decisions.

### Success and measurement — resolves I005

1. The four Phase 1 KPIs are member acquisition, activation rate, first redemption rate and
   database growth. **What is the numeric target for each, by when?**
2. **What counts as "activated"?** First app open after enrolment, first card presentation,
   first points earned, or first redemption? *(Each implies a different priority on the
   member surface — we cannot design toward this metric until it means one thing.)*
3. On 1 December 2026, what has to be true for you to call the launch a success?
4. And at three months?
5. What would count as a failure that you'd want to catch early?

### The proposition — feeds G01, G03

6. "Your Third Place Rewards You More" — who wrote that, and what were you trying to make
   someone feel?
7. Who is the member you picture when you make a decision about this programme?
8. The BRD names Families, PMEs and DINKs/Silvers. Where did those come from — research, a
   segmentation exercise, or working assumption?
9. Is there existing customer research, footfall data, F&B spend data or CRM analysis anywhere
   in NTUC Club we haven't seen? *(Ask twice, in different words. There usually is.)*
10. The BRD names Changi Rewards as the benchmark. Which parts of it specifically?

### Open decisions — resolves I001, I004, I006, I012

11. **Launch footprint (I001):** BRD §8 says Phase 1 covers tenants "outside of Downtown East
    (DE)". §2, §5.3 and the go-live milestone in §15 all include DE. Which is right?
12. **Rebate yield (I004):** Scenario 1 or Scenario 2 — $5 or $10 per 1,000 points? Who
    decides, and by when? What would change the answer?
13. **Tier 2 retention (I006):** §11 says members must redeem 1,000 points before expiry to
    keep Tier 2, "subject to confirmation". Is that live at launch, or from Year 2? Members
    have to be told from day one if it is live.
14. **Union eligibility (I012):** BR-P1-005 says NTUC members are auto-placed into Tier 2
    "subject to eligibility rules to be finalised". All union members, or a subset?
15. **Birthday multiplier (I002):** BR-P1-007 says both tiers must earn at the same rate and
    explicitly not through differential earn rates — but Tier 1 gets a 2x and Tier 2 a 3x
    birthday multiplier. Is the equal-yield rule about base earn only?
16. **Parking unit (I003):** BR-P1-025 says 1 hour/month for Tier 1 and 2 hours/month for
    Tier 2. §11.5 says "1-hour comp parking, capped at 2/month" and "2-hour comp parking,
    capped at 2/month" — which reads as up to 2 and 4 hours. Which is the entitlement?

### Tier 2 — the hard question, feeds G03/R004

17. Both tiers earn at exactly the same rate. What is Tier 2 *for*, in a member's eyes?
18. If a union member is placed in Premium automatically and earns no faster, what makes them
    care about it?
19. Would you be open to changing the tier proposition if research says it reads as a label
    rather than a benefit?

---

## S2 — Customer Experience (CX)

CX is the recovery path for every failure mode the member surface has. They are also the only
function with direct member contact today.

1. What do members and visitors contact you about now? What are the top three?
2. In what channel, and what volume?
3. When something goes wrong for a customer today, what tools do you have?
4. **Identity-match exception (I008):** at enrolment, members are matched against Salesforce
   and NTUC HQ. Some will fail to match and land in an exception queue. What happens to that
   person? Who works the queue, in what timeframe, and what does the member do meanwhile?
5. What exception rate are you expecting? Has anyone estimated it?
6. When a member says "I spent $80 and got no points", how would you expect to answer that?
   What would you need to see?
7. Points will expire after 12 months, and refunds will automatically reverse points. Both
   make a balance go down without the member doing anything. What do you expect that to do to
   your contact volume?
8. What would you want the app to show a member so they don't have to contact you at all?
9. Who staffs this at launch? The BRD says a Future Loyalty Team is "in progress" — does it
   exist yet?
10. What is your escalation path on 2 December 2026 at 9am?

---

## S3 — Finance

1. How is points liability going to be accounted for? The BRD flags the treatment as
   unconfirmed.
2. Does the rebate-yield decision (I004) sit with you or with Marketing? What is your position?
3. Reward funding attribution — NTUC Club, tenant, or co-funded (BR-P1-015). Is the policy
   settled? *(This determines whether the member ever sees who funds a reward, and whether
   tenant-funded rewards can be restricted to that tenant.)*
4. GST treatment of points issuance and redemption (§13.4) — settled or open? Does qualifying
   spend include GST and service charge? *(BR-P1-009 makes it configurable, but the member
   needs to be told one thing.)*
5. Is there a cap on total points liability that would force a change to earn rates
   mid-programme? Members must not be surprised by that.
6. What are the ~20 launch reports, and which are yours?

---

## S4 — NTUC HQ / Group IT

1. Walk me through the Athena membership system. What does it hold, and what can it expose?
2. **Union verification:** how does the loyalty platform confirm someone is a union member?
   Real-time API, batch, or something else? What is the latency? *(BRD §5.1 requires
   "real-time synchronisation of NTUC membership status".)*
3. What happens when a member's union status changes after enrolment — do they leave Tier 2?
   How quickly, and are they told?
4. **SingPass/MyInfo (R001, D001):** what is the current status of the SNDGO/GovTech
   application? What lead time should we plan for? Is there a fallback if it is not ready by
   1 December?
5. Which MyInfo fields will we be permitted to retrieve? *(Data minimisation under NDI
   directly limits what enrolment can pre-fill and what we can tell the member we hold.)*
6. **Migration (A008):** BRD §17.1 assumes existing member and transaction data will be
   available "in a reasonable format". Does that data exist? What state is it in, and how many
   records? *(If migrated members arrive with a pre-existing balance and tier, they need a
   different first-run experience from a new enrolment — that is unscoped member-facing work.)*
7. **Marketing automation (D004):** which platform is it? It is required for expiry, birthday,
   tier-upgrade and lapsed-visit notifications and is named in neither document. Push, SMS and
   email capabilities?
8. **CIAM (D009):** the solutioning deck proposes Entra External ID. Is that agreed with Group
   IT? Who operates it?
9. Where does the NTUC Club IT Outsource Security Requirement Checklist v3 sit — we don't have
   a copy (I010).
10. Any group standard that constrains the member app — session length, MFA, device policy,
    accessibility, or a group design system (feeds G11)?

---

## S5 — Tenant operations / commercial

1. **Participation basis (D006):** are tenants opting in or being mandated? BRD §6 leaves it open.
2. Which tenants are confirmed for 1 December, at which properties? *(A member's ability to
   earn depends entirely on this. A sparse footprint undermines acquisition regardless of the
   app — RAID R009.)*
3. How many tenants and how many tills does that come to?
4. Who trains tenant staff, and when?
5. What is a tenant's incentive to participate, and what does it cost them?
6. When a tenant funds a reward, how do they get settled?
7. What happens when a tenant leaves the programme and members hold vouchers for it?
8. **(I011)** The solutioning deck mentions "upload receipt" as an earn path. Is that in Phase
   1? Nothing in the BRD covers it — BR-P1-001 describes tenant-side scanning only.

---

## S6 — PALO IT delivery lead

Internal, but these are decisions the member design cannot proceed without.

1. **Channel (I009):** BRD §13.3 lists "Mobile App (Vendor to propose) — architectural
   decision pending" as Phase 1. The solutioning deck names both ReactJS PWA and Flutter, and
   its landscape diagram says "Member App — iOS & Android". What are members actually getting
   on 1 December — installable PWA, native apps, or both? *(Push notification delivery for
   f11 differs materially between PWA and native on iOS. This gates enrolment and card design.)*
2. **Codebase (A007):** is `apps/pwa` the starting point for the Phase 1 build, or a
   demonstrator? The solutioning deck proposes NestJS for backend services; the repo is
   Express.
3. **Open Loyalty access (D005):** when can we get a real instance, not the mock, for the
   RA-05 capability spike?
4. What is the actual build window after design sign-off, and what is the drop-dead date for
   member-facing design decisions?
5. **(R006)** The README describes auth as a dev-grade shortcut with the Open Loyalty token in
   localStorage. Confirmed as prototype-only?
6. Where is the higher-resolution architecture diagram the solutioning deck refers to (I010)?
7. What is already committed to the client that we should not reopen, versus what is genuinely
   open to discovery?

---

## Closing every interview

1. What have I not asked you that I should have?
2. Who else should I be talking to?
3. Read back: *"Here is what I understood we decided… and here is what is still open, with
   [name] to decide by [date]."*

Anything left open leaves the interview as a RAID entry with a named owner and a target date.
Anything decided updates the product brief and closes its RAID item, dated and attributed to
this activity.
