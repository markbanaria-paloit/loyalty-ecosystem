/**
 * Tier set and tier endpoints, following the OpenLoyalty spec:
 *   GET  /api/{storeCode}/tierSet
 *   POST /api/{storeCode}/tierSet
 *   GET  /api/{storeCode}/tierSet/{tierSet}
 *   PUT  /api/{storeCode}/tierSet/{tierSet}
 *   GET  /api/{storeCode}/tierSet/{tierSet}/tiers
 *   PUT  /api/{storeCode}/tierSet/{tierSet}/tiers   (bulk upsert with values)
 *   DELETE /api/{storeCode}/tier/{tier}
 *   POST /api/{storeCode}/tier/{tier}/activate|deactivate
 *
 * The split matters: conditions are declared once on the set, and every tier
 * supplies a value for each of them. That is the shape the admin console's
 * tier-set wizard writes, and the reason a condition change resets thresholds.
 *
 * Every write that can move members re-runs tier recomputation, so a saved
 * configuration is never merely cosmetic.
 */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  assignTierManually,
  defaultTierSet,
  getStore,
  listEnvelope,
  pruneRewardLevels,
  recomputeAllTiers,
  recalculateMember,
  removeManualTier,
  runDueRecalculations,
  serializeTierSetMemberProgress,
  serializeCustomerStatus,
  serializeTier,
  serializeTierSet,
  sortedTiers,
  TIER_CONDITION_ATTRIBUTES,
  type Store,
  type Tier,
  type TierCondition,
  type MemberLabel,
  type TierConditionAttribute,
  type TierSet,
  type TierSetCondition,
} from '../data.js';
import { requireAdmin, requireAuth, type AuthedRequest } from '../auth.js';

export const tierRouter = Router();

/** A member may read their own record; an admin may read anyone's. */
function canRead(req: AuthedRequest): boolean {
  return (
    req.auth!.roles.includes('ROLE_ADMIN') || req.params.member === req.auth!.id
  );
}

/** The console caps a tier set at eight conditions; mirror that here. */
const MAX_CONDITIONS = 8;

/** Attributes measured in units carry a wallet, per the spec. */
function isUnitAttribute(attribute: TierConditionAttribute): boolean {
  return (
    attribute === 'activeUnits' ||
    attribute === 'totalEarnedUnits' ||
    attribute === 'cumulatedEarnedUnits'
  );
}

interface ConditionInput {
  id?: unknown;
  attribute?: unknown;
  walletType?: unknown;
}

/**
 * Read the set-level condition list.
 *
 * An input `id` that matches an existing condition keeps it — and with it every
 * tier value already recorded against that id. Anything else is a new
 * condition, which is what makes the console's "changing the conditions will
 * reset all tiers' threshold values to 0" warning true.
 */
function readConditions(
  raw: unknown,
  existing: TierSetCondition[],
): { conditions: TierSetCondition[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: 'conditions must contain at least one entry' };
  }
  if (raw.length > MAX_CONDITIONS) {
    return { error: `a tier set may have at most ${MAX_CONDITIONS} conditions` };
  }

  const conditions: TierSetCondition[] = [];
  const seen = new Set<string>();

  for (const entry of raw as ConditionInput[]) {
    const attribute = entry?.attribute;
    if (
      typeof attribute !== 'string' ||
      !TIER_CONDITION_ATTRIBUTES.includes(attribute as TierConditionAttribute)
    ) {
      return {
        error: `condition.attribute must be one of: ${TIER_CONDITION_ATTRIBUTES.join(', ')}`,
      };
    }
    if (seen.has(attribute)) {
      return { error: `condition ${attribute} is listed more than once` };
    }
    seen.add(attribute);

    const kept =
      typeof entry.id === 'string'
        ? existing.find((c) => c.id === entry.id && c.attribute === attribute)
        : undefined;

    conditions.push({
      id: kept?.id ?? randomUUID(),
      attribute: attribute as TierConditionAttribute,
      ...(isUnitAttribute(attribute as TierConditionAttribute)
        ? { walletType: (typeof entry.walletType === 'string' && entry.walletType) || 'default' }
        : {}),
    });
  }

  return { conditions };
}

/**
 * Bring every tier in the set in line with the set's conditions: drop values
 * for conditions that no longer exist, and default newly added ones to 0.
 */
