/**
 * Mock OpenLoyalty — local process entrypoint.
 *
 * NOT for production: state is in memory and resets on restart, and passwords
 * are stored in plaintext.
 */
import { app } from './app.js';
import { DEFAULT_STORE } from './data.js';
import { initSchema, isPersistent } from './db.js';

const PORT = Number(process.env.PORT ?? 8181);

await initSchema();

app.listen(PORT, () => {
  console.log(`🎁  Mock OpenLoyalty listening on http://localhost:${PORT}`);
  console.log(`    Store code:   ${DEFAULT_STORE}`);
  console.log(`    Demo member:  demo@example.com / password`);
  console.log(`    Admin:        admin / admin`);
  console.log(`    Storage:      ${isPersistent ? 'Postgres (durable)' : 'in memory (resets on restart)'}`);
  console.log(`    OpenAPI:      http://localhost:${PORT}/openapi.json (real OL spec)`);
});
