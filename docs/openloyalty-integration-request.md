# NTUC Club × Open Loyalty — integration request

**From:** PALO IT, NTUC Club Customer Loyalty Programme (NC-CT00008)
**Purpose:** confirm the API calls we intend to make, the responses we expect,
and the tier configuration we need in the tenant.

We have built the full programme against a local stand-in that follows your
published OpenAPI document, so every call below is one we already make and every
response is one we already parse. Nothing here is speculative. What we need from
you is confirmation that the real platform behaves the same way, and the tier and
campaign configuration described in section 4.

Two notes on our architecture, because they explain the call pattern:

- **Our apps never compute loyalty outcomes.** They publish events and read state
  back. How many points a purchase earns, which tier a member holds, what a
  welcome award is worth — all of that is decided by Open Loyalty from
  configuration, not by our code. That is deliberate, and it is why the list of
  calls is short.
- **Two surfaces, two access patterns.** Our member app goes through a
  backend-for-frontend that holds the admin-scoped operations. Our till speaks to
  Open Loyalty directly, as a POS integration would.

---

## 1. Authentication

We support both schemes in your document and would prefer the first.

| | Method | Path |
|---|---|---|
| Preferred | API key sent as `X-AUTH-TOKEN` | — |
| Fallback | `POST` | `/api/admin/login_check` → JWT, refreshed via `/api/token/refresh` |

Members authenticate separately via `POST /api/{storeCode}/member/login_check`,
and we use that member token for member-scoped reads.

**Question:** which do you issue for a tenant like ours, and is the API key
scoped per store?

---

## 2. The story: a member joins, shops, and checks their balance

### 2.1 Enrolment

A person signs up in the member app. We create them in one call, and we need
that call to settle everything — tier and welcome points included — before it
returns, because the next screen shows their balance.

```
POST /api/{storeCode}/member/register
```

```json
{
  "customer": {
    "firstName": "Wei",
    "lastName": "Tan",
    "email": "wei.tan@example.com",
    "plainPassword": "•••••••",
    "loyaltyCardNumber": "NC7A3F91",
    "agreement1": true,
    "labels": [{ "key": "customerType", "value": "union_member" }]
  }
}
```

Two fields carry weight:

- **`loyaltyCardNumber`** is what the member's QR encodes and what the till
  matches on. It must be set at registration or the member can never be matched
  at the counter.
- **`labels`** is how we tell you the member is an NTUC union member. This is the
  crux of our tier configuration — see section 4.

**Expected result:** `200` with the created member. We then read the member back
(2.3) rather than trusting the registration response.

**What we need to happen inside this call:** registration raises
`CustomerRegistered`, and the campaigns configured against it award the welcome
points and settle the member's tier. **Question:** is `CustomerRegistered` the
correct event name for an `internal_event` campaign trigger, and is the campaign
guaranteed to have run before this response returns — or is it asynchronous? If
asynchronous, what is the expected delay, and is there a webhook we should wait
on instead?

### 2.2 A purchase at the till

```
POST /api/{storeCode}/transaction
```

```json
{
  "transaction": {
    "header": {
      "documentNumber": "POS-7a3f91",
      "documentType": "sell",
      "purchasedAt": "2026-08-18T06:00:00.000Z",
      "purchasePlace": "Main Street Store"
    },
    "items": [
      { "sku": "SALE", "name": "Qualifying spend", "category": "general",
        "grossValue": 42.50, "quantity": 1 }
    ],
    "customerData": { "loyaltyCardNumber": "NC7A3F91" }
  }
}
```

**Expected result:**

```json
{ "transactionId": "efa8d9b4-…", "matched": true, "pointsEarned": 42 }
```

The till prints `pointsEarned` on the receipt; it never calculates it.
`documentNumber` is unique per store, so a repeat is rejected and publishing is
safe to retry.

**Questions:** (a) is `matched` / `pointsEarned` returned on the create response,
or must we re-read the member to learn what the sale earned? (b) is the point
award synchronous with this call?

### 2.3 Fetching the customer

Responsible for data in the member dashboard

```
GET /api/{storeCode}/member/{member}/status
```

**The response we currently rely on:**

