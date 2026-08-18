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

  /*
   * The push channel.
   *
   * A row says only that something changed for a member — never what, never by
   * how much. Clients watch for their own id and then re-read their record
   * through their own token, so no member's data reaches another's browser
   * even though the table is world-readable.
   */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loyalty_events (
      id         bigserial PRIMARY KEY,
      store_code text NOT NULL,
      member_id  text NOT NULL,
      kind       text NOT NULL,
      at         timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS loyalty_events_member_idx ON loyalty_events (member_id, id DESC)',
  );

  // Realtime only publishes tables added to its publication.
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime' AND tablename = 'loyalty_events'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_events;
        END IF;
      END IF;
    END $$;
  `);

  // World-readable on purpose: the rows carry no member data, and the browser
  // subscribes with a publishable key that has no other privilege.
  await pool.query('ALTER TABLE loyalty_events ENABLE ROW LEVEL SECURITY').catch(() => {});
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'loyalty_events' AND policyname = 'loyalty_events_readable'
      ) THEN
        CREATE POLICY loyalty_events_readable ON loyalty_events FOR SELECT USING (true);
      END IF;
    END $$;
  `).catch(() => {});
}