function realignTierConditions(store: Store, set: TierSet): void {
  for (const tier of store.tiers.values()) {
    if (tier.tierSetId !== set.tierSetId) continue;
    tier.conditions = set.conditions.map((c) => {
      const previous = tier.conditions.find((tc) => tc.conditionId === c.id);
      return { conditionId: c.id, attribute: c.attribute, value: previous?.value ?? 0 };
    });
    tier.updatedAt = new Date().toISOString();
  }
}

/* ---------------------------- Tier sets ---------------------------- */

tierRouter.get('/api/:storeCode/tierSet', requireAdmin, (req: AuthedRequest, res) => {
  const store = getStore(req.params.storeCode);
  const items = [...store.tierSets.values()].map((s) => serializeTierSet(store, s));
  res.json(listEnvelope(items));
});

tierRouter.post('/api/:storeCode/tierSet', requireAdmin, (req: AuthedRequest, res) => {
  const store = getStore(req.params.storeCode);
  const body = req.body?.tierSet ?? req.body ?? {};
  const name = body.translations?.en?.name ?? body.name;
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ code: 400, message: 'name is required' });
    return;
  }

  const built = readConditions(body.conditions, []);
  if ('error' in built) {
    res.status(400).json({ code: 400, message: built.error });
    return;
  }

  const now = new Date().toISOString();
  const set: TierSet = {
    tierSetId: randomUUID(),
    name: name.trim(),
    description: body.translations?.en?.description ?? body.description ?? '',
    active: body.active !== false,
    // The first set created owns the store's members.
    isDefault: store.tierSets.size === 0,
    conditions: built.conditions,
    downgrade: { mode: body.downgrade?.mode === 'automatic' ? 'automatic' : 'none' },
    createdAt: now,
    updatedAt: now,
  };
  store.tierSets.set(set.tierSetId, set);
  res.status(201).json(serializeTierSet(store, set));
});

tierRouter.get(
  '/api/:storeCode/tierSet/:tierSet',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const set = store.tierSets.get(req.params.tierSet);
    if (!set) {
      res.status(404).json({ code: 404, message: 'Tier set not found' });
      return;
    }
    res.json(serializeTierSet(store, set));
  },
);

tierRouter.put(
  '/api/:storeCode/tierSet/:tierSet',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const set = store.tierSets.get(req.params.tierSet);
    if (!set) {
      res.status(404).json({ code: 404, message: 'Tier set not found' });
      return;
    }
    const body = req.body?.tierSet ?? req.body ?? {};
    const name = body.translations?.en?.name ?? body.name;
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ code: 400, message: 'name cannot be empty' });
        return;
      }
      set.name = name.trim();
    }
    const description = body.translations?.en?.description ?? body.description;
    if (description !== undefined) set.description = String(description);
    if (body.active !== undefined) set.active = Boolean(body.active);
    if (body.downgrade?.mode !== undefined) {
      set.downgrade = { mode: body.downgrade.mode === 'automatic' ? 'automatic' : 'none' };
    }

    if (body.conditions !== undefined) {
      const built = readConditions(body.conditions, set.conditions);
      if ('error' in built) {
        res.status(400).json({ code: 400, message: built.error });
        return;
      }
      set.conditions = built.conditions;
      realignTierConditions(store, set);
    }

    set.updatedAt = new Date().toISOString();
    const moved = recomputeAllTiers(store);
    res.json({ ...serializeTierSet(store, set), membersRecalculated: moved });
  },
);

/* ------------------------------ Tiers ------------------------------ */

tierRouter.get(
  '/api/:storeCode/tierSet/:tierSet/tiers',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    if (!store.tierSets.has(req.params.tierSet)) {
      res.status(404).json({ code: 404, message: 'Tier set not found' });
      return;
    }
    const items = sortedTiers(store, req.params.tierSet).map((t) => serializeTier(store, t));
    res.json(listEnvelope(items));
  },
);

interface TierInput {
  levelId?: unknown;
  name?: unknown;
  description?: unknown;
  active?: unknown;
  assignmentOnly?: unknown;
  qualifyingLabels?: unknown;
  translations?: { en?: { name?: unknown; description?: unknown } };
  conditions?: Array<{ conditionId?: unknown; value?: unknown }>;
}

/**
 * Replace the set's tier list in one call — the shape of the wizard's "Tiers
 * conditions value" step, which submits every tier at once.
 *
 * Tiers are ranked by their position in the array. Thresholds must not
 * decrease as you go up, which is the spec's own rule ("it must not be lower
 * than the lower tier's value") and stops a set from being unreachable.
 */
