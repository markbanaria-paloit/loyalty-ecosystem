/**
 * Campaign endpoints, following the OpenLoyalty spec's shape:
 *   GET    /api/{storeCode}/campaign
 *   POST   /api/{storeCode}/campaign
 *   GET    /api/{storeCode}/campaign/{campaign}
 *   PUT    /api/{storeCode}/campaign/{campaign}
 *   DELETE /api/{storeCode}/campaign/{campaign}
 *   POST   /api/{storeCode}/campaign/simulate
 *   POST   /api/{storeCode}/campaign/{campaign}/activate|deactivate
 *
 * A campaign is a trigger, conditions and effects, bounded by limits — the
 * structure the admin console's five-step wizard walks through. `simulate`
 * is the interesting one: it projects a draft campaign's impact (replaying
 * transaction history for purchase triggers) before anything goes live.
 */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  campaignRules,
  emptyCampaignStats,
  getStore,
  readCampaignRules,
  listEnvelope,
  simulateCampaign,
  MEMBER_REGISTERED_EVENT,
  type Campaign,
  type CampaignEffectType,
  type CampaignLimit,
  type CampaignLimits,
  type CampaignMemberFilter,
  type CampaignTimeStrategy,
  type CampaignTrigger,
  type CampaignTriggerStrategy,
  type CampaignVisibility,
} from '../data.js';
import { requireAdmin, type AuthedRequest } from '../auth.js';

export const campaignRouter = Router();

const EFFECT_TYPES: CampaignEffectType[] = ['multiplier', 'bonus_points'];
const TRIGGERS: CampaignTrigger[] = ['transaction', 'internal_event', 'time'];
const TIME_STRATEGIES: CampaignTimeStrategy[] = [
  'birthday',
  'registration_anniversary',
  'daily',
  'weekly',
  'monthly',
];

