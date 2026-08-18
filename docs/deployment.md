# Deployment

Seven workspaces: two Node services and five Vite frontends. They split cleanly,
and the split is what decides how each is configured.

| Workspace | Type | Talks to | Port (dev) |
|-----------|------|----------|-----------|
| `apps/mock-openloyalty` | Node service | — | 8181 |
| `apps/backend` | Node service (BFF) | OpenLoyalty | 4000 |
| `apps/member` | Vite static | BFF | 5180 |
| `apps/studio` | Vite static | BFF | 5176 |
| `apps/admin` | Vite static | OpenLoyalty | 5174 |
| `apps/merchant` | Vite static | OpenLoyalty | 5175 |
| `apps/pwa` | Vite static | BFF | 5173 |

Each workspace has a `.env.example`. Copy it to `.env` locally; on Vercel, set
the same keys as project environment variables.

## The one thing that breaks a static deploy

In development every frontend calls `/api/...` and Vite proxies it upstream, so
the browser sees a single origin. **A static deploy has no proxy.** Set
`VITE_API_BASE_URL` on every frontend to the absolute origin it should call:

- `member`, `studio`, `pwa` → the deployed **backend** URL
- `admin`, `merchant` → the deployed **OpenLoyalty** URL

Leave it empty and the deployed app will request `/api/...` against its own
static host and 404.

Two consequences worth knowing:

- **`VITE_*` values are build-time.** They are inlined into the bundle, so
  changing one needs a redeploy — and none of them may hold a secret. Everything
  prefixed `VITE_` ships to the browser.
- **Cross-origin now applies.** Set `CORS_ORIGIN` on the backend to the deployed
  frontend origins, comma-separated. A mismatch appears as a browser CORS error,
  not a server-side failure.

## What to deploy

Not everything here needs to go up. The demo storyboard needs four services and
one host that is not Vercel.

| Workspace | Deploy? | Where | Why |
|-----------|---------|-------|-----|
| `apps/member` | **Yes** | Vercel | The member app. |
| `apps/admin` | **Yes** | Vercel | Campaign Admin — tiers and campaigns. |
| `apps/merchant` | **Yes** | Vercel | The till that publishes transactions. |
| `apps/backend` | **Yes** | Vercel | The BFF. Stateless, so serverless is fine. |
| `apps/mock-openloyalty` | **Yes, but not Vercel** | One always-on container | Holds all the state in memory. See below. |
| `apps/studio` | Optional | Vercel | Chat campaign builder. Needs `ANTHROPIC_API_KEY`, and falls back to an offline planner without one. |
| `apps/pwa` | **No** | — | Superseded by `apps/member`. |

### Why the mock cannot be a Vercel function

Each serverless instance holds its own copy of the store, and a cold start
reseeds it. The till would publish a sale into one instance while the member app
read another, and a member enrolled at the start of the demo could be gone by
the time the till scans them. Run it as a single long-lived process — any
always-on container host will do — or point the backend at a real OpenLoyalty
tenant and do not deploy it at all.

### Per-project settings

Each workspace carries a `vercel.json`, so the build settings come from the
repo. Create one Vercel project per app with **Root Directory** set to that
workspace. The static apps rewrite all non-asset paths to `index.html`, without
which a direct load of `/personas` or `/campaigns/new` returns a 404 — React
Router owns those paths, not the CDN.

The backend is served from `api/index.ts`, which exports the Express app rather
than starting it; `src/index.ts` still starts it for local development.

## Secrets

Only two workspaces hold anything sensitive, and both are server-side:

| Variable | Where | Notes |
|----------|-------|-------|
| `OPENLOYALTY_API_KEY` | `apps/backend` | Preferred over username/password; sent as `X-AUTH-TOKEN`. |
| `OPENLOYALTY_ADMIN_USER` / `_PASSWORD` | `apps/backend` | Used only when no API key is set. |
| `DEMO_PERSONA_PASSWORD` | `apps/backend` | Never leaves the service. |
| `ANTHROPIC_API_KEY` | `apps/backend` | Absent, the studio uses its offline planner. |
| `MOCK_OL_JWT_SECRET` | `apps/mock-openloyalty` | Set a real value anywhere reachable. |

The `admin` and `merchant` apps authenticate against OpenLoyalty from the
browser with credentials a user types — no key is baked into either bundle.

## Pointing at a real OpenLoyalty

Set `OPENLOYALTY_BASE_URL` and the auth variables on `apps/backend`, and
`VITE_API_BASE_URL` on `admin` and `merchant`. Then:

```
npm run contract
```

It reads every upstream path out of the backend source and fails if one is not
in `spec/openloyalty-openapi.json`. It has already caught a route that worked
against the mock and would have 404'd against a real deployment.

`apps/mock-openloyalty` should not be deployed alongside a real instance. Its
state is in memory, it resets on restart, and it stores passwords in plaintext.

See [`api-flows.md`](./api-flows.md) for the exact calls each app makes.
