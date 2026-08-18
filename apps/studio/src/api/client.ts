/**
 * Campaign studio client. Talks to the backend, which owns both the Anthropic
 * key and the OpenLoyalty admin session.
 */

/**
 * Absolute API origin for deployed builds.
 *
 * Empty in development, where Vite proxies `/api` to the upstream and the
 * browser sees a single origin. A static deploy has no proxy, so the origin has
 * to be baked in at build time — that is what `VITE_API_BASE_URL` is for.
 * Trailing slashes are trimmed so path concatenation stays predictable.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, body?.message ?? res.statusText);
  return body as T;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolActivity {
  name: string;
  summary: string;
  detail?: unknown;
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

export interface Campaign extends CampaignDraft {
  campaignId: string;
  active: boolean;
  createdAt: string;
  condition: {
    categories: string[];
    tierIds: string[];
    minTransactionValue: number;
  };
  /** Campaign window, per the spec's campaign-level `activity` object. */
  activity: { startsAt: string | null; endsAt: string | null };
}

export interface StudioReply {
  reply: string;
  activity: ToolActivity[];
  simulation?: { draft: CampaignDraft; result: Simulation };
  createdCampaignId?: string;
  mode: 'claude' | 'offline';
}

export interface StudioContext {
  mode: 'claude' | 'offline';
  model: string | null;
  storeCode: string;
  tiers: Array<{ levelId: string; name: string }>;
  campaigns: Campaign[];
  categories: Array<{ category: string; transactions: number; grossValue: number }>;
}

export const api = {
  context: () => req<StudioContext>('/api/studio/context'),
  campaigns: () => req<{ campaigns: Campaign[] }>('/api/studio/campaigns'),
  chat: (messages: ChatTurn[]) =>
    req<StudioReply>('/api/studio/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
};
