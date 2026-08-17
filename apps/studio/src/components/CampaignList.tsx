import type { Campaign } from '../api/client';

function describeEffect(c: Campaign): string {
  return c.effect.type === 'multiplier'
    ? `${c.effect.value}× points`
    : `+${c.effect.value} points`;
}

function describeScope(
  c: Campaign,
  tiers: Array<{ levelId: string; name: string }>,
): string {
  const parts: string[] = [];
  if (c.condition.categories.length) parts.push(c.condition.categories.join(', '));
  if (c.condition.tierIds.length) {
    parts.push(
      c.condition.tierIds
        .map((id) => tiers.find((t) => t.levelId === id)?.name ?? 'tier')
        .join(', '),
    );
  }
  if (c.condition.minTransactionValue > 0) {
    parts.push(`over $${c.condition.minTransactionValue}`);
  }
  return parts.length ? parts.join(' · ') : 'all purchases';
}

export function CampaignList({
  campaigns,
  tiers,
}: {
  campaigns: Campaign[];
  tiers: Array<{ levelId: string; name: string }>;
}) {
  return (
    <section className="card">
      <h3>Live campaigns</h3>
      {campaigns.length === 0 && <p className="muted sm">No campaigns configured.</p>}
      <ul className="campaign-list">
        {campaigns.map((c) => (
          <li key={c.campaignId}>
            <div>
              <strong>{c.name}</strong>
              <p className="muted xs">{describeScope(c, tiers)}</p>
            </div>
            <div className="campaign-right">
              <span className="effect">{describeEffect(c)}</span>
              <span className={c.active ? 'dot ok' : 'dot off'} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