```json
{
  "customerId": "b1e82242-9b73-48dc-ad5e-bfe8a3fb47f5",
  "firstName": "Wei",
  "lastName": "Tan",
  "activePoints": 500,
  "earnedPoints": 500,
  "spentPoints": 0,
  "expiredPoints": 0,
  "lockedPoints": 0,
  "levelId": "f811a14a-15f8-4304-b133-f924285b4158",
  "levelName": "Tier 2",
  "levelConditionValue": 1500,
  "nextLevelName": null,
  "nextLevelConditionValue": null,
  "pointsToNextLevel": null,
  "currency": "points",
  "pointsExpiringNextMonth": 0
}
```

**Please confirm which of these your `CustomerStatus` actually returns.** We use:

| Field | Used for | Can we rely on it? |
|---|---|---|
| `activePoints` | The headline balance | |
| `earnedPoints`, `spentPoints` | Lifetime totals | |
| `levelId`, `levelName` | Which tier the member holds | |
| `pointsExpiringNextMonth` | Expiry warning | |
| **`levelId`** | We need the **id**, not just the name, to match against the tier list | ← please confirm |
| **`labels`** | To know the member's type without a second call | ← please confirm |

### 2.4 Points history

```
GET /api/{storeCode}/member/points
```

Returns the member's transfers. We show them as an activity list, and we read
`comment` and `actionCause` to attribute each one:

```json
{
  "transferId": "6a1bc975-…",
  "type": "adding",
  "value": 500,
  "comment": "Campaign: Union Member Welcome",
  "createdAt": "2026-08-18T05:53:04.970Z",
  "actionCause": { "campaignId": "b322ade4-…" }
}
```

**Question:** does `actionCause` carry the `campaignId` for campaign-issued
points and the `transactionId` for purchase-issued points? We use that to tell a
member *why* they were awarded something.

### 2.5 Progress toward the next tier

The member app shows how far a member is from the next tier. We do not compute
this — you own the qualification rules, so we ask you.

```
GET /api/{storeCode}/member/{member}/tierSet
GET /api/{storeCode}/member/{member}/tierSet/{tierSet}
```

**The response we rely on:**

```json
{
  "currentTierId": "bc4bb441-…",
  "currentTierName": "Tier 1",
  "nextTierId": "f811a14a-…",
  "nextTierName": "Tier 2",
  "tierSetId": "430155c1-…",
  "currentProgress": 60,
  "nextRecalculationAt": "2027-08-18T05:53:04.970Z",
  "manually": false,
  "downgrade": "periodic",
  "nextTierCurrentProgress": [
    { "conditionId": "793625f3-…", "attribute": "totalSpending",
      "currentValue": 900, "valueGoal": 1500 }
  ]
}
```

`nextTierCurrentProgress` is the important part — it lets us render "$600 to
Tier 2" without knowing the rules. **Question:** is `currentValue` measured
against the current qualification period, or lifetime?

### 2.6 Redemption

```
POST /api/{storeCode}/points/spend
```

with `{ "transfer": { "customer": "…", "points": 500, "comment": "Redeemed: …" } }`.
We re-read the balance server-side before spending so a redemption can never take
an account negative.

---

## 3. Full call list

Everything our services call, and nothing else. All are in your OpenAPI document
— we have an automated check that fails our build if we add a call that is not.

| Method | Path | Caller | When |
|---|---|---|---|
| `POST` | `/api/admin/login_check` | BFF, till | Session start (unless API key) |
| `POST` | `/api/{storeCode}/member/login_check` | BFF | Member sign-in |
| `POST` | `/api/{storeCode}/member/register` | BFF | Enrolment |
| `GET` | `/api/{storeCode}/member/{member}/status` | BFF | Every member screen |
| `GET` | `/api/{storeCode}/member/{member}/tierSet` | BFF | Tier progress |
| `GET` | `/api/{storeCode}/member/{member}/tierSet/{tierSet}` | BFF | Tier progress |
| `GET` | `/api/{storeCode}/member/points` | BFF | Activity list |
| `GET` | `/api/{storeCode}/member/reward` | BFF | Rewards catalogue |
| `GET` | `/api/{storeCode}/member/reward/bought` | BFF | Member's vouchers |
| `POST` | `/api/{storeCode}/reward/{reward}/buy` | BFF | Redeem a reward |
| `POST` | `/api/{storeCode}/points/spend` | BFF | Redemption debit |
| `GET` | `/api/{storeCode}/tier` | BFF, admin | Tier ladder |
| `GET` | `/api/{storeCode}/member` | BFF | Admin member list |
| `POST` | `/api/{storeCode}/transaction` | Till | Publish a sale |
| `GET` | `/api/{storeCode}/member/check` | Till | Validate a scanned card |
| `POST` | `/api/{storeCode}/transaction/assign` | Till | Attach an unmatched sale |
| `GET` | `/api/{storeCode}/redemption/by-code/{code}` | Till | Look up a voucher |
| `POST` | `/api/{storeCode}/redemption/{issuedReward}/status` | Till | Mark it redeemed |

