/**
 * Deterministic fallback planner, used when no ANTHROPIC_API_KEY is configured.
 *
 * This is NOT a language model and does not pretend to be one. It is a keyword
 * extractor that pulls a campaign shape out of a sentence, grounds it against
 * the real category and tier lists, simulates it, and reports the numbers — so
 * the studio, its tool layer, and the simulation panel all work end-to-end
 * without a key. It handles simple requests and says so plainly when it can't.
 *
 * Set ANTHROPIC_API_KEY to get the real agent (see `agent.ts`).
 */
import { olAdmin, type CampaignDraft } from './olAdmin.js';
import { describeSimulation, type ChatTurn, type StudioReply, type ToolActivity } from './agent.js';

const MULTIPLIER_WORDS: Record<string, number> = {
  double: 2,
  triple: 3,
  quadruple: 4,
  '2x': 2,
  '3x': 3,
  '4x': 4,
  '5x': 5,
};

const APPROVAL = /\b(yes|yep|do it|create it|go ahead|approve[d]?|ship it|launch it|make it live)\b/i;

function extractMultiplier(text: string): number | null {
  for (const [word, value] of Object.entries(MULTIPLIER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) return value;
  }
  const explicit = text.match(/(\d+(?:\.\d+)?)\s*(?:x|times)\b/i);
  if (explicit) return Number(explicit[1]);
  return null;
}

function extractBonus(text: string): number | null {
  const match = text.match(/(\d+)\s*(?:bonus\s*)?points?\b/i);
  if (!match) return null;
  // "double points" is a multiplier, not a bonus — only treat a bare number as a bonus.
  return /\b(bonus|flat|extra)\b/i.test(text) ? Number(match[1]) : null;
}

function extractThreshold(text: string): number | null {
  const match = text.match(/(?:over|above|more than|spend(?:ing)? (?:of )?)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

/** Run one turn with the deterministic planner. */
export async function runOfflineTurn(history: ChatTurn[]): Promise<StudioReply> {
  const activity: ToolActivity[] = [];
  const latest = history.filter((t) => t.role === 'user').at(-1)?.content ?? '';

  // Approval of a previously simulated draft → create it.
  if (APPROVAL.test(latest)) {
    const prior = [...history].reverse().find((t) => t.role === 'assistant' && t.content.includes('__DRAFT__'));
    const encoded = prior?.content.match(/__DRAFT__(.+?)__END__/s)?.[1];
    if (!encoded) {
      return {
        reply:
          'I do not have a simulated campaign to create yet. Describe the campaign first and I will simulate it.',
        activity,
        mode: 'offline',
      };
    }
    const draft = JSON.parse(encoded) as CampaignDraft;
    const created = await olAdmin.create(draft);
    activity.push({
      name: 'create_campaign',
      summary: `Created campaign "${created.name}" (live)`,
      detail: created,
    });
    return {
      reply: `Created "${created.name}". It is live now.`,
      activity,
      createdCampaignId: created.campaignId,
      mode: 'offline',
    };
  }

  const [categories, tiers] = await Promise.all([olAdmin.categories(), olAdmin.tiers()]);
  activity.push({
    name: 'list_categories',
    summary: `Read ${categories.length} categories: ${categories.map((c) => c.category).join(', ')}`,
  });
  activity.push({
    name: 'list_tiers',
    summary: `Read ${tiers.length} tiers: ${tiers.map((t) => t.name).join(', ')}`,
  });

  const matchedCategories = categories
    .filter((c) => new RegExp(`\\b${c.category}s?\\b`, 'i').test(latest))
    .map((c) => c.category);
  const matchedTiers = tiers.filter((t) => new RegExp(`\\b${t.name}\\b`, 'i').test(latest));

  const multiplier = extractMultiplier(latest);
  const bonus = extractBonus(latest);
  const threshold = extractThreshold(latest);

  if (multiplier === null && bonus === null) {
    return {
      reply:
        'Offline mode: I could not tell what the reward should be. Try phrasing it like "double points on coffee" or "500 bonus points on orders over $50". Set ANTHROPIC_API_KEY for the full assistant, which handles open-ended requests.',
      activity,
      mode: 'offline',
    };
  }

  const label = multiplier !== null ? `${multiplier}x points` : `${bonus} bonus points`;
  const scope = matchedCategories.length ? ` on ${matchedCategories.join(', ')}` : '';
  const tierScope = matchedTiers.length ? ` for ${matchedTiers.map((t) => t.name).join(', ')}` : '';

  const draft: CampaignDraft = {
    name: `${label}${scope}${tierScope}`.replace(/\b\w/, (c) => c.toUpperCase()),
    description: `Generated from: "${latest.trim()}"`,
    effect:
      multiplier !== null
        ? { type: 'multiplier', value: multiplier }
        : { type: 'bonus_points', value: bonus! },
    condition: {
      categories: matchedCategories,
      tierIds: matchedTiers.map((t) => t.levelId),
      minTransactionValue: threshold ?? 0,
      startsAt: null,
      endsAt: null,
    },
  };

  const { simulation } = await olAdmin.simulate(draft);
  activity.push({
    name: 'simulate_campaign',
    summary: `Simulated "${draft.name}" — ${describeSimulation(simulation)}`,
    detail: simulation,
  });

  const expensive =
    simulation.upliftPercent > 50
      ? ` That is a large uplift — worth confirming the budget before launching.`
      : '';

  // The draft rides along in the transcript so an approval can pick it up.
  const reply =
    `Offline mode. I read that as **${draft.name}**${threshold ? ` on transactions over $${threshold}` : ''}.\n\n` +
    `${describeSimulation(simulation)}.${expensive}\n\n` +
    `Say "create it" to make this live.\n\n` +
    `__DRAFT__${JSON.stringify(draft)}__END__`;

  return { reply, activity, simulation: { draft, result: simulation }, mode: 'offline' };
}
