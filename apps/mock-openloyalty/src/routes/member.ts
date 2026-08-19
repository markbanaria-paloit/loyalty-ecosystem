/**
 * Member endpoints, matching the real OpenLoyalty spec:
 *   POST /api/{storeCode}/member/register        (public self-registration)
 *   GET  /api/{storeCode}/member/points          (logged member's transfers)
 *   GET  /api/{storeCode}/member/reward          (rewards available to member)
 *   GET  /api/{storeCode}/member/tier            (logged member's tier)
 *   GET  /api/{storeCode}/member/reward/bought   (issued rewards)
 *   GET  /api/{storeCode}/member/{member}/status (CustomerStatus)
 *   POST /api/{storeCode}/reward/{reward}/buy    (redeem a reward)
 *
 * The `/member/...` collection routes are scoped to the token's identity;
 * `/member/{member}/...` routes accept an id but a member may only read their
 * own record (admins may read anyone's).
 */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  findCustomerByEmail,
  listEnvelope,
  serializeCustomerStatus,
  serializeIssuedReward,
  serializeReward,
  spendPointsInternal,
  MEMBER_REGISTERED_EVENT,
  recomputeTier,
  runInternalEventCampaigns,
  type MemberLabel,
  type Store,
  tierThreshold,
  type Customer,
} from '../data.js';
import { requireAuth, type AuthedRequest } from '../auth.js';

export const memberRouter = Router();

/**
 * Self-registration. The spec nests the payload under `customer` and requires
 * `plainPassword` + `agreement1`; we accept a flat body too for convenience.
 */
memberRouter.post('/api/:storeCode/member/register', (req, res) => {
  const store = req.store;
  const body = req.body?.customer ?? req.body ?? {};
  const { firstName, lastName, email } = body;
  const plainPassword = body.plainPassword ?? body.password;

  if (!email || !plainPassword) {
    res
      .status(400)
      .json({ code: 400, message: 'email and plainPassword are required' });
    return;
  }
  if (body.agreement1 !== true && body.agreement1 !== '1' && body.agreement1 !== 1) {
    res.status(400).json({ code: 400, message: 'agreement1 must be accepted' });
    return;
  }
  if (findCustomerByEmail(store, email)) {
    res.status(400).json({ code: 400, message: 'Email already exists' });
    return;
  }

  const defaultTier =
    [...store.tiers.values()].find((t) => t.isDefault) ??
    [...store.tiers.values()].sort((a, b) => tierThreshold(a) - tierThreshold(b))[0];

  // Labels tag the member with who they are (`customerType: union_member`,
  // say). Campaigns filter on them, which is how a member type that no metric
  // can express still drives tier and reward.
  const labels: MemberLabel[] = Array.isArray(body.labels)
    ? body.labels
        .filter(
          (l: unknown): l is MemberLabel =>
            Boolean(l) &&
            typeof (l as MemberLabel).key === 'string' &&
            typeof (l as MemberLabel).value === 'string',
        )
        .map((l: MemberLabel) => ({ key: l.key, value: l.value }))
    : [];

  const customer: Customer = {
    customerId: randomUUID(),
    firstName: firstName ?? '',
    lastName: lastName ?? '',
    email,
    password: plainPassword,
    phone: body.phone,
    gender: body.gender,
    birthDate: body.birthDate,
    loyaltyCardNumber: body.loyaltyCardNumber,
    agreement1: true,
    agreement2: body.agreement2 === true,
    agreement3: body.agreement3 === true,
    // Inactive, as Open Loyalty creates them. Activation is a separate call and
    // is what scores the enrolment campaigns — a member minted active here
    // would never have one to score.
    active: false,
    createdAt: body.registeredAt ?? new Date().toISOString(),
    labels,
    // Enrolment opens the member's first qualification period.
    periodStartedAt: body.registeredAt ?? new Date().toISOString(),
    lastPromotionAt: null,
    lastDowngradeAt: null,
    levelId: defaultTier?.levelId ?? '',
    manualLevelId: null,
    activePoints: 0,
    earnedPoints: 0,
    spentPoints: 0,
    expiredPoints: 0,
    lockedPoints: 0,
    blockedPoints: 0,
  };
  store.customers.set(customer.customerId, customer);

  // Nothing is awarded here. Open Loyalty creates a member inactive and scores
  // enrolment campaigns when they are activated, so a mock that paid out during
  // registration made a race disappear that a real tenant has — and the code
  // written to survive it was never once exercised. See `/activate`.
  res.json({
    customerId: customer.customerId,
    email: customer.email,
    campaignPayouts: [],
    status: serializeCustomerStatus(store, customer),
  });
});

