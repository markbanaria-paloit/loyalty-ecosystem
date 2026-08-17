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

export interface TierCondition {
  conditionId: string;
  attribute: string;
  value: number;
}

export interface Tier {
  levelId: string;
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  sortOrder: number;
  storeCode: string;
  /** Points required to hold this tier (`attribute: 'points'`). */
  conditions: TierCondition[];
  createdAt: string;
  updatedAt: string;
}

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
  levelId: string;
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
  status: RedemptionStatus;
  createdAt: string;
  statusHistory: Array<{ status: RedemptionStatus; comment?: string; at: string }>;
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

export interface Campaign {
  campaignId: string;
  name: string;
  description: string;
  active: boolean;
  condition: CampaignCondition;
  effect: CampaignEffect;
  createdAt: string;
}

export interface Store {
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

/** Points threshold for a tier, read off its `points` condition. */
export function tierThreshold(tier: Tier): number {
  return tier.conditions.find((c) => c.attribute === 'points')?.value ?? 0;
}

export function sortedTiers(store: Store): Tier[] {
  return [...store.tiers.values()].sort(
    (a, b) => tierThreshold(a) - tierThreshold(b),
  );
}

function recomputeTier(store: Store, customer: Customer): void {
  const tiers = sortedTiers(store);
  let current = tiers[0];
  for (const tier of tiers) {
    if (customer.earnedPoints >= tierThreshold(tier)) current = tier;
  }
  if (current) customer.levelId = current.levelId;
}

function makeTier(
  name: string,
  points: number,
  sortOrder: number,
  storeCode: string,
): Tier {
  return {
    levelId: randomUUID(),
    name,
    description: `${name} tier`,
    active: true,
    isDefault: points === 0,
    sortOrder,
    storeCode,
    conditions: [
      { conditionId: randomUUID(), attribute: 'points', value: points },
    ],
    createdAt: iso(365),
    updatedAt: iso(365),
  };
}

export function seedStore(code: string): Store {
  const store: Store = {
    tiers: new Map(),
    customers: new Map(),
    transfers: new Map(),
    rewards: new Map(),
    issuedRewards: new Map(),
    transactions: new Map(),
    campaigns: new Map(),
    basePointsPerCurrencyUnit: 1,
  };

  const bronze = makeTier('Bronze', 0, 1, code);
  const silver = makeTier('Silver', 500, 2, code);
  const gold = makeTier('Gold', 2000, 3, code);
  [bronze, silver, gold].forEach((t) => store.tiers.set(t.levelId, t));

  const rewards: Reward[] = [
    {
      rewardId: randomUUID(),
      reward: 'free-coffee',
      name: 'Free Coffee',
      shortDescription: 'Redeem a free medium coffee at any partner cafe.',
      costInPoints: 100,
      active: true,
      featured: true,
      public: true,
      levels: [],
      usageLimit: null,
      createdAt: iso(120),
    },
    {
      rewardId: randomUUID(),
      reward: 'voucher-10',
      name: '$10 Off Voucher',
      shortDescription: 'A $10 discount voucher for your next purchase.',
      costInPoints: 250,
      active: true,
      featured: false,
      public: true,
      levels: [],
      usageLimit: 500,
      createdAt: iso(120),
    },
    {
      rewardId: randomUUID(),
      reward: 'vip-event',
      name: 'VIP Event Ticket',
      shortDescription: 'Exclusive invite to a members-only event. Gold tier only.',
      costInPoints: 1500,
      active: true,
      featured: true,
      public: true,
      levels: [gold.levelId],
      usageLimit: 20,
      createdAt: iso(120),
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
    levelId: bronze.levelId,
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
    levelId: bronze.levelId,
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
    condition: {
      categories: ['coffee'],
      tierIds: [],
      minTransactionValue: 0,
      startsAt: null,
      endsAt: null,
    },
    effect: { type: 'multiplier', value: 3 },
    createdAt: iso(200),
  };
  store.campaigns.set(coffeeCampaign.campaignId, coffeeCampaign);

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
  const at = tx.purchasedAt;
  if (condition.startsAt && at < condition.startsAt) return false;
  if (condition.endsAt && at > condition.endsAt) return false;
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
  }

  store.transactions.set(transaction.transactionId, transaction);
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
  return transaction;
}

/** Matches the CustomerStatus schema from the OpenLoyalty spec. */
export function serializeCustomerStatus(store: Store, customer: Customer) {
  const tier = store.tiers.get(customer.levelId);
  const tiers = sortedTiers(store);
  const currentThreshold = tier ? tierThreshold(tier) : 0;
  const next = tiers.find((t) => tierThreshold(t) > currentThreshold);
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
    levelName: tier?.name ?? null,
    levelConditionValue: currentThreshold,
    nextLevelName: next?.name ?? null,
    nextLevelConditionValue: next ? tierThreshold(next) : null,
    pointsToNextLevel: next
      ? Math.max(0, tierThreshold(next) - customer.earnedPoints)
      : null,
    currency: 'points',
    transactionsCount: 0,
    transactionsAmount: 0,
    pointsExpiringNextMonth: 0,
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
