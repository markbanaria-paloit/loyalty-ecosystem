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
  getStore,
  listEnvelope,
  serializeCustomerStatus,
  serializeReward,
  spendPointsInternal,
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
  const store = getStore(req.params.storeCode);
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
    active: true,
    createdAt: body.registeredAt ?? new Date().toISOString(),
    levelId: defaultTier?.levelId ?? '',
    activePoints: 0,
    earnedPoints: 0,
    spentPoints: 0,
    expiredPoints: 0,
    lockedPoints: 0,
    blockedPoints: 0,
  };
  store.customers.set(customer.customerId, customer);

  // Spec returns 200 with customerId + email.
  res.json({ customerId: customer.customerId, email: customer.email });
});

/** Everything below needs a token. */
memberRouter.use('/api/:storeCode/member', requireAuth);
memberRouter.use('/api/:storeCode/reward/:reward/buy', requireAuth);

function currentCustomer(req: AuthedRequest) {
  const store = getStore(req.params.storeCode);
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
      .map((r) => ({ ...r, reward: store.rewards.get(r.rewardId)?.name ?? null }));
    res.json(listEnvelope(items));
  },
);

/** Member status. A member may only read their own; admins may read anyone's. */
memberRouter.get(
  '/api/:storeCode/member/:member/status',
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
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

/** Buy (redeem) a reward. Spec returns an array of `{ issuedRewardId }`. */
memberRouter.post(
  '/api/:storeCode/reward/:reward/buy',
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const customer = store.customers.get(req.auth!.id);
    const reward = store.rewards.get(req.params.reward);
    if (!customer || !reward) {
      res.status(404).json({ code: 404, message: 'Not found' });
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
      // Spec: rewards are redeemed with `issued` status by default.
      status: 'issued',
      createdAt: now,
      statusHistory: [{ status: 'issued', at: now }],
    });

    res.json([{ issuedRewardId }]);
  },
);
