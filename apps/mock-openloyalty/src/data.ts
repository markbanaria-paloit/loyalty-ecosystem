/**
 * In-memory data store for the mock OpenLoyalty server.
 *
 * Field names and shapes follow the real OpenLoyalty OpenAPI document vendored
 * at `spec/openloyalty-openapi.json` — notably the member/tier/reward
 * vocabulary, the `{ items, total }` list envelope, and the CustomerStatus
 * point fields (`activePoints`, `earnedPoints`, `spentPoints`).
 *
 * Everything resets when the process restarts.
 */
import { randomUUID } from 'node:crypto';

/** OpenLoyalty wraps every collection response in this envelope. */
export function listEnvelope<T>(items: T[]) {
  return {
    items,
    total: { all: items.length, filtered: items.length, estimated: false },
  };
}

/**
 * Metrics a tier set can qualify members on.
 *
 * Vocabulary and spelling come straight from `PostTierSet.conditions.attribute`
 * in `spec/openloyalty-openapi.json`. `cumulatedEarnedUnits` is the resettable
 * counterpart of `totalEarnedUnits`; the mock has no recalculation cycle, so
 * the two resolve to the same figure.
 */
export type TierConditionAttribute =
  | 'activeUnits'
  | 'totalEarnedUnits'
  | 'monthsSinceJoiningProgram'
  | 'totalSpending'
  | 'cumulatedEarnedUnits';

export const TIER_CONDITION_ATTRIBUTES: TierConditionAttribute[] = [
  'activeUnits',
  'totalEarnedUnits',
  'totalSpending',
  'monthsSinceJoiningProgram',
  'cumulatedEarnedUnits',
];

/** A condition declared once at tier-set level; every tier supplies a value for it. */
export interface TierSetCondition {
  id: string;
  attribute: TierConditionAttribute;
  /** Present only for unit-based attributes, per the spec. */
  walletType?: string;
}

/**
 * A tier set: the conditions all its tiers are measured on, plus a downgrade
 * policy. OpenLoyalty currently exposes exactly one set per store, which is why
 * `isDefault` exists and why nothing here supports multi-set membership.
 */
export interface TierSet {
  tierSetId: string;
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  conditions: TierSetCondition[];
  /**
   * When members are re-evaluated, per the spec's `Downgrade` object.
   *
   * `periodic` is what makes a condition like "$1.5K annual spend" mean
   * anything: it opens a fresh measurement period on each recalculation, so
   * qualification is judged on the period rather than on a lifetime total.
   */
  downgrade: {
    mode: 'none' | 'automatic' | 'periodic';
    period?: 'yearly' | 'monthly' | 'weekly' | 'registration_anniversary';
  };
  createdAt: string;
  updatedAt: string;
}

/** A tier's threshold for one of its set's conditions. */
export interface TierCondition {
  /** References `TierSetCondition.id` on the owning set. */
  conditionId: string;
  attribute: TierConditionAttribute;
  value: number;
}

export interface Tier {
  levelId: string;
  tierSetId: string;
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  sortOrder: number;
  storeCode: string;
  /**
   * Members are never qualified into this tier automatically — it is entered
   * only by assignment (a campaign effect or an admin).
   *
   * Needed because the condition vocabulary is metric-only: a tier that depends
   * on who a member *is* rather than what they have spent has no threshold that
   * separates them, and a threshold of 0 would otherwise capture everybody.
   */
  assignmentOnly: boolean;
  /**
   * Labels that qualify a member for this tier on their own, whatever their
   * metrics say.
   *
   * A tier can be reached two ways: by meeting its conditions, or by being a
   * kind of member the programme admits directly. Union membership is the
   * second kind — it is not a metric, so it cannot be a condition, and it does
   * not have to be earned. Carrying one of these labels is sufficient; the
   * conditions remain the route for everybody else.
   */
  qualifyingLabels: MemberLabel[];
  /** One entry per condition on the owning tier set. */
  conditions: TierCondition[];
  createdAt: string;
  updatedAt: string;
}

/** A key/value tag on a member, per the spec's `Labels` schema. */
export interface MemberLabel {
  key: string;
  value: string;
}

/**
 * The label that marks a member as a union member.
 *
 * Exactly the pair the stage tenant's campaign matches — `membertype` /
 * `unionmember`, lowercase, no underscore. Their rule compares the label as a
 * string, so the mock has to use the same one or a member who is union here
 * would not be union there, and the tier path would only ever be exercised
 * against one of the two.
 */
export const CUSTOMER_TYPE_LABEL = 'membertype';
export const UNION_MEMBER = 'unionmember';

/**
 * Marks a seeded member as a demo persona, so a caller can find the
 * pre-existing accounts without hardcoding ids that change on every reseed.
 */
export const DEMO_PERSONA_LABEL = 'demoPersona';

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Plaintext — mock only. Real OL takes `plainPassword` and hashes it. */
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'not_disclosed';
  birthDate?: string;
  loyaltyCardNumber?: string;
  agreement1: boolean;
  agreement2?: boolean;
  agreement3?: boolean;
  active: boolean;
  createdAt: string;
  /** Tags describing the member; drives label-filtered campaign targeting. */
  labels: MemberLabel[];
  /**
   * Start of the member's current qualification period. Period-scoped metrics
   * (spend, cumulated units) are measured from here, and recalculation moves
   * it forward.
   */
  periodStartedAt: string;
  lastPromotionAt: string | null;
  lastDowngradeAt: string | null;
  levelId: string;
  /**
   * Tier held by assignment rather than by meeting conditions.
   *
   * OpenLoyalty marks such a tier as manually held so it survives automatic
   * downgrade — which is the only way a tier nobody can qualify for on metrics
   * (union membership, say) can stick. Cleared by `remove-manually-level`.
   */
  manualLevelId: string | null;
  /** Spendable balance -> serialized as `activePoints`. */
  activePoints: number;
  earnedPoints: number;
  spentPoints: number;
  expiredPoints: number;
  lockedPoints: number;
  blockedPoints: number;
}

export interface Transfer {
  transferId: string;
  /** OpenLoyalty uses 'adding' | 'spending'. */
  type: 'adding' | 'spending';
  accountId: string;
  value: number;
  comment?: string;
  cancelled: boolean;
  pending: boolean;
  createdAt: string;
  expiresAt?: string;
  actionCause?: {
    rewardId?: string;
    issuedRewardId?: string;
    transactionId?: string;
    campaignId?: string;
  };
}

export interface Reward {
  rewardId: string;
  /** OpenLoyalty's `reward` field carries the identifier/slug. */
  reward: string;
  name: string;
  shortDescription: string;
  costInPoints: number;
  active: boolean;
  featured: boolean;
  public: boolean;
  /** Tier ids allowed to redeem; empty = all tiers. */
  levels: string[];
  /** null = unlimited. */
  usageLimit: number | null;
  createdAt: string;
}

/** Statuses come from the spec's RedemptionStatusRequestBody enum. */
export type RedemptionStatus =
  | 'issued'
  | 'pending'
  | 'approved'
  | 'packing'
  | 'awaiting_shipping'
  | 'shipped'
  | 'returned'
  | 'completed'
  | 'canceled'
  | 'rejected';

export interface IssuedReward {
  issuedRewardId: string;
  rewardId: string;
  customerId: string;
  couponCode: string;
  /**
   * Whether the coupon itself has been spent, and when.
   *
   * Deliberately not the same thing as `status`. `status` is the fulfilment
   * pipeline an order moves through — issued, packing, shipped, completed —
   * and `usedAt` is the single fact of the code having been handed over and
   * consumed. The spec keeps them apart: the status endpoints drive one, and
   * `member/{id}/reward/redeem` drives the other. A coupon can be completed and
   * never used, or used while still issued.
   */
  usedAt: string | null;
  status: RedemptionStatus;
  createdAt: string;
  statusHistory: Array<{ status: RedemptionStatus; comment?: string; at: string }>;
}

/**
 * An issued reward in the shape the spec's `issuedReward` schema describes.
 *
 * The coupon is nested there, carrying its own `usedAt`, which is where a
 * caller learns the code has been spent. `couponCode` is kept alongside it
 * because this mock's own callers read it flat; nothing new should.
 */
export function serializeIssuedReward(issued: IssuedReward) {
  return {
    ...issued,
    issuedCoupon: { code: issued.couponCode, usedAt: issued.usedAt },
  };
}

export interface TransactionItem {
  sku: string;
  name: string;
  category: string;
  /** Line total (gross), following OpenLoyalty's per-item convention. */
  grossValue: number;
  quantity: number;
  maker?: string;
}

export interface TransactionCustomerData {
  customerId?: string;
  email?: string;
  loyaltyCardNumber?: string;
  phone?: string;
  name?: string;
}

export interface Transaction {
  transactionId: string;
  documentNumber: string;
  documentType: 'sell' | 'return';
  purchasedAt: string;
  purchasePlace?: string;
  items: TransactionItem[];
  customerData: TransactionCustomerData;
  /** Resolved member, or null when the transaction could not be matched. */
  customerId: string | null;
  matched: boolean;
  grossValue: number;
  pointsEarned: number;
  currency: string;
  createdAt: string;
}

