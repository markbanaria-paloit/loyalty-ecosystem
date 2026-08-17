/**
 * Admin-scoped OpenLoyalty client for the campaign studio.
 *
 * Separate from the member-facing client: this one authenticates as an admin
 * and reads/writes campaign configuration. It caches the admin token and
 * re-authenticates on 401.
 */
import { config } from '../config.js';

const { baseUrl, storeCode, adminUsername, adminPassword } = config.openLoyalty;

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

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = cachedToken ?? (await login());
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (res.status === 401 && retry) {
    cachedToken = null;
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

export interface Tier {
  levelId: string;
  name: string;
  conditions: Array<{ attribute: string; value: number }>;
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
    startsAt: string | null;
    endsAt: string | null;
  };
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

  async tiers(): Promise<Tier[]> {
    const { items } = await request<ListEnvelope<Tier>>(`${s()}/tier`);
    return items;
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

  setStatus(campaignId: string, active: boolean): Promise<Campaign> {
    return request(`${s()}/campaign/${campaignId}/${active ? 'activate' : 'deactivate'}`, {
      method: 'POST',
    });
  },
};
