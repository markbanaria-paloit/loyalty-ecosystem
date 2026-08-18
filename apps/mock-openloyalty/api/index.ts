/**
 * Serverless entrypoint.
 *
 * Works, but read this first: the store is an in-memory Map. Every instance a
 * serverless platform starts holds its own copy, and a cold start reseeds it.
 * Under any real concurrency the till and the member app can end up talking to
 * different instances and disagreeing about a member's points.
 *
 * Acceptable for a single-user walkthrough; not for anything else. A long-lived
 * process, or a real OpenLoyalty tenant, is the answer. See docs/deployment.md.
 */
import { app } from '../src/app.js';
import { initSchema } from '../src/db.js';

// Serverless instances start cold, so the schema check runs once per instance
// rather than once per deploy. CREATE TABLE IF NOT EXISTS makes that cheap.
await initSchema();

export default app;