/**
 * Score a member's enrolment campaigns, as activation does upstream.
 *
 * Exported so the activate route can call it without importing half of this
 * file's context: activation is an admin operation and lives over there, but
 * what it triggers belongs with enrolment.
 */
export function settleEnrolment(store: Store, customer: Customer) {
  const payouts = runInternalEventCampaigns(store, customer, MEMBER_REGISTERED_EVENT);
  recomputeTier(store, customer);
  return payouts;
}

/** Everything below needs a token. */
memberRouter.use('/api/:storeCode/member', requireAuth);
memberRouter.use('/api/:storeCode/reward/:reward/buy', requireAuth);

function currentCustomer(req: AuthedRequest) {
  const store = req.store;
  return { store, customer: store.customers.get(req.auth!.id) };
}

/** Logged member's units (points transfers). */
memberRouter.get('/api/:storeCode/member/points', (req: AuthedRequest, res) => {
  const { store } = currentCustomer(req);
  const items = [...store.transfers.values()]
    .filter((t) => t.accountId === req.auth!.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(listEnvelope(items));
});

/** Rewards available to the logged member. */
memberRouter.get('/api/:storeCode/member/reward', (req: AuthedRequest, res) => {
  const { store, customer } = currentCustomer(req);
  if (!customer) {
    res.status(404).json({ code: 404, message: 'Member not found' });
    return;
  }
  const items = [...store.rewards.values()]
    .filter((r) => r.active)
    .filter((r) => r.usageLimit === null || r.usageLimit > 0)
    .filter((r) => r.levels.length === 0 || r.levels.includes(customer.levelId))
    .map((r) => serializeReward(r, customer));
  res.json(listEnvelope(items));
});

/** Logged member's tier. */
memberRouter.get('/api/:storeCode/member/tier', (req: AuthedRequest, res) => {
  const { store, customer } = currentCustomer(req);
  const tier = customer ? store.tiers.get(customer.levelId) : undefined;
  if (!tier) {
    res.status(404).json({ code: 404, message: 'Tier not found' });
    return;
  }
  res.json(tier);
});

/** Rewards the logged member has already bought. */
memberRouter.get(
  '/api/:storeCode/member/reward/bought',
  (req: AuthedRequest, res) => {
    const { store } = currentCustomer(req);
    const items = [...store.issuedRewards.values()]
      .filter((r) => r.customerId === req.auth!.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({
        ...serializeIssuedReward(r),
        reward: store.rewards.get(r.rewardId)?.name ?? null,
      }));
    res.json(listEnvelope(items));
  },
);

/** Member status. A member may only read their own; admins may read anyone's. */
memberRouter.get(
  '/api/:storeCode/member/:member/status',
  (req: AuthedRequest, res) => {
    const store = req.store;
    const isAdmin = req.auth!.roles.includes('ROLE_ADMIN');
    if (!isAdmin && req.params.member !== req.auth!.id) {
      res.status(403).json({ code: 403, message: 'Access denied' });
      return;
    }
    const customer = store.customers.get(req.params.member);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    res.json(serializeCustomerStatus(store, customer));
  },
);

/**
 * Mark a coupon as used — the member has spent it.
 *
 * The spec's integration endpoint for a point of sale, and the counterpart to
 * buying rather than a later stage of it: buying puts the coupon in the
 * member's hand, this consumes it. The code is scoped to the member in the
 * path, so one member's coupon cannot be spent against another's account.
 *
 * A second attempt is a conflict, not a no-op. That is the whole value of
 * doing it here: a coupon shown at two tills is refused the second time, which
 * a fulfilment status change — settable over and over — would not catch.
 */
memberRouter.post(
  '/api/:storeCode/member/:member/reward/redeem',
  (req: AuthedRequest, res) => {
    const store = req.store;
    const code = String(req.body?.couponCode ?? '').trim().toUpperCase();
    if (!code) {
      res.status(400).json({ code: 400, message: 'couponCode is required' });
      return;
    }
    const issued = [...store.issuedRewards.values()].find(
      (r) =>
        r.customerId === req.params.member && r.couponCode.toUpperCase() === code,
    );
    if (!issued) {
      res.status(404).json({ code: 404, message: 'Coupon not found' });
      return;
    }
    if (issued.usedAt) {
      res.status(409).json({ code: 409, message: 'Coupon already used' });
      return;
    }
    issued.usedAt = new Date().toISOString();
    res.json({ code: issued.couponCode, used: true, customerId: issued.customerId });
  },
);

/** Mark a coupon as unused again — the undo for the call above. */
memberRouter.post(
  '/api/:storeCode/member/:member/reward/reissue',
  (req: AuthedRequest, res) => {
    const store = req.store;
    const code = String(req.body?.couponCode ?? '').trim().toUpperCase();
    const issued = [...store.issuedRewards.values()].find(
      (r) =>
        r.customerId === req.params.member && r.couponCode.toUpperCase() === code,
    );
    if (!issued) {
      res.status(404).json({ code: 404, message: 'Coupon not found' });
      return;
    }
    issued.usedAt = null;
    res.json({ code: issued.couponCode, used: false, customerId: issued.customerId });
  },
);

/** Buy (redeem) a reward. Spec returns an array of `{ issuedRewardId }`. */
memberRouter.post(
  '/api/:storeCode/reward/:reward/buy',
  (req: AuthedRequest, res) => {
    const store = req.store;
    const customer = store.customers.get(req.auth!.id);
    const reward = store.rewards.get(req.params.reward);
    if (!customer || !reward) {
      res.status(404).json({ code: 404, message: 'Not found' });
      return;
    }

    /**
     * The body is required, and its shape follows the reward's kind.
     *
     * Enforced because the real platform enforces it. This used to accept
     * anything, including the empty object the backend was sending, so a call
     * that could never work against a tenant passed every test here and failed
     * the first time it met one.
     */
    const body = (req.body ?? {}) as Record<string, unknown>;
    const missing = ['customerId']
      .concat(
        reward.type === 'conversion_coupon' ? [] : ['quantity', 'withoutPoints'],
      )
      .concat(reward.type === 'dynamic_coupon' ? ['couponValue'] : [])
      .filter((field) => body[field] === undefined);
    if (missing.length) {
      res.status(400).json({
        code: 400,
        message: 'Invalid form',
        errors: missing.map((path) => ({ path, message: 'This value is required.' })),
      });
      return;
    }
    if (!reward.active) {
      res.status(400).json({ code: 400, message: 'Reward is not active' });
      return;
    }
    if (reward.levels.length && !reward.levels.includes(customer.levelId)) {
      res
        .status(400)
        .json({ code: 400, message: 'Your tier cannot redeem this reward' });
      return;
    }
    if (reward.usageLimit !== null && reward.usageLimit <= 0) {
      res.status(400).json({ code: 400, message: 'Reward is sold out' });
      return;
    }
    if (customer.activePoints < reward.costInPoints) {
      res.status(400).json({ code: 400, message: 'Not enough points' });
      return;
    }

    const issuedRewardId = randomUUID();
    spendPointsInternal(
      store,
      customer.customerId,
      reward.costInPoints,
      `Redeemed: ${reward.name}`,
      new Date().toISOString(),
      { rewardId: reward.rewardId, issuedRewardId },
    );
    if (reward.usageLimit !== null) reward.usageLimit -= 1;

    const now = new Date().toISOString();
    store.issuedRewards.set(issuedRewardId, {
      issuedRewardId,
      rewardId: reward.rewardId,
      customerId: customer.customerId,
      couponCode: `OL-${issuedRewardId.slice(0, 6).toUpperCase()}`,
      // Bought, not yet spent. Buying puts a coupon in the member's hand;
      // consuming it is a separate act, at a separate endpoint.
      usedAt: null,
      // Spec: rewards are redeemed with `issued` status by default.
      status: 'issued',
      createdAt: now,
      statusHistory: [{ status: 'issued', at: now }],
    });

    res.json([{ issuedRewardId }]);
  },
);
