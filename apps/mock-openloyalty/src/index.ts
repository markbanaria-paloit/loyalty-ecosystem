/**
 * Mock OpenLoyalty server.
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
import { DEFAULT_STORE, getStore } from './data.js';
import { authRouter } from './routes/auth.js';
import { memberRouter } from './routes/member.js';
import { adminRouter } from './routes/admin.js';
import { transactionRouter } from './routes/transaction.js';
import { campaignRouter } from './routes/campaign.js';

const PORT = Number(process.env.PORT ?? 8181);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Seed the default store on boot so the demo member exists immediately.
getStore(DEFAULT_STORE);

// System endpoints (mirroring OpenLoyalty).
app.get('/api/', (_req, res) => {
  res.json({ name: 'mock-openloyalty', version: '0.1.0' });
});
app.get('/api/healthcheck', (_req, res) => {
  res.json({ status: 'ok', services: { database: 'ok', search: 'ok' } });
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

// Order matters: `/member/check` and `/transaction/assign` are literal paths
// that would otherwise be swallowed by the `/member/:member` and
// `/transaction/:transaction` patterns in adminRouter.
app.use(authRouter);
app.use(memberRouter);
app.use(transactionRouter);
// campaignRouter before adminRouter: `/campaign/simulate` is a literal path
// that `/campaign/:campaign` would otherwise swallow.
app.use(campaignRouter);
app.use(adminRouter);

app.use((_req, res) => {
  res.status(404).json({ code: 404, message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`🎁  Mock OpenLoyalty listening on http://localhost:${PORT}`);
  console.log(`    Store code:   ${DEFAULT_STORE}`);
  console.log(`    Demo member:  demo@example.com / password`);
  console.log(`    Admin:        admin / admin`);
  console.log(`    OpenAPI:      http://localhost:${PORT}/openapi.json (real OL spec)`);
});
