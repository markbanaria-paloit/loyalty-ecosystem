/**
 * Admin endpoints, matching the real OpenLoyalty spec:
 *   GET  /api/{storeCode}/member                       (members list)
 *   GET  /api/{storeCode}/member/{member}
 *   POST /api/{storeCode}/member/{member}/activate|deactivate
 *   POST /api/{storeCode}/points/add                   ({ transfer: {...} })
 *   POST /api/{storeCode}/points/spend
 *   GET  /api/{storeCode}/points                       (all transfers)
 *   GET  /api/{storeCode}/tier                         (tiers list)
 *   GET  /api/{storeCode}/reward                       (rewards list)
 *   POST /api/{storeCode}/reward                       (create)
 *   PUT  /api/{storeCode}/reward/{reward}              (update)
 *   POST /api/{storeCode}/reward/{reward}/activate|deactivate
 *   GET  /api/{storeCode}/redemption                   (issued rewards)
 *
 * Plus one non-spec convenience route for the admin cockpit dashboard:
 *   GET  /api/{storeCode}/admin/stats
 */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  addPointsInternal,
  listEnvelope,
  defaultTierSet,
  serializeCustomer,
  serializeIssuedReward,
  serializeReward,
  serializeTier,
  sortedTiers,
  spendPointsInternal,
  tierThreshold,
  type Reward,
} from '../data.js';
import { requireAdmin, type AuthedRequest } from '../auth.js';
import { settleEnrolment } from './member.js';
import { resetStore } from '../persistence.js';

export const adminRouter = Router();

/* ----------------------------- Members ----------------------------- */

adminRouter.get('/api/:storeCode/member', requireAdmin, (req: AuthedRequest, res) => {
  const store = req.store;
  /**
   * The filters a caller actually uses, honoured rather than ignored.
   *
   * A till scans a card and asks for that member by `loyaltyCardNumber`. This
   * used to answer with every member in the store, newest first, and the till
   * took the first — so it identified whoever had signed up most recently
   * instead of the person at the counter, and did it silently.
   */
  const wantedCard = String(req.query.loyaltyCardNumber ?? '').trim();
  const wantedEmail = String(req.query.email ?? '').trim().toLowerCase();

  const matched = [...store.customers.values()]
    .filter((c) => !wantedCard || c.loyaltyCardNumber === wantedCard)
    .filter((c) => !wantedEmail || c.email.toLowerCase() === wantedEmail)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Paged like the real list, so a caller that reads one response and stops
  // finds out here rather than against a tenant with real membership.
  const perPage = Math.min(Math.max(Number(req.query.itemsOnPage ?? 10) || 10, 1), 50);
  const page = Math.max(Number(req.query.page ?? 1) || 1, 1);
  const start = (page - 1) * perPage;
  res.json({
    items: matched.slice(start, start + perPage).map((c) => serializeCustomer(store, c)),
    total: { all: matched.length, filtered: matched.length, estimated: false },
  });
});

adminRouter.get(
  '/api/:storeCode/member/:member',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const customer = store.customers.get(req.params.member);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    res.json(serializeCustomer(store, customer));
  },
);

for (const action of ['activate', 'deactivate'] as const) {
  adminRouter.post(
    `/api/:storeCode/member/:member/${action}`,
    requireAdmin,
    (req: AuthedRequest, res) => {
      const store = req.store;
      const customer = store.customers.get(req.params.member);
      if (!customer) {
        res.status(404).json({ code: 404, message: 'Member not found' });
        return;
      }
      const wasActive = customer.active;
      customer.active = action === 'activate';
      // Activating is what pays the welcome award: Open Loyalty scores
      // enrolment campaigns here, not at registration, which is why a caller
      // that reads the balance straight after registering sees nothing.
      if (customer.active && !wasActive) settleEnrolment(store, customer);
      res.json({ customerId: customer.customerId, active: customer.active });
    },
  );
}

/* ------------------------------ Points ----------------------------- */

/** Spec wraps the payload as `{ transfer: { customer, points, comment } }`. */
function readTransferBody(body: unknown): {
  customer?: string;
  points?: unknown;
  comment?: string;
} {
  const b = (body ?? {}) as Record<string, unknown>;
  return (b.transfer ?? b) as { customer?: string; points?: unknown; comment?: string };
}

