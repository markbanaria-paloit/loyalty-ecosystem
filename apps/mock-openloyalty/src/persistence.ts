/**
 * Loading and saving a store.
 *
 * The `Store` is eight `Map`s and a number. `JSON.stringify` turns a `Map` into
 * `{}` without complaining, so serialisation here is explicit in both
 * directions rather than left to the default — a silent empty store is exactly
 * the failure this layer exists to prevent.
 */
import type { PoolClient } from 'pg';
import { pool } from './db.js';
import {
  seedStore,
  stores,
  type Campaign,
  type Customer,
  type IssuedReward,
  type Reward,
  type Store,
  type Tier,
  type TierSet,
  type Transaction,
  type Transfer,
} from './data.js';

/** The store as JSON: every `Map` becomes a plain object keyed the same way. */
interface StoreSnapshot {
  tierSets: Record<string, TierSet>;
  tiers: Record<string, Tier>;
  customers: Record<string, Customer>;
  transfers: Record<string, Transfer>;
  rewards: Record<string, Reward>;
  issuedRewards: Record<string, IssuedReward>;
  transactions: Record<string, Transaction>;
  campaigns: Record<string, Campaign>;
  basePointsPerCurrencyUnit: number;
}

export function serialize(store: Store): StoreSnapshot {
  // `pendingEvents` is deliberately absent: it is per-request, not state.
  return {
    tierSets: Object.fromEntries(store.tierSets),
    tiers: Object.fromEntries(store.tiers),
    customers: Object.fromEntries(store.customers),
    transfers: Object.fromEntries(store.transfers),
    rewards: Object.fromEntries(store.rewards),
    issuedRewards: Object.fromEntries(store.issuedRewards),
    transactions: Object.fromEntries(store.transactions),
    campaigns: Object.fromEntries(store.campaigns),
    basePointsPerCurrencyUnit: store.basePointsPerCurrencyUnit,
  };
}

export function hydrate(snapshot: StoreSnapshot): Store {
  return {
    // Transient: events belong to the request that raised them.
    pendingEvents: [],
    tierSets: new Map(Object.entries(snapshot.tierSets ?? {})),
    tiers: new Map(Object.entries(snapshot.tiers ?? {})),
    customers: new Map(Object.entries(snapshot.customers ?? {})),
    transfers: new Map(Object.entries(snapshot.transfers ?? {})),
    rewards: new Map(Object.entries(snapshot.rewards ?? {})),
    issuedRewards: new Map(Object.entries(snapshot.issuedRewards ?? {})),
    transactions: new Map(Object.entries(snapshot.transactions ?? {})),
    campaigns: new Map(Object.entries(snapshot.campaigns ?? {})),
    basePointsPerCurrencyUnit: snapshot.basePointsPerCurrencyUnit ?? 1,
  };
}

/**
 * A store checked out for the duration of one request.
 *
 * `release` must be called exactly once, and it is what commits the work and
 * frees the lock. Passing `persist: false` rolls back instead — used when the
 * request failed and its mutations should not stand.
 */
export interface CheckedOutStore {
  store: Store;
  release(persist: boolean): Promise<void>;
}

/**
 * Take the store for `code`, creating and seeding it if this is the first time
 * anyone has asked.
 *
 * The advisory lock is held for the transaction, so concurrent requests against
 * one store queue rather than interleave. Without it two instances could each
 * read, mutate and write the whole document, and the second would erase the
 * first — the lost-update problem that a document model invites.
 */
export async function checkOutStore(code: string): Promise<CheckedOutStore> {
  // No database configured: fall back to the process-local store, exactly as
  // this service behaved before.
  if (!pool) {
    const store = stores.get(code) ?? seedStore(code);
    return { store, release: async () => {} };
  }

  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    // hashtext gives a stable bigint from the store code; the lock is released
    // when the transaction ends, whichever way it ends.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [code]);

    const existing = await client.query<{ snapshot: StoreSnapshot }>(
      'SELECT snapshot FROM stores WHERE code = $1',
      [code],
    );

    let store: Store;
    if (existing.rowCount && existing.rows[0]) {
      store = hydrate(existing.rows[0].snapshot);
    } else {
      // Seed once. Two cold-starting instances can reach here together, so the
      // insert tolerates the race rather than assuming it away.
      store = seedStore(code);
      await client.query(
        'INSERT INTO stores (code, snapshot) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [code, JSON.stringify(serialize(store))],
      );
      const reread = await client.query<{ snapshot: StoreSnapshot }>(
        'SELECT snapshot FROM stores WHERE code = $1',
        [code],
      );
      if (reread.rows[0]) store = hydrate(reread.rows[0].snapshot);
    }

    // Only write when something actually changed, so a page of reads does not
    // rewrite the document each time.
    const before = JSON.stringify(serialize(store));

    return {
      store,
      async release(persist: boolean) {
        try {
          if (persist) {
            const after = JSON.stringify(serialize(store));
            if (after !== before) {
              await client.query(
                'UPDATE stores SET snapshot = $2, updated_at = now() WHERE code = $1',
                [code, after],
              );
            }
            // Events commit with the state that caused them. A client cannot be
            // told to re-read a change that then fails to persist.
            for (const event of store.pendingEvents) {
              await client.query(
                'INSERT INTO loyalty_events (store_code, member_id, kind) VALUES ($1, $2, $3)',
                [code, event.memberId, event.kind],
              );
            }
            await client.query('COMMIT');
          } else {
            await client.query('ROLLBACK');
          }
        } finally {
          client.release();
        }
      },
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    throw err;
  }
}

/** Drop a store so the next request reseeds it. The demo's reset button. */
export async function resetStore(code: string): Promise<void> {
  stores.delete(code);
  if (pool) await pool.query('DELETE FROM stores WHERE code = $1', [code]);
}
