# RA-01 — Participant Screener and Recruitment Instrument

**Version:** v0.1 draft — 2026-08-17
**Activity:** RA-01, NTUC Club Loyalty Member PWA research plan
**Gap targeted:** G01 (what members are trying to achieve); prerequisite for G03, G08, G09
**Assumption under direct test:** A002 (Families / PMEs / DINKs-Silvers are the correct segments)
**Risk it addresses:** R003 (no user research exists; every design decision rests on segment labels)
**Feeds:** RA-02 (JTBD interviews), RA-03 (till contextual inquiry, Part C member intercepts),
RA-08 (enrolment usability testing)
**Format:** ~7 minutes. Online form **plus** a phone-administered and an in-person-assisted route.
**Target:** 16 recruited to a 15–18 band, from ~18 confirmed (2 held as over-recruit)

---

## ⛔ Status — prepared, not fielded

**This instrument is ready to field the day recruitment access lands. It has not been fielded
and must not be.** RA-01's trigger is NTUC Club recruitment support, logged as **RAID D010**
(*"Access to a representative tenant till and to member participants… Discovery cannot close its
highest-priority gaps without recruitment support from NTUC Club"*), status `pending`, owner
unassigned. Three things are needed before question one goes to a respondent:

1. **D010 confirmed** — a named NTUC Club owner for recruitment, and agreement on which of their
   channels we may use (see *Recruitment channels* below).
2. **The legal decisions in *Consent, incentive and PDPA* answered** — principally who controls
   screener data and whether DNC applies to our outbound contact.
3. **Two factual blanks filled** — the four clubhouse names (not stated in the BRD) and the
   confirmed launch tenant list if available (D006/I001), so question S5 lists real places.

Everything else is drafted and reviewable now. Reviewing it now is the point: if D010 lands in
week 3 rather than week 1, the difference between having this ready and starting it then is the
whole of RA-02's slot in the timeline.

---

## Why this screener is built the way it is

The BRD names three customer segments — Families, PMEs, and DINKs/Silvers — **in a single
sentence of §3.2**, with no sizing, no behavioural data, and no statement of how their needs
differ. That sentence is currently load-bearing for the entire member surface. A002 records it
as an assumption; R003 records the risk.

The obvious screener writes itself: three buckets, five or six people in each, done. **That
screener is worthless**, because it can only ever return the answer it was given. Recruit to
three demographic buckets and you will produce three demographic groups, then write three
personas, and the assumption will have laundered itself into a finding without ever being tested.

So this screener inverts the frame:

- **Behaviour is the recruitment grid.** Participants are recruited against *how they actually
  use NTUC Club properties* — frequency, which properties, whether they still go — not against
  who they are.
- **Demography is recorded, not recruited to.** Age, household composition and occupation type
  are captured so that the team can classify each participant into Families / PME / DINK / Silver
  **after** the behavioural cell is filled — and can equally classify them as *does not fit any
  of the three*.
- **The mismatch is the finding.** If behaviourally similar participants scatter across all three
  named segments, or if one named segment turns out to contain two behaviourally opposite groups,
  A002 is broken and the personas must be built on behaviour instead. This screener is designed
  so that outcome is *visible in the recruitment table before a single interview happens*.

The three mandated cohorts in the plan's success criteria — ≥5 union members, ≥4 aged 60+, and
representation of the three named segments — are honoured as **cross-cutting minima layered over
the behavioural grid**, not as the grid itself.

---

## Fielding mode — and why the mode is itself a screening bias

A self-completed online form is a device-confidence filter. Field it alone and it will quietly
exclude exactly the people RA-08 exists to protect: the 60+ cohort with low device confidence,
and anyone who does not read English comfortably. The screener would then hand RA-02 a sample
that confirms A003 (SingPass-first enrolment is fine) by construction.

Field all three routes concurrently:

| Route | For | Notes |
|---|---|---|
| Online form | General fielding, panel and social channels | Mobile-first, no account required, no login wall |
| Phone-administered | 60+ recruitment, community channels, anyone who requests it | Recruiter reads questions verbatim; record route against the participant |
| In-person assisted | Senior activity centres, on-site intercept | Paper or tablet, recruiter-assisted; same script |

**Record the completion route for every respondent.** If every 60+ participant arrives via the
phone route, that is a data point about the member base, not an administrative detail.

---

## Section A — Consent gate and eligibility

Administered before any substantive question. Nothing in Section A is used for quota.

**A1. Consent statement** *(read or displayed in full; see PDPA notes below)*

> PALO IT is carrying out research for NTUC Club about how people use its leisure and lifestyle
> places — Downtown East, the clubhouses and the attractions. This is a short set of questions,
> about seven minutes, to see whether you are a fit for a paid research session later. There are
> no right answers, and nothing here is a sales call — we are not selling you anything and you
> will not be signed up to anything.
>
> If you take part we will keep your answers and your contact details to arrange the session and
> nothing else. You can stop at any point, and you can ask us to delete your details at any
> point. [Retention period, controller and DPO contact inserted here once confirmed — see the
> open legal items.]

- **S0 — Do you agree to continue on that basis?** Yes / No
  → *No* = **disqualify**, close politely, discard the response.

**S1. Are you 18 or older?** Yes / No
→ *No* = **disqualify.** Under-18s are out of scope for this round. Family research may later
want the child's view; that requires parental consent machinery this round does not carry.

**S2. Do you, or does anyone in your household, work for any of the following?**
*(multi-select; list, do not describe)*
- NTUC Club, or any NTUC Club property (Downtown East, D'Resort, the clubhouses, Wild Wild Wet,
  Orchid Country Club, Aranda Country Club, My Golf Kaki)
- A shop, restaurant or business operating inside one of those places
- PALO IT
- Market research, advertising, or a customer loyalty / rewards company

→ Any tick = **disqualify.**
→ **Do not disqualify for working at an NTUC social enterprise** (FairPrice, Income, Health,
LearningHub and so on). Those employ a large share of the union base and excluding them would
gut the union cohort. Record the employer and move on.

**S3. Have you taken part in a research interview or focus group in the last 6 months?**
Yes / No
→ *Yes* = **soft disqualify** — professional respondents. Overridable by the research lead only
to fill a stubborn cell (60+ low-confidence, or non-English), and flagged if so.

**S4. Which language would you be most comfortable being interviewed in?**
English / Mandarin / Malay / Tamil / Other (specify) / Dialect (specify)
→ Never a disqualifier. **Quota:** at least 3 participants whose preferred language is not
English. NFR-010 justifies multi-language support on the basis of the "family/multi-generational
customer segments targeted" — a claim made with no evidence. If we recruit only in English we
will never be able to say anything about it. *This creates an interpreter or bilingual-moderator
cost — see the open items.*

---

## Section B — Behaviour (the recruitment grid)

**Ask these before Section D. Order matters:** demographic questions first would prime
respondents to answer as a type.

**S5. In the last 12 months, which of these have you been to, even once?** *(multi-select)*

- Downtown East — the shops, restaurants, E!Hub or the events there
- Wild Wild Wet
- D'Resort
- One of the four NTUC Club clubhouses — *[NAMES TO CONFIRM: the BRD says "the 4 NTUC Club
  Clubhouses" throughout and never names them. Obtain from NTUC Club before fielding; a
  respondent will not recognise the phrase "clubhouse" unaided]*
- Orchid Country Club
- Aranda Country Club
- My Golf Kaki
- None of these

→ **Qualify** if one or more selected → route to S6.
→ **"None of these"** does **not** disqualify → route to S7. This is the single most important
branch in the instrument. Someone who has not visited in 12 months but lives in the catchment,
or is a union member, is a *member acquisition target* — the whole of KPI m1. A screener that
disqualifies them recruits only the people the programme already has.

**S6. How often, in a typical month, do you go to any of those places?**
- 4 or more times a month
- 2–3 times a month
- About once a month
- Every couple of months
- A few times a year
- Less than once a year, but I have been in the last 12 months

**S7. When did you last go to any of them?** *(asked of everyone, including "none of these")*
- In the last month / 1–6 months ago / 6–12 months ago / 1–3 years ago / More than 3 years ago /
  Never been

**S8. Is that more, less, or about the same as two years ago?** More / Less / About the same
→ Not a quota question. It is the cheapest available read on whether the visiting base is
growing or eroding, and a *Less* answer plus a recent visit is the most valuable interview in the
sample — a lapsing regular who can still remember why.

**S9. Last time you went, who were you with?** *(multi-select)* Alone / Partner or spouse /
Children under 16 / Adult children / Parents or older relatives / Friends / Colleagues / Other

**S10. What did you actually do and spend money on there, last time?** *(multi-select)*
Eat or drink / Shop / Water park or attraction ticket / Stay overnight / Golf / Sports or gym /
Class, event or show / Bowling, arcade or similar / Function, wedding or company event /
Just accompanied someone else / Didn't spend anything

**S11. Do you go to more than one of these places, or mainly just one?**
Mainly one *(which?)* / Two or three of them / Spread across several
→ **Quota, and a live test of the programme's premise.** Cross-property spend is one of the three
stated reasons the programme exists (BRD §3.1, §3.4). If we cannot fill the multi-property cell,
we have learned something material about whether cross-property behaviour exists to be rewarded.
**Do not backfill this cell by relaxing the definition.**

**S12. Which of these is closest to how you decide to go?** *(single)*
- I go regularly, it is part of our routine
- I go for a specific thing — an event, a booking, a birthday, a school holiday
- I go because someone else in my family or group wants to
- I end up there when I am nearby anyway
- I would not say I go at all

**S13. Roughly how long does it take you to get there?** Under 15 min / 15–30 / 30–60 / Over 60 /
Don't know
→ Not a quota; a control. If the whole sample lives within 20 minutes of Pasir Ris we have
recruited a catchment, not a member base, and the synthesis must say so.

*Listen for, when reviewing completed screeners:* whether "the club" reads as one place or several
unconnected ones (S11 against S5); whether spend is incidental to an activity or the point of the
trip (S10 against S12); who in the party decides versus who pays (S9 against S12, and the direct
input to H007).

---

## Section C — Loyalty programmes they already live with

**S14. Which of these rewards or membership programmes are you signed up to?**
*(multi-select; list Changi Rewards, FairPrice Link/Plus, CapitaStar, Passion Card, Frank by OCBC
or equivalent, an airline programme, supermarket or pharmacy programmes, a restaurant group app,
others — and "None of these")*

**S15. Of the ones you ticked, which have you actually used in the last month?**
*(multi-select from S14 selections; plus "None of them")*

→ **Quota — the deliberate non-user cell.** At least **3** participants must answer *None of
them* to S15, or tick two or fewer programmes at S14. Loyalty programme users are
over-represented in every panel and self-select into loyalty research. Recruit only them and the
sample will tell us points programmes are worth joining, which is not a finding, it is an echo.

**S16. Are you an NTUC union member?** Yes / No / Not sure
→ **Quota: ≥5 Yes.** *Not sure* is a legitimate answer and is itself relevant to BR-P1-005 and
I012 — a member who does not know they are a member cannot value automatic Tier 2 placement.
Record *Not sure* separately; do not push, and do not resolve it for them.
→ **Never ask for a union membership number.** Union membership is a yes/no screening attribute
only, consistent with the RA-02 handling note.

**S17. Do you carry a Passion Card, or any NTUC Club or Downtown East membership already?**
Yes / No / Not sure
→ No quota. Flags participants who arrive with a pre-existing card mental model — directly
relevant to A008 (migrated members) and to what "join" means to them.

---

## Section D — Device and technology (RA-08 feed)

Behavioural, not attitudinal. Do not ask how confident they feel; ask what they have done.

**S18. What phone do you mainly use?** iPhone / Android / A basic phone without apps /
I don't use a smartphone / Not sure
→ *Basic phone* or *no smartphone* does **not** disqualify. It is a finding about a mobile-first
programme (NFR-009) and must reach the delivery lead if it appears more than once.

**S19. In the last 6 months, have you installed an app on your phone yourself — not someone
doing it for you?** Yes / No / Can't remember

**S20. Have you used SingPass in the last 12 months?** Yes / No / I have it but haven't used it /
I don't have SingPass / Not sure
→ *(If yes)* **S20a. What did you use it for?** *(open text, one line)*
→ No disqualifier in any direction. A003 assumes SingPass will be the dominant enrolment path
"consistent with NTUC's current standard", on no usage data. S20 is the first evidence we will
have. **Quota:** at least **3** participants who answer anything other than a plain *Yes*.

**S21. When you pay at a shop or restaurant, do you ever show something on your phone — a
member code, a QR, an app?** Often / Sometimes / Never / Not sure what that means
→ **Direct evidence against A004** ("members will readily present a QR code on their phone at a
tenant till"), collected before anyone has been shown a concept. **Quota:** at least **4**
participants answering *Never* or *Not sure what that means*.

**S22. If someone showed you how, would you be comfortable being asked to try an app on a phone
during the session?** Comfortable / I'd rather just talk / Not sure
→ Not a disqualifier for RA-02. It is the recruitment pool marker for **RA-08** — a usability
test needs participants across this range, including the *I'd rather just talk* group, or it will
only measure people who were always going to complete.

---

## Section E — Classification (recorded, not recruited to)

Asked last, deliberately. These populate the descriptive overlay in the quota grid; **none of
them opens or closes a cell on its own.**

**S23. Which age band are you in?** 18–29 / 30–39 / 40–49 / 50–59 / 60–69 / 70–79 / 80+
→ **Cross-cutting minimum: ≥4 aged 60+.** Of those four, at least **2** must answer *No* or
*Can't remember* to S19, or anything other than *Often* to S21. Four digitally fluent 60-year-olds
satisfy the number and defeat the purpose (H003, G08).

**S24. Who lives in your household?** *(multi-select)* Just me / Partner or spouse / Children
under 6 / Children 6–15 / Children 16+ / Parents or parents-in-law / Other relatives / Others
→ **Cross-cutting minimum: ≥4 households with a child under 16.**

**S25. Which best describes what you do?** Employed full-time / Employed part-time /
Self-employed or freelance / Running my own business / Retired / Homemaker or caring full-time /
Studying / Between jobs / Prefer not to say
→ *Prefer not to say* is always available and never disqualifies.

**S26. And what kind of work is that?** *(open text, one line — job title is enough)*
→ Used only to classify PME / non-PME post-hoc. **The classification is made by the research lead
after recruitment and recorded as an interpretation, not collected as a fact.**

**S27. Where do you live?** *(planning area or nearest MRT — not a full address)*

### Post-hoc classification

After the grid is filled, classify every participant against the BRD's three segments and record
the result — **including a fourth value, `does not fit`**. Report the counts with the recruitment
summary. If `does not fit` is a meaningful share, or if the behavioural cells cut across the
demographic labels, that goes to the delivery lead **before RA-02 starts**, because it changes
what RA-02's persona output can honestly be built on. It is also the evidence that closes or
breaks A002.

---

## Section F — Logistics, incentive and re-contact

**S28.** Availability across the fielding window *(grid of dates/times)*
**S29.** Preference: in person at [venue] / online video call / phone
→ Offer all three. An online-only session repeats the Section-A mode bias one layer down.
**S30.** Any access needs, so we can arrange the session properly? *(open text)*
→ An **accommodation** question, not a screening criterion. It never affects qualification.
**S31.** Would you be willing to be contacted about a **second, separate activity** — being
observed or accompanied while you shop or eat at one of these places, or trying an early version
of an app? Yes / No
→ Feeds the RA-03 Part C intercept pool and the RA-08 pool. Separate opt-in, separately withdrawable.
**S32.** Best way to reach you *(phone / email — collect one, not both, unless they offer)*

---

## Quota grid

**Target n = 16.** Confirm 18 and hold 2 as over-recruit (see *No-shows* below). Acceptable
landing band is 15–18 per the research plan.

### Primary grid — behaviour

| Cell | Definition (from S6, S7) | Target | Floor |
|---|---|---|---|
| **B1 Regular** | 2+ visits a month | 5 | 4 |
| **B2 Occasional** | About monthly, down to a few times a year | 5 | 4 |
| **B3 Lapsed** | Went more before; last visit 6–36 months ago (S7 + S8 = *Less*) | 3 | 3 |
| **B4 Rare / non-visiting** | Last visit 3+ years ago or never; in catchment or union member | 3 | 2 |

**B3 and B4 are non-negotiable at their floors.** They are 5 or 6 of 16 and they are the entire
evidence base for member *acquisition* — the first named Phase 1 KPI. Every prior instinct in a
recruitment process will push these cells toward zero, because they are the hardest people to
find and the least willing to talk about a place they do not go to. Protect them by filling them
first, before B1 and B2, which will fill themselves.

### Property-mix overlay (from S5, S11)

| Requirement | Target |
|---|---|
| Visits led by Downtown East | ≥4 |
| Visits led by a clubhouse / OCC / ACC | ≥4 |
| Visits led by an attraction (WWW, D'Resort, golf) | ≥3 |
| **Uses two or more property types** (S11) | **≥3** |

Applies to B1–B3 only; B4 participants are exempt by definition.

### Cross-cutting minima

| Cohort | Minimum | Source | Distribution rule |
|---|---|---|---|
| NTUC union members | **5** | S16 = Yes | ≥2 of the 5 must come from B3 or B4 |
| Aged 60+ | **4** | S23 | ≥2 with low device signal (S19 *No* / S21 not *Often*) |
| Household with child under 16 | **4** | S24 | — |
| Low or no current loyalty use | **3** | S15 = None, or ≤2 at S14 | — |
| Non-English preferred language | **3** | S4 | — |
| Non-standard SingPass position | **3** | S20 ≠ plain *Yes* | May overlap the 60+ cohort |
| Never presents a phone at a till | **4** | S21 = Never / Not sure | May overlap the 60+ cohort |

Cross-cutting minima **may and should overlap each other**. They must not be satisfied by
collapsing the primary grid — a union member recruited into B1 does not release the B3 floor.

### Descriptive overlay — the BRD's three segments

Recorded, reported, **not recruited to**:

| Classification | Expected spread | Rule |
|---|---|---|
| Families | 4–6 | No floor. No ceiling. |
| PMEs | 4–6 | No floor. No ceiling. |
| DINKs / Silvers | 4–6 | No floor. No ceiling. |
| **Does not fit any of the three** | unknown — **report the number** | Never re-classify to make a cell look full |

> **The one rule that matters:** where the behavioural grid and the demographic overlay conflict,
> **behaviour wins.** If the last available B3 candidate is a third PME, take them. Then write the
> imbalance into the recruitment summary as a finding about A002, rather than rejecting them to
> preserve a spread the BRD asserted and no one has evidenced.

### Handling over-recruited cells

1. **Do not close the cell and stop screening.** Keep the form open — later respondents may fill
   a different cell, and closing early biases toward whoever answers fastest.
2. **Surplus goes to the reserve list**, in the order they qualified, with their cell recorded.
3. **Prefer a surplus candidate who also carries an unmet cross-cutting minimum.** If B1 is full
   and a new B1 respondent is 68 with no SingPass, take them over an already-confirmed B1 who is
   42 and carries nothing scarce — and tell the displaced candidate honestly that the session is
   full, thanking them.
4. **Where a full cell can be split, split it rather than turning people away.** B1 at 6 and B2 at
   4 is fine; B3 at 2 is not.
5. **Never re-classify a participant into a thinner cell to make the grid balance.** The grid is
   an instrument, not a target. A recruitment table that had to be edited to look right is a
   sample that will mislead the synthesis.
6. If the total lands at 18, run 18. Extra JTBD interviews cost an hour each; a re-run of
   recruitment costs a week we do not have against 1 December 2026.

---

## Recruitment channels and their bias risks

**The central risk: NTUC Club's own channels can only reach the people NTUC Club already
reaches.** Its member list, Downtown East mailer, on-site posters and social following are, by
construction, a register of the currently engaged and digitally reachable who have already opted
into marketing. Recruit through them alone and cells B3 and B4 come back empty, the sample tells
us the programme is welcome and the card is easy, and we will have spent three weeks confirming
that people who like NTUC Club like NTUC Club. Every member-acquisition decision on the roadmap
would then be made on evidence drawn exclusively from people who need no acquiring.

| Channel | Reaches | Bias risk | Cap |
|---|---|---|---|
| **NTUC Club owned** — member list, DE mailer, socials, on-site posters | B1, B2, families, current members | Selects the engaged, currently visiting, marketing-consented and digitally reachable. Cannot produce B3 or B4. Also selects for goodwill toward the brand — respondents will be gentler with us than reality will be. | **≤5 of 16** |
| **NTUC union channels** — branch comms, union member mailings | The ≥5 union cohort, PMEs | Over-produces union members and skews the union / non-union comparison that G03 depends on. If all 5 union participants come from here they will be *engaged* union members, which is precisely the group most likely to endorse Tier 2. | **≤3 of the 5 union cohort** |
| **Independent consumer panel / recruitment agency** | Volume, speed, hard demographic cells | Professional respondents; incentive-motivated; skews digitally confident, English-first and under-60. Panel members are practised at giving research answers. | **≤5 of 16**; S3 applied strictly |
| **On-site intercept** at DE and clubhouses | High-quality B1, family groups, real recent behaviour | Pure visitor bias by construction — mathematically incapable of producing a lapsed or non-visiting participant. Also skews to whoever has time to stop, i.e. not the rushed. | **≤4 of 16** |
| **Community and street-level** — senior activity centres, CCs/RCs, residents' committees, grassroots contacts in and beyond the eastern catchment | The realistic route to 60+ low-device-confidence, non-English speakers, and B4 non-visitors | Geographic clustering; gatekeeper selection (the centre coordinator picks the confident, sociable members); may over-represent the socially active senior rather than the isolated one. | **≥4 of 16 — a floor, not a cap** |
| **Snowball / participant referral** | Fills stubborn cells late | Homophily — referrals resemble the referrer, tightening a sample that needs widening. | **≤2 of 16** |

### Mitigations, in order of importance

1. **Hard rule: cells B3 and B4 (5–6 participants) may not be sourced from NTUC Club's active
   member list or from on-site intercept.** Those channels cannot contain those people. Use panel
   screening on catchment residents, community channels, and lapsed-member records if — and only
   if — NTUC Club holds contactable records of people who *stopped* coming and consent permits
   contacting them. **Ask for that list explicitly; it is the single highest-value recruitment
   asset the client holds and nobody will offer it unprompted.**
2. **No single channel supplies more than 5 of 16.** Enforced at confirmation, not at screening.
3. **Record the source channel against every participant** and publish the channel mix alongside
   the findings, so synthesis can weight for it and so a future cycle can see what this sample
   could not see.
4. **Do not let NTUC Club select the participants.** Accept channel access — a mailing, a poster,
   an introduction to a community partner — and run the screening and selection ourselves against
   this grid. A hand-picked list of "good members" is the failure mode this whole section exists
   to prevent, and it is offered with genuine helpfulness every time.
5. **Do not brand the screener as an NTUC Club loyalty study.** Field it as research about how
   people spend leisure time at these places. Naming the programme in the invitation selects for
   people interested in loyalty programmes and pre-frames every answer in RA-02 Section 5.
6. **Screen in at least one non-eastern catchment.** The clubhouses, OCC and ACC are not all in
   Pasir Ris; a sample that is will describe Downtown East, not NTUC Club.

---

## Consent, incentive and PDPA handling

### PDPA

- Screener responses **are personal data**. Collect the minimum: one contact method, not two.
  No address beyond planning area (S27). No identity numbers of any kind.
- **Notification obligation:** the Section A statement must state purpose, what is collected, who
  it is disclosed to (PALO IT project team, and whether NTUC Club), the retention period, and how
  to withdraw. Consent must be for research participation **only** — explicitly *not* for
  marketing, and explicitly not an enrolment in anything.
- **Separate the key from the responses.** Contact details in one store, screener answers under a
  participant ID in another, joined only by the recruitment lead. RA-02 findings then carry an ID
  and no identity, consistent with the RA-02 handling note.
- **Non-recruited respondents:** delete contact details within **30 days** of the recruitment
  window closing *(proposed — needs confirmation)*. Retain de-identified screener answers, which
  are analytically useful in their own right: a hundred completed screeners is the first
  behavioural dataset this programme has ever had, and it costs nothing extra.
- **Withdrawal:** honoured at any point, before or after the session, with a named contact.

### 🔴 Client legal decisions required — do not assume any of these

1. **Who is the data controller for screener responses — NTUC Club or PALO IT?** This is not
   administrative. If NTUC Club controls them, there is a live question about whether responses
   can flow into Salesforce or the marketing platform (D003, D004) — which respondents will not
   have consented to and which would turn a research instrument into a data-capture exercise.
   **Get this in writing before fielding.**
2. **Does the Do Not Call Registry apply to our outbound recruitment?** Phone or SMS contact to
   Singapore numbers engages DNC unless there is clear-and-unambiguous consent or an applicable
   ongoing-relationship position. The phone-administered route is *required* to reach the 60+
   cohort, so this cannot be avoided by design. Confirm the client's legal position, per channel,
   and confirm who is responsible for DNC checking. Cross-reference BR-P1-022.
3. **May we contact lapsed or former members from NTUC Club records, and on what consent basis?**
   Mitigation 1 above depends entirely on the answer. If the answer is no, say so in the
   recruitment summary — the resulting sample gap is a limitation on every finding downstream.
4. **Incentive form and any gift or conflict policy.** Whether an NTUC Club or union-linked
   recipient may accept a research incentive, and whether Finance requires any record of payment.
5. **Whether screener data is in scope of the NTUC Club IT Outsource Security Requirement
   Checklist v3** (I010 — we do not hold a copy). Where the data is stored and under whose tenancy
   may be constrained by it.

### Incentive

- **Proposed: SGD 80–100** per completed 60-minute RA-02 session *(indicative Singapore consumer
  rate — confirm with the client and with procurement)*. Upper end where travel is required, for
  60+ participants, and for the in-person route.
- **Paid on attendance, not on completion.** A participant who withdraws mid-session is paid in
  full. Anything else buys compliance and contaminates Section 5 of RA-02.
- **Use a neutral voucher or bank transfer — never an NTUC Club, Downtown East or FairPrice
  voucher.** A branded incentive biases every response toward the brand and forces the participant
  through a redemption journey we are about to interview them about.
- Screener completion itself is unpaid. If a channel requires an incentive to field at all, use a
  small prize draw and say so in Section A.
- Community-channel recruitment may warrant a donation to the centre rather than, or alongside,
  individual incentives — confirm with the partner, and never make it contingent on who they send.

### No-shows and replacement

Confirm 18 to land 16. Reconfirm 48 and 24 hours before. If a participant drops, replace **from
the same behavioural cell** — never from whichever cell is easiest to refill. If a B3 or B4
participant drops and cannot be replaced, run RA-02 short rather than substituting a B1, and
record the shortfall.

---

## What this screener deliberately does not ask, and why

| Not asked | Why |
|---|---|
| **NRIC, FIN, or union membership number** | Never needed for screening, disproportionate under PDPA, and a live liability. Union membership is a yes/no attribute (S16), consistent with RA-02's handling note. |
| **Household or personal income** | The obvious way to sort PMEs from everyone else — and precisely why it is excluded. It would smuggle A002 back in as a recruitment criterion, it is the most refused question on any Singapore screener, and it is a weak proxy for what we actually need, which is visit behaviour. Occupation type (S25–S26) is sufficient for post-hoc classification. |
| **Anything about points, tiers, rewards, vouchers or the NTUC Club programme** | RA-02 Section 5 depends on a cold first reaction to the specifics. Mentioning them at screening destroys that, in every participant, permanently — and it self-selects for people who like loyalty programmes. |
| **"How likely would you be to join a rewards programme?"** | A purchase-intent question. It reliably returns warm answers that predict nothing, and it primes the participant to perform enthusiasm for the next hour. |
| **Dollar amounts of spend** | Screening on spend would recruit high spenders and bake the "valuable member" assumption into the sample before anyone has established what value looks like here. Self-reported spend is also unreliable. Category (S10) and frequency (S6) are enough. |
| **Ethnicity or race** | Not operationally relevant to any Phase 1 design decision. Language preference (S4) is the variable that actually affects the product, via NFR-010. |
| **Disability status, or health conditions, as a category** | S30 asks about access needs so the *session* works. That is an accommodation, not a screening criterion, and it is never used to include or exclude. |
| **Attitudinal self-rating of tech confidence** | "How confident are you with technology?" measures self-image, and older respondents systematically under-rate. S19–S21 ask what they have actually done instead. |
| **Whether they would prefer an app or a website** | A solution question in a screener. It belongs nowhere in this study, and least of all here — the channel decision (I009) is the client's to make against evidence, not the respondent's to guess at. |
| **Satisfaction with NTUC Club today** | Would read as a customer survey, invite a complaints frame, and set the register for RA-02 as service recovery rather than jobs-to-be-done. |

---

## What good looks like

By the end of RA-01 we should be able to hand RA-02 a recruitment table that states, for every
participant: their behavioural cell, their property mix, their union status, their loyalty-use
level, their device and SingPass position, their language, their source channel — and, separately
and clearly labelled as an interpretation, which of the BRD's three segments they were classified
into, or that they fit none.

Three specific outcomes make this activity worth its week:

1. **A behavioural spread that RA-02 can interrogate**, including 5–6 people who do not currently
   visit — the only participants who can speak to acquisition.
2. **A first, cheap read on A002 before any interview happens.** If the behavioural cells cut
   cleanly across Families / PMEs / DINKs-Silvers, the segmentation is not doing work, and that
   goes to the delivery lead immediately rather than at synthesis. R003's whole premise is that
   the segments may be a plausible but wrong model of who uses the club.
3. **An honest, written account of who this sample cannot speak for**, driven by which channels
   the client was able to open. That limitation travels with every downstream finding, into the
   personas and into the definition phase.

If recruitment cannot fill B3 and B4 at their floors after a full fielding window, **stop and
escalate rather than proceeding with a 16-person sample of current visitors.** A study that can
only describe existing members, presented as evidence for a programme whose first KPI is member
acquisition, is worse than a study that reports it could not reach them.

---

## Practicalities

- Requires **RAID D010** confirmed. Fielding before then is not possible and should not be
  attempted through informal channels.
- Obtain the four clubhouse names, and the launch tenant list if it exists (D006, I001), before
  S5 is finalised.
- Budget a bilingual moderator or interpreter for the S4 non-English cohort, and confirm who pays.
- Pilot the instrument on 3 respondents — one online, one by phone, one in person, at least one
  aged 60+ — and time it. If it runs past 9 minutes, cut from Section C before Section B.
- Keep the recruitment table in the research folder alongside the findings, not in a recruiter's
  spreadsheet. It is evidence about the sample, and the synthesis will need it.
