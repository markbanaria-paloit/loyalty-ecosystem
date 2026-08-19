/**
 * The Express app, built but not started.
 *
 * Kept separate from the process entrypoint so the same app can be served two
 * ways: listening on a port locally, or handed to a serverless runtime that
 * owns the listening itself. A file that both defines the app and calls
 * `listen()` cannot do the second.
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { loyaltyRouter } from './routes/loyalty.js';
import { demoRouter } from './routes/demo.js';
import { eventsRouter } from './routes/events.js';
import { consoleRouter } from './routes/console.js';
import { olProxyRouter } from './routes/ol-proxy.js';

export const app = express();

/**
 * Browser origins allowed to call this service.
 *
 * In development these are the Vite dev servers. Deployed, they are the
 * frontends' own origins — which is when this starts to matter, since a static
 * deploy has no proxy and every call becomes cross-origin.
 */
app.use(cors({ origin: config.corsOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', openLoyalty: config.openLoyalty.baseUrl });
});

app.use(authRouter);
app.use(loyaltyRouter);
app.use(demoRouter);
app.use(eventsRouter);
app.use(consoleRouter);
app.use(olProxyRouter);

/**
 * The campaign studio is mounted by the caller, not here.
 *
 * It pulls in the Anthropic SDK, whose package ships both CJS and ESM type
 * definitions. A serverless build that compiles this entrypoint under CJS
 * resolution picks the CJS ones, where the default export is not constructable
 * — so the whole service fails to build over an optional feature. Keeping it
 * out of the core app means the deployed BFF carries only what the member app
 * and the till actually need; `index.ts` adds it back for local development.
 */
/**
 * Close the app to further routes.
 *
 * Express matches in registration order, so a catch-all 404 has to go on last —
 * which means it cannot be registered here while an entrypoint may still add
 * routes of its own. Each entrypoint calls this once it has finished mounting.
 */
export function finalize(): typeof app {
  app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
  return app;
}

export default app;