tierRouter.put(
  '/api/:storeCode/tierSet/:tierSet/tiers',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const set = store.tierSets.get(req.params.tierSet);
    if (!set) {
      res.status(404).json({ code: 404, message: 'Tier set not found' });
      return;
    }

    const input = req.body?.tiers;
    if (!Array.isArray(input) || input.length === 0) {
      res.status(400).json({ code: 400, message: 'tiers must contain at least one tier' });
      return;
    }

    const drafts: Tier[] = [];
    const now = new Date().toISOString();

    for (const [index, raw] of (input as TierInput[]).entries()) {
      const name = raw.translations?.en?.name ?? raw.name;
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ code: 400, message: `tiers.${index}.name is required` });
        return;
      }

      const conditions: TierCondition[] = [];
      for (const setCondition of set.conditions) {
        const supplied = raw.conditions?.find((c) => c.conditionId === setCondition.id);
        const value = Number(supplied?.value ?? 0);
        if (!Number.isFinite(value) || value < 0) {
          res.status(400).json({
            code: 400,
            message: `tiers.${index}.conditions.${setCondition.attribute} must be >= 0`,
          });
          return;
        }
        const previousLadderTier = [...drafts].reverse().find((d) => !d.assignmentOnly);
        const below = raw.assignmentOnly
          ? undefined
          : previousLadderTier?.conditions.find((c) => c.conditionId === setCondition.id);
        if (below && value < below.value) {
          res.status(400).json({
            code: 400,
            message:
              `tiers.${index}.conditions.${setCondition.attribute} (${value}) must not be ` +
              `lower than the tier below it (${below.value})`,
          });
          return;
        }
        conditions.push({
          conditionId: setCondition.id,
          attribute: setCondition.attribute,
          value,
        });
      }

      const existing =
        typeof raw.levelId === 'string' ? store.tiers.get(raw.levelId) : undefined;

      drafts.push({
        levelId: existing?.levelId ?? randomUUID(),
        tierSetId: set.tierSetId,
        name: name.trim(),
        description:
          (raw.translations?.en?.description ?? raw.description ?? existing?.description ?? '') as string,
        active: raw.active === undefined ? existing?.active ?? true : Boolean(raw.active),
        // The entry tier is the first in the list, not whichever has a 0 value.
        isDefault: index === 0,
        sortOrder: index + 1,
        storeCode: req.params.storeCode,
        assignmentOnly:
          raw.assignmentOnly === undefined
            ? existing?.assignmentOnly ?? false
            : Boolean(raw.assignmentOnly),
        qualifyingLabels: Array.isArray(raw.qualifyingLabels)
          ? (raw.qualifyingLabels as MemberLabel[])
              .filter((l) => typeof l?.key === 'string' && typeof l?.value === 'string')
              .map((l) => ({ key: l.key, value: l.value }))
          : existing?.qualifyingLabels ?? [],
        conditions,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    }

    // Tiers omitted from the payload are removed; members on them are moved by
    // the recompute below rather than left pointing at a tier that is gone.
    for (const tier of [...store.tiers.values()]) {
      if (tier.tierSetId === set.tierSetId) store.tiers.delete(tier.levelId);
    }
    drafts.forEach((t) => store.tiers.set(t.levelId, t));
    set.updatedAt = now;

    pruneRewardLevels(store);
    const moved = recomputeAllTiers(store);
    res.json({
      ...listEnvelope(drafts.map((t) => serializeTier(store, t))),
      membersRecalculated: moved,
    });
  },
);

tierRouter.delete(
  '/api/:storeCode/tier/:tier',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const tier = store.tiers.get(req.params.tier);
    if (!tier) {
      res.status(404).json({ code: 404, message: 'Tier not found' });
      return;
    }
    if (sortedTiers(store, tier.tierSetId).length <= 1) {
      res.status(400).json({ code: 400, message: 'A tier set must keep at least one tier' });
      return;
    }
    store.tiers.delete(tier.levelId);
    // Re-rank what is left so the entry tier is unambiguous.
    sortedTiers(store, tier.tierSetId).forEach((t, i) => {
      t.sortOrder = i + 1;
      t.isDefault = i === 0;
    });
    pruneRewardLevels(store);
    recomputeAllTiers(store);
    res.status(204).end();
  },
);

for (const action of ['activate', 'deactivate'] as const) {
  tierRouter.post(
    `/api/:storeCode/tier/:tier/${action}`,
    requireAdmin,
    (req: AuthedRequest, res) => {
      const store = getStore(req.params.storeCode);
      const tier = store.tiers.get(req.params.tier);
      if (!tier) {
        res.status(404).json({ code: 404, message: 'Tier not found' });
        return;
      }
      tier.active = action === 'activate';
      tier.updatedAt = new Date().toISOString();
      recomputeAllTiers(store);
      res.json(serializeTier(store, tier));
    },
  );
}

