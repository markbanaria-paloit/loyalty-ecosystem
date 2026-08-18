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
import { app } from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`🚀  Loyalty backend listening on http://localhost:${config.port}`);
  console.log(`    → OpenLoyalty: ${config.openLoyalty.baseUrl} (store: ${config.openLoyalty.storeCode})`);
});
