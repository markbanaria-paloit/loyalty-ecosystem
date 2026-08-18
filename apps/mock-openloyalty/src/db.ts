/**
 * Postgres connection and schema.
 *
 * The store is persisted as a single JSONB document per store code rather than
 * a normalised schema. That is a deliberate trade for what this service is: a
 * stand-in for Open Loyalty that gets deleted the day a real tenant exists.
 * Normalising it would mean designing — and maintaining — a schema for
 * scaffolding.
 *
 * What the document model costs, stated plainly:
 *
 *   - Every write rewrites the whole store. Fine at demo size (tens of
 *     kilobytes); it would not be at a million members.
 *   - No partial reads. Every request loads the whole store.
 *   - Writes to one store are serialised by an advisory lock, so concurrent
 *     requests queue rather than interleave.
 *
 * What it buys is the thing in-memory could not do: state that survives a
 * restart, and that every instance of this service sees the same way.
 */
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

/**
 * Absent `DATABASE_URL`, the service runs in memory exactly as it used to.
 * Keeps `npm run dev` working with no database, and makes the persistence
 * opt-in rather than a hard dependency.
 */
export const isPersistent = Boolean(connectionString);

export const pool = isPersistent
  ? new Pool({
      connectionString,
      // Hosted Postgres (Supabase among others) terminates non-TLS connections;
      // certificate verification is off because a demo tenant uses whatever
      // certificate the provider issues.
      ssl: /supabase|amazonaws|neon|render/.test(connectionString ?? '')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 5,
    })
  : null;

/** Create the table if it is not there. Safe to call on every boot. */
export async function initSchema(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stores (
      code       text PRIMARY KEY,
      snapshot   jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}
