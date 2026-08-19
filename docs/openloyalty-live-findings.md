# Open Loyalty stage tenant — what the live API actually does

Tested 2026-08-19 against `https://sales-1.eu-west-1.openloyalty-stage.io`,
Open Loyalty **5.180.0**. Every statement below was executed, not read.

## Connection

| | |
|---|---|
| **Base URL** | `https://sales-1.eu-west-1.openloyalty-stage.io/api` — **the same host as the dashboard** |
| **Store code** | `ntuc` (not `default`; every other code returns 404) |
| **Auth** | `X-AUTH-TOKEN: <key>` — confirmed required (401 without, 200 with) |
| **Currency** | `SGD` |

The API key alone is enough. No `login_check` round trip was needed, which is
the scheme our backend already prefers.

## Their tier configuration

Read from `/api/ntuc/tierSet`:

```
Tier set   NTUC Membership   (isDefault: true)
Condition  activeUnits (wallet: default)
Downgrade  periodic, period = registration_anniversary
Tier 1     activeUnits >= 0
Tier 2     activeUnits >= 1500
```

**Two things differ from what we built, and one of them is a design risk.**

1. **Tier 2 qualifies on `activeUnits`, not spend.** We built `totalSpending >=
   1500` (`$1.5K annual spend`). Theirs is 1,500 *points currently held*.
2. **`activeUnits` is the spendable balance, so redeeming demotes you.** A
   member who reaches Tier 2 at 1,500 points and then redeems a 500-point
   voucher drops to 1,000 and falls back to Tier 1. `totalEarnedUnits` — a
   lifetime counter — would not do that. Worth raising with them before launch;
   it is a one-field change on their side.

There is **no union-member route configured**, which matches what we predicted:
the condition vocabulary is metric-only, so membership cannot be a tier
condition. See "Registering with a tier" below for how it is actually done.

## The four tests

### 1. Register customer — works

`POST /api/ntuc/member/register`

```json
{ "customer": {
    "firstName": "PaloTest", "lastName": "Member",
    "email": "…", "plainPassword": "…",
    "loyaltyCardNumber": "NCTEST…", "agreement1": true,
    "labels": [{ "key": "customerType", "value": "union_member" }] } }
```

→ `200 {"customerId":"…","email":"…"}`

**`labels` is accepted**, which is the mechanism we proposed for member type.
It comes back on `GET /member/{id}`.

> **New members are created inactive.** `"active": false` until
> `POST /member/{id}/activate` (→ `204`). Our BFF does not do this today, so a
> real integration would create members who cannot transact.

### 2. Register customer with tier — **not in one call**

Sending `levelId` in the registration payload is rejected:

```
400 "This form should not contain extra fields." — "levelId"
```

It is three calls:

```
POST /member/register        → customerId
POST /member/{id}/activate   → 204
POST /member/{id}/tier       → 204   body: { "levelId": "<tier uuid>" }
```

Result: the member holds **Tier 2 with 0 points** — a tier they do not qualify
for on the metric. So assignment does override the condition, which is exactly
what union membership needs. It also survived a subsequent transaction, so the
assignment is held rather than recalculated away.

The consequence for us: a union member is briefly on Tier 1 between call one and
call three. Our BFF must not return until all three have completed.

### 3. Get customer data — works, with two gaps

`GET /api/ntuc/member/{id}/status` returns `activePoints`, `earnedPoints`,
`spentPoints`, `levelName`, `levelConditionValue`, `nextLevelName`,
`nextLevelConditionValue`, `pointsToNextLevel`, `pointsExpiringNextMonth`,
`transactionsCount`, `transactionsAmount`, `currency`, a `tierSet` object,
`levelAchievementDate` and `referralToken`.

**It does not return `levelId`, and it does not return `labels`.** Both were
flagged as dependencies in our integration request; both are confirmed absent.

- `levelId` is available on `GET /member/{id}` as `currentLevel.levelId`.
- `labels` is available on `GET /member/{id}`.

Our BFF already handles the missing `levelId` — it derives tier rank from the
configured ladder by name. That fallback is no longer a precaution; it is the
only thing that works.

### 4. Push transaction — works, with a different item shape

`POST /api/ntuc/transaction`

```json
{ "transaction": {
    "header": { "documentNumber": "PALO-…", "documentType": "sell",
                "purchasedAt": "2026-08-19T02:00:00+00:00",
                "purchasePlace": "Main Street Store" },
    "items": [ { "sku": "SALE", "name": "Qualifying spend",
                 "quantity": 1, "grossValue": 42.50, "category": "general" } ],
    "customerData": { "loyaltyCardNumber": "NCTIER…" } } }
```

→ `200 {"transactionId":"…"}`

`sku` and `category` are **plain strings**. Sending `{"code":"SALE"}` fails with
`items.0.sku: This value is not valid`, and a `categories: [{name}]` array fails
with `items.0.category: This value should not be blank`. Our till already sends
strings, so no change was needed there — the failure above was a hand-written
probe, not the app.

Two things that do affect us:

- **The response carries only `transactionId`** — no `matched`, no
  `pointsEarned`. Our till printed the award from that response and now measures
  it instead, by reading the member's balance either side of the sale.
- **Point awards are asynchronous.** The transaction returns once accepted, not
  once scored. A balance read immediately afterwards still showed the old
  figure; the credit appeared under a second later. Reading once would print a
  receipt saying zero for a sale that earned. The till now waits for the balance
  to move, and gives up rather than hanging.

Points are **fractional**: $42.50 earned 42.5, so the rate is 1 point per SGD and
nothing is rounded. Our engine floors.

## What this changes for us

| Area | Change |
|---|---|
| Base URL | `https://sales-1.eu-west-1.openloyalty-stage.io` |
| Store code | `ntuc` |
| Auth | `X-AUTH-TOKEN` (already supported) |
| Enrolment | Must call `/activate` after registering |
| Union members | Register → activate → assign tier; three calls, all before responding |
| Receipt points | Measured across the sale; the response does not carry them, and the award lands asynchronously |
| Tier ordering | `/tier` returns Tier 2 first — sort by threshold, never trust the order |
| Points | Fractional, not integers |
| `levelId` | Absent from status — derive rank from the ladder, or read `/member/{id}` |

## Still to confirm with them

1. Is `activeUnits` intended for Tier 2, given that redeeming points demotes a
   member? `totalEarnedUnits` would hold the tier.
2. Are welcome-points campaigns configured on this tenant? None were observed —
   registration awarded nothing.
3. Is there a webhook for point awards, or is polling the only option for the
   member app?
4. What activates a member in production — is the API call ours to make, or is
   there an email confirmation step we are bypassing on stage?
