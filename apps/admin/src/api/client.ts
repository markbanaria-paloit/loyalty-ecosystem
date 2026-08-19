/**
 * Campaign Admin API client.
 *
 * Speaks Open Loyalty's vocabulary — paths and payloads follow
 * `spec/openloyalty-openapi.json` — but reaches it through the backend rather
 * than directly. The store credential that used to ship in this bundle now
 * stays on the server; the console signs in as an operator and gets a session
 * scoped to programme configuration.
 */

/**
 * Absolute API origin for deployed builds.
 *
 * Empty in development, where Vite proxies `/api` to the upstream and the
 * browser sees a single origin. A static deploy has no proxy, so the origin has
 * to be baked in at build time — that is what `VITE_API_BASE_URL` is for.
 * Trailing slashes are trimmed so path concatenation stays predictable.
 */
/**
 * Absolute origin of the **backend**, not of Open Loyalty. This used to point at
 * the loyalty platform; pointing it back would send unauthenticated calls at a
 * service that has never heard of an operator session.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
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

/**
 * Operator-scoped route to Open Loyalty. The store code lives on the server, so
 * the console no longer needs to know which tenant it is configuring.
 */
const s = () => '/api/ol';

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

/**
 * Metrics a tier set can qualify members on, from `PostTierSet` in the spec.
 * The labels are the ones the OpenLoyalty console shows in its condition picker.
 */
export type TierConditionAttribute =
  | 'activeUnits'
  | 'totalEarnedUnits'
  | 'totalSpending'
  | 'monthsSinceJoiningProgram'
  | 'cumulatedEarnedUnits';

export const CONDITION_ATTRIBUTES: TierConditionAttribute[] = [
  'activeUnits',
  'totalEarnedUnits',
  'totalSpending',
  'monthsSinceJoiningProgram',
  'cumulatedEarnedUnits',
];

export const CONDITION_LABELS: Record<TierConditionAttribute, string> = {
  activeUnits: 'Active units',
  totalEarnedUnits: 'Total earned units',
  totalSpending: 'Total spending (SGD)',
  monthsSinceJoiningProgram: 'Months since joining the program',
  cumulatedEarnedUnits: 'Cumulative earned units',
};

export const CONDITION_HINTS: Record<TierConditionAttribute, string> = {
  activeUnits: 'Points currently spendable on the member’s balance.',
  totalEarnedUnits: 'Every point the member has ever earned.',
  totalSpending: 'Gross value of the member’s matched purchases.',
  monthsSinceJoiningProgram: 'Whole months since the member enrolled.',
  cumulatedEarnedUnits: 'Earned points since the last recalculation cycle.',
};

/** Unit-based attributes carry a wallet; the others do not. */
export function isUnitAttribute(attribute: TierConditionAttribute): boolean {
  return (
    attribute === 'activeUnits' ||
    attribute === 'totalEarnedUnits' ||
    attribute === 'cumulatedEarnedUnits'
  );
}

export interface TierSetCondition {
  id: string;
  attribute: TierConditionAttribute;
  walletType?: string;
}

export interface TierCondition {
  conditionId: string;
  attribute: TierConditionAttribute;
  value: number;
}