---


### The programme

Two tiers, with **two independent routes into Tier 2**:

| Tier | Who is in it |
|---|---|
| **Tier 1** — Occasional Shopper | Everyone, on enrolment |
| **Tier 2** — NTUC Member / Frequent Spender | **NTUC union members, admitted on enrolment**, *or* any member reaching **$1,500 of qualifying spend in a rolling year** |

Earn rate is **$1 spend = 1 point** for both tiers.

### What we can configure ourselves

The spend route maps cleanly onto your model:

```json
{
  "tierSet": {
    "translations": { "en": { "name": "Membership Levels" } },
    "active": true,
    "conditions": [{ "attribute": "totalSpending" }],
    "downgrade": { "mode": "periodic", "period": "yearly" }
  }
}
```

with tier thresholds `Tier 1 = 0`, `Tier 2 = 1500`.

**Question 4a:** with `downgrade.mode = periodic` and `period = yearly`, is
`totalSpending` measured **within the current period** (so "annual spend"), or is
it a lifetime total? If lifetime, which attribute gives us a rolling annual
figure? We note `cumulatedEarnedUnits` is documented as resetting on
recalculation, but it counts *units*, not spend — and our welcome and birthday
bonuses would inflate it beyond actual spending.

### What we cannot express — please advise

The condition vocabulary (`activeUnits`, `totalEarnedUnits`, `totalSpending`,
`monthsSinceJoiningProgram`, `cumulatedEarnedUnits`) is entirely **metric-based**.
Union membership is **not a metric** — it is an attribute of who the member is,
and it must admit them to Tier 2 immediately, with no spend.

We can see three possible approaches and would like your recommendation:

1. **Campaign effect.** A campaign triggered on `CustomerRegistered`, conditioned
   on the member's `customerType` label, with an `assign_member_to_tier` effect.
   - *Our concern:* a tier reached only by assignment has no thresholds, so
     `nextTierCurrentProgress` would be empty and we could not show a spending
     member their progress toward Tier 2. Does an assigned tier still report
     progress? And does `assign_member_to_tier` survive the periodic
     recalculation that the spend route requires?
2. **Segments.** If a segment can be defined by a member label, and tier
   membership or campaign audience can key off that segment.
   - *Question:* can a segment be defined on a label, and can it drive tier
     qualification rather than only campaign visibility?
3. **Something we have missed.** If there is a supported way to make a tier
   qualify on a member attribute, we would rather use it than work around it.

**Question 4b:** which of these do you recommend, and does any of them let a
union member hold Tier 2 permanently while a public member's Tier 2 is subject to
annual re-qualification?

### Campaigns we need configured

| Campaign | Trigger | Audience | Effect | Limit |
|---|---|---|---|---|
| Union Member Welcome | `CustomerRegistered` | `customerType = union_member` | 500 points | Once per member |
| Welcome Bonus | `CustomerRegistered` | Everyone **except** the above | 250 points | Once per member |

**Question 4c:** the two must be **mutually exclusive** — a union member receives
500, not 750. Can a campaign be *excluded* by label (a "not one of" condition), or
should we express this differently?

**Question 4d:** birthday perks are **2× points for Tier 1 and 3× for Tier 2 on
the first qualifying transaction in the member's birthday month**. This needs a
per-member, per-month execution limit and a condition on the member's birth
month. Is `limits.executionsPerMember.interval` enforced as a rolling window, and
is `is_month_of_year` available as a rule condition against the member's birth
date?

---

## 5. Non-points benefits

The programme also grants entitlements that are not points: comp parking
(1 hour Tier 1 / 2 hours Tier 2, capped at 2 per month), day passes (2/year and
4/year), early-bird facility booking, and a room discount.

We plan to declare these as **tier benefits** — the `rewards[]` array on a tier,
which your document describes as "lifetime benefits associated with tier", using
`{ code, value }` pairs.

**Question 5a:** is that the intended use of that field?
**Question 5b:** does Open Loyalty track *consumption* of such an entitlement —
"2 per month", "4 per year" — or should we hold that ledger on our side?