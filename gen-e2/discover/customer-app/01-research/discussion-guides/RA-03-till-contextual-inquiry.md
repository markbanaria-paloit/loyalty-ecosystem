# RA-03 — Tenant Till Contextual Inquiry Protocol

**Version:** v0.1 draft — 2026-08-17
**Activity:** RA-03, NTUC Club Loyalty Member PWA research plan
**Gaps targeted:** G02 (behaviour at the point of payment); evidences G04 (service failure paths)
**Hypotheses tested:** H001 (card reachable in one action), H005 (member- vs staff-initiated redemption)
**Assumption under test:** A004 (members will present a phone QR and staff will scan it)
**Issue it resolves:** I007 (who initiates redemption)
**Format:** 2–3 sites, half a day each, at least one at peak trading
**Sites:** one clubhouse F&B tenant, one Downtown East retail tenant, one attraction
(Wild Wild Wet or equivalent) — chosen for different transaction rhythms

---

## Why this activity exists

The BRD and the solutioning deck describe the same moment two incompatible ways. BR-P1-018
allows redemption in-app *and* at tenant point-of-sale. The solutioning deck's redemption
journey is staff-driven: the member asks for a reward in the moment, staff scan the member's
card, a voucher is issued and auto-invalidated on use. The existing PWA is member-driven:
browse a catalogue, redeem, receive a coupon code. **These are different products.** Which one
we build determines whether the rewards catalogue or the voucher wallet is the primary
surface, and no amount of desk analysis will settle it. Go and watch.

The other reason: nobody has established what the physical conditions at the counter actually
are. NFR-009 asserts the flows must be "optimised for mobile devices, reflecting expected
usage at physical points of presence" without anyone having established what those points of
presence are like — lighting, counter height, queue pressure, mobile signal, whether staff
face the customer or a screen.

**NTUC Club's programme does not exist yet**, so there is nothing of ours to observe. Observe
the transaction as it happens today, and observe members using *other* programmes' cards where
those appear. Then interview staff about what they expect.

---

## Part A — Structured observation (2–3 hours per site)

Position yourself where you can see both sides of the counter without obstructing. Note the
time and queue length at the start of each observation block.

### Record for every transaction observed

| Field | What to capture |
|---|---|
| Time and queue length | Queue depth behind the paying customer |
| Party composition | Solo / couple / family with children / group |
| Who pays | And whether that is the same person who chose |
| Loyalty presented? | Any programme — card, app, phone number, none |
| If presented: what artefact | Physical card / app QR / barcode / phone number recited |
| Time from "payment starts" to "loyalty resolved" | Stopwatch. This is the budget our card has to fit inside |
| Fumble events | Unlocking, hunting for the app, brightness, signal wait, retry |
| Who initiated | Customer offered it, or staff prompted |
| Staff scan attempts | Number of attempts to a successful scan |
| Outcome | Success / abandoned / manual fallback |

### Environmental baseline, once per site

- Mobile signal strength at the counter (all major carriers) — walk the queue line, not just
  the till.
- Wi-Fi availability for customers; is it open or captive-portal?
- Lighting at the counter, and whether direct light hits a phone screen held at scanning angle.
- Counter height and depth — can a customer hold a phone flat where a scanner can read it?
- What the staff-facing screen is, where it sits, and whether staff face the customer.
- Is there anywhere a customer can step aside to sort out a problem without losing their place?

### Specifically watch for

- **Redemption direction.** Every time a discount, voucher or reward is applied, note who
  raised it. This is the direct evidence for H005 and issue I007. Aim for at least 15 observed
  redemption events across sites; if the sites are too quiet, extend rather than extrapolate.
- **The queue's tolerance.** How long does a transaction take before people visibly react?
  That number is the latency budget for the membership card (RAID R005, guiding principle 1).
- **Failure recovery today.** When a card does not scan or an app does not load, what actually
  happens? Does the sale continue? Does anyone type something manually? Is anything lost?
- **Group transactions.** Who presents loyalty when a family pays together — feeds H007.

---

## Part B — Staff interviews (30–40 min per site, 1–2 staff)

Interview after observing, so you can ask about what you saw. Tenant staff are the
counterparty in every member earn and redeem moment; the member experience is capped by what
is workable on their side.

1. Talk me through a normal transaction here, start to finish.
2. When does it get busy, and what changes about how you work when it does?
3. Do customers here use loyalty cards or apps from any programme? What happens when they do?
4. *(referencing a specific observation)* I saw someone take a while to find their app —
   how often does that happen? What do you do?
5. When a customer's phone won't scan, what are your options?
6. Has your till or network ever gone down mid-service? What did you do about the sales?
7. *(introduce the model)* NTUC Club is starting a rewards programme. You'd be given a scanner
   or an app on a device, and members would show a QR code at payment for points.
   - What's your first reaction?
   - What's the part of that you think won't work here?
   - Where in your current flow would the scan have to happen?
8. If a member asked you to apply a reward or voucher for them, where would you expect to do
   that — before ringing the sale up, or after?
9. Who would you ask if a customer disputed their points at the counter?
10. What would you need to know to feel confident doing this on day one?

*Listen for:* whether the scan is being inserted into an already-tight flow; who staff think
owns a member's problem; whether a "queue it offline and reconcile later" model matches how
staff actually think about a sale.

---

## Part C — Member intercepts (optional, 5–10 min, opportunistic)

If a customer has just presented loyalty for another programme and is willing:

1. Which programme was that? How long have you been in it?
2. Do you always remember to show it? What happens when you forget?
3. Did you have to think about where to find it just now?
4. Have you ever redeemed something with them? How did that go?

Keep these short and non-blocking. Their value is corroborating H001 against real behaviour
rather than recalled behaviour.

---

## What good looks like

By the end of this activity we should be able to state, with observed evidence:

1. Whether redemption is **member-initiated or staff-initiated** in practice — resolving I007
   and settling whether the voucher wallet or the catalogue is the primary surface.
2. The **time budget** a member has at the counter, and therefore the latency and interaction
   budget for the membership card.
3. Whether the **physical and network conditions** at the counter support a phone-QR model at
   all, and what the offline requirement for the member's device actually needs to be
   (RAID R010).
4. What **failure recovery** looks like today, as the basis for designing it deliberately in
   the service blueprint (RA-06).
5. Whether **staff** see the scan as workable in their flow — the constraint that caps the
   member experience regardless of design quality.

If the observation contradicts A004 — members do not reliably present, or staff do not
reliably scan — that is a finding that reaches the delivery lead the same day, not at
synthesis. The entire Phase 1 earn mechanism (BR-P1-001) rests on that assumption.

---

## Practicalities

- Requires tenant and NTUC Club permission (RAID D006, D010). Agree in advance whether staff
  are told the purpose beforehand — they should be, but not so early that it changes behaviour
  during observation.
- Do not photograph customers. Record no payment details. Observation notes carry no
  personally identifying information.
- Bring a stopwatch, a signal-strength app, and a phone with a sample QR to test scan
  ergonomics at the counter without involving a real customer.