interface DraftInput {
  name?: unknown;
  description?: unknown;
  trigger?: unknown;
  event?: unknown;
  triggerStrategy?: { type?: unknown; executionSchedule?: unknown };
  activity?: { startsAt?: unknown; endsAt?: unknown };
  displayOrder?: unknown;
  effect?: { type?: unknown; value?: unknown };
  limits?: { points?: unknown; pointsPerMember?: unknown; executionsPerMember?: unknown };
  visibility?: { target?: unknown; tiers?: unknown };
  assignTierId?: unknown;
  assignTierSetId?: unknown;
  memberFilter?: { labels?: unknown; excludeLabels?: unknown };
  /** The spec's rules array; preferred over the flat fields when present. */
  rules?: unknown;
  condition?: {
    categories?: unknown;
    tierIds?: unknown;
    minTransactionValue?: unknown;
    startsAt?: unknown;
    endsAt?: unknown;
  };
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * Optional positive ceiling: absent, null or '' all mean "no limit".
 *
 * The spec wraps a limit as `{ value, interval }`; a bare number is accepted
 * too, since that is what the campaign studio sends.
 */
function limit(raw: unknown): CampaignLimit | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const source = typeof raw === 'object' ? (raw as { value?: unknown; interval?: unknown }) : { value: raw };
  const n = Number(source.value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const interval =
    source.interval && typeof source.interval === 'object'
      ? { type: String((source.interval as { type?: unknown }).type ?? 'days') }
      : null;
  return { value: n, interval };
}

function readLimits(input: DraftInput['limits']): CampaignLimits {
  return {
    points: limit(input?.points),
    pointsPerMember: limit(input?.pointsPerMember),
    executionsPerMember: limit(input?.executionsPerMember),
  };
}

function readVisibility(input: DraftInput['visibility']): CampaignVisibility {
  const tiers = strings(input?.tiers);
  const target = input?.target === 'tier' && tiers.length > 0 ? 'tier' : 'none';
  return { target, tiers: target === 'tier' ? tiers : [] };
}

/**
 * Label filter narrowing a campaign to a member type. Entries without both a
 * key and a value are dropped rather than silently matching everything.
 */
function readLabels(raw: unknown): Array<{ key: string; value: string }> {
  return (Array.isArray(raw) ? raw : [])
    .filter((l): l is { key: string; value: string } =>
      Boolean(l) && typeof (l as { key?: unknown }).key === 'string'
        && typeof (l as { value?: unknown }).value === 'string',
    )
    .map((l) => ({ key: l.key, value: l.value }));
}

function readMemberFilter(input: DraftInput['memberFilter']): CampaignMemberFilter {
  return {
    labels: readLabels(input?.labels),
    excludeLabels: readLabels(input?.excludeLabels),
  };
}

function readSchedule(raw: unknown): CampaignTriggerStrategy['executionSchedule'] {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as { dayOfWeek?: unknown; dayOfMonth?: unknown };
  const dayOfWeek = Array.isArray(s.dayOfWeek)
    ? s.dayOfWeek.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : [];
  const dayOfMonth = Array.isArray(s.dayOfMonth)
    ? s.dayOfMonth
        .map((d) => (d === 'L' ? ('L' as const) : Number(d)))
        .filter((d): d is number | 'L' => d === 'L' || (Number.isInteger(d) && d >= 1 && d <= 31))
    : [];
  return { dayOfWeek, dayOfMonth };
}

/** Build a Campaign from request input, or return a validation message. */
function buildDraft(body: DraftInput): { campaign: Campaign } | { error: string } {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return { error: 'name is required' };

  const trigger = (body.trigger ?? 'transaction') as CampaignTrigger;
  if (!TRIGGERS.includes(trigger)) {
    return { error: `trigger must be one of: ${TRIGGERS.join(', ')}` };
  }

  const effectType = body.effect?.type;
  if (typeof effectType !== 'string' || !EFFECT_TYPES.includes(effectType as CampaignEffectType)) {
    return { error: `effect.type must be one of: ${EFFECT_TYPES.join(', ')}` };
  }
  const effectValue = Number(body.effect?.value);
  if (!Number.isFinite(effectValue) || effectValue <= 0) {
    return { error: 'effect.value must be a positive number' };
  }
  if (effectType === 'multiplier' && effectValue < 1) {
    return { error: 'a multiplier below 1 would reduce earning; use a value >= 1' };
  }
  // Multipliers scale transaction lines; off a transaction there is nothing to
  // scale, so non-purchase triggers must award a flat amount.
  if (trigger !== 'transaction' && effectType === 'multiplier') {
    return { error: 'only bonus_points effects are supported outside purchase triggers' };
  }

  let event: string | null = null;
  if (trigger === 'internal_event') {
    event = typeof body.event === 'string' && body.event ? body.event : MEMBER_REGISTERED_EVENT;
    if (event !== MEMBER_REGISTERED_EVENT) {
      return { error: `event must be ${MEMBER_REGISTERED_EVENT}` };
    }
  }

  let triggerStrategy: CampaignTriggerStrategy | null = null;
  if (trigger === 'time') {
    const type = body.triggerStrategy?.type;
    if (typeof type !== 'string' || !TIME_STRATEGIES.includes(type as CampaignTimeStrategy)) {
      return { error: `triggerStrategy.type must be one of: ${TIME_STRATEGIES.join(', ')}` };
    }
    triggerStrategy = {
      type: type as CampaignTimeStrategy,
      executionSchedule: readSchedule(body.triggerStrategy?.executionSchedule),
    };
  }

  const condition = body.condition ?? {};
  const minTransactionValue = Number(condition.minTransactionValue ?? 0);
  if (!Number.isFinite(minTransactionValue) || minTransactionValue < 0) {
    return { error: 'condition.minTransactionValue must be >= 0' };
  }

  const rawStart = body.activity?.startsAt ?? condition.startsAt;
  const rawEnd = body.activity?.endsAt ?? condition.endsAt;
  const startsAt = typeof rawStart === 'string' && rawStart ? rawStart : null;
  const endsAt = typeof rawEnd === 'string' && rawEnd ? rawEnd : null;
  if (startsAt && endsAt && endsAt < startsAt) {
    return { error: 'condition.endsAt must be after condition.startsAt' };
  }

  const displayOrder = Number(body.displayOrder ?? 0);

  // A spec-shaped `rules[]` array wins over the flat fields, so an integration
  // written against OpenLoyalty's documented format is understood as-is.
  const fromRules = readCampaignRules(body.rules);

  return {
    campaign: {
      campaignId: randomUUID(),
      name,
      description: typeof body.description === 'string' ? body.description : '',
      active: true,
      trigger,
      event,
      triggerStrategy,
      activity: { startsAt, endsAt },
      condition: {
        categories: fromRules?.categories ?? strings(condition.categories),
        tierIds: fromRules?.tierIds ?? strings(condition.tierIds),
        minTransactionValue: fromRules?.minTransactionValue ?? minTransactionValue,
        startsAt,
        endsAt,
      },
      effect: fromRules?.effect ?? { type: effectType as CampaignEffectType, value: effectValue },
      assignTierId:
        fromRules?.assignTierId ??
        (typeof body.assignTierId === 'string' && body.assignTierId ? body.assignTierId : null),
      assignTierSetId:
        fromRules?.assignTierSetId ??
        (typeof body.assignTierSetId === 'string' && body.assignTierSetId
          ? body.assignTierSetId
          : null),
      memberFilter: fromRules
        ? { labels: fromRules.labels, excludeLabels: fromRules.excludeLabels }
        : readMemberFilter(body.memberFilter),
      limits: readLimits(body.limits),
      visibility: readVisibility(body.visibility),
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      stats: emptyCampaignStats(),
      createdAt: new Date().toISOString(),
    },
  };
}

/** Campaigns carry the spec's `rules[]` projection as well as the flat view. */
function serialize(campaign: Campaign) {
  return { ...campaign, rules: campaignRules(campaign) };
}

campaignRouter.get(
  '/api/:storeCode/campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    res.json(listEnvelope([...store.campaigns.values()].map(serialize)));
  },
);