/**
 * Campaign (earning rule).
 *
 * Real OpenLoyalty campaigns are far richer — this models the slice a
 * chat-driven campaign builder needs to be meaningful: who qualifies
 * (categories, tiers, spend floor, date window) and what they earn
 * (a multiplier on matching lines, or flat bonus points per transaction).
 */
export interface CampaignCondition {
  /** Product categories this applies to; empty = all categories. */
  categories: string[];
  /** Tier ids that qualify; empty = all tiers. */
  tierIds: string[];
  /** Minimum transaction gross value to qualify; 0 = no floor. */
  minTransactionValue: number;
  /** ISO dates bounding the campaign; null = open-ended. */
  startsAt: string | null;
  endsAt: string | null;
}

export type CampaignEffectType = 'multiplier' | 'bonus_points';

export interface CampaignEffect {
  type: CampaignEffectType;
  /** multiplier: 2 = double points on matching lines. bonus_points: flat award. */
  value: number;
}

/**
 * What starts a campaign. Names follow the spec's `campaign.trigger` enum;
 * the mock implements the three the programme needs:
 *
 * - `transaction`     — evaluated whenever a purchase is registered.
 * - `internal_event`  — fired by a platform event named in `event`, of which
 *                       `member_registered` (welcome points) is implemented.
 * - `time`            — scheduled automation, described by `triggerStrategy`.
 *                       Configurable and stored, but nothing in the mock runs
 *                       a scheduler, so these never fire on their own.
 */
export type CampaignTrigger = 'transaction' | 'internal_event' | 'time';

/**
 * The one internal event the mock raises. `CustomerRegistered` is OpenLoyalty's
 * own event name — the same string its webhooks publish for an enrolment.
 */
export const MEMBER_REGISTERED_EVENT = 'CustomerRegistered';

/** `triggerStrategy.type` from the spec, for `time` campaigns. */
export type CampaignTimeStrategy =
  | 'birthday'
  | 'registration_anniversary'
  | 'daily'
  | 'weekly'
  | 'monthly';

export interface CampaignTriggerStrategy {
  type: CampaignTimeStrategy;
  executionSchedule: {
    /** 0 = Sunday … 6 = Saturday. Used by `weekly`. */
    dayOfWeek: number[];
    /** Day numbers, or 'L' for last day of month. Used by `monthly`. */
    dayOfMonth: Array<number | 'L'>;
  } | null;
}

/**
 * One ceiling, in the spec's `Limit` shape.
 *
 * `interval` is stored and echoed back but not enforced — the mock has no
 * rolling-window accounting, so a limit is always lifetime-to-date.
 */
export interface CampaignLimit {
  value: number;
  interval: { type: string } | null;
}

/**
 * Spend ceilings, mirroring the spec's `Limit` object. `null` means no limit.
 * `points` is the campaign's whole budget; the other two are per member.
 */
export interface CampaignLimits {
  points: CampaignLimit | null;
  pointsPerMember: CampaignLimit | null;
  executionsPerMember: CampaignLimit | null;
}

/** Who the campaign is shown to, mirroring the spec's `Visibility`. */
export interface CampaignVisibility {
  target: 'none' | 'tier';
  tiers: string[];
}

/** Running totals, used to enforce `limits` and to report on the dashboard. */
export interface CampaignStats {
  executions: number;
  pointsIssued: number;
  executionsByMember: Record<string, number>;
  pointsByMember: Record<string, number>;
}

/**
 * Narrows a campaign to members carrying particular labels.
 *
 * Mirrors the spec's `memberFilter` on a campaign, and is the mechanism for
 * targeting a member *type* — something the tier-condition vocabulary cannot
 * express, since it only knows about metrics.
 */
export interface CampaignMemberFilter {
  /** Member must carry every label listed. Empty = no restriction. */
  labels: MemberLabel[];
  /**
   * Member must carry none of these.
   *
   * Needed to keep two awards mutually exclusive when neither confers a tier:
   * scoping the default award by tier stops working once both member types
   * start on the same tier.
   */
  excludeLabels: MemberLabel[];
}

export interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  active: boolean;
  trigger: CampaignTrigger;
  /** Event name for `internal_event` campaigns; null otherwise. */
  event: string | null;
  /** Schedule for `time` campaigns; null otherwise. */
  triggerStrategy: CampaignTriggerStrategy | null;
  /**
   * When the campaign runs, per the spec's campaign-level `activity` object.
   * `condition.startsAt`/`endsAt` mirror it for the campaign studio, which was
   * written against the earlier shape.
   */
  activity: { startsAt: string | null; endsAt: string | null };
  condition: CampaignCondition;
  effect: CampaignEffect;
  /**
   * Tier the campaign puts the member on, held against automatic downgrade.
   * The spec's `assign_member_to_tier` effect; null when the campaign only
   * awards points.
   */
  assignTierId: string | null;
  /** Required alongside `assignTierId` by the spec's `assign_member_to_tier`. */
  assignTierSetId: string | null;
  memberFilter: CampaignMemberFilter;
  limits: CampaignLimits;
  visibility: CampaignVisibility;
  displayOrder: number;
  stats: CampaignStats;
  createdAt: string;
}

/**
 * Spec projection of a campaign's rules.
 *
 * The engine keeps a flat internal model, but the wire format is the spec's:
 * `rules[].conditions[]` with real operators, and `rules[].effects[]` with the
 * real effect names and their documented parameters. Callers integrating
 * against OpenLoyalty see the shape OpenLoyalty documents.
 */
export function campaignRules(campaign: Campaign): Array<{
  name: string;
  conditions: Array<{ attribute: string; operator: string; data: unknown }>;
  effects: Array<Record<string, unknown>>;
}> {
  const conditions: Array<{ attribute: string; operator: string; data: unknown }> = [];

  for (const label of campaign.memberFilter.labels) {
    conditions.push({
      attribute: `member.labels.${label.key}`,
      operator: 'has_at_least_one_label',
      data: [label.value],
    });
  }
  for (const label of campaign.memberFilter.excludeLabels) {
    conditions.push({
      attribute: `member.labels.${label.key}`,
      operator: 'is_not_one_of',
      data: [label.value],
    });
  }
  if (campaign.condition.categories.length) {
    conditions.push({
      attribute: 'transaction.items.category',
      operator: 'is_one_of',
      data: campaign.condition.categories,
    });
  }
  if (campaign.condition.tierIds.length) {
    conditions.push({
      attribute: 'member.tier',
      operator: 'is_one_of',
      data: campaign.condition.tierIds,
    });
  }
  if (campaign.condition.minTransactionValue > 0) {
    conditions.push({
      attribute: 'transaction.grossValue',
      operator: 'is_greater_or_equal',
      data: campaign.condition.minTransactionValue,
    });
  }

  const effects: Array<Record<string, unknown>> = [];
  if (campaign.assignTierId) {
    effects.push({
      effect: 'assign_member_to_tier',
      tierSetId: campaign.assignTierSetId,
      tierId: campaign.assignTierId,
    });
  }
  if (campaign.effect.value > 0) {
    effects.push({
      effect: 'give_points',
      // `pointsRule` is an expression in OpenLoyalty. A multiplier scales the
      // transaction's base points; a bonus is a constant.
      pointsRule:
        campaign.effect.type === 'multiplier'
          ? `transaction.points * ${campaign.effect.value}`
          : String(campaign.effect.value),
    });
  }

  return [{ name: campaign.name, conditions, effects }];
}

/**
 * Read a spec-shaped `rules[]` array back into the flat internal model.
 * Returns null when the input carries nothing the engine understands, so a
 * caller sending the legacy flat shape is left alone.
 */
