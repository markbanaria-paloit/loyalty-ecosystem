/**
 * Loyalty backend (BFF).
 *
 * Sits between the PWA and OpenLoyalty: exposes a small, PWA-shaped API and
 * translates it into OpenLoyalty calls via the client. Keeps OpenLoyalty
 * specifics (store codes, endpoint shapes) out of the frontend.
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { loyaltyRouter } from './routes/loyalty.js';
import { demoRouter } from './routes/demo.js';
import { studioRouter } from './routes/studio.js';

const app = express();

// The PWA and the campaign studio both call this server from their dev origins.
app.use(cors({ origin: config.corsOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', openLoyalty: config.openLoyalty.baseUrl });
});

app.use(authRouter);
app.use(loyaltyRouter);
app.use(demoRouter);
app.use(studioRouter);

app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));

app.listen(config.port, () => {
  console.log(`🚀  Loyalty backend listening on http://localhost:${config.port}`);
  console.log(`    → OpenLoyalty: ${config.openLoyalty.baseUrl} (store: ${config.openLoyalty.storeCode})`);
});
