/**
 * Loyalty backend (BFF) — local process entrypoint.
 *
 * Sits between the member app and OpenLoyalty: exposes a small, app-shaped API
 * and translates it into OpenLoyalty calls, keeping store codes and endpoint
 * shapes out of the frontends.
 *
 * The app itself lives in `app.ts`; this file only starts it. Deployed to a
 * serverless runtime, `api/index.ts` hands over the same app instead.
 */
import { app, finalize } from './app.js';
import { config } from './config.js';
import { studioRouter } from './routes/studio.js';

// Mounted here rather than in the app: it is the only thing that needs the
// Anthropic SDK, and the deployed function builds without it. Registered before
// listening, so it still sits ahead of the app's catch-all 404.
app.use(studioRouter);
finalize();

app.listen(config.port, () => {
  console.log(`🚀  Loyalty backend listening on http://localhost:${config.port}`);
  console.log(`    → OpenLoyalty: ${config.openLoyalty.baseUrl} (store: ${config.openLoyalty.storeCode})`);
});
