/**
 * Mock OpenLoyalty server — the app, built but not started.
 *
 * Split from the process entrypoint so the same app can either listen on a port
 * or be handed to a runtime that owns the listening. Note the caveat that comes
 * with the second: this server keeps everything in memory, so more than one
 * instance means more than one truth. See docs/deployment.md.
 *
 * A lightweight, in-memory stand-in for the OpenLoyalty REST API so the loyalty
 * backend/PWA can be developed without a full OpenLoyalty deployment. It mimics
 * the routes and JWT auth model documented at https://apidocs.openloyalty.io/.
 *
 * NOT for production — data resets on restart and passwords are plaintext.
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { authRouter } from './routes/auth.js';
import { memberRouter } from './routes/member.js';
import { adminRouter } from './routes/admin.js';
import { transactionRouter } from './routes/transaction.js';
import { campaignRouter } from './routes/campaign.js';
import { storeContext } from './store-context.js';
import { isPersistent } from './db.js';
import { tierRouter } from './routes/tier.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// No seeding on boot. The store is seeded on first use, inside the same locked
// transaction that reads it, so two instances starting together cannot both
// create it.

// System endpoints (mirroring OpenLoyalty).
app.get('/api/', (_req, res) => {
  res.json({ name: 'mock-openloyalty', version: '0.1.0' });
});
app.get('/api/healthcheck', (_req, res) => {
  // `storage` is not part of the OpenLoyalty shape — it is here because "which
  // instance is talking to what" is otherwise invisible, and a service silently
  // running in memory looks identical to one that is persisting until state
  // goes missing.
  res.json({
    status: 'ok',
    services: { database: isPersistent ? 'ok' : 'memory', search: 'ok' },
    storage: isPersistent ? 'postgres' : 'memory',
  });
});

// Serve the real OpenLoyalty OpenAPI document this mock is modeled on.
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get('/openapi.json', (_req, res) => {
  try {
    const spec = readFileSync(
      join(__dirname, '..', '..', '..', 'spec', 'openloyalty-openapi.json'),
      'utf8',
    );
    res.type('application/json').send(spec);
  } catch {
    res.status(404).json({ message: 'spec/openloyalty-openapi.json not found' });
  }
});

// Check the store out before any store-scoped route runs, and write it back
// when the response finishes. Mounted on the param so it never fires for
// `/api/admin/...` or `/api/healthcheck`.
app.use('/api/:storeCode', storeContext);

// Order matters: `/member/check` and `/transaction/assign` are literal paths
// that would otherwise be swallowed by the `/member/:member` and
// `/transaction/:transaction` patterns in adminRouter.
app.use(authRouter);
app.use(memberRouter);
app.use(transactionRouter);
// campaignRouter before adminRouter: `/campaign/simulate` is a literal path
// that `/campaign/:campaign` would otherwise swallow. tierRouter likewise owns
// `/tier/recalculate`.
app.use(campaignRouter);
app.use(tierRouter);
app.use(adminRouter);

app.use((_req, res) => {
  res.status(404).json({ code: 404, message: 'Not Found' });
});

export default app;
