/**
 * Admin-scoped OpenLoyalty client for the campaign studio.
 *
 * Separate from the member-facing client: this one authenticates as an admin
 * and reads/writes campaign configuration. It caches the admin token and
 * re-authenticates on 401.
 */
import { config } from '../config.js';

const { baseUrl, storeCode, adminUsername, adminPassword, apiKey } = config.openLoyalty;

export class OpenLoyaltyAdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'OpenLoyaltyAdminError';
  }
}

let cachedToken: string | null = null;

/** Drop the cached admin JWT so the next call logs in again. */
export function clearAdminToken(): void {
  cachedToken = null;
}

async function login(): Promise<string> {
  const res = await fetch(`${baseUrl}/api/admin/login_check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: adminUsername, password: adminPassword }),
  });
  if (!res.ok) {
    throw new OpenLoyaltyAdminError(res.status, 'OpenLoyalty admin login failed');
  }
  const body = (await res.json()) as { token: string };
  cachedToken = body.token;
  return body.token;
}

/**
 * Admin credentials for one request.
 *
 * A configured API key wins and needs no login round trip; otherwise we hold a
 * JWT from `login_check` and re-authenticate when it expires.
 *
 * Exported because the member-facing client makes admin-scoped calls too — tier
 * progress is read that way — and it has no business holding a second copy of
 * the login, the cache and the expiry handling.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  if (apiKey) return { 'X-AUTH-TOKEN': apiKey };
  const token = cachedToken ?? (await login());
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(await authHeaders()),
      ...init.headers,
    },
  });

  // A static API key cannot be refreshed, so only the JWT path retries.
  if (res.status === 401 && retry && !apiKey) {
    clearAdminToken();
    return request<T>(path, init, false);
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new OpenLoyaltyAdminError(res.status, body?.message ?? res.statusText);
  }
  return body as T;
}

const s = () => `/api/${storeCode}`;

/** A member as the admin members-list reports them. */
export interface AdminMember {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  levelId: string;
  levelName: string | null;
  levelManuallyAssigned?: boolean;
  labels?: Array<{ key: string; value: string }>;
  activePoints: number;
  earnedPoints: number;
  createdAt: string;
}

/**
 * A tier's position on the ladder, as a single number.
 *
 * The lowest of its condition values: a tier is reached by meeting all of them,
 * so the smallest is what separates it from the tier below. Values arrive as
 * strings from a live tenant ("1500.000000000000"), hence the coercion.
 */
function tierThreshold(tier: Tier): number {
  const values = (tier.conditions ?? [])
    .map((c) => Number(c.value))
    .filter((n) => Number.isFinite(n));
  return values.length ? Math.min(...values) : 0;
}

export interface Tier {
  levelId: string;
  name: string;
  /** Tiers ordered by rank; entered only by assignment when true. */
  assignmentOnly?: boolean;
  /** A live tenant sends these as decimal strings, not numbers. */
  conditions: Array<{ attribute: string; value: number | string }>;
}

export interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  active: boolean;
  condition: {
    categories: string[];
    tierIds: string[];
    minTransactionValue: number;
  };
  /** Campaign window, per the spec's campaign-level `activity` object. */
  activity: { startsAt: string | null; endsAt: string | null };
  effect: { type: 'multiplier' | 'bonus_points'; value: number };
  createdAt: string;
}

export interface Simulation {
  transactionsEvaluated: number;
  matchingTransactions: number;
  membersAffected: number;
  baselinePoints: number;
  projectedPoints: number;
  additionalPoints: number;
  upliftPercent: number;
  grossValueEvaluated: number;
  sampleImpacts: Array<{
    documentNumber: string;
    customerName: string;
    grossValue: number;
    baselinePoints: number;
    projectedPoints: number;
  }>;
}

/** The shape the studio passes around for a not-yet-created campaign. */
export interface CampaignDraft {
  name: string;
  description?: string;
  effect: { type: 'multiplier' | 'bonus_points'; value: number };
  condition?: {
    categories?: string[];
    tierIds?: string[];
    minTransactionValue?: number;
    startsAt?: string | null;
    endsAt?: string | null;
  };
}

interface ListEnvelope<T> {
  items: T[];
}

export const olAdmin = {
  storeCode,

  /** Every member on the store. */
  async members(): Promise<AdminMember[]> {
    const { items } = await request<ListEnvelope<AdminMember>>(`${s()}/member`);
    return items;
  },

  /**
   * Members carrying a given label, used to find the platform's seeded demo
   * personas without this service holding their ids.
   */
  async membersWithLabel(key: string): Promise<AdminMember[]> {
    return (await olAdmin.members()).filter((m) =>
      (m.labels ?? []).some((l) => l.key === key),
    );
  },

  /**
   * The tier ladder, lowest first.
   *
   * Sorted here rather than trusted: a live tenant returns tiers in creation
   * order, which put Tier 2 ahead of Tier 1 — and rank is what the member app
   * keys its presentation off, so an unsorted list styles every member as the
   * wrong tier. Ordering by threshold is the only ordering that means anything.
   */
  async tiers(): Promise<Tier[]> {
    const { items } = await request<ListEnvelope<Tier>>(`${s()}/tier`);
    return [...items].sort((a, b) => tierThreshold(a) - tierThreshold(b));
  },

  async campaigns(): Promise<Campaign[]> {
    const { items } = await request<ListEnvelope<Campaign>>(`${s()}/campaign`);
    return items;
  },

  /** Product categories actually present in the store's transaction history. */
  async categories(): Promise<Array<{ category: string; transactions: number; grossValue: number }>> {
    const { items } = await request<
      ListEnvelope<{ items: Array<{ category: string; grossValue: number }> }>
    >(`${s()}/transaction`);
    const totals = new Map<string, { transactions: number; grossValue: number }>();
    for (const tx of items) {
      const seen = new Set<string>();
      for (const line of tx.items) {
        const key = line.category.toLowerCase();
        const entry = totals.get(key) ?? { transactions: 0, grossValue: 0 };
        entry.grossValue += line.grossValue;
        if (!seen.has(key)) {
          entry.transactions += 1;
          seen.add(key);
        }
        totals.set(key, entry);
      }
    }
    return [...totals.entries()]
      .map(([category, v]) => ({
        category,
        transactions: v.transactions,
        grossValue: Math.round(v.grossValue * 100) / 100,
      }))
      .sort((a, b) => b.grossValue - a.grossValue);
  },

  simulate(draft: CampaignDraft): Promise<{ draft: Campaign; simulation: Simulation }> {
    return request(`${s()}/campaign/simulate`, {
      method: 'POST',
      body: JSON.stringify({ campaign: draft }),
    });
  },

  create(draft: CampaignDraft): Promise<Campaign> {
    return request(`${s()}/campaign`, {
      method: 'POST',
      body: JSON.stringify({ campaign: draft }),
    });
  },

  /**
   * Pause or resume a campaign.
   *
   * A partial update, which is how the spec models it — the `activate` /
   * `deactivate` routes some deployments expose are not in the OpenAPI document,
   * so calling them would work against the mock and 404 against a real
   * instance.
   */
  setStatus(campaignId: string, active: boolean): Promise<Campaign> {
    return request(`${s()}/campaign/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify({ campaign: { active } }),
    });
  },

  /**
   * Credit a member's account. Granting points is an admin operation in
   * OpenLoyalty — a member cannot award points to themselves — so the enrolment
   * bonus has to be issued server-side with admin credentials.
   */
  addPoints(customerId: string, points: number, comment: string): Promise<unknown> {
    return request(`${s()}/points/add`, {
      method: 'POST',
      body: JSON.stringify({ transfer: { customer: customerId, points, comment } }),
    });
  },

  /** Debit a member's account. Admin-only for the same reason as addPoints. */
  spendPoints(customerId: string, points: number, comment: string): Promise<unknown> {
    return request(`${s()}/points/spend`, {
      method: 'POST',
      body: JSON.stringify({ transfer: { customer: customerId, points, comment } }),
    });
  },
};
