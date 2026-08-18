/** Thin fetch wrapper around the backend BFF. Attaches the stored token. */

/**
 * Absolute API origin for deployed builds.
 *
 * Empty in development, where Vite proxies `/api` to the upstream and the
 * browser sees a single origin. A static deploy has no proxy, so the origin has
 * to be baked in at build time — that is what `VITE_API_BASE_URL` is for.
 * Trailing slashes are trimmed so path concatenation stays predictable.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const TOKEN_KEY = 'loyalty.token';

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

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
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

export interface Member {
  customerId: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface Status {
  firstName: string;
  lastName: string;
  points: number;
  totalEarnedPoints: number;
  usedPoints: number;
  levelName: string | null;
  nextLevelName: string | null;
  nextLevelConditionValue: number | null;
  pointsToNextLevel: number | null;
}

export interface Transaction {
  pointsTransferId: string;
  type: 'adding' | 'spending';
  value: number;
  comment?: string;
  createdAt: string;
}

export interface Reward {
  campaignId: string;
  name: string;
  description: string;
  costInPoints: number;
  unitsAvailable: number | null;
  canRedeem: boolean;
}

export const api = {
  login(email: string, password: string) {
    return req<{ token: string; member: Member }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return req<{ token: string; member: Member }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  me() {
    return req<Status>('/api/me');
  },
  transactions() {
    return req<{ transactions: Transaction[] }>('/api/me/transactions');
  },
  rewards() {
    return req<{ rewards: Reward[] }>('/api/rewards');
  },
  redeem(campaignId: string) {
    return req<{ couponCode: string; pointsRemaining: number }>(
      `/api/rewards/${campaignId}/redeem`,
      { method: 'POST' },
    );
  },
};
