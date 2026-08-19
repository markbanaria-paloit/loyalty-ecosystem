/**
 * The push channel's write side.
 *
 * The member app learns that its points moved from a row in `loyalty_events`,
 * which Supabase Realtime delivers. Our own mock platform writes that row when
 * it awards points — a real Open Loyalty does not, and never will: it has no
 * knowledge of our database.
 *
 * So the till reports it. The till is the only party that both triggers the
 * award and confirms it landed: it publishes the sale, waits for the balance to
 * move, and then says so. Nothing downstream has to trust a timer.
 *
 * The row carries a member id and a kind, never a balance — the member app
 * re-reads its own record through its own token.
 */
import { Router } from 'express';
import { Pool } from 'pg';

export const eventsRouter = Router();

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: /supabase|amazonaws|neon|render/.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
      max: 3,
    })
  : null;

/**
 * Shared secret between the till and this service.
 *
 * Demo-grade on purpose: the endpoint can only ask a member app to re-read its
 * own record, so the worst it buys an attacker is a forced refresh. It exists
 * so the endpoint is not simply open, not because the payload is sensitive.
 */
const secret = process.env.EVENT_PUBLISH_SECRET ?? null;

eventsRouter.post('/api/events/member-changed', async (req, res) => {
  if (secret && req.header('x-event-secret') !== secret) {
    res.status(401).json({ message: 'Not authorised to publish events' });
    return;
  }

  const memberId = typeof req.body?.memberId === 'string' ? req.body.memberId : null;
  const kind = req.body?.kind === 'tier_changed' ? 'tier_changed' : 'points_changed';
  const storeCode = typeof req.body?.storeCode === 'string' ? req.body.storeCode : 'default';

  if (!memberId) {
    res.status(400).json({ message: 'memberId is required' });
    return;
  }

  // No database configured means no push channel; the member app polls instead,
  // so this is a no-op rather than a failure.
  if (!pool) {
    res.json({ published: false, reason: 'no DATABASE_URL configured' });
    return;
  }

  try {
    await pool.query(
      'INSERT INTO loyalty_events (store_code, member_id, kind) VALUES ($1, $2, $3)',
      [storeCode, memberId, kind],
    );
    res.json({ published: true });
  } catch (err) {
    // A member app that misses a push falls back to polling, so a failure here
    // is worth logging and not worth failing the caller's flow over.
    console.error('Failed to publish member event', err);
    res.status(502).json({ published: false });
  }
});
