# Regression checks

Written against a running stack, not mocked. Between them these caught most of
the real defects in this project: ISO timestamps compared as strings, tier order
that could not be trusted, purchase campaigns that never recorded a run, an
assigned tier demoted by the next recalculation.

They run against the **mock** platform, which is the reason it still exists.
Pointed at a live tenant they would create members in it, so they do not do that.

## Running them

```
npm run dev:mock      # :8181
npm run dev:backend   # :4000
npm run check
```

Each is re-runnable against a store that already has data — addresses and
document numbers are unique per run.

| Check | What it proves |
|-------|----------------|
| `enrolment-check.py` | A member enrols, is awarded and tiered by the platform, and the BFF reports the same record the member app will render. Covers the demo personas. |
| `tier-qualification-check.py` | Tier rules mean something: conditions AND together, a member type gates a tier, progress is reported against the right goal, and an annual period resets qualification. |
| `persistence-check.py` | State survives a restart, and two instances sharing one database agree. Needs `DATABASE_URL`; skips loudly without one. |

## What they do not cover

The live Open Loyalty tenant. Its behaviour is recorded in
[`../../docs/openloyalty-live-findings.md`](../../docs/openloyalty-live-findings.md)
— several things differ from the mock, and from the vendored spec.