export interface Tier {
  levelId: string;
  tierSet: { tierSetId: string; name: string };
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  sortOrder: number;
  conditions: TierCondition[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TierSet {
  tierSetId: string;
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  conditions: TierSetCondition[];
  downgrade: { mode: 'none' | 'automatic' };
  tiers: Tier[];
  createdAt: string;
  updatedAt: string;
}

/** What starts a campaign. Mirrors the mock's `CampaignTrigger`. */
export type CampaignTrigger = 'transaction' | 'internal_event' | 'time';

export type CampaignTimeStrategy =
  | 'birthday'
  | 'registration_anniversary'
  | 'daily'
  | 'weekly'
  | 'monthly';

/**
 * One ceiling, in the spec's `Limit` shape. `interval` is round-tripped but the
 * mock engine enforces limits lifetime-to-date, not per window.
 */
export interface CampaignLimit {
  value: number;
  interval?: { type: string } | null;
}

export interface CampaignLimits {
  points: CampaignLimit | null;
  pointsPerMember: CampaignLimit | null;
  executionsPerMember: CampaignLimit | null;
}

export interface CampaignDraft {
  name: string;
  description: string;
  trigger: CampaignTrigger;
  event?: string | null;
  triggerStrategy?: {
    type: CampaignTimeStrategy;
    executionSchedule?: { dayOfWeek: number[]; dayOfMonth: Array<number | 'L'> } | null;
  } | null;
  displayOrder: number;
  /** When the campaign runs — the spec's campaign-level `activity` object. */
  activity: { startsAt: string | null; endsAt: string | null };
  condition: {
    categories: string[];
    tierIds: string[];
    minTransactionValue: number;
  };
  effect: { type: 'multiplier' | 'bonus_points'; value: number };
  limits: CampaignLimits;
  visibility: { target: 'none' | 'tier'; tiers: string[] };
}

export interface Campaign extends CampaignDraft {
  campaignId: string;
  active: boolean;
  event: string | null;
  stats: {
    executions: number;
    pointsIssued: number;
    executionsByMember: Record<string, number>;
    pointsByMember: Record<string, number>;
  };
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
  activeCampaigns: number;
  campaignPointsIssued: number;
  tierSet: { tierSetId: string; name: string; conditions: TierSetCondition[] } | null;
  membersByTier: Array<{
    levelId: string;
    name: string;
    threshold: number;
    active: boolean;
    conditions: TierCondition[];
    count: number;
  }>;
  campaignPerformance: Array<{
    campaignId: string;
    name: string;
    trigger: CampaignTrigger;
    active: boolean;
    executions: number;
    pointsIssued: number;
  }>;
}

export const api = {
  async login(username: string, password: string) {
    const res = await req<{ token: string }>('/api/console/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(res.token);
    return res;
  },

  stats: () => req<Stats>(`${s()}/admin/stats`),
  members: () => req<ListResponse<Member>>(`${s()}/member`),
  /**
   * Tiers, lowest first.
   *
   * Sorted here because the platform returns them in creation order — a live
   * tenant answers with Tier 2 ahead of Tier 1 — and everything that reads this
   * treats position as rank.
   */
  tiers: async () => {
    const res = await req<ListResponse<Tier>>(`${s()}/tier`);
    const threshold = (t: Tier) => {
      const values = (t.conditions ?? [])
        .map((c) => Number(c.value))
        .filter((n) => Number.isFinite(n));
      return values.length ? Math.min(...values) : 0;
    };
    return { ...res, items: [...res.items].sort((a, b) => threshold(a) - threshold(b)) };
  },
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

  /* ---------------------------- Tier sets --------------------------- *
   * Conditions live on the set; each tier supplies a value for each of
   * them. Saving either half re-runs member recalculation server-side,
   * which is why these responses carry `membersRecalculated`.
   * ------------------------------------------------------------------ */

  tierSets: () => req<ListResponse<TierSet>>(`${s()}/tierSet`),
  tierSet: (tierSetId: string) => req<TierSet>(`${s()}/tierSet/${tierSetId}`),

  createTierSet: (input: {
    name: string;
    description: string;
    active: boolean;
    conditions: Array<{ attribute: TierConditionAttribute }>;
  }) =>
    req<TierSet>(`${s()}/tierSet`, {
      method: 'POST',
      body: JSON.stringify({ tierSet: input }),
    }),

  updateTierSet: (
    tierSetId: string,
    input: {
      name?: string;
      description?: string;
      active?: boolean;
      conditions?: Array<{ id?: string; attribute: TierConditionAttribute }>;
    },
  ) =>
    req<TierSet & { membersRecalculated: number }>(`${s()}/tierSet/${tierSetId}`, {
      method: 'PUT',
      body: JSON.stringify({ tierSet: input }),
    }),

  /** Replace the whole tier list; array order is the tier ranking. */
  saveTierSetTiers: (
    tierSetId: string,
    tiers: Array<{
      levelId?: string;
      name: string;
      description?: string;
      active?: boolean;
      conditions: Array<{ conditionId: string; value: number }>;
    }>,
  ) =>
    req<ListResponse<Tier> & { membersRecalculated: number }>(
      `${s()}/tierSet/${tierSetId}/tiers`,
      { method: 'PUT', body: JSON.stringify({ tiers }) },
    ),

  deleteTier: (levelId: string) =>
    req<void>(`${s()}/tier/${levelId}`, { method: 'DELETE' }),

  setTierActive: (levelId: string, active: boolean) =>
    req<Tier>(`${s()}/tier/${levelId}/${active ? 'activate' : 'deactivate'}`, {
      method: 'POST',
    }),

  recalculateTiers: () =>
    req<{ membersRecalculated: number; totalMembers: number }>(
      `${s()}/tier/recalculate`,
      { method: 'POST' },
    ),

  /* ---------------------------- Campaigns --------------------------- */

  campaigns: () => req<ListResponse<Campaign>>(`${s()}/campaign`),
  campaign: (campaignId: string) => req<Campaign>(`${s()}/campaign/${campaignId}`),

  /** Project a draft's impact. Nothing is persisted. */
  simulateCampaign: (draft: CampaignDraft) =>
    req<{ draft: Campaign; simulation: Simulation }>(`${s()}/campaign/simulate`, {
      method: 'POST',
      body: JSON.stringify({ campaign: draft }),
    }),

  createCampaign: (draft: CampaignDraft) =>
    req<Campaign>(`${s()}/campaign`, {
      method: 'POST',
      body: JSON.stringify({ campaign: draft }),
    }),

  updateCampaign: (campaignId: string, draft: Partial<CampaignDraft>) =>
    req<Campaign>(`${s()}/campaign/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify({ campaign: draft }),
    }),

  setCampaignActive: (campaignId: string, active: boolean) =>
    req<Campaign>(`${s()}/campaign/${campaignId}/${active ? 'activate' : 'deactivate'}`, {
      method: 'POST',
    }),

  deleteCampaign: (campaignId: string) =>
    req<void>(`${s()}/campaign/${campaignId}`, { method: 'DELETE' }),
};
