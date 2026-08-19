/**
 * Typed OpenLoyalty API client.
 *
 * The single seam between the loyalty app and OpenLoyalty. Paths, payload
 * shapes and field names follow the real OpenLoyalty OpenAPI document vendored
 * at `spec/openloyalty-openapi.json`. In dev this talks to the mock; point
 * `OPENLOYALTY_BASE_URL` at a real instance and nothing else changes.
 */
import { config } from '../config.js';
import { authHeaders, clearAdminToken } from '../studio/olAdmin.js';

const { baseUrl, storeCode, apiKey } = config.openLoyalty;

export class OpenLoyaltyError extends Error {
  constructor(
    public status: number,
    message: string,
    /**
     * The upstream body, kept whole for a rejection that explains nothing.
     *
     * Open Loyalty sometimes answers a bad payload with a bare "Validation
     * failed" and no structure to read, and without this there is no way to
     * learn which field it objected to short of guessing.
     */
    public detail?: string,
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

/**
 * A reward the member has taken, as the platform records it.
 *
 * `reward` carries the reward's name — the spec flattens it onto the issued
 * record rather than nesting the reward itself. `status` is the platform's
 * vocabulary (`issued`, `completed`, `rejected`, …), which is what makes this
 * the answer to "has this coupon been used": the till writes it, and the member
 * app reads it rather than tracking a copy.
 */
export interface IssuedReward {
  issuedRewardId: string;
  couponCode: string;
  reward: string | null;
  status: string;
  createdAt: string;
  /**
   * The coupon itself. `usedAt` is set when it is spent, and is the fact a
   * member cares about — `status` above tracks fulfilment, which is a different
   * question and moves independently.
   */
  issuedCoupon?: { code: string; usedAt: string | null };
}

/** Subset of the spec's MemberRewardResponse schema. */
export interface MemberReward {
  rewardId: string;
  /**
   * What kind of reward this is — `static_coupon`, `dynamic_coupon`,
   * `conversion_coupon`, `material`. Not a name or a slug: the spec's create
   * bodies use this same field for the type, and buying one requires a payload
   * shaped to match it.
   */
  reward: string;
  name: string;
  shortDescription: string;
  costInPoints: number;
  active: boolean;
  usageLimit: number | null;
  canBeBoughtByCustomer?: boolean;
  /** Carried on a dynamic coupon, whose value is set when it is bought. */
  couponValue?: number | null;
}

/**
 * The reasons behind a rejected form.
 *
 * Open Loyalty answers a bad payload with a flat "Validation failed" and puts
 * what was actually wrong somewhere else — sometimes a list of
 * `{path, message}`, more often a Symfony form tree where each field hangs off
 * `errors.children.<field>.errors`. Reading only the message threw away the one
 * part that says what to fix, which is how a rejected purchase reached a member
 * as three words that named neither the field nor the reason.
 */
function formErrors(body: unknown): string {
  const seen: string[] = [];

  const walk = (node: unknown, path: string) => {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;

    if (Array.isArray(n.errors)) {
      for (const e of n.errors) {
        const text =
          typeof e === 'string'
            ? e
            : ((e as { message?: string })?.message ?? '');
        const at = (e as { path?: string })?.path ?? path;
        if (text) seen.push(at ? `${at}: ${text}` : text);
      }
    } else if (n.errors) {
      walk(n.errors, path);
    }

    if (n.children && typeof n.children === 'object') {
      for (const [field, child] of Object.entries(
        n.children as Record<string, unknown>,
      )) {
        walk(child, path ? `${path}.${field}` : field);
      }
    }
  };

  walk(body, '');
  // Deduplicated: a form tree repeats the same complaint at several depths.
  return [...new Set(seen)].join('; ');
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
  retry = true,
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // A member token identifies the member and is used when one is supplied.
      // Everything else here is admin-scoped — activating a member, assigning a
      // tier, reading tier progress — and authenticates as the admin does: the
      // store's API key where one is configured, a `login_check` JWT otherwise.
      // Shared with the admin client rather than reimplemented, so an
      // unconfigured key falls back here exactly as it does there instead of
      // going out unauthenticated and coming back 401.
      ...(token ? { Authorization: `Bearer ${token}` } : await authHeaders()),
      ...headers,
    },
  });

  // An expired admin JWT is worth one retry; a member token is the caller's to
  // renew, and a static API key cannot be refreshed at all.
  if (res.status === 401 && retry && !token && !apiKey) {
    clearAdminToken();
    return request<T>(path, init, false);
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const detail = formErrors(body);
    // A rejection that explains nothing is worth logging whole. Open Loyalty
    // sometimes answers a bad payload with a bare "Validation failed", and
    // without the body there is no way to learn which field it objected to
    // short of guessing — which is how this cost an afternoon.
    if (!detail && res.status >= 400 && res.status < 500) {
      console.error(
        `Open Loyalty rejected ${init.method ?? 'GET'} ${path}: ${text.slice(0, 800)}`,
      );
    }
    throw new OpenLoyaltyError(
      res.status,
      detail || body?.message || res.statusText,
      text.slice(0, 800),
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

  /**
   * Buy a reward for a member. Returns an array of `{ issuedRewardId }`.
   *
   * The body is not optional and its shape depends on what kind of reward this
   * is: every kind wants `customerId`, the counted kinds want `quantity` and
   * `withoutPoints`, and a dynamic coupon wants the value to put on it. Sending
   * an empty object is a 400 — which is what this used to do, and what the mock
   * used to accept.
   *
   * `withoutPoints` is false because this is the member spending their own
   * balance. True is for a reward granted without charging for it, which is an
   * administrator's act, not a member's.
   */
  async buyReward(
    token: string,
    rewardId: string,
    member: string,
    reward?: { type?: string | null; couponValue?: number | null },
  ): Promise<Array<{ issuedRewardId: string }>> {
    const type = reward?.type ?? 'static_coupon';

    /**
     * The shapes worth trying, best first.
     *
     * The spec describes this body as one of four schemas and the tenant
     * accepts neither an empty object nor the full schema — it answers "this
     * form should not contain extra fields", which says a field we send is not
     * one it wants but not which. Rather than guess once and be wrong again,
     * the shapes are tried in order of how well the spec supports them, and a
     * rejection for having extra fields moves to the next narrower one.
     *
     * Safe to retry: a rejected buy issues nothing and takes no points, so the
     * only cost of a wrong guess is the round trip. The shape that works is
     * logged, because the tenant's real contract is worth knowing once rather
     * than rediscovering.
     */
    const candidates: Array<[string, Record<string, unknown>]> = [
      type === 'conversion_coupon'
        ? ['customerId only (conversion)', { customerId: member }]
        : [
            'spec shape',
            {
              customerId: member,
              quantity: 1,
              withoutPoints: false,
              ...(type === 'dynamic_coupon'
                ? { couponValue: reward?.couponValue ?? 0 }
                : {}),
            },
          ],
      // "This form should not contain extra fields" is a complaint about
      // surplus, not absence, so the shapes below strip fields away one at a
      // time rather than adding them. `withoutPoints` is the first to go: it
      // decides whether the platform charges for the reward, which is an
      // administrator's choice and not a member's to send.
      ['without withoutPoints', { customerId: member, quantity: 1 }],
      ['quantity only', { quantity: 1 }],
      ['customerId only', { customerId: member }],
      // The member's own token already says who they are, so a store may treat
      // naming them as the surplus field.
      ['quantity and withoutPoints', { quantity: 1, withoutPoints: false }],
      ['empty', {}],
    ];

    let lastError: unknown = null;
    for (const [label, body] of candidates) {
      try {
        const issued = await request<Array<{ issuedRewardId: string }>>(
          `/api/${storeCode}/reward/${rewardId}/buy`,
          { method: 'POST', token, body: JSON.stringify(body) },
        );
        if (label !== candidates[0][0]) {
          console.warn(
            `Reward purchase accepted the "${label}" body, not the spec's — this store's form differs from the vendored schema.`,
          );
        }
        return issued;
      } catch (err) {
        lastError = err;
        // Only a rejected form is worth reshaping for. Not enough points, an
        // inactive reward or a tier that may not have it are real answers, and
        // trying a different shape would only bury them.
        const rejectedForm =
          err instanceof OpenLoyaltyError &&
          err.status === 400 &&
          // "Validation failed" belongs here too. It is what this store says
          // when it will not name a field, and leaving it out stopped the
          // search at the first shape — which is the same as not searching.
          /extra fields|should not contain|required|not valid|validation failed/i.test(
            err.message,
          );
        if (!rejectedForm) throw err;
      }
    }
    throw lastError;
  },

  /**
   * Mark a coupon as used, against the member who holds it.
   *
   * The spec's integration endpoint for a point of sale. Distinct from moving
   * an issued reward's status: this consumes the coupon and answers 409 if it
   * has already been consumed, which is what stops the same code being spent
   * twice. A status change carries no such guard.
   */
  consumeCoupon(
    memberId: string,
    couponCode: string,
  ): Promise<{ code: string; used: boolean; customerId: string }> {
    return request(`/api/${storeCode}/member/${memberId}/reward/redeem`, {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  },

  /** The undo: mark a coupon unused again. */
  reissueCoupon(
    memberId: string,
    couponCode: string,
  ): Promise<{ code: string; used: boolean; customerId: string }> {
    return request(`/api/${storeCode}/member/${memberId}/reward/reissue`, {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  },

  /**
   * Every issued reward on the store, newest first.
   *
   * The only documented way to find one by its coupon code — Open Loyalty has
   * no by-code lookup, so the match is made on the way back.
   */
  redemptions(
    page = 1,
    itemsOnPage = 50,
  ): Promise<
    ListResponse<
      IssuedReward & { customerId: string; name?: string; costInPoints?: number }
    >
  > {
    return request(
      `/api/${storeCode}/redemption?page=${page}&itemsOnPage=${itemsOnPage}`,
    );
  },

  /** Move an issued reward along the fulfilment pipeline. */
  setRedemptionStatus(issuedRewardId: string, status: string): Promise<void> {
    return request(`/api/${storeCode}/redemption/${issuedRewardId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  /** Rewards the logged member has already bought. */
  boughtRewards(token: string): Promise<ListResponse<IssuedReward>> {
    return request(`/api/${storeCode}/member/reward/bought`, { token });
  },
};
