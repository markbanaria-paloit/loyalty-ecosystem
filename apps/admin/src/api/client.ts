/**
 * OpenLoyalty admin API client.
 *
 * Unlike the PWA (which goes through the BFF), the cockpit speaks raw
 * OpenLoyalty — same as the real admin console. Paths and payloads follow
 * `spec/openloyalty-openapi.json`.
 */
const TOKEN_KEY = 'cockpit.token';
export const STORE_CODE = import.meta.env.VITE_STORE_CODE ?? 'default';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** OpenLoyalty's collection envelope. */
export interface ListResponse<T> {
  items: T[];
  total: { all: number; filtered: number; estimated: boolean };
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }
  return body as T;
}

const s = () => `/api/${STORE_CODE}`;

export interface Member {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
  levelId: string;
  levelName: string | null;
  activePoints: number;
  earnedPoints: number;
  spentPoints: number;
}

export interface Tier {
  levelId: string;
  name: string;
  conditions: Array<{ conditionId: string; attribute: string; value: number }>;
}

export interface Reward {
  rewardId: string;
  reward: string;
  name: string;
  shortDescription: string;
  costInPoints: number;
  active: boolean;
  featured: boolean;
  levels: string[];
  usageLimit: number | null;
  createdAt: string;
}

export interface Transfer {
  transferId: string;
  type: 'adding' | 'spending';
  value: number;
  comment?: string;
  createdAt: string;
  customerName: string;
  customerEmail: string | null;
}

export interface Redemption {
  issuedRewardId: string;
  couponCode: string;
  status: string;
  createdAt: string;
  customerName: string;
  rewardName: string;
  costInPoints: number;
}

export interface Stats {
  totalMembers: number;
  activeMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  outstandingPoints: number;
  totalRedemptions: number;
  activeRewards: number;
  membersByTier: Array<{
    levelId: string;
    name: string;
    threshold: number;
    count: number;
  }>;
}

export const api = {
  async login(username: string, password: string) {
    const res = await req<{ token: string }>('/api/admin/login_check', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(res.token);
    return res;
  },

  stats: () => req<Stats>(`${s()}/admin/stats`),
  members: () => req<ListResponse<Member>>(`${s()}/member`),
  tiers: () => req<ListResponse<Tier>>(`${s()}/tier`),
  rewards: () => req<ListResponse<Reward>>(`${s()}/reward`),
  transfers: () => req<ListResponse<Transfer>>(`${s()}/points`),
  redemptions: () => req<ListResponse<Redemption>>(`${s()}/redemption`),

  /** Spec wraps the payload as `{ transfer: {...} }`. */
  addPoints: (customer: string, points: number, comment: string) =>
    req<{ transferId: string }>(`${s()}/points/add`, {
      method: 'POST',
      body: JSON.stringify({ transfer: { customer, points, comment } }),
    }),
  spendPoints: (customer: string, points: number, comment: string) =>
    req<{ transferId: string }>(`${s()}/points/spend`, {
      method: 'POST',
      body: JSON.stringify({ transfer: { customer, points, comment } }),
    }),

  setMemberActive: (customerId: string, active: boolean) =>
    req<{ active: boolean }>(
      `${s()}/member/${customerId}/${active ? 'activate' : 'deactivate'}`,
      { method: 'POST' },
    ),

  createReward: (input: {
    name: string;
    shortDescription: string;
    costInPoints: number;
    levels: string[];
    usageLimit: number | null;
  }) => req<Reward>(`${s()}/reward`, { method: 'POST', body: JSON.stringify(input) }),

  setRewardActive: (rewardId: string, active: boolean) =>
    req<Reward>(`${s()}/reward/${rewardId}/${active ? 'activate' : 'deactivate'}`, {
      method: 'POST',
    }),
};
