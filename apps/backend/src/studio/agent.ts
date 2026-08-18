/**
 * Campaign studio agent.
 *
 * A marketer describes a campaign in natural language; the agent inspects the
 * live loyalty configuration, simulates the campaign against real transaction
 * history, and creates it once the marketer approves. Every tool call is
 * surfaced to the UI so the marketer can see what was inspected and changed.
 */
import Anthropic from '@anthropic-ai/sdk';
import { betaTool } from '@anthropic-ai/sdk/helpers/beta/json-schema';
import { config } from '../config.js';
import { olAdmin, type CampaignDraft, type Simulation } from './olAdmin.js';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** One tool invocation, surfaced to the UI as an activity entry. */
export interface ToolActivity {
  name: string;
  summary: string;
  detail?: unknown;
}

export interface StudioReply {
  reply: string;
  activity: ToolActivity[];
  /** Latest simulation produced this turn, if any — drives the impact panel. */
  simulation?: { draft: CampaignDraft; result: Simulation };
  /** Set when a campaign was actually created this turn. */
  createdCampaignId?: string;
  mode: 'claude' | 'offline';
}

/** Shared input schema for the two tools that take a campaign definition. */
const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Short campaign name, e.g. "Weekend Coffee Double Points".',
    },
    description: { type: 'string', description: 'One sentence explaining the campaign.' },
    effectType: {
      type: 'string',
      enum: ['multiplier', 'bonus_points'],
      description:
        'multiplier: multiplies points on matching lines (2 = double). bonus_points: flat points added once per qualifying transaction.',
    },
    effectValue: {
      type: 'number',
      description: 'For multiplier, a value >= 1. For bonus_points, the flat points awarded.',
    },
    categories: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Product categories this applies to, from list_categories. Omit or empty = all categories.',
    },
    tierIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'Tier ids that qualify, from list_tiers. Omit or empty = all tiers.',
    },
    minTransactionValue: {
      type: 'number',
      description: 'Minimum transaction gross value to qualify. Omit for no floor.',
    },
    startsAt: { type: 'string', description: 'ISO 8601 start date. Omit for open-ended.' },
    endsAt: { type: 'string', description: 'ISO 8601 end date. Omit for open-ended.' },
  },
  required: ['name', 'effectType', 'effectValue'],
  additionalProperties: false,
} as const;

const EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const;

type DraftArgs = {
  name: string;
  description?: string;
  effectType: 'multiplier' | 'bonus_points';
  effectValue: number;
  categories?: string[];
  tierIds?: string[];
  minTransactionValue?: number;
  startsAt?: string;
  endsAt?: string;
};

export function toDraft(args: DraftArgs): CampaignDraft {
  return {
    name: args.name,
    description: args.description ?? '',
    effect: { type: args.effectType, value: args.effectValue },
    condition: {
      categories: args.categories ?? [],
      tierIds: args.tierIds ?? [],
      minTransactionValue: args.minTransactionValue ?? 0,
      startsAt: args.startsAt ?? null,
      endsAt: args.endsAt ?? null,
    },
  };
}

export function describeSimulation(sim: Simulation): string {
  return [
    `${sim.matchingTransactions} of ${sim.transactionsEvaluated} historical transactions would be affected`,
    `${sim.membersAffected} member(s) impacted`,
    `points issued would go from ${sim.baselinePoints} to ${sim.projectedPoints} (+${sim.additionalPoints}, ${sim.upliftPercent}% uplift)`,
  ].join('; ');
}

const SYSTEM_PROMPT = `You are a loyalty campaign strategist embedded in a campaign studio. Marketers describe campaigns in plain language; you configure them against a live OpenLoyalty program.

How you work:
- Inspect before you assume. Use list_tiers, list_categories, and list_campaigns to ground the campaign in what actually exists. Never invent a category or tier name — categories and tier ids must come from those tools.
- Always simulate before creating. simulate_campaign replays real transaction history and reports the projected cost. Report those numbers plainly: how many transactions match, how many members are affected, and the extra points issued.
- Never create a campaign until the marketer has seen a simulation and approved it in a later message. "Simulate a double-points weekend" is not approval to create.
- If the request is ambiguous in a way that changes the campaign (which categories, which tiers, flat bonus vs multiplier), ask one focused question rather than guessing. If ambiguity does not change the outcome, pick the sensible default and say what you picked.
- Flag when a campaign looks expensive. An uplift above roughly 50% is worth calling out explicitly, along with what is driving it.

Keep responses focused, brief, and concise. Lead with the outcome — the number that answers the marketer's question — then the supporting detail. Write in prose, not headers and bullet walls, for anything shorter than a full report. Do not restate the campaign configuration back in full unless it changed.

Deliver what the marketer asked for, at the scope they intended. Do not add campaigns, conditions, or tiers they did not ask about.`;

