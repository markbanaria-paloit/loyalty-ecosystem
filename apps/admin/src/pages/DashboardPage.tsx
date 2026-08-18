import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRefreshOnFocus } from '../hooks/useLiveData';
import {
  api,
  CONDITION_LABELS,
  type CampaignTrigger,
  type Redemption,
  type Stats,
} from '../api/client';

const TRIGGER_LABELS: Record<CampaignTrigger, string> = {
  transaction: 'Purchase',
  internal_event: 'Enrolment',
  time: 'Scheduled',
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Redemption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([api.stats(), api.redemptions()])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r.items.slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);
  useRefreshOnFocus(load);

  if (error) return <div className="error">{error}</div>;
  if (!stats) return <p className="muted">Loading…</p>;

  const maxTier = Math.max(1, ...stats.membersByTier.map((t) => t.count));

  return (
    <>
      <header className="page-head">
        <h1>Dashboard</h1>
        <p className="muted sm">Program health at a glance.</p>
      </header>

      <div className="kpi-grid">
        <Kpi label="Members" value={stats.totalMembers} sub={`${stats.activeMembers} active`} />
        <Kpi label="Points issued" value={stats.pointsIssued} />
        <Kpi label="Points redeemed" value={stats.pointsRedeemed} />
        <Kpi
          label="Outstanding"
          value={stats.outstandingPoints}
          sub="program liability"
          accent
        />
        <Kpi
          label="Live campaigns"
          value={stats.activeCampaigns}
          sub={`${stats.campaignPointsIssued.toLocaleString()} pts awarded`}
        />
      </div>

      <div className="two-col">
        <section className="card">
          <div className="page-head">
            <h2>Members by tier</h2>
            <Link className="btn sm" to="/tiers">
              Configure
            </Link>
          </div>
          {stats.tierSet && (
            <p className="muted xs">
              {stats.tierSet.name} · qualified on{' '}
              {stats.tierSet.conditions.map((c) => CONDITION_LABELS[c.attribute]).join(', ')}
            </p>
          )}
          <div className="bars">
            {stats.membersByTier.map((t) => (
              <div key={t.levelId} className="bar-row">
                <span className="bar-label">
                  {t.name}
                  <span className="muted xs"> ≥{t.threshold}</span>
                </span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(t.count / maxTier) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{t.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="page-head">
            <h2>Campaign performance</h2>
            <Link className="btn sm" to="/campaigns">
              Configure
            </Link>
          </div>
          {stats.campaignPerformance.length === 0 && (
            <p className="muted sm">No campaigns configured yet.</p>
          )}
          <ul className="plain-list">
            {stats.campaignPerformance.map((c) => (
              <li key={c.campaignId}>
                <div>
                  <strong>{c.name}</strong>
                  <p className="muted xs">
                    {TRIGGER_LABELS[c.trigger]} · {c.executions} run
                    {c.executions === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="num">
                  <strong>{c.pointsIssued.toLocaleString()}</strong>
                  <p className="muted xs">{c.active ? 'live' : 'paused'}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Recent redemptions</h2>
          {recent.length === 0 && <p className="muted sm">No redemptions yet.</p>}
          <ul className="plain-list">
            {recent.map((r) => (
              <li key={r.issuedRewardId}>
                <div>
                  <strong>{r.rewardName}</strong>
                  <p className="muted xs">
                    {r.customerName} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <code className="chip">{r.couponCode}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`kpi ${accent ? 'accent' : ''}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value.toLocaleString()}</p>
      {sub && <p className="muted xs">{sub}</p>}
    </div>
  );
}
