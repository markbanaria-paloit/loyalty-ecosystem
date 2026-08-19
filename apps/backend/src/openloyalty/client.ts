/**
 * Typed OpenLoyalty API client.
 *
 * The single seam between the loyalty app and OpenLoyalty. Paths, payload
 * shapes and field names follow the real OpenLoyalty OpenAPI document vendored
 * at `spec/openloyalty-openapi.json`. In dev this talks to the mock; point
 * `OPENLOYALTY_BASE_URL` at a real instance and nothing else changes.
 */
import { config } from '../config.js';

const { baseUrl, storeCode, apiKey } = config.openLoyalty;

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
  levelId?: string;
  levelName: string | null;
  /** Rank of the tier within its set; 1 is the entry tier. */
  levelSortOrder?: number | null;
  /** True when the tier was assigned rather than earned on conditions. */
  levelManuallyAssigned?: boolean;
  labels?: Array<{ key: string; value: string }>;
  levelConditionValue: number;
  nextLevelName: string | null;
  nextLevelConditionValue: number | null;
  pointsToNextLevel: number | null;
  currency: string;
  /** Points due to expire within the next month; drives the member's warning. */
  pointsExpiringNextMonth?: number;
}

/** Matches the spec's `TierSetMemberProgress`. */
export interface TierProgress {
  currentTierId: string | null;
  currentTierName: string | null;
  nextTierId: string | null;
  nextTierName: string | null;
  tierSetId: string;
  tierSetName: string;
  currentProgress: number;
  periodStartedAt?: string;
  nextRecalculationAt: string | null;
  manually: boolean;
  downgrade: string;
  nextTierCurrentProgress: Array<{
    conditionId: string;
    attribute: string;
    currentValue: number;
    valueGoal: number;
  }>;
  /** Non-spec: why an otherwise-reachable tier is still out of reach. */
  nextTierEligible?: boolean;
  nextTierMissingLabels?: Array<{ key: string; value: string }>;
}

/** The member record as the admin endpoints return it. */
export interface AdminMemberRecord {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  loyaltyCardNumber?: string | null;
  active: boolean;
  labels?: Array<{ key: string; value: string }>;
  currentLevel?: { levelId: string; name: string } | null;
  manuallyAssignedLevelId?: string | null;
}

/** What an enrolment campaign did for a member as they joined. */
export interface CampaignPayout {
  campaignId: string;
  name: string;
  points: number;
  assignedTier: { levelId: string; name: string } | null;
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
      // A member token identifies the member and is used when one is supplied.
      // Everything else here is admin-scoped — activating a member, assigning a
      // tier — and authenticates with the store's API key. Without this those
      // calls go out unauthenticated and come back 401.
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : apiKey
          ? { 'X-AUTH-TOKEN': apiKey }
          : {}),
      ...headers,
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    // Open Loyalty answers a rejected form with a generic message and the real
    // reasons in `errors[]`. Carrying only the message loses the one thing that
    // says what to fix.
    const detail = Array.isArray(body?.errors)
      ? body.errors
          .map((e: { path?: string; message?: string }) =>
            e.path ? `${e.path}: ${e.message}` : e.message,
          )
          .filter(Boolean)
          .join('; ')
      : '';
    throw new OpenLoyaltyError(
      res.status,
      detail || body?.message || res.statusText,
    );
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
    /**
     * The identifier the member's QR encodes. A till scans it and OpenLoyalty
     * matches the sale on this value, so it has to be set at registration —
     * a member registered without one can never be matched at the counter.
     */
    loyaltyCardNumber?: string;
    /**
     * Tags describing who the member is (`customerType: union_member`, say).
     * Enrolment campaigns filter on these, so they decide both the welcome
     * award and the tier the member starts on — which is why they must be sent
     * with the registration itself rather than patched on afterwards.
     */
    labels?: Array<{ key: string; value: string }>;
  }): Promise<{
    customerId: string;
    email: string;
    campaignPayouts?: CampaignPayout[];
    status?: CustomerStatus;
  }> {
    return request(`/api/${storeCode}/member/register`, {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          plainPassword: input.password,
          loyaltyCardNumber: input.loyaltyCardNumber,
          labels: input.labels ?? [],
          agreement1: true,
        },
      }),
    });
  },

  /**
   * Activate a member.
   *
   * Open Loyalty creates members inactive, and an inactive member cannot
   * transact. Registration is therefore not complete until this has run.
   */
  activate(memberId: string): Promise<unknown> {
    return request(`/api/${storeCode}/member/${memberId}/activate`, { method: 'POST' });
  },

  /**
   * Put a member on a tier directly.
   *
   * The only way to express membership-based tiering: tier conditions are
   * metric-only, so a member type that should confer a tier cannot qualify for
   * one. An assigned tier overrides the metric and survives later activity.
   */
  assignTier(memberId: string, levelId: string): Promise<unknown> {
    return request(`/api/${storeCode}/member/${memberId}/tier`, {
      method: 'POST',
      body: JSON.stringify({ levelId }),
    });
  },

  /**
   * The full member record.
   *
   * `CustomerStatus` carries neither `levelId` nor `labels`; both live here,
   * as `currentLevel.levelId` and `labels`.
   */
  member(memberId: string): Promise<AdminMemberRecord> {
    return request(`/api/${storeCode}/member/${memberId}`);
  },

  status(token: string, memberId: string): Promise<CustomerStatus> {
    return request<CustomerStatus>(
      `/api/${storeCode}/member/${memberId}/status`,
      { token },
    );
  },

  /**
   * Tier sets this member belongs to.
   *
   * Admin-scoped: a member's own token is refused here (403), even for their
   * own record. Bridging that is what this service is for — the caller has
   * already been authenticated as the member by the route.
   */
  memberTierSets(memberId: string): Promise<ListResponse<{ tierSetId: string }>> {
    return request(`/api/${storeCode}/member/${memberId}/tierSet`);
  },

  /** Where the member stands against the next tier, condition by condition. */
  tierProgress(memberId: string, tierSetId: string): Promise<TierProgress> {
    return request(`/api/${storeCode}/member/${memberId}/tierSet/${tierSetId}`);
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