export function readCampaignRules(raw: unknown): {
  categories: string[];
  tierIds: string[];
  minTransactionValue: number;
  labels: MemberLabel[];
  excludeLabels: MemberLabel[];
  effect: CampaignEffect | null;
  assignTierId: string | null;
  assignTierSetId: string | null;
} | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const out = {
    categories: [] as string[],
    tierIds: [] as string[],
    minTransactionValue: 0,
    labels: [] as MemberLabel[],
    excludeLabels: [] as MemberLabel[],
    effect: null as CampaignEffect | null,
    assignTierId: null as string | null,
    assignTierSetId: null as string | null,
  };

  const labelKey = (attribute: string) => attribute.replace(/^member\.labels\./, '');
  const list = (data: unknown): string[] =>
    Array.isArray(data) ? data.map(String) : data === undefined ? [] : [String(data)];

  for (const rule of raw as Array<Record<string, unknown>>) {
    for (const c of (rule.conditions as Array<Record<string, unknown>>) ?? []) {
      const attribute = String(c.attribute ?? '');
      const operator = String(c.operator ?? '');
      if (operator === 'has_at_least_one_label') {
        list(c.data).forEach((value) => out.labels.push({ key: labelKey(attribute), value }));
      } else if (operator === 'is_not_one_of' && attribute.startsWith('member.labels.')) {
        list(c.data).forEach((value) =>
          out.excludeLabels.push({ key: labelKey(attribute), value }),
        );
      } else if (attribute === 'transaction.items.category') {
        out.categories.push(...list(c.data));
      } else if (attribute === 'member.tier') {
        out.tierIds.push(...list(c.data));
      } else if (attribute === 'transaction.grossValue') {
        const n = Number(c.data);
        if (Number.isFinite(n)) out.minTransactionValue = n;
      }
    }

    for (const e of (rule.effects as Array<Record<string, unknown>>) ?? []) {
      if (e.effect === 'assign_member_to_tier') {
        out.assignTierId = e.tierId ? String(e.tierId) : null;
        out.assignTierSetId = e.tierSetId ? String(e.tierSetId) : null;
      } else if (e.effect === 'give_points') {
        const rule2 = String(e.pointsRule ?? '');
        const mult = rule2.match(/transaction\.points\s*\*\s*([\d.]+)/);
        if (mult) out.effect = { type: 'multiplier', value: Number(mult[1]) };
        else {
          const n = Number(rule2);
          if (Number.isFinite(n) && n > 0) out.effect = { type: 'bonus_points', value: n };
        }
      }
    }
  }

  return out;
}

export function emptyCampaignStats(): CampaignStats {
  return { executions: 0, pointsIssued: 0, executionsByMember: {}, pointsByMember: {} };
}

/**
 * Something changed for a member that a client should react to.
 *
 * Deliberately carries no figures and no names — only who changed and what
 * kind of change it was. Clients re-read their own record through their own
 * token, so nothing about one member ever travels to another.
 */
export interface LoyaltyEvent {
  memberId: string;
  kind: 'points_changed' | 'tier_changed';
}

export interface Store {
  /**
   * Events raised while handling the current request. Transient: never
   * serialised into the snapshot, flushed when the request commits.
   */
  pendingEvents: LoyaltyEvent[];
  tierSets: Map<string, TierSet>;
  tiers: Map<string, Tier>;
  customers: Map<string, Customer>;
  transfers: Map<string, Transfer>;
  rewards: Map<string, Reward>;
  issuedRewards: Map<string, IssuedReward>;
  transactions: Map<string, Transaction>;
  campaigns: Map<string, Campaign>;
  /** Baseline earn rate before any campaign applies. */
  basePointsPerCurrencyUnit: number;
}

export const stores = new Map<string, Store>();
export const DEFAULT_STORE = 'default';

function iso(offsetDays = 0): string {
  const base = new Date('2026-08-14T09:00:00.000Z');
  base.setUTCDate(base.getUTCDate() - offsetDays);
  return base.toISOString();
}

/**
 * Display-only headline threshold for a tier: the value of its first
 * unit-based condition, falling back to the first condition of any kind.
 *
 * Kept because the cockpit dashboard, `serializeCustomerStatus` and the studio
 * agent all want a single number to show. Qualification itself is decided by
 * `memberQualifiesForTier`, which honours every condition.
 */
export function tierThreshold(tier: Tier): number {
  const units = tier.conditions.find(
    (c) => c.attribute === 'activeUnits' || c.attribute === 'totalEarnedUnits'
      || c.attribute === 'cumulatedEarnedUnits',
  );
  return (units ?? tier.conditions[0])?.value ?? 0;
}

/**
 * Tiers lowest-first.
 *
 * Ordered by `sortOrder`, not by threshold: with several conditions in play
 * there is no single number to sort on, so the admin's declared order is the
 * ranking. Ties fall back to the headline threshold.
 */
export function sortedTiers(store: Store, tierSetId?: string): Tier[] {
  return [...store.tiers.values()]
    .filter((t) => !tierSetId || t.tierSetId === tierSetId)
    .sort((a, b) => a.sortOrder - b.sortOrder || tierThreshold(a) - tierThreshold(b));
}

/** The store's single tier set — `isDefault`, or the first one created. */
export function defaultTierSet(store: Store): TierSet | undefined {
  const sets = [...store.tierSets.values()];
  return sets.find((s) => s.isDefault) ?? sets[0];
}

/**
 * Epoch milliseconds for an ISO instant.
 *
 * Window checks must compare instants numerically, never as strings: a caller
 * sending microsecond precision (`.816638Z`) sorts *before* the same instant at
 * millisecond precision (`.816Z`) under string ordering, which silently drops
 * the record out of the window.
 */
function at(iso: string | null | undefined): number {
  if (!iso) return Number.NaN;
  return Date.parse(iso);
}

/** Is `iso` at or after `boundary`? Missing boundary means no lower bound. */
function isAtOrAfter(iso: string, boundary: string | null | undefined): boolean {
  const b = at(boundary);
  return Number.isNaN(b) ? true : at(iso) >= b;
}

/** Is `iso` at or before `boundary`? Missing boundary means no upper bound. */
function isAtOrBefore(iso: string, boundary: string | null | undefined): boolean {
  const b = at(boundary);
  return Number.isNaN(b) ? true : at(iso) <= b;
}