/** Simulate a draft campaign against history. Nothing is persisted. */
campaignRouter.post(
  '/api/:storeCode/campaign/simulate',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const built = buildDraft(req.body?.campaign ?? req.body ?? {});
    if ('error' in built) {
      res.status(400).json({ code: 400, message: built.error });
      return;
    }
    res.json({
      draft: built.campaign,
      simulation: simulateCampaign(store, built.campaign),
    });
  },
);

campaignRouter.post(
  '/api/:storeCode/campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const built = buildDraft(req.body?.campaign ?? req.body ?? {});
    if ('error' in built) {
      res.status(400).json({ code: 400, message: built.error });
      return;
    }
    store.campaigns.set(built.campaign.campaignId, built.campaign);
    res.status(201).json(serialize(built.campaign));
  },
);

campaignRouter.get(
  '/api/:storeCode/campaign/:campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const campaign = store.campaigns.get(req.params.campaign);
    if (!campaign) {
      res.status(404).json({ code: 404, message: 'Campaign not found' });
      return;
    }
    res.json(serialize(campaign));
  },
);

campaignRouter.put(
  '/api/:storeCode/campaign/:campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const campaign = store.campaigns.get(req.params.campaign);
    if (!campaign) {
      res.status(404).json({ code: 404, message: 'Campaign not found' });
      return;
    }
    const body = req.body?.campaign ?? req.body ?? {};
    // The trigger is immutable once a campaign exists — the console says so
    // ("You can't change the trigger in an existing automation").
    const built = buildDraft({
      name: body.name ?? campaign.name,
      description: body.description ?? campaign.description,
      trigger: campaign.trigger,
      event: campaign.event ?? undefined,
      triggerStrategy: body.triggerStrategy ?? campaign.triggerStrategy ?? undefined,
      activity: body.activity ?? campaign.activity,
      displayOrder: body.displayOrder ?? campaign.displayOrder,
      effect: body.effect ?? campaign.effect,
      rules: body.rules,
      assignTierId: body.assignTierId ?? campaign.assignTierId ?? undefined,
      assignTierSetId: body.assignTierSetId ?? campaign.assignTierSetId ?? undefined,
      memberFilter: body.memberFilter ?? campaign.memberFilter,
      limits: body.limits ?? campaign.limits,
      visibility: body.visibility ?? campaign.visibility,
      condition: body.condition ?? campaign.condition,
    });
    if ('error' in built) {
      res.status(400).json({ code: 400, message: built.error });
      return;
    }
    const updated: Campaign = {
      ...built.campaign,
      campaignId: campaign.campaignId,
      active: campaign.active,
      // Payout history survives an edit; limits keep counting from it.
      stats: campaign.stats,
      createdAt: campaign.createdAt,
    };
    store.campaigns.set(updated.campaignId, updated);
    res.json(serialize(updated));
  },
);

/** Partial update — the spec's way of flipping `active` on a campaign. */
campaignRouter.patch(
  '/api/:storeCode/campaign/:campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    const campaign = store.campaigns.get(req.params.campaign);
    if (!campaign) {
      res.status(404).json({ code: 404, message: 'Campaign not found' });
      return;
    }
    const body = req.body?.campaign ?? req.body ?? {};
    if (body.active !== undefined) campaign.active = Boolean(body.active);
    if (body.displayOrder !== undefined) campaign.displayOrder = Number(body.displayOrder) || 0;
    res.json(serialize(campaign));
  },
);

/**
 * Non-spec shorthand for the same thing. Kept because the cockpit and the
 * campaign studio both already call it.
 */
for (const action of ['activate', 'deactivate'] as const) {
  campaignRouter.post(
    `/api/:storeCode/campaign/:campaign/${action}`,
    requireAdmin,
    (req: AuthedRequest, res) => {
      const store = getStore(req.params.storeCode);
      const campaign = store.campaigns.get(req.params.campaign);
      if (!campaign) {
        res.status(404).json({ code: 404, message: 'Campaign not found' });
        return;
      }
      campaign.active = action === 'activate';
      res.json(serialize(campaign));
    },
  );
}

campaignRouter.delete(
  '/api/:storeCode/campaign/:campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    if (!store.campaigns.delete(req.params.campaign)) {
      res.status(404).json({ code: 404, message: 'Campaign not found' });
      return;
    }
    res.status(204).end();
  },
);
