/**
 * Campaign list: what is configured, what starts it, and what it has paid out.
 *
 * Payout totals come from the engine's own counters rather than being derived
 * here, so a campaign that has hit a limit reads the same way the engine sees
 * it.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Campaign, type CampaignTrigger, type Tier } from '../api/client';
import { useRefreshOnFocus } from '../hooks/useLiveData';

const TRIGGER_LABELS: Record<CampaignTrigger, string> = {
  transaction: 'Purchase transaction',
  internal_event: 'Member enrolment',
  time: 'Time-based automation',
};

function effectLabel(campaign: Campaign): string {
  return campaign.effect.type === 'multiplier'
    ? `${campaign.effect.value}× points`
    : `${campaign.effect.value} points`;
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([api.campaigns(), api.tiers()])
      .then(([c, t]) => {
        setCampaigns([...c.items].sort((a, b) => a.displayOrder - b.displayOrder));
        setTiers(t.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);
  useRefreshOnFocus(load);

  async function toggleActive(campaign: Campaign) {
    setError(null);
    try {
      await api.setCampaignActive(campaign.campaignId, !campaign.active);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change the campaign');
    }
  }

  const tierName = (id: string) => tiers.find((t) => t.levelId === id)?.name ?? 'Unknown tier';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Campaigns</h1>
          <p className="muted sm">
            Triggers, conditions and effects — the rules that issue points.
          </p>
        </div>
        <Link className="btn primary" to="/campaigns/new">
          Create campaign
        </Link>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <p className="muted sm">Loading campaigns…</p>}

      {!loading && campaigns.length === 0 && (
        <div className="card empty-state">
          <h2>No campaigns yet</h2>
          <p className="muted sm">
            Start with a welcome campaign so members earn something the moment they enrol.
          </p>
          <Link className="btn primary" to="/campaigns/new">
            Create campaign
          </Link>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Trigger</th>
                <th>Effect</th>
                <th>Visible to</th>
                <th className="num">Runs</th>
                <th className="num">Points issued</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.campaignId}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.description && <p className="muted xs">{c.description}</p>}
                  </td>
                  <td>
                    <span className="pill trigger">{TRIGGER_LABELS[c.trigger]}</span>
                    {c.triggerStrategy && (
                      <p className="muted xs">{c.triggerStrategy.type.replace(/_/g, ' ')}</p>
                    )}
                  </td>
                  <td>{effectLabel(c)}</td>
                  <td className="sm">
                    {c.visibility.target === 'none'
                      ? 'All members'
                      : c.visibility.tiers.map(tierName).join(', ')}
                  </td>
                  <td className="num">{c.stats.executions}</td>
                  <td className="num">{c.stats.pointsIssued.toLocaleString()}</td>
                  <td>
                    <span className={`pill ${c.active ? 'live' : 'paused'}`}>
                      {c.active ? 'Live' : 'Paused'}
                    </span>
                  </td>
                  <td className="num">
                    <Link className="btn sm" to={`/campaigns/${c.campaignId}/edit`}>
                      Edit
                    </Link>{' '}
                    <button className="btn sm" onClick={() => toggleActive(c)}>
                      {c.active ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