/** Run one turn of the campaign studio conversation through Claude. */
export async function runClaudeTurn(history: ChatTurn[]): Promise<StudioReply> {
  const client = new Anthropic({ apiKey: config.studio.anthropicApiKey! });
  const activity: ToolActivity[] = [];
  let lastSimulation: StudioReply['simulation'];
  let createdCampaignId: string | undefined;

  const listTiers = betaTool({
    name: 'list_tiers',
    description:
      'List the loyalty tiers in this store, with their ids, names, and the points threshold to reach each. Use this to resolve tier names to ids before targeting a campaign at specific tiers.',
    inputSchema: EMPTY_SCHEMA,
    run: async () => {
      const tiers = await olAdmin.tiers();
      activity.push({
        name: 'list_tiers',
        summary: `Read ${tiers.length} tiers: ${tiers.map((t) => t.name).join(', ')}`,
      });
      return JSON.stringify(
        tiers.map((t) => ({
          levelId: t.levelId,
          name: t.name,
          // Tier conditions use the spec's attribute vocabulary; the units
          // ones are what a points threshold means here.
          pointsThreshold:
            t.conditions.find((c) =>
              ['activeUnits', 'totalEarnedUnits', 'cumulatedEarnedUnits'].includes(c.attribute),
            )?.value ?? 0,
        })),
      );
    },
  });

  const listCategories = betaTool({
    name: 'list_categories',
    description:
      'List the product categories that actually appear in this store’s transaction history, with transaction counts and gross value. Use this to ground category targeting in real data rather than guessing category names.',
    inputSchema: EMPTY_SCHEMA,
    run: async () => {
      const categories = await olAdmin.categories();
      activity.push({
        name: 'list_categories',
        summary: `Read ${categories.length} categories: ${categories.map((c) => c.category).join(', ')}`,
      });
      return JSON.stringify(categories);
    },
  });

  const listCampaigns = betaTool({
    name: 'list_campaigns',
    description:
      'List the campaigns (earning rules) already configured in this store, including whether each is active. Use this to avoid creating a duplicate or a campaign that stacks unexpectedly with an existing one.',
    inputSchema: EMPTY_SCHEMA,
    run: async () => {
      const campaigns = await olAdmin.campaigns();
      activity.push({
        name: 'list_campaigns',
        summary: `Read ${campaigns.length} existing campaign(s)`,
        detail: campaigns.map((c) => ({ name: c.name, active: c.active, effect: c.effect })),
      });
      return JSON.stringify(campaigns);
    },
  });

  const simulate = betaTool({
    name: 'simulate_campaign',
    description:
      'Replay the store’s real transaction history with this campaign applied and report the projected impact: how many transactions and members are affected, and how many extra points would be issued. Nothing is persisted. Always call this before create_campaign.',
    inputSchema: DRAFT_SCHEMA,
    run: async (args) => {
      const draft = toDraft(args as DraftArgs);
      const { simulation } = await olAdmin.simulate(draft);
      lastSimulation = { draft, result: simulation };
      activity.push({
        name: 'simulate_campaign',
        summary: `Simulated "${draft.name}" — ${describeSimulation(simulation)}`,
        detail: simulation,
      });
      return JSON.stringify(simulation);
    },
  });

  const create = betaTool({
    name: 'create_campaign',
    description:
      'Create the campaign in OpenLoyalty. It goes live immediately. Only call this after simulate_campaign has run and the marketer has explicitly approved the campaign in a later message.',
    inputSchema: DRAFT_SCHEMA,
    run: async (args) => {
      const draft = toDraft(args as DraftArgs);
      const created = await olAdmin.create(draft);
      createdCampaignId = created.campaignId;
      activity.push({
        name: 'create_campaign',
        summary: `Created campaign "${created.name}" (live)`,
        detail: created,
      });
      return JSON.stringify(created);
    },
  });

  const setStatus = betaTool({
    name: 'set_campaign_status',
    description: 'Activate or deactivate an existing campaign by id.',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string' },
        active: { type: 'boolean' },
      },
      required: ['campaignId', 'active'],
      additionalProperties: false,
    } as const,
    run: async ({ campaignId, active }) => {
      const updated = await olAdmin.setStatus(campaignId, active);
      activity.push({
        name: 'set_campaign_status',
        summary: `${active ? 'Activated' : 'Deactivated'} "${updated.name}"`,
      });
      return JSON.stringify(updated);
    },
  });

  const finalMessage = await client.beta.messages.toolRunner({
    model: config.studio.model,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    // medium keeps the chat responsive; the work here is tool orchestration
    // and arithmetic reporting, not deep reasoning.
    output_config: { effort: 'medium' },
    system: SYSTEM_PROMPT,
    tools: [listTiers, listCategories, listCampaigns, simulate, create, setStatus],
    messages: history.map((t) => ({ role: t.role, content: t.content })),
  });

  if (finalMessage.stop_reason === 'refusal') {
    return {
      reply:
        'I could not complete that request. Try rephrasing what you want the campaign to do.',
      activity,
      mode: 'claude',
    };
  }

  const reply = finalMessage.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return {
    reply: reply || 'Done.',
    activity,
    simulation: lastSimulation,
    createdCampaignId,
    mode: 'claude',
  };
}
