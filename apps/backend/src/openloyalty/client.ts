/**
 * Typed OpenLoyalty API client.
 *
 * The single seam between the loyalty app and OpenLoyalty. Paths, payload
 * shapes and field names follow the real OpenLoyalty OpenAPI document vendored
 * at `spec/openloyalty-openapi.json`. In dev this talks to the mock; point
 * `OPENLOYALTY_BASE_URL` at a real instance and nothing else changes.
 */
import { config } from '../config.js';

const { baseUrl, storeCode } = config.openLoyalty;

export class OpenLoyaltyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'OpenLoyaltyError';
  }
}

/** OpenLoyalty's collection envelope. */
export interface ListResponse<T> {
  items: T[];
  total: { all: number; filtered: number; estimated: boolean };
}

export interface TokenPair {
  token: string;
  refresh_token: string;
}

/** Subset of the spec's CustomerStatus schema. */
export interface CustomerStatus {
  customerId: string;
  firstName: string;
  lastName: string;
  activePoints: number;
  earnedPoints: number;
  spentPoints: number;
  expiredPoints: number;
  lockedPoints: number;
  levelName: string | null;
  levelConditionValue: number;
  nextLevelName: string | null;
  nextLevelConditionValue: number | null;
  pointsToNextLevel: number | null;
  currency: string;
}

/** Subset of the spec's Transfer schema. */
export interface Transfer {
  transferId: string;
  type: 'adding' | 'spending';
  value: number;
  comment?: string;
  cancelled: boolean;
  pending: boolean;
  createdAt: string;
}

/** Subset of the spec's MemberRewardResponse schema. */
export interface MemberReward {
  rewardId: string;
  reward: string;
  name: string;
  shortDescription: string;
  costInPoints: number;
  active: boolean;
  usageLimit: number | null;
  canBeBoughtByCustomer?: boolean;
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new OpenLoyaltyError(res.status, body?.message ?? res.statusText);
  }
  return body as T;
}

/**
 * OpenLoyalty puts the authenticated identity in the JWT payload — that is how
 * a client learns its own member id. We only decode (never trust) it here; the
 * token is verified upstream by OpenLoyalty on every call.
 */
export function memberIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    const claims = JSON.parse(json) as { id?: string; sub?: string };
    return claims.id ?? claims.sub ?? null;
  } catch {
    return null;
  }
}

export const openLoyalty = {
  storeCode,

  memberLogin(email: string, password: string): Promise<TokenPair> {
    return request<TokenPair>(`/api/${storeCode}/member/login_check`, {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    });
  },

  /** Spec nests the payload under `customer` and expects `plainPassword`. */
  register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ customerId: string; email: string }> {
    return request(`/api/${storeCode}/member/register`, {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          plainPassword: input.password,
          agreement1: true,
        },
      }),
    });
  },

  status(token: string, memberId: string): Promise<CustomerStatus> {
    return request<CustomerStatus>(
      `/api/${storeCode}/member/${memberId}/status`,
      { token },
    );
  },

  /** Logged member's points transfers. */
  points(token: string): Promise<ListResponse<Transfer>> {
    return request(`/api/${storeCode}/member/points`, { token });
  },

  /** Rewards available to the logged member. */
  rewards(token: string): Promise<ListResponse<MemberReward>> {
    return request(`/api/${storeCode}/member/reward`, { token });
  },

  /** Spec returns an array of `{ issuedRewardId }`. */
  buyReward(
    token: string,
    rewardId: string,
  ): Promise<Array<{ issuedRewardId: string }>> {
    return request(`/api/${storeCode}/reward/${rewardId}/buy`, {
      method: 'POST',
      token,
      body: JSON.stringify({}),
    });
  },

  /** Rewards the logged member has already bought. */
  boughtRewards(
    token: string,
  ): Promise<ListResponse<{ issuedRewardId: string; couponCode: string; reward: string | null }>> {
    return request(`/api/${storeCode}/member/reward/bought`, { token });
  },
};