/** Whole months elapsed since an ISO date. */
function monthsSince(isoDate: string, now = new Date()): number {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return 0;
  let months =
    (now.getUTCFullYear() - then.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - then.getUTCMonth());
  if (now.getUTCDate() < then.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Gross value of the member's matched sell transactions in the current
 * qualification period.
 *
 * Period-scoped, not lifetime: a threshold like "$1.5K annual spend" is a rate,
 * and measuring it against a lifetime total would let a member qualify once and
 * never have to earn it again.
 */
function totalSpending(store: Store, customer: Customer): number {
  let total = 0;
  for (const tx of store.transactions.values()) {
    if (tx.documentType !== 'sell' || tx.customerId !== customer.customerId) continue;
    if (!isAtOrAfter(tx.purchasedAt, customer.periodStartedAt)) continue;
    total += tx.grossValue;
  }
  return Math.round(total * 100) / 100;
}

/** Units earned in the current period — the resettable counterpart of earnedPoints. */
function cumulatedEarnedUnits(store: Store, customer: Customer): number {
  let total = 0;
  for (const t of store.transfers.values()) {
    if (t.type !== 'adding' || t.cancelled) continue;
    if (t.accountId !== customer.customerId) continue;
    if (!isAtOrAfter(t.createdAt, customer.periodStartedAt)) continue;
    total += t.value;
  }
  return total;
}

/**
 * The member's current standing on one tier-set condition. This is the bridge
 * between the spec's condition vocabulary and what the mock actually tracks —
 * without it a tier keyed on `totalSpending` would be configurable but inert.
 */
export function memberMetric(
  store: Store,
  customer: Customer,
  attribute: TierConditionAttribute,
): number {
  switch (attribute) {
    case 'activeUnits':
      return customer.activePoints;
    case 'totalEarnedUnits':
      return customer.earnedPoints;
    case 'cumulatedEarnedUnits':
      return cumulatedEarnedUnits(store, customer);
    case 'monthsSinceJoiningProgram':
      return monthsSince(customer.createdAt);
    case 'totalSpending':
      return totalSpending(store, customer);
  }
}

/**
 * A member holds a tier when they meet **every** condition on it.
 *
 * The tier-set UI states this explicitly — "All selected conditions will apply
 * to every tier in this tier set" — so conditions are ANDed, not ORed. A
 * condition the tier gives no value for is treated as 0, i.e. satisfied.
 */
export function memberQualifiesForTier(
  store: Store,
  customer: Customer,
  tier: Tier,
): boolean {
  // Either route in is enough. A qualifying label admits a member outright —
  // union membership is a status, not something spent up to — and everyone else
  // reaches the tier by meeting its conditions.
  const byLabel = tier.qualifyingLabels.some((l) =>
    memberHasLabel(customer, l.key, l.value),
  );
  if (byLabel) return true;

  return tier.conditions.every(
    (c) => memberMetric(store, customer, c.attribute) >= c.value,
  );
}

/**
 * Put a member on the highest tier they qualify for within their tier set,
 * falling back to the set's default (entry) tier.
 */
export function recomputeTier(store: Store, customer: Customer): void {
  // A manually held tier is not subject to automatic movement. Without this a
  // member placed on a tier they cannot qualify for on metrics would be
  // demoted by the very next recompute — and recompute runs on every award.
  if (customer.manualLevelId && store.tiers.has(customer.manualLevelId)) {
    customer.levelId = customer.manualLevelId;
    return;
  }
  // The held tier no longer exists; drop the hold and requalify normally.
  if (customer.manualLevelId) customer.manualLevelId = null;

  const set = defaultTierSet(store);
  const tiers = sortedTiers(store, set?.tierSetId).filter((t) => t.active);
  if (tiers.length === 0) return;

  // Assignment-only tiers sit outside the automatic ladder.
  const qualifiable = tiers.filter((t) => !t.assignmentOnly);
  let current = qualifiable.find((t) => t.isDefault) ?? qualifiable[0] ?? tiers[0]!;
  for (const tier of qualifiable) {
    if (memberQualifiesForTier(store, customer, tier)) current = tier;
  }

  if (current.levelId !== customer.levelId) {
    const previous = store.tiers.get(customer.levelId);
    const movedUp = !previous || current.sortOrder > previous.sortOrder;
    const at = new Date().toISOString();
    if (movedUp) customer.lastPromotionAt = at;
    else customer.lastDowngradeAt = at;
    customer.levelId = current.levelId;
    store.pendingEvents.push({ memberId: customer.customerId, kind: 'tier_changed' });
  }
}

/** Add whole months to an ISO date, clamped to the end of the target month. */
function addMonths(isoDate: string, months: number): Date {
  const d = new Date(isoDate);
  const target = new Date(d);
  target.setUTCMonth(target.getUTCMonth() + months);
  return target;
}

/**
 * When the member's current qualification period ends.
 *
 * `none`/`automatic` downgrade means there is no period at all — conditions are
 * judged continuously and nothing ever resets, so there is no date to report.
 */
export function nextRecalculationAt(store: Store, customer: Customer): string | null {
  const set = defaultTierSet(store);
  if (!set || set.downgrade.mode !== 'periodic') return null;

  switch (set.downgrade.period) {
    case 'monthly':
      return addMonths(customer.periodStartedAt, 1).toISOString();
    case 'weekly': {
      const d = new Date(customer.periodStartedAt);
      d.setUTCDate(d.getUTCDate() + 7);
      return d.toISOString();
    }
    case 'registration_anniversary':
      return addMonths(customer.createdAt, 12 * (monthsSince(customer.createdAt) / 12 + 1)).toISOString();
    case 'yearly':
    default:
      return addMonths(customer.periodStartedAt, 12).toISOString();
  }
}

/**
 * Close the member's qualification period and open a new one.
 *
 * Period-scoped metrics restart from zero, so a member re-qualifies for their
 * tier on the new period's activity rather than keeping it on the strength of
 * a year they have already banked. A member who does not re-qualify drops on
 * the spot — there is no grace window.
 */
export function recalculateMember(store: Store, customer: Customer, at = new Date().toISOString()): boolean {
  const before = customer.levelId;
  customer.periodStartedAt = at;
  recomputeTier(store, customer);
  return customer.levelId !== before;
}

/**
 * Run recalculation for everyone whose period has elapsed. Called on read, so
 * the mock behaves as if a scheduler had run without needing one.
 */
export function runDueRecalculations(store: Store, now = new Date().toISOString()): number {
  const set = defaultTierSet(store);
  if (!set || set.downgrade.mode !== 'periodic') return 0;
  let moved = 0;
  for (const customer of store.customers.values()) {
    const due = nextRecalculationAt(store, customer);
    if (due && at(due) <= at(now) && recalculateMember(store, customer, now)) moved += 1;
  }
  return moved;
}

/**
 * Matches the spec's `TierSetMemberProgress`: where the member stands against
 * the next tier, condition by condition.
 *
 * The engine reports progress because the engine owns qualification — an app
 * that computed "how far to the next tier" itself would be re-deriving rules it
 * does not hold.
 */
export function serializeTierSetMemberProgress(store: Store, customer: Customer, set: TierSet) {
  const tiers = sortedTiers(store, set.tierSetId).filter((t) => t.active);
  const current = store.tiers.get(customer.levelId);
  const currentIndex = current ? tiers.findIndex((t) => t.levelId === current.levelId) : -1;
  const next = currentIndex >= 0 ? tiers[currentIndex + 1] : tiers[0];

  const nextTierCurrentProgress = (next?.conditions ?? []).map((c) => {
    const currentValue = memberMetric(store, customer, c.attribute);
    return {
      conditionId: c.conditionId,
      attribute: c.attribute,
      currentValue,
      valueGoal: c.value,
    };
  });

  // Overall progress is the least-complete condition: a member is only as close
  // to the next tier as the requirement they are furthest from.
  const ratios = nextTierCurrentProgress.map((r) =>
    r.valueGoal <= 0 ? 1 : Math.min(1, r.currentValue / r.valueGoal),
  );
  const currentProgress = ratios.length === 0 ? 0 : Math.round(Math.min(...ratios) * 1000) / 10;

  // A qualifying label is an alternative route in, not a barrier, so no tier is
  // ever out of reach — the conditions are open to everybody.
  const missingLabels: MemberLabel[] = [];

  return {
    currentTierId: customer.levelId,
    currentTierName: current?.name ?? null,
    nextTierId: next?.levelId ?? null,
    nextTierName: next?.name ?? null,
    tierSetId: set.tierSetId,
    tierSetName: set.name,
    currentProgress,
    lastPromotionAt: customer.lastPromotionAt,
    lastDowngradeAt: customer.lastDowngradeAt,
    periodStartedAt: customer.periodStartedAt,
    nextRecalculationAt: nextRecalculationAt(store, customer),
    manually: customer.manualLevelId === customer.levelId,
    downgrade: set.downgrade.mode,
    nextTierCurrentProgress,
    /** Not in the spec: why an otherwise-met tier is still out of reach. */
    nextTierMissingLabels: missingLabels,
    nextTierEligible: missingLabels.length === 0,
  };
}

/** Place a member on a tier and hold them there. */
export function assignTierManually(store: Store, customer: Customer, levelId: string): boolean {
  if (!store.tiers.has(levelId)) return false;
  customer.manualLevelId = levelId;
  customer.levelId = levelId;
  return true;
}

/** Release the hold and requalify the member on conditions alone. */
export function removeManualTier(store: Store, customer: Customer): void {
  customer.manualLevelId = null;
  recomputeTier(store, customer);
}

/** Does this member carry a label with the given key and value? */
export function memberHasLabel(customer: Customer, key: string, value: string): boolean {
  return customer.labels.some(
    (l) => l.key === key && l.value.toLowerCase() === value.toLowerCase(),
  );
}

/**
 * Re-evaluate every member's tier.
 *
 * Called after any change to the tier set or its thresholds — the admin console
 * promises exactly this ("the progress of each member will be recalculated
 * individually"), and without it a newly added tier would never be populated.
 */
export function recomputeAllTiers(store: Store): number {
  let moved = 0;
  for (const customer of store.customers.values()) {
    const before = customer.levelId;
    recomputeTier(store, customer);
    if (customer.levelId !== before) moved += 1;
  }
  return moved;
}

function makeTier(
  name: string,
  threshold: number,
  sortOrder: number,
  storeCode: string,
  tierSetId: string,
  condition: TierSetCondition,
): Tier {
  return {
    levelId: randomUUID(),
    tierSetId,
    name,
    description: `${name} tier`,
    active: true,
    isDefault: threshold === 0,
    sortOrder,
    storeCode,
    assignmentOnly: false,
    qualifyingLabels: [],
    conditions: [
      { conditionId: condition.id, attribute: condition.attribute, value: threshold },
    ],
    createdAt: iso(365),
    updatedAt: iso(365),
  };
}

export function seedStore(code: string): Store {
  const store: Store = {
    pendingEvents: [],
    tierSets: new Map(),
    tiers: new Map(),
    customers: new Map(),
    transfers: new Map(),
    rewards: new Map(),
    issuedRewards: new Map(),
    transactions: new Map(),
    campaigns: new Map(),
    basePointsPerCurrencyUnit: 1,
  };

  // Seeded at the state the storyboard starts from: one tier set qualified on
  // total earned units, holding two tiers. The third tier is configured from
  // the admin console.
  // The programme qualifies Tier 2 on annual spend, so spend is the condition
  // the whole set is measured on.
  const annualSpend: TierSetCondition = {
    id: randomUUID(),
    attribute: 'totalSpending',
  };
  const tierSet: TierSet = {
    tierSetId: randomUUID(),
    name: 'Membership Levels',
    description: 'Default tier set for the loyalty programme.',
    active: true,
    isDefault: true,
    conditions: [annualSpend],
    // Periodic recalculation is what makes "annual" mean anything: it opens a
    // fresh spend period each year, so a member re-qualifies rather than
    // keeping the tier on one good year forever.
    downgrade: { mode: 'periodic', period: 'yearly' },
    createdAt: iso(365),
    updatedAt: iso(365),
  };
  store.tierSets.set(tierSet.tierSetId, tierSet);

  // Tier 2 has two ways in: union membership, which admits a member on
  // enrolment, or $1,500 of spend in the current period for everyone else.
  const tier1 = makeTier('Tier 1', 0, 1, code, tierSet.tierSetId, annualSpend);
  const tier2 = makeTier('Tier 2', 1500, 2, code, tierSet.tierSetId, annualSpend);
  tier1.description = 'Occasional shopper. All members start here.';
  tier2.isDefault = false;
  tier2.description = 'NTUC union members, and frequent spenders from $1.5K annual spend.';
  tier2.qualifyingLabels = [{ key: CUSTOMER_TYPE_LABEL, value: UNION_MEMBER }];
  [tier1, tier2].forEach((t) => store.tiers.set(t.levelId, t));

  /**
   * The reward catalogue, as the stage tenant holds it.
   *
   * Only the points voucher costs points. Everything else is a coupon the
   * programme grants — at enrolment, on a birthday, or by tier — so it is
   * carried here at zero cost rather than left out, because the member app
   * lists what a member is entitled to, not only what they can buy.
   *
   * The conversion is the programme's: 1,000 points for a $5 voucher, which is
   * the $0.005 redemption rebate yield both tiers are on.
   */
  const rewards: Reward[] = [
    {
      rewardId: randomUUID(),
      reward: 'points-voucher-5',
      name: '1k points = $5 voucher',
      shortDescription: 'Convert 1,000 points into a $5 voucher, redeemable at participating tenants.',
      costInPoints: 1000,
      active: true,
      featured: true,
      public: true,
      levels: [],
      usageLimit: null,
      createdAt: iso(120),
    },
    {
      rewardId: randomUUID(),
      reward: 'percentage-10-off',
      name: '10% off next shopping',
      shortDescription: 'A percentage coupon off your next shop at a participating tenant.',
      costInPoints: 0,
      active: true,
      featured: false,
      public: true,
      levels: [],
      usageLimit: null,
      createdAt: iso(118),
    },
    {
      rewardId: randomUUID(),
      reward: 'parking-coupon-20-tier2',
      name: 'Parking coupon $20, Tier 2',
      shortDescription: 'A $20 parking coupon. Tier 2 members only.',
      costInPoints: 0,
      active: true,
      featured: false,
      public: true,
      // Gated on the tier itself, which is what makes this the reward that
      // proves tier filtering works end to end.
      levels: [tier2.levelId],
      usageLimit: null,
      createdAt: iso(116),
    },
    {
      rewardId: randomUUID(),
      reward: 'parking-coupon-birthday',
      name: '2-hour parking coupon (birthday)',
      shortDescription: 'Two hours of complimentary parking during your birthday month.',
      costInPoints: 0,
      active: true,
      featured: false,
      public: true,
      levels: [],
      usageLimit: null,
      createdAt: iso(116),
    },
    {
      rewardId: randomUUID(),
      reward: 'welcome-bundle-50',
      name: 'Welcome bundle $50',
      shortDescription: 'The digital deal bundle granted on joining, valid 30 days at participating tenants.',
      costInPoints: 0,
      active: true,
      featured: false,
      public: true,
      levels: [],
      usageLimit: null,
      createdAt: iso(115),
    },
    {
      rewardId: randomUUID(),
      reward: 'conversion-15-voucher',
      name: '15% voucher',
      shortDescription: 'A conversion coupon worth 15% off a qualifying purchase.',
      costInPoints: 0,
      active: true,
      featured: false,
      public: true,
      levels: [],
      usageLimit: null,
      createdAt: iso(115),
    },
  ];
  rewards.forEach((r) => store.rewards.set(r.rewardId, r));

  const demo: Customer = {
    customerId: randomUUID(),
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'demo@example.com',
    password: 'password',
    phone: '+15550100',
    gender: 'female',
    loyaltyCardNumber: '1000000001',
    agreement1: true,
    agreement2: true,
    active: true,
    createdAt: iso(90),
    labels: [{ key: DEMO_PERSONA_LABEL, value: 'existing_public' }],
    periodStartedAt: iso(90),
    lastPromotionAt: null,
    lastDowngradeAt: null,
    levelId: tier1.levelId,
    manualLevelId: null,
    activePoints: 0,
    earnedPoints: 0,
    spentPoints: 0,
    expiredPoints: 0,
    lockedPoints: 0,
    blockedPoints: 0,
  };
  store.customers.set(demo.customerId, demo);

  // A second member, so tier-targeted campaigns have someone to exclude.
  const second: Customer = {
    ...demo,
    customerId: randomUUID(),
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace@example.com',
    phone: '+15550101',
    loyaltyCardNumber: '1000000002',
    createdAt: iso(45),
    labels: [
      { key: CUSTOMER_TYPE_LABEL, value: UNION_MEMBER },
      { key: DEMO_PERSONA_LABEL, value: 'existing_union' },
    ],
    periodStartedAt: iso(45),
    levelId: tier2.levelId,
    manualLevelId: null,
    activePoints: 0,
    earnedPoints: 0,
    spentPoints: 0,
  };
  store.customers.set(second.customerId, second);

  // A baseline campaign so the store isn't empty of earning rules.
  const coffeeCampaign: Campaign = {
    campaignId: randomUUID(),
    name: 'Coffee Lovers 3x',
    description: 'Triple points on all coffee purchases.',
    active: true,
    trigger: 'transaction',
    event: null,
    triggerStrategy: null,
    activity: { startsAt: null, endsAt: null },
    condition: {
      categories: ['coffee'],
      tierIds: [],
      minTransactionValue: 0,
      startsAt: null,
      endsAt: null,
    },
    effect: { type: 'multiplier', value: 3 },
    assignTierId: null,
    assignTierSetId: null,
    memberFilter: { labels: [], excludeLabels: [] },
    limits: { points: null, pointsPerMember: null, executionsPerMember: null },
    visibility: { target: 'none', tiers: [] },
    displayOrder: 1,
    stats: emptyCampaignStats(),
    createdAt: iso(200),
  };
  store.campaigns.set(coffeeCampaign.campaignId, coffeeCampaign);

  /**
   * Enrolment campaigns.
   *
   * Display order is load-bearing. The union campaign runs first and moves the
   * member to Tier 2; the default campaign that follows is scoped to Tier 1, so
   * it no longer matches them. A union member therefore receives 500 — not 500
   * plus the 250 everyone else gets.
   */
  const unionWelcome: Campaign = {
    campaignId: randomUUID(),
    name: 'Union Member Welcome',
    description: 'Union members join at Tier 2 and receive 500 welcome points.',
    active: true,
    trigger: 'internal_event',
    event: MEMBER_REGISTERED_EVENT,
    triggerStrategy: null,
    activity: { startsAt: null, endsAt: null },
    condition: {
      categories: [],
      tierIds: [],
      minTransactionValue: 0,
      startsAt: null,
      endsAt: null,
    },
    effect: { type: 'bonus_points', value: 500 },
    // No tier assignment needed: the union label qualifies the member for
    // Tier 2 outright, so recomputation places them there on enrolment.
    assignTierId: null,
    assignTierSetId: null,
    memberFilter: {
      labels: [{ key: CUSTOMER_TYPE_LABEL, value: UNION_MEMBER }],
      excludeLabels: [],
    },
    limits: {
      points: null,
      pointsPerMember: null,
      executionsPerMember: { value: 1, interval: null },
    },
    visibility: { target: 'none', tiers: [] },
    displayOrder: 0,
    stats: emptyCampaignStats(),
    createdAt: iso(30),
  };

  const defaultWelcome: Campaign = {
    campaignId: randomUUID(),
    name: 'Welcome Bonus',
    description: 'All new members join at Tier 1 and receive 250 welcome points.',
    active: true,
    trigger: 'internal_event',
    event: MEMBER_REGISTERED_EVENT,
    triggerStrategy: null,
    activity: { startsAt: null, endsAt: null },
    condition: {
      categories: [],
      tierIds: [],
      minTransactionValue: 0,
      startsAt: null,
      endsAt: null,
    },
    effect: { type: 'bonus_points', value: 250 },
    assignTierId: null,
    assignTierSetId: null,
    // Both member types now start on Tier 1, so tier scoping can no longer keep
    // the two awards apart — the exclusion is what stops a union member
    // collecting this on top of their own.
    memberFilter: {
      labels: [],
      excludeLabels: [{ key: CUSTOMER_TYPE_LABEL, value: UNION_MEMBER }],
    },
    limits: {
      points: null,
      pointsPerMember: null,
      executionsPerMember: { value: 1, interval: null },
    },
    visibility: { target: 'none', tiers: [] },
    displayOrder: 1,
    stats: emptyCampaignStats(),
    createdAt: iso(30),
  };
  [unionWelcome, defaultWelcome].forEach((c) => store.campaigns.set(c.campaignId, c));

  addPointsInternal(store, demo.customerId, 300, 'Welcome bonus', iso(80));
  spendPointsInternal(store, demo.customerId, 100, 'Redeemed: Free Coffee', iso(10));

  // Seeded purchase history, so campaign simulation has something to replay.
  const catalogue = [
    { sku: 'CF-001', name: 'Flat White', category: 'coffee', price: 4.5 },
    { sku: 'CF-002', name: 'Bag of Beans 250g', category: 'coffee', price: 14 },
    { sku: 'FD-010', name: 'Almond Croissant', category: 'food', price: 5.25 },
    { sku: 'FD-011', name: 'Chicken Sandwich', category: 'food', price: 9.8 },
    { sku: 'EL-100', name: 'Wireless Earbuds', category: 'electronics', price: 89 },
    { sku: 'MD-200', name: 'Ceramic Mug', category: 'merch', price: 12 },
  ];
  const members = [demo, second];
  for (let i = 0; i < 24; i++) {
    const member = members[i % members.length]!;
    // Deterministic spread across the catalogue and the last ~60 days.
    const first = catalogue[i % catalogue.length]!;
    const secondItem = catalogue[(i * 3 + 2) % catalogue.length]!;
    const qty = (i % 3) + 1;
    registerTransaction(store, {
      documentNumber: `SEED-${String(1000 + i)}`,
      documentType: 'sell',
      purchasedAt: iso(60 - i * 2),
      purchasePlace: 'Main Street Store',
      items: [
        {
          sku: first.sku,
          name: first.name,
          category: first.category,
          grossValue: Number((first.price * qty).toFixed(2)),
          quantity: qty,
        },
        {
          sku: secondItem.sku,
          name: secondItem.name,
          category: secondItem.category,
          grossValue: secondItem.price,
          quantity: 1,
        },
      ],
      customerData: { email: member.email },
    });
  }

  // A public member climbing to Tier 2 on spend. This is the only persona with
  // a distance to travel: a union member is admitted on enrolment, and Grace
  // already holds the tier.
  const inProgress: Customer = {
    ...demo,
    customerId: randomUUID(),
    firstName: 'Siti',
    lastName: 'Rahman',
    email: 'siti@example.com',
    phone: '+15550103',
    loyaltyCardNumber: '1000000003',
    createdAt: iso(60),
    labels: [{ key: DEMO_PERSONA_LABEL, value: 'spender_in_progress' }],
    periodStartedAt: iso(60),
    levelId: tier1.levelId,
    manualLevelId: null,
    activePoints: 0,
    earnedPoints: 0,
    spentPoints: 0,
  };
  store.customers.set(inProgress.customerId, inProgress);

  // Roughly 60% of the way to the $1,500 gate.
  for (let i = 0; i < 3; i++) {
    registerTransaction(store, {
      documentNumber: `SEED-PROGRESS-${i}`,
      documentType: 'sell',
      purchasedAt: iso(40 - i * 8),
      purchasePlace: 'Main Street Store',
      items: [
        {
          sku: 'MD-200',
          name: 'Homeware bundle',
          category: 'merch',
          grossValue: 300,
          quantity: 1,
        },
      ],
      customerData: { email: inProgress.email },
    });
  }

  // Grace is the "existing union member" persona. Her tier comes from the union
  // label, not this spend — the purchases just give her a realistic history.
  for (let i = 0; i < 4; i++) {
    registerTransaction(store, {
      documentNumber: `SEED-UNION-${i}`,
      documentType: 'sell',
      purchasedAt: iso(30 - i * 5),
      purchasePlace: 'Main Street Store',
      items: [
        {
          sku: 'EL-100',
          name: 'Wireless Earbuds',
          category: 'electronics',
          grossValue: 420,
          quantity: 1,
        },
      ],
      customerData: { email: second.email },
    });
  }

  // Settle everyone against the seeded activity.
  recomputeAllTiers(store);

  stores.set(code, store);
  return store;
}

export function getStore(code: string): Store {
  return stores.get(code) ?? seedStore(code);
}

export function findCustomerByEmail(
  store: Store,
  email: string,
): Customer | undefined {
  const lower = email.toLowerCase();
  return [...store.customers.values()].find(
    (c) => c.email.toLowerCase() === lower,
  );
}

export function addPointsInternal(
  store: Store,
  customerId: string,
  value: number,
  comment: string,
  createdAt = new Date().toISOString(),
): Transfer {
  const customer = store.customers.get(customerId);
  if (!customer) throw new Error('customer not found');
  const transfer: Transfer = {
    transferId: randomUUID(),
    type: 'adding',
    accountId: customerId,
    value,
    comment,
    cancelled: false,
    pending: false,
    createdAt,
  };
  store.transfers.set(transfer.transferId, transfer);
  customer.activePoints += value;
  customer.earnedPoints += value;
  store.pendingEvents.push({ memberId: customerId, kind: 'points_changed' });
  recomputeTier(store, customer);
  return transfer;
}

export function spendPointsInternal(
  store: Store,
  customerId: string,
  value: number,
  comment: string,
  createdAt = new Date().toISOString(),
  actionCause?: Transfer['actionCause'],
): Transfer {
  const customer = store.customers.get(customerId);
  if (!customer) throw new Error('customer not found');
  if (customer.activePoints < value) throw new Error('not enough points');
  const transfer: Transfer = {
    transferId: randomUUID(),
    type: 'spending',
    accountId: customerId,
    value,
    comment,
    cancelled: false,
    pending: false,
    createdAt,
    actionCause,
  };
  store.transfers.set(transfer.transferId, transfer);
  customer.activePoints -= value;
  customer.spentPoints += value;
  store.pendingEvents.push({ memberId: customerId, kind: 'points_changed' });
  return transfer;
}

/**
 * Resolve the member a transaction belongs to, in OpenLoyalty's order of
 * precedence: explicit id, then loyalty card number, then email, then phone.
 * Returns undefined when nothing matches — the transaction stays unmatched and
 * can be assigned later via `POST /transaction/assign`.
 */
export function matchCustomer(
  store: Store,
  data: TransactionCustomerData,
): Customer | undefined {
  if (data.customerId && store.customers.has(data.customerId)) {
    return store.customers.get(data.customerId);
  }
  const all = [...store.customers.values()];
  if (data.loyaltyCardNumber) {
    const hit = all.find((c) => c.loyaltyCardNumber === data.loyaltyCardNumber);
    if (hit) return hit;
  }
  if (data.email) {
    const hit = findCustomerByEmail(store, data.email);
    if (hit) return hit;
  }
  if (data.phone) {
    const hit = all.find((c) => c.phone === data.phone);
    if (hit) return hit;
  }
  return undefined;
}

/** Does a campaign apply to this transaction at all? */
function campaignAppliesTo(
  campaign: Campaign,
  tx: Transaction,
  tierId: string | null,
): boolean {
  const { condition } = campaign;
  if (tx.grossValue < condition.minTransactionValue) return false;
  if (condition.tierIds.length && (!tierId || !condition.tierIds.includes(tierId))) {
    return false;
  }
  if (!isAtOrAfter(tx.purchasedAt, campaign.activity.startsAt)) return false;
  if (!isAtOrBefore(tx.purchasedAt, campaign.activity.endsAt)) return false;
  return true;
}

function campaignMatchesItem(campaign: Campaign, item: TransactionItem): boolean {
  const { categories } = campaign.condition;
  if (categories.length === 0) return true;
  return categories.some((c) => c.toLowerCase() === item.category.toLowerCase());
}

/**
 * Points a transaction earns.
 *
 * Baseline is `basePointsPerCurrencyUnit` per line. Matching `multiplier`
 * campaigns stack multiplicatively on the lines they match; matching
 * `bonus_points` campaigns each add a flat award once per transaction.
 * Returns never earn points.
 *
 * `campaigns` defaults to the store's active set — pass an explicit list to
 * evaluate a hypothetical (that is what the simulator does).
 */
export function calculatePoints(
  store: Store,
  tx: Transaction,
  campaigns?: Campaign[],
): number {
  if (tx.documentType === 'return') return 0;

  const customer = tx.customerId ? store.customers.get(tx.customerId) : undefined;
  const tierId = customer?.levelId ?? null;
  const applicable = (campaigns ?? [...store.campaigns.values()].filter((c) => c.active))
    // Only purchase-triggered campaigns take part in transaction earning;
    // enrolment and scheduled campaigns pay out through their own triggers.
    .filter((c) => c.trigger === 'transaction')
    .filter((c) => campaignAppliesTo(c, tx, tierId));

  let total = 0;
  for (const item of tx.items) {
    let linePoints = item.grossValue * store.basePointsPerCurrencyUnit;
    for (const campaign of applicable) {
      if (campaign.effect.type === 'multiplier' && campaignMatchesItem(campaign, item)) {
        linePoints *= campaign.effect.value;
      }
    }
    total += linePoints;
  }

  for (const campaign of applicable) {
    if (campaign.effect.type === 'bonus_points') {
      // A bonus only pays out if at least one line matches its categories.
      if (tx.items.some((i) => campaignMatchesItem(campaign, i))) {
        total += campaign.effect.value;
      }
    }
  }

  return Math.floor(total);
}

export interface SimulationResult {
  transactionsEvaluated: number;
  matchingTransactions: number;
  membersAffected: number;
  baselinePoints: number;
  projectedPoints: number;
  additionalPoints: number;
  /** Percent change in points issued across the evaluated history. */
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

/**
 * Replay the store's historical sell transactions with a draft campaign added
 * to the active set, and report the delta against the current configuration.
 *
 * This is what makes a chat-driven builder useful: "what would this have cost
 * me last month?" answered before anything goes live.
 */
export function simulateCampaign(store: Store, draft: Campaign): SimulationResult {
  // Only purchase-triggered campaigns can be replayed against sales history.
  // For the others, project the payout across the members who would qualify.
  if (draft.trigger !== 'transaction') return simulateMemberCampaign(store, draft);

  const active = [...store.campaigns.values()].filter((c) => c.active);
  const withDraft = [...active, draft];
  const history = [...store.transactions.values()].filter(
    (t) => t.documentType === 'sell',
  );

  let baselinePoints = 0;
  let projectedPoints = 0;
  let matchingTransactions = 0;
  let grossValueEvaluated = 0;
  const membersAffected = new Set<string>();
  const sampleImpacts: SimulationResult['sampleImpacts'] = [];

  for (const tx of history) {
    const base = calculatePoints(store, tx, active);
    const projected = calculatePoints(store, tx, withDraft);
    baselinePoints += base;
    projectedPoints += projected;
    grossValueEvaluated += tx.grossValue;

    if (projected !== base) {
      matchingTransactions += 1;
      if (tx.customerId) membersAffected.add(tx.customerId);
      if (sampleImpacts.length < 5) {
        const customer = tx.customerId ? store.customers.get(tx.customerId) : undefined;
        sampleImpacts.push({
          documentNumber: tx.documentNumber,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : 'Unmatched',
          grossValue: tx.grossValue,
          baselinePoints: base,
          projectedPoints: projected,
        });
      }
    }
  }

  return {
    transactionsEvaluated: history.length,
    matchingTransactions,
    membersAffected: membersAffected.size,
    baselinePoints,
    projectedPoints,
    additionalPoints: projectedPoints - baselinePoints,
    upliftPercent:
      baselinePoints > 0
        ? Math.round(((projectedPoints - baselinePoints) / baselinePoints) * 1000) / 10
        : 0,
    grossValueEvaluated: Math.round(grossValueEvaluated * 100) / 100,
    sampleImpacts,
  };
}

/**
 * Projection for a campaign that pays a flat award per member rather than per
 * transaction (enrolment and scheduled campaigns).
 *
 * There is no history to replay, so this answers a different question: what
 * would it cost to pay every member who would qualify today, once? Baseline is
 * zero because the campaign adds a payout that no transaction produces.
 */
function simulateMemberCampaign(store: Store, draft: Campaign): SimulationResult {
  const eligible = [...store.customers.values()].filter((c) => {
    if (!c.active) return false;
    if (draft.visibility.target === 'tier' && draft.visibility.tiers.length > 0) {
      return draft.visibility.tiers.includes(c.levelId);
    }
    return true;
  });

  const perMember =
    draft.effect.type === 'bonus_points' ? Math.floor(draft.effect.value) : 0;
  const capped = draft.limits.pointsPerMember
    ? Math.min(perMember, draft.limits.pointsPerMember.value)
    : perMember;
  let projected = capped * eligible.length;
  if (draft.limits.points) projected = Math.min(projected, draft.limits.points.value);

  return {
    transactionsEvaluated: 0,
    matchingTransactions: 0,
    membersAffected: capped > 0 ? eligible.length : 0,
    baselinePoints: 0,
    projectedPoints: projected,
    additionalPoints: projected,
    upliftPercent: 0,
    grossValueEvaluated: 0,
    sampleImpacts: eligible.slice(0, 5).map((c) => ({
      documentNumber: draft.event ?? draft.triggerStrategy?.type ?? draft.trigger,
      customerName: `${c.firstName} ${c.lastName}`.trim(),
      grossValue: 0,
      baselinePoints: 0,
      projectedPoints: capped,
    })),
  };
}

/**
 * How many points a campaign may still award this member, after its limits.
 * Returns 0 when the campaign is exhausted for them.
 */
function allowanceFor(campaign: Campaign, customerId: string, wanted: number): number {
  const { limits, stats } = campaign;
  let allowed = wanted;

  if (limits.executionsPerMember) {
    const runs = stats.executionsByMember[customerId] ?? 0;
    if (runs >= limits.executionsPerMember.value) return 0;
  }
  if (limits.pointsPerMember) {
    const given = stats.pointsByMember[customerId] ?? 0;
    allowed = Math.min(allowed, limits.pointsPerMember.value - given);
  }
  if (limits.points) {
    allowed = Math.min(allowed, limits.points.value - stats.pointsIssued);
  }
  return Math.max(0, Math.floor(allowed));
}

function recordExecution(campaign: Campaign, customerId: string, points: number): void {
  campaign.stats.executions += 1;
  campaign.stats.pointsIssued += points;
  campaign.stats.executionsByMember[customerId] =
    (campaign.stats.executionsByMember[customerId] ?? 0) + 1;
  campaign.stats.pointsByMember[customerId] =
    (campaign.stats.pointsByMember[customerId] ?? 0) + points;
}

/** Is `campaign` inside its configured activity window right now? */
function campaignIsLive(campaign: Campaign, now = new Date().toISOString()): boolean {
  if (!campaign.active) return false;
  const { startsAt, endsAt } = campaign.activity;
  return isAtOrAfter(now, startsAt) && isAtOrBefore(now, endsAt);
}

export interface CampaignPayout {
  campaignId: string;
  name: string;
  points: number;
  transferId: string | null;
  /** Tier the campaign put the member on, if it assigned one. */
  assignedTier: { levelId: string; name: string } | null;
}

/**
 * Fire every live campaign listening for a platform event on one member.
 *
 * This is what makes "member enrols, gets welcome points" work: registration
 * raises `member_registered`, and any campaign configured against that event
 * pays out here, subject to its limits. Only flat `bonus_points` effects make
 * sense off a transaction, so multiplier effects are skipped.
 */
export function runInternalEventCampaigns(
  store: Store,
  customer: Customer,
  event: string,
): CampaignPayout[] {
  const payouts: CampaignPayout[] = [];

  const listeners = [...store.campaigns.values()]
    .filter((c) => c.trigger === 'internal_event' && c.event === event)
    .filter((c) => campaignIsLive(c))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  for (const campaign of listeners) {
    // Member filter first: it selects on who the member *is*, independent of
    // any tier they hold.
    const missingRequired = campaign.memberFilter.labels.some(
      (l) => !memberHasLabel(customer, l.key, l.value),
    );
    if (missingRequired) continue;
    const hasExcluded = campaign.memberFilter.excludeLabels.some((l) =>
      memberHasLabel(customer, l.key, l.value),
    );
    if (hasExcluded) continue;

    // Visibility doubles as targeting: a tier-scoped campaign only pays members
    // currently on one of those tiers. Evaluated live, so a campaign earlier in
    // display order that moved the member changes what matches after it — this
    // is what keeps a tier-scoped default award from stacking on top of a
    // member-type award.
    const { visibility } = campaign;
    if (visibility.target === 'tier' && visibility.tiers.length > 0) {
      if (!visibility.tiers.includes(customer.levelId)) continue;
    }

    let assignedTier: CampaignPayout['assignedTier'] = null;
    if (campaign.assignTierId) {
      const tier = store.tiers.get(campaign.assignTierId);
      // Never move a member down: the effect raises a member to a tier.
      if (tier && tier.levelId !== customer.levelId) {
        const current = store.tiers.get(customer.levelId);
        if (!current || tier.sortOrder > current.sortOrder) {
          assignTierManually(store, customer, tier.levelId);
          assignedTier = { levelId: tier.levelId, name: tier.name };
        }
      }
    }

    const wanted = campaign.effect.type === 'bonus_points' ? campaign.effect.value : 0;
    const points = wanted > 0 ? allowanceFor(campaign, customer.customerId, wanted) : 0;

    let transferId: string | null = null;
    if (points > 0) {
      const transfer = addPointsInternal(
        store,
        customer.customerId,
        points,
        `Campaign: ${campaign.name}`,
      );
      transfer.actionCause = { campaignId: campaign.campaignId };
      transferId = transfer.transferId;
    }

    // A run that only moved a tier still counts as a run.
    if (points > 0 || assignedTier) {
      recordExecution(campaign, customer.customerId, points);
      payouts.push({
        campaignId: campaign.campaignId,
        name: campaign.name,
        points,
        transferId,
        assignedTier,
      });
    }
  }

  return payouts;
}

/**
 * Credit each purchase-triggered campaign for what it actually contributed.
 *
 * Without this, only enrolment campaigns ever record a run and a purchase
 * campaign reads as "never fired" on the dashboard however many sales it has
 * changed.
 *
 * Contribution is marginal: what the transaction earned with the campaign, less
 * what it would have earned without it, every other applicable campaign held
 * constant. That is the honest answer to "what did this campaign cost me", but
 * note the parts do not sum to the whole when multipliers stack — each is
 * measured against the others being present.
 */
function recordTransactionCampaigns(store: Store, tx: Transaction): void {
  const customer = tx.customerId ? store.customers.get(tx.customerId) : undefined;
  if (!customer) return;

  const applicable = [...store.campaigns.values()]
    .filter((c) => c.active && c.trigger === 'transaction')
    .filter((c) => campaignAppliesTo(c, tx, customer.levelId));
  if (applicable.length === 0) return;

  const withAll = calculatePoints(store, tx, applicable);
  for (const campaign of applicable) {
    const without = calculatePoints(
      store,
      tx,
      applicable.filter((c) => c !== campaign),
    );
    const marginal = withAll - without;
    // A campaign that matched the transaction but changed nothing about it —
    // a category multiplier with no matching line — did not run.
    if (marginal > 0) recordExecution(campaign, customer.customerId, marginal);
  }
}

/**
 * Register a transaction: match it to a member, award points under the earning
 * rule, and record the resulting transfer with the transaction as its cause.
 */
export function registerTransaction(
  store: Store,
  input: {
    documentNumber: string;
    documentType?: 'sell' | 'return';
    purchasedAt?: string;
    purchasePlace?: string;
    items: TransactionItem[];
    customerData?: TransactionCustomerData;
  },
): Transaction {
  const customerData = input.customerData ?? {};
  const customer = matchCustomer(store, customerData);
  const grossValue = input.items.reduce((acc, i) => acc + i.grossValue, 0);

  const transaction: Transaction = {
    transactionId: randomUUID(),
    documentNumber: input.documentNumber,
    documentType: input.documentType ?? 'sell',
    purchasedAt: input.purchasedAt ?? new Date().toISOString(),
    purchasePlace: input.purchasePlace,
    items: input.items,
    customerData,
    customerId: customer?.customerId ?? null,
    matched: Boolean(customer),
    grossValue,
    pointsEarned: 0,
    currency: 'points',
    createdAt: new Date().toISOString(),
  };

  // Store the transaction before awarding: a tier qualified on `totalSpending`
  // reads the store's transaction history, so recomputation would otherwise
  // miss the purchase that just happened.
  store.transactions.set(transaction.transactionId, transaction);

  if (customer) {
    const points = calculatePoints(store, transaction);
    if (points > 0) {
      const transfer = addPointsInternal(
        store,
        customer.customerId,
        points,
        `Transaction ${transaction.documentNumber}`,
        transaction.createdAt,
      );
      transfer.actionCause = { transactionId: transaction.transactionId };
      transaction.pointsEarned = points;
    }
    recordTransactionCampaigns(store, transaction);
    // A purchase can qualify a member on spend alone, with no points awarded.
    recomputeTier(store, customer);
  }

  return transaction;
}

/** Assign an unmatched transaction to a member and award its points. */
export function assignTransaction(
  store: Store,
  transaction: Transaction,
  customer: Customer,
): Transaction {
  if (transaction.matched) return transaction;
  transaction.customerId = customer.customerId;
  transaction.matched = true;

  const points = calculatePoints(store, transaction);
  if (points > 0) {
    const transfer = addPointsInternal(
      store,
      customer.customerId,
      points,
      `Transaction ${transaction.documentNumber}`,
    );
    transfer.actionCause = { transactionId: transaction.transactionId };
    transaction.pointsEarned = points;
  }
  recordTransactionCampaigns(store, transaction);
  // The transaction now counts toward the member's spend, so requalify them.
  recomputeTier(store, customer);
  return transaction;
}

/** Matches the CustomerStatus schema from the OpenLoyalty spec. */
export function serializeCustomerStatus(store: Store, customer: Customer) {
  const tier = store.tiers.get(customer.levelId);
  // Next tier is the next one up in the set's declared order, not the next
  // higher threshold — with several conditions there is no single number to
  // compare on.
  const tiers = sortedTiers(store, tier?.tierSetId).filter((t) => t.active);
  const currentIndex = tier ? tiers.findIndex((t) => t.levelId === tier.levelId) : -1;
  const next = currentIndex >= 0 ? tiers[currentIndex + 1] : tiers[0];
  const currentThreshold = tier ? tierThreshold(tier) : 0;

  // Kept for the summary view. The full picture — goals, percentages, the next
  // recalculation date — comes from the spec's tier-progress endpoint.
  const nextLevelRequirements = (next?.conditions ?? []).map((c) => {
    const current = memberMetric(store, customer, c.attribute);
    return {
      attribute: c.attribute,
      required: c.value,
      current,
      gap: Math.max(0, c.value - current),
    };
  });

  // `pointsToNextLevel` stays what its name says — a distance in units. A tier
  // qualified only on spend or tenure has no points gap to report, so it is
  // null rather than a figure in dollars or months that callers would render
  // as "pts".
  const unitsRequirement = nextLevelRequirements.find(
    (r) =>
      r.attribute === 'activeUnits' ||
      r.attribute === 'totalEarnedUnits' ||
      r.attribute === 'cumulatedEarnedUnits',
  );

  return {
    customerId: customer.customerId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    activePoints: customer.activePoints,
    earnedPoints: customer.earnedPoints,
    spentPoints: customer.spentPoints,
    expiredPoints: customer.expiredPoints,
    lockedPoints: customer.lockedPoints,
    blockedPoints: customer.blockedPoints,
    transferredPoints: 0,
    levelId: customer.levelId,
    levelName: tier?.name ?? null,
    /** Rank of the held tier within its set — 1 is the entry tier. */
    levelSortOrder: tier?.sortOrder ?? null,
    /** True when the tier was assigned rather than earned on conditions. */
    levelManuallyAssigned: customer.manualLevelId === customer.levelId,
    labels: customer.labels,
    levelConditionValue: currentThreshold,
    nextLevelName: next?.name ?? null,
    nextLevelConditionValue: next ? tierThreshold(next) : null,
    pointsToNextLevel: unitsRequirement ? unitsRequirement.gap : null,
    nextLevelRequirements,
    currency: 'points',
    transactionsCount: 0,
    transactionsAmount: 0,
    pointsExpiringNextMonth: 0,
  };
}

/**
 * Drop removed tiers from every reward's gate.
 *
 * `levels` is a whitelist where **empty means all tiers**, so simply filtering
 * out dead ids would silently widen a top-tier-only reward to everybody. A gate
 * that empties out is deactivated instead, leaving an admin to re-target it.
 */
export function pruneRewardLevels(store: Store): void {
  for (const reward of store.rewards.values()) {
    if (reward.levels.length === 0) continue;
    const live = reward.levels.filter((id) => store.tiers.has(id));
    if (live.length === reward.levels.length) continue;
    reward.levels = live;
    if (live.length === 0) reward.active = false;
  }
}

/** Matches TierSetResponse: the set plus the tiers that belong to it. */
export function serializeTierSet(store: Store, set: TierSet) {
  const tiers = sortedTiers(store, set.tierSetId);
  return {
    tierSetId: set.tierSetId,
    name: set.name,
    description: set.description,
    active: set.active,
    isDefault: set.isDefault,
    isMigrated: false,
    conditions: set.conditions,
    downgrade: set.downgrade,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
    translations: { en: { name: set.name, description: set.description } },
    tiers: tiers.map((t) => serializeTier(store, t)),
  };
}

/** Matches TierSetTiersResponse, with the member count the cockpit lists want. */
export function serializeTier(store: Store, tier: Tier) {
  const set = store.tierSets.get(tier.tierSetId);
  return {
    levelId: tier.levelId,
    tierSet: { tierSetId: tier.tierSetId, name: set?.name ?? '' },
    name: tier.name,
    description: tier.description,
    storeCode: tier.storeCode,
    active: tier.active,
    isDefault: tier.isDefault,
    sortOrder: tier.sortOrder,
    assignmentOnly: tier.assignmentOnly,
    qualifyingLabels: tier.qualifyingLabels,
    hasPhoto: false,
    rewards: [],
    conditions: tier.conditions,
    memberCount: [...store.customers.values()].filter(
      (c) => c.levelId === tier.levelId,
    ).length,
    createdAt: tier.createdAt,
    updatedAt: tier.updatedAt,
    translations: { en: { name: tier.name, description: tier.description } },
  };
}

/** Matches the Customer schema used by the members-list endpoint. */
export function serializeCustomer(store: Store, customer: Customer) {
  const tier = store.tiers.get(customer.levelId);
  return {
    customerId: customer.customerId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone ?? null,
    gender: customer.gender ?? null,
    loyaltyCardNumber: customer.loyaltyCardNumber ?? null,
    active: customer.active,
    createdAt: customer.createdAt,
    levelId: customer.levelId,
    levelName: tier?.name ?? null,
    levelManuallyAssigned: customer.manualLevelId === customer.levelId,
    labels: customer.labels,
    activePoints: customer.activePoints,
    earnedPoints: customer.earnedPoints,
    spentPoints: customer.spentPoints,
  };
}

/** Matches MemberRewardResponse. */
export function serializeReward(reward: Reward, customer?: Customer) {
  return {
    rewardId: reward.rewardId,
    reward: reward.reward,
    name: reward.name,
    shortDescription: reward.shortDescription,
    costInPoints: reward.costInPoints,
    active: reward.active,
    featured: reward.featured,
    public: reward.public,
    levels: reward.levels,
    usageLimit: reward.usageLimit,
    createdAt: reward.createdAt,
    ...(customer
      ? { canBeBoughtByCustomer: customer.activePoints >= reward.costInPoints }
      : {}),
  };
}
