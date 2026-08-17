/**
 * Campaign (earning rule) endpoints, following the OpenLoyalty spec's shape:
 *   GET  /api/{storeCode}/campaign
 *   POST /api/{storeCode}/campaign
 *   GET  /api/{storeCode}/campaign/{campaign}
 *   PUT  /api/{storeCode}/campaign/{campaign}
 *   POST /api/{storeCode}/campaign/simulate
 *   POST /api/{storeCode}/campaign/{campaign}/activate|deactivate
 *
 * `simulate` is the interesting one: it replays the store's transaction
 * history against a draft campaign and reports the projected impact, so a
 * campaign can be evaluated before it goes live.
 */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  getStore,
  listEnvelope,
  simulateCampaign,
  type Campaign,
  type CampaignEffectType,
} from '../data.js';
import { requireAdmin, type AuthedRequest } from '../auth.js';

export const campaignRouter = Router();

const EFFECT_TYPES: CampaignEffectType[] = ['multiplier', 'bonus_points'];

interface DraftInput {
  name?: unknown;
  description?: unknown;
  effect?: { type?: unknown; value?: unknown };
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

/** Build a Campaign from request input, or return a validation message. */
function buildDraft(body: DraftInput): { campaign: Campaign } | { error: string } {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return { error: 'name is required' };

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

  const condition = body.condition ?? {};
  const minTransactionValue = Number(condition.minTransactionValue ?? 0);
  if (!Number.isFinite(minTransactionValue) || minTransactionValue < 0) {
    return { error: 'condition.minTransactionValue must be >= 0' };
  }

  return {
    campaign: {
      campaignId: randomUUID(),
      name,
      description: typeof body.description === 'string' ? body.description : '',
      active: true,
      condition: {
        categories: strings(condition.categories),
        tierIds: strings(condition.tierIds),
        minTransactionValue,
        startsAt: typeof condition.startsAt === 'string' ? condition.startsAt : null,
        endsAt: typeof condition.endsAt === 'string' ? condition.endsAt : null,
      },
      effect: { type: effectType as CampaignEffectType, value: effectValue },
      createdAt: new Date().toISOString(),
    },
  };
}

campaignRouter.get(
  '/api/:storeCode/campaign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = getStore(req.params.storeCode);
    res.json(listEnvelope([...store.campaigns.values()]));
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
    res.status(201).json(built.campaign);
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
    res.json(campaign);
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
    const built = buildDraft({
      name: req.body?.name ?? campaign.name,
      description: req.body?.description ?? campaign.description,
      effect: req.body?.effect ?? campaign.effect,
      condition: req.body?.condition ?? campaign.condition,
    });
    if ('error' in built) {
      res.status(400).json({ code: 400, message: built.error });
      return;
    }
    const updated: Campaign = {
      ...built.campaign,
      campaignId: campaign.campaignId,
      active: campaign.active,
      createdAt: campaign.createdAt,
    };
    store.campaigns.set(updated.campaignId, updated);
    res.json(updated);
  },
);

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
      res.json(campaign);
    },
  );
}
