# Loyalty PWA + POS + Campaign Studio

**OpenLoyalty is used headlessly here.** The loyalty engine keeps the members, points, tiers and campaigns; every surface in this repo is a first-class API client of it. The point of the project is not to re-skin OpenLoyalty's backoffice — it is to build experiences the backoffice doesn't have. The **campaign studio** (`apps/studio`) is the first of those: a marketer describes a campaign in plain language, and the agent grounds it in the live configuration, simulates it against real transaction history, and creates it only on approval.

A base project for a **loyalty rewards program**.

Programme configuration — tiers, campaigns, rewards — is done in Open Loyalty's
own console, not here. This repo builds the surfaces that console does not have:
the member experience, the till, and a campaign studio a marketer can talk to.

```
┌────────────┐                                 ┌────────────────────┐
│  Member    │ ──┐                             │  Open Loyalty      │
│  app       │   │                             │  console           │
└────────────┘   │                             │  (configuration)   │
   :5180         │                             └────────────────────┘
                 │   ┌────────────────┐                  ▲
┌────────────┐   ├──►│  Backend (BFF) │ ─────────────────┤
│  Till      │ ──┤   │  Express       │                  │
│  merchants │   │   └────────────────┘        ┌────────────────────┐
└────────────┘   │      :4000                  │  Open Loyalty API  │
   :5175         │                             │  (mock in dev)     │
                 │                             └────────────────────┘
┌────────────┐   │   ┌──────────────┐               :8181 (mock)
│  Studio    │ ──┘──►│ Campaign     │
│  marketers │  chat │ agent (Opus 5)│
└────────────┘       └──────────────┘
   :5176
   :5176            in backend
```

**The earning loop:** the POS publishes a transaction → OpenLoyalty matches the member and applies earning rules → points land on the member's balance → the member redeems a reward in the PWA → the POS validates and fulfils the coupon.

- **`apps/studio`** — **Chat-driven campaign customisation.** Describe a campaign in natural language; the agent inspects tiers, categories and existing campaigns, simulates the campaign against real transaction history, reports the projected cost, and creates it once you approve. Every tool call is surfaced in the transcript, so you can see exactly what was inspected and changed.
- **`apps/pwa`** — Installable member PWA (React + Vite + TypeScript, service worker, manifest, offline app shell). Login/register, points dashboard with tier progress, rewards, history.
- **`apps/merchant`** — Merchant POS. Product catalogue and cart, optional member attach by email or loyalty card, publishes the sale to OpenLoyalty and prints points earned on the receipt. Also handles returns, assigning unmatched sales, and coupon validation/fulfilment.
- **`apps/backend`** — Backend-for-frontend for the member app. Exposes a small PWA-shaped API and translates it into OpenLoyalty calls through one typed client, [`src/openloyalty/client.ts`](apps/backend/src/openloyalty/client.ts).
- **`apps/mock-openloyalty`** — In-memory mock of the OpenLoyalty REST API. Lets you build without deploying OpenLoyalty.
- **`spec/openloyalty-openapi.json`** — The real OpenLoyalty OpenAPI 3.0 document (195 paths, 352 schemas), vendored as the source of truth. The mock is served alongside it at `/openapi.json`.

Every surface goes through the backend. The till used to call Open Loyalty
directly, which meant a store credential in a browser bundle; it now signs in
for a session and reaches only the calls a till makes. The studio goes through
the backend too, because the campaign agent needs the Anthropic key and that
must stay server-side.

Programme configuration happens in Open Loyalty's own console.

## Quick start

```bash
cd loyalty-pwa
npm install
npm run dev
```

| Service          | URL                   | Credentials              |
| ---------------- | --------------------- | ------------------------ |
| Campaign studio  | http://localhost:5176 | —                        |
| Member PWA       | http://localhost:5173 | `demo@example.com` / `password` |
| Merchant POS     | http://localhost:5175 | `admin` / `admin`        |
| Backend (BFF)    | http://localhost:4000 | —                        |
| Mock OpenLoyalty | http://localhost:8181 | —                        |

Run one service at a time with `npm run dev:studio`, `dev:pwa`, `dev:merchant`, `dev:backend`, `dev:mock`.

