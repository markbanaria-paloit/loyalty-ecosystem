# API flows: enrolment and transaction

The two moments that matter for an OpenLoyalty integration — a member joining,
and a sale being recorded. Every call below is in
[`spec/openloyalty-openapi.json`](../spec/openloyalty-openapi.json); `npm run
contract` proves it by reading the paths out of the backend source and checking
them against that document.

Two things are worth noticing before the detail:

- **The apps never decide anything.** They publish events and read state back.
  Which tier a member lands on, how many points a purchase earns, what a welcome
  award is worth — all of it is decided by the loyalty engine from configuration
  the Campaign Admin writes.
- **The two surfaces reach the platform differently.** The member app goes
  through the BFF, which holds the admin-scoped operations a member must never be
  able to perform themselves. The till speaks to OpenLoyalty directly, as a real
  POS integration would, using a store-scoped admin credential.

---

## 1. Enrolment — member app

Triggered when someone completes sign-in for the first time. The member app
holds the sign-in spinner until every call below has returned, so the dashboard
never renders a zero balance or a blank tier.

```
member app          BFF (:4000)                  OpenLoyalty
    │                    │                            │
    ├─ POST /api/auth/register ──────────►            │
    │                    ├─ POST /api/{store}/member/register ─────►
    │                    │        (raises CustomerRegistered;       │
    │                    │         enrolment campaigns run here)    │
    │                    │◄──── { customerId, email }               │
    │                    ├─ POST /api/{store}/member/login_check ──►
    │                    │◄──── { token, refresh_token }            │
    │                    ├─ GET  /api/{store}/member/{id}/status ──►
    │                    │◄──── CustomerStatus                      │
    │                    ├─ GET  /api/{store}/tier ────────────────►
    │◄─ { token, member, account, enrolment }                       │
    │                    │                            │
    ├─ GET /api/me/transactions ─────────►            │
    │                    ├─ GET  /api/{store}/member/points ───────►
    ├─ GET /api/me/tier-progress ────────►            │
    │                    ├─ GET  /api/{store}/member/{id}/tierSet ─►
    │                    ├─ GET  /api/{store}/member/{id}/tierSet/{tierSet} ─►
    ├─ GET /api/tiers ───────────────────►            │
    │                    ├─ GET  /api/{store}/tier ────────────────►
```

### Calls in order

| # | Caller | Method | Path | Why |
|---|--------|--------|------|-----|
| 1 | member app → BFF | `POST` | `/api/auth/register` | Enrol. Carries `labels[]` — the member type. |
| 2 | BFF → OL | `POST` | `/api/{storeCode}/member/register` | Creates the member. **Everything else about enrolment happens inside this call.** |
| 3 | BFF → OL | `POST` | `/api/{storeCode}/member/login_check` | Member JWT, so the app reads its own record with its own token. |
| 4 | BFF → OL | `GET` | `/api/{storeCode}/member/{member}/status` | The settled record — balance and tier, after campaigns. |
| 5 | BFF → OL | `GET` | `/api/{storeCode}/tier` | Ladder, to resolve the tier's rank. |
| 6 | member app → BFF | `GET` | `/api/me/transactions` → `/api/{storeCode}/member/points` | Activity list. |
| 7 | member app → BFF | `GET` | `/api/me/tier-progress` → `/member/{member}/tierSet`, then `/member/{member}/tierSet/{tierSet}` | Progress to the next tier. |
| 8 | member app → BFF | `GET` | `/api/tiers` → `/api/{storeCode}/tier` | Tier names and order, so the app renders no hardcoded ladder. |

### What the member type carries

The app's only input to tiering is a label on the registration payload, in the
spec's `Labels` shape:

```json
{ "customer": { "…": "…", "labels": [{ "key": "customerType", "value": "union_member" }] } }
```

### What happens inside call 2

Registration raises OpenLoyalty's `CustomerRegistered` event. Campaigns listening
for it run in display order, and the member is fully settled before the response
returns:

1. **Union Member Welcome** — matches `customerType: union_member`, awards 500 points.
2. **Welcome Bonus** — excludes that label, awards 250 points.
3. Tier is recomputed against the member's conditions.

The two are mutually exclusive by label, so a union member receives 500, not 750.
Tier 2 has two ways in, and the welcome campaigns confer neither directly:
**union membership admits a member outright**, and everyone else reaches it on
**$1,500 of spend in the current period**. A union member is therefore on Tier 2
from the moment they enrol; a public member climbs to it.

---

## 2. Transaction — merchant till

Triggered when a cashier publishes a sale. The till talks to OpenLoyalty
directly; there is no BFF in this path.