adminRouter.post(
  '/api/:storeCode/points/add',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const { customer, points, comment } = readTransferBody(req.body);
    if (!customer || !store.customers.has(customer)) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    const value = Number(points);
    if (!Number.isFinite(value) || value <= 0) {
      res.status(400).json({ code: 400, message: 'points must be > 0' });
      return;
    }
    const transfer = addPointsInternal(
      store,
      customer,
      value,
      comment ?? 'Points added',
    );
    res.json({ transferId: transfer.transferId });
  },
);

adminRouter.post(
  '/api/:storeCode/points/spend',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const { customer, points, comment } = readTransferBody(req.body);
    const member = customer ? store.customers.get(customer) : undefined;
    if (!member) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    const value = Number(points);
    if (!Number.isFinite(value) || value <= 0) {
      res.status(400).json({ code: 400, message: 'points must be > 0' });
      return;
    }
    if (member.activePoints < value) {
      res.status(400).json({ code: 400, message: 'Not enough points' });
      return;
    }
    const transfer = spendPointsInternal(
      store,
      member.customerId,
      value,
      comment ?? 'Points spent',
    );
    res.json({ transferId: transfer.transferId });
  },
);

/** All transfers in the store, newest first, enriched with member names. */
adminRouter.get('/api/:storeCode/points', requireAdmin, (req: AuthedRequest, res) => {
  const store = req.store;
  const items = [...store.transfers.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((t) => {
      const customer = store.customers.get(t.accountId);
      return {
        ...t,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`.trim()
          : 'Unknown',
        customerEmail: customer?.email ?? null,
      };
    });
  res.json(listEnvelope(items));
});

/* ------------------------------- Tiers ----------------------------- */

adminRouter.get('/api/:storeCode/tier', requireAdmin, (req: AuthedRequest, res) => {
  const store = req.store;
  res.json(listEnvelope(sortedTiers(store).map((t) => serializeTier(store, t))));
});

/* ------------------------------ Rewards ---------------------------- */

adminRouter.get('/api/:storeCode/reward', requireAdmin, (req: AuthedRequest, res) => {
  const store = req.store;
  const items = [...store.rewards.values()].map((r) => serializeReward(r));
  res.json(listEnvelope(items));
});

adminRouter.post('/api/:storeCode/reward', requireAdmin, (req: AuthedRequest, res) => {
  const store = req.store;
  const { name, shortDescription, costInPoints, levels, usageLimit } =
    req.body ?? {};
  const cost = Number(costInPoints);
  if (!name || !Number.isFinite(cost) || cost <= 0) {
    res
      .status(400)
      .json({ code: 400, message: 'name and a positive costInPoints are required' });
    return;
  }
  const reward: Reward = {
    rewardId: randomUUID(),
    reward: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    shortDescription: shortDescription ?? '',
    costInPoints: cost,
    active: true,
    featured: false,
    public: true,
    levels: Array.isArray(levels) ? levels : [],
    usageLimit:
      usageLimit === null || usageLimit === undefined || usageLimit === ''
        ? null
        : Number(usageLimit),
    createdAt: new Date().toISOString(),
  };
  store.rewards.set(reward.rewardId, reward);
  res.status(201).json(serializeReward(reward));
});

adminRouter.put(
  '/api/:storeCode/reward/:reward',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const reward = store.rewards.get(req.params.reward);
    if (!reward) {
      res.status(404).json({ code: 404, message: 'Reward not found' });
      return;
    }
    const { name, shortDescription, costInPoints, levels, usageLimit, featured } =
      req.body ?? {};
    if (name !== undefined) reward.name = name;
    if (shortDescription !== undefined) reward.shortDescription = shortDescription;
    if (costInPoints !== undefined) reward.costInPoints = Number(costInPoints);
    if (levels !== undefined) reward.levels = Array.isArray(levels) ? levels : [];
    if (featured !== undefined) reward.featured = Boolean(featured);
    if (usageLimit !== undefined) {
      reward.usageLimit =
        usageLimit === null || usageLimit === '' ? null : Number(usageLimit);
    }
    res.json(serializeReward(reward));
  },
);

for (const action of ['activate', 'deactivate'] as const) {
  adminRouter.post(
    `/api/:storeCode/reward/:reward/${action}`,
    requireAdmin,
    (req: AuthedRequest, res) => {
      const store = req.store;
      const reward = store.rewards.get(req.params.reward);
      if (!reward) {
        res.status(404).json({ code: 404, message: 'Reward not found' });
        return;
      }
      reward.active = action === 'activate';
      res.json(serializeReward(reward));
    },
  );
}

/* ---------------------------- Redemptions -------------------------- */

adminRouter.get(
  '/api/:storeCode/redemption',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const items = [...store.issuedRewards.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => {
        const customer = store.customers.get(r.customerId);
        const reward = store.rewards.get(r.rewardId);
        // Field names follow the spec's `issuedReward`: the reward's name is
        // `name`, and who holds it is `customerData`. A prettier `rewardName`
        // here would only be a name a real tenant never sends.
        return {
          ...serializeIssuedReward(r),
          name: reward?.name ?? 'Unknown',
          costInPoints: reward?.costInPoints ?? 0,
          customerData: customer
            ? {
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                loyaltyCardNumber: customer.loyaltyCardNumber,
              }
            : null,
        };
      });

    // Paged, because the real list is. The spec's default is ten per page and
    // fifty is the ceiling — a caller that reads the response and stops has
    // seen ten redemptions, not all of them, and the only place that mistake
    // shows up is a tenant with more than a page of history.
    const perPage = Math.min(
      Math.max(Number(req.query.itemsOnPage ?? 10) || 10, 1),
      50,
    );
    const page = Math.max(Number(req.query.page ?? 1) || 1, 1);
    const start = (page - 1) * perPage;
    res.json({
      items: items.slice(start, start + perPage),
      total: { all: items.length, filtered: items.length, estimated: false },
    });
  },
);

/* ------------------------- Cockpit dashboard ----------------------- *
 * Not part of the OpenLoyalty spec — an aggregate the admin UI needs.
 * Against a real instance this would come from the Analytics endpoints.
 * ------------------------------------------------------------------- */

adminRouter.get(
  '/api/:storeCode/admin/stats',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const customers = [...store.customers.values()];
    const transfers = [...store.transfers.values()].filter((t) => !t.cancelled);

    const sum = (type: 'adding' | 'spending') =>
      transfers.filter((t) => t.type === type).reduce((acc, t) => acc + t.value, 0);

    const tierSet = defaultTierSet(store);
    const membersByTier = sortedTiers(store, tierSet?.tierSetId).map((tier) => ({
      levelId: tier.levelId,
      name: tier.name,
      threshold: tierThreshold(tier),
      active: tier.active,
      conditions: tier.conditions,
      count: customers.filter((c) => c.levelId === tier.levelId).length,
    }));

    const campaigns = [...store.campaigns.values()];

    res.json({
      totalMembers: customers.length,
      activeMembers: customers.filter((c) => c.active).length,
      pointsIssued: sum('adding'),
      pointsRedeemed: sum('spending'),
      // Points sitting on member balances — the program's liability.
      outstandingPoints: customers.reduce((acc, c) => acc + c.activePoints, 0),
      totalRedemptions: store.issuedRewards.size,
      activeRewards: [...store.rewards.values()].filter((r) => r.active).length,
      activeCampaigns: campaigns.filter((c) => c.active).length,
      campaignPointsIssued: campaigns.reduce((acc, c) => acc + c.stats.pointsIssued, 0),
      tierSet: tierSet
        ? { tierSetId: tierSet.tierSetId, name: tierSet.name, conditions: tierSet.conditions }
        : null,
      membersByTier,
      campaignPerformance: campaigns
        .map((c) => ({
          campaignId: c.campaignId,
          name: c.name,
          trigger: c.trigger,
          active: c.active,
          executions: c.stats.executions,
          pointsIssued: c.stats.pointsIssued,
        }))
        .sort((a, b) => b.pointsIssued - a.pointsIssued),
    });
  },
);

/**
 * Drop the store so the next request reseeds it.
 *
 * Restarting the process used to be the reset button. Now that state outlives
 * the process, a demo needs an explicit way back to a clean programme — and a
 * run that has accumulated test members needs it before the next one.
 */
adminRouter.post(
  '/api/:storeCode/admin/reset',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const code = req.params.storeCode;
    resetStore(code)
      .then(() => res.json({ reset: true, storeCode: code }))
      .catch((err) => {
        console.error('Reset failed', err);
        res.status(500).json({ code: 500, message: 'Reset failed' });
      });
  },
);
