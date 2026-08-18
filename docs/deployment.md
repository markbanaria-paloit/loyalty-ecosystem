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