/** Recalculate every member against the current configuration, on demand. */
tierRouter.post(
  '/api/:storeCode/tier/recalculate',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const set = defaultTierSet(store);
    res.json({
      tierSetId: set?.tierSetId ?? null,
      membersRecalculated: recomputeAllTiers(store),
      totalMembers: store.customers.size,
    });
  },
);

/* --------------------- Manual tier assignment ---------------------- *
 * Spec:
 *   POST /api/{storeCode}/member/{member}/tier
 *   POST /api/{storeCode}/member/{member}/remove-manually-level
 *
 * The escape hatch for tiers no metric can express. An assigned tier is held
 * against automatic downgrade until it is explicitly removed.
 * ------------------------------------------------------------------- */

tierRouter.post(
  '/api/:storeCode/member/:member/tier',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const customer = store.customers.get(req.params.member);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    const levelId = req.body?.levelId;
    if (typeof levelId !== 'string' || !assignTierManually(store, customer, levelId)) {
      res.status(400).json({ code: 400, message: 'levelId must be an existing tier' });
      return;
    }
    res.json(serializeCustomerStatus(store, customer));
  },
);

tierRouter.post(
  '/api/:storeCode/member/:member/remove-manually-level',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const customer = store.customers.get(req.params.member);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    removeManualTier(store, customer);
    res.json(serializeCustomerStatus(store, customer));
  },
);

/* ---------------------- Member tier progress ----------------------- *
 * Spec:
 *   GET /api/{storeCode}/member/{member}/tierSet
 *   GET /api/{storeCode}/member/{member}/tierSet/{tierSet}
 *
 * The engine owns qualification, so the engine reports progress against it —
 * condition by condition, with the goal for each. A client that worked this out
 * for itself would be re-deriving rules it does not hold.
 *
 * Due recalculations are run on read, so the mock behaves as a scheduled
 * platform would without needing a scheduler.
 * ------------------------------------------------------------------- */

tierRouter.get(
  '/api/:storeCode/member/:member/tierSet',
  requireAuth,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    if (!canRead(req)) {
      res.status(403).json({ code: 403, message: 'Access denied' });
      return;
    }
    runDueRecalculations(store);
    const customer = store.customers.get(req.params.member);
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }
    const set = defaultTierSet(store);
    if (!set) {
      res.json(listEnvelope([]));
      return;
    }
    const tier = store.tiers.get(customer.levelId);
    res.json(
      listEnvelope([
        {
          currentTierId: customer.levelId,
          currentTierName: tier?.name ?? null,
          tierSetId: set.tierSetId,
          tierSetName: set.name,
          manually: customer.manualLevelId === customer.levelId,
        },
      ]),
    );
  },
);

tierRouter.get(
  '/api/:storeCode/member/:member/tierSet/:tierSet',
  requireAuth,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    if (!canRead(req)) {
      res.status(403).json({ code: 403, message: 'Access denied' });
      return;
    }
    runDueRecalculations(store);
    const customer = store.customers.get(req.params.member);
    const set = store.tierSets.get(req.params.tierSet);
    if (!customer || !set) {
      res.status(404).json({ code: 404, message: 'Not found' });
      return;
    }
    res.json(serializeTierSetMemberProgress(store, customer, set));
  },
);

/**
 * Force a recalculation cycle now, rather than waiting for a period to elapse.
 *
 * Takes an optional `member` so a single account can be rolled over. Without it
 * the whole store is recalculated, which closes every member's period at once —
 * destructive enough that it should be an explicit choice.
 */
tierRouter.post(
  '/api/:storeCode/tier/recalculate-periods',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const only = typeof req.body?.member === 'string' ? req.body.member : null;

    if (only) {
      const customer = store.customers.get(only);
      if (!customer) {
        res.status(404).json({ code: 404, message: 'Member not found' });
        return;
      }
      res.json({
        membersRecalculated: recalculateMember(store, customer) ? 1 : 0,
        totalMembers: 1,
      });
      return;
    }

    let moved = 0;
    for (const customer of store.customers.values()) {
      if (recalculateMember(store, customer)) moved += 1;
    }
    res.json({ membersRecalculated: moved, totalMembers: store.customers.size });
  },
);