```
till (:5175)                                  OpenLoyalty
    │                                              │
    ├─ POST /api/admin/login_check ───────────────►│   (once, at sign-in)
    │◄──── { token, refresh_token }                │
    │                                              │
    ├─ GET  /api/{store}/member/check?identifier= ►│   (optional, on scan)
    │◄──── { total }                               │
    │                                              │
    ├─ POST /api/{store}/transaction ─────────────►│
    │        { transaction: { header, items, customerData } }
    │                                              │
    │        inside: match member → evaluate       │
    │        purchase campaigns → award points     │
    │        → recompute tier                      │
    │                                              │
    │◄──── { transactionId, matched, pointsEarned }│
```

### Calls in order

| # | Method | Path | Why |
|---|--------|------|-----|
| 1 | `POST` | `/api/admin/login_check` | Store-scoped admin JWT. Once per session. |
| 2 | `GET` | `/api/{storeCode}/member/check` | Existence check on the scanned card. Returns a count only — never member details, so a till cannot enumerate members. |
| 3 | `POST` | `/api/{storeCode}/transaction` | Publish the sale. |

### The payload

```json
{
  "transaction": {
    "header": {
      "documentNumber": "POS-123456789",
      "documentType": "sell",
      "purchasedAt": "2026-08-18T04:30:00.000Z",
      "purchasePlace": "Main Street Store"
    },
    "items": [
      { "sku": "SALE", "name": "Qualifying spend", "category": "general",
        "grossValue": 42.50, "quantity": 1 }
    ],
    "customerData": { "loyaltyCardNumber": "NC1A2B3C4D" }
  }
}
```

`documentNumber` must be unique per store — a repeat is rejected, which is what
makes publishing safe to retry.

### What happens inside call 3

1. **Match** the member, in the spec's order of precedence: explicit id, then
   loyalty card number, then email, then phone. No match means the sale is
   recorded unmatched and can be assigned later.
2. **Evaluate** purchase-triggered campaigns against the transaction — category,
   tier, minimum value, activity window — and compute the points.
3. **Award** the points and record the transfer, with the transaction as its cause.
4. **Recompute** the member's tier. A sale can promote a member on spend alone,
   with no points involved.

The till reads `pointsEarned` off the response for the receipt. It never
calculates it.

### Related till calls

| Method | Path | When |
|--------|------|------|
| `POST` | `/api/{storeCode}/transaction/assign` | Attach an unmatched sale to a member afterwards. |
| `GET` | `/api/{storeCode}/transaction` | Sales list. |
| `GET` | `/api/{storeCode}/redemption/by-code/{code}` | Look up a voucher a member presents. |
| `POST` | `/api/{storeCode}/redemption/{issuedReward}/status` | Mark it redeemed. |

---

## Pointing at a real instance

Set `OPENLOYALTY_BASE_URL`, and either `OPENLOYALTY_API_KEY` (sent as
`X-AUTH-TOKEN`) or `OPENLOYALTY_ADMIN_USER` / `OPENLOYALTY_ADMIN_PASSWORD` for the
JWT flow. Both auth schemes are in the spec; the API key skips the login round
trip.

`npm run contract` guards the swap: it reads every upstream path out of the
backend source and fails if one is not in the vendored spec. It has already
caught one route that worked against the mock and would have 404'd against a real
deployment.

### Known extensions

These are additions this mock makes that a stock OpenLoyalty will not return.
Nothing breaks without them, but the behaviour degrades:

| Field | Where | Without it |
|-------|-------|-----------|
| `campaignPayouts`, `status` | register response | The welcome screen falls back to the account balance. |
| `levelSortOrder` | `CustomerStatus` | The BFF derives the rank from `GET /tier` instead. |
| `qualifyingLabels`, `assignmentOnly` | tier | Tier 2's union route is not expressible; see below. |
| `nextTierEligible`, `nextTierMissingLabels` | tier progress | The app cannot say *why* a tier is out of reach. |

The one place the spec has no answer is admitting a member to a tier on member
type. Its
condition vocabulary is metric-only (`activeUnits`, `totalEarnedUnits`,
`totalSpending`, `monthsSinceJoiningProgram`, `cumulatedEarnedUnits`), so
"union members qualify" cannot be a tier condition. The alternative the spec does
offer — assigning the tier from a campaign's `assign_member_to_tier` effect —
works, but a tier reached only by assignment has no thresholds, and therefore no
progress for `TierSetMemberProgress` to report. This build keeps the label route
on the tier so progress stays reportable, and flags it as an extension.