### The campaign studio

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # then: npm run dev
```

Open http://localhost:5176 and try *"double points on coffee for Gold members this month"* or *"what would 500 bonus points on orders over $50 cost me?"*.

The agent runs on **`claude-opus-5`** with adaptive thinking, driving six tools against OpenLoyalty: `list_tiers`, `list_categories`, `list_campaigns`, `simulate_campaign`, `create_campaign`, `set_campaign_status`. It is instructed to ground categories and tier ids in real data (never invent them), always simulate before creating, never create without explicit approval in a later message, and flag campaigns whose uplift looks expensive.

**Without a key** the studio falls back to a **deterministic offline planner** ([`src/studio/offline.ts`](apps/backend/src/studio/offline.ts)) so the app still runs end-to-end. It is a keyword extractor, not a model, and the UI labels it as such — it handles phrasings like *"double points on coffee"* or *"500 bonus points on orders over $50"* and says plainly when it can't parse a request. It exercises the same tool layer, so the plumbing is identical either way.

### Try the loop

1. **POS** (:5175) — tap a few products, enter `demo@example.com`, publish the sale. The receipt shows the points awarded.
2. **PWA** (:5173) — sign in as the demo member; the points and the transaction are already there.
3. Redeem a reward; the app shows a coupon code.
4. **POS → Coupons** — enter that code, verify the member and reward, mark it fulfilled.

## Fidelity to the real API

The mock follows `spec/openloyalty-openapi.json` — real paths, the `member`/`tier`/`reward` vocabulary, the `{ items, total }` list envelope, and real field names:

| Concern            | Endpoint                                          |
| ------------------ | ------------------------------------------------- |
| Admin login        | `POST /api/admin/login_check`                     |
| Member login       | `POST /api/{storeCode}/member/login_check`        |
| Register           | `POST /api/{storeCode}/member/register` — body nested under `customer`, requires `plainPassword` + `agreement1` |
| Member status      | `GET /api/{storeCode}/member/{member}/status` — `activePoints` / `earnedPoints` / `spentPoints` |
| Member points      | `GET /api/{storeCode}/member/points`              |
| Member rewards     | `GET /api/{storeCode}/member/reward`              |
| Redeem             | `POST /api/{storeCode}/reward/{reward}/buy` → `[{ issuedRewardId }]` |
| Add / spend points | `POST /api/{storeCode}/points/add` \| `/spend` — body wrapped as `{ transfer: {...} }` |
| Campaigns          | `GET`/`POST /api/{storeCode}/campaign`, `PUT`/`activate`/`deactivate`, `POST /campaign/simulate` |
| Publish transaction | `POST /api/{storeCode}/transaction` — nested under `transaction`, with `header` + `items` + `customerData` → `{ transactionId }` |
| Match a sale       | `POST /api/{storeCode}/transaction/assign` — by document number |
| Member exists?     | `GET /api/{storeCode}/member/check` — returns a count only, never details |
| Fulfil a coupon    | `POST /api/{storeCode}/redemption/{issuedReward}/status` |
| Members, tiers, rewards, redemptions, sales | `GET /api/{storeCode}/member` \| `/tier` \| `/reward` \| `/redemption` \| `/transaction` |

Identities are UUIDs, and JWTs carry `id` / `username` / `roles` claims — which is how a client learns its own member id.

Note the POS never looks a member up. It attaches `customerData` (email, loyalty card, phone) to the sale and **OpenLoyalty matches server-side**, then applies earning rules. That is the real integration shape, and it is why `/member/check` returns only a count.

### Deliberate departures from the spec

Three things in the mock are **not** OpenLoyalty API:

- `GET /api/{storeCode}/admin/stats` — a convenience aggregate this mock invents. Open Loyalty serves the same ground through its Analytics endpoints.
- `GET /api/{storeCode}/redemption/by-code/{couponCode}` — coupon lookup for the POS. Real OpenLoyalty resolves coupons through the redemption endpoints with filters.
- **The campaign model.** Real OpenLoyalty campaigns are far richer (segments, challenges, leaderboards, redemption codes). The mock models the slice a campaign builder needs: a condition (categories, tiers, spend floor, date window) and an effect (`multiplier` on matching lines, or flat `bonus_points` per transaction). Multipliers stack multiplicatively; bonuses add once. Returns earn nothing. `POST /transaction` also returns `matched` and `pointsEarned` alongside the spec's `transactionId`, so a till can print the receipt without a second call.
- **`POST /campaign/simulate`** exists in the real spec, but the mock's implementation is its own: it replays the store's `sell` history with the draft campaign added to the active set and reports the delta. Two modeling caveats — it evaluates each member against their **current** tier rather than their tier at transaction time, and it assumes historical purchasing is unchanged by the campaign (no behavioral uplift). Treat the output as a floor on cost, not a forecast of revenue.

The mock covers the slice these apps need — not the full 195-path surface. Areas left out include wallets and wallet types, segments, challenges and leaderboards, achievements/badges, custom fields and events, webhooks, and referrals.

## Going live against a real OpenLoyalty

```bash
cp apps/backend/.env.example apps/backend/.env
# OPENLOYALTY_BASE_URL=https://your-openloyalty.example.com
# OPENLOYALTY_STORE_CODE=your-store
```

The POS reaches Open Loyalty through the backend rather than directly, so no
store credential ships in its bundle. Because the mock matches the documented
contract, the same code works against both — but verify against your Open
Loyalty version before production; the vendored spec is a point-in-time
snapshot, and a live tenant has already differed from it in several places
(see `docs/openloyalty-live-findings.md`).

## Scripts

- `npm run dev` — all six services with live reload
- `npm run build` — build every workspace
- `npm run typecheck` — type-check every workspace

## Tech

React 18 · React Router · Vite 6 · vite-plugin-pwa (Workbox) · Express 4 · TypeScript · Zod · JWT · Anthropic SDK (`claude-opus-5`, beta tool runner).

> The mock stores everything in memory (resets on restart) and keeps passwords in plaintext. Local development only.
>
> Auth is a dev-grade shortcut: the BFF hands the OpenLoyalty token to the browser and it is kept in `localStorage`. For production, keep the OpenLoyalty token server-side behind your own httpOnly session cookie.
