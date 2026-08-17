import { useEffect, useState, type FormEvent } from 'react';
import { api, type Reward, type Tier } from '../api/client';

export function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    Promise.all([api.rewards(), api.tiers()])
      .then(([r, t]) => {
        setRewards(r.items);
        setTiers(t.items);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function toggle(reward: Reward) {
    try {
      await api.setRewardActive(reward.rewardId, !reward.active);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update reward');
    }
  }

  const tierName = (id: string) => tiers.find((t) => t.levelId === id)?.name ?? id;

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Rewards</h1>
          <p className="muted sm">{rewards.length} configured</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New reward'}
        </button>
      </header>

      {showForm && (
        <NewRewardForm
          tiers={tiers}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Reward</th>
              <th className="num">Cost</th>
              <th>Tiers</th>
              <th className="num">Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.rewardId}>
                <td>
                  <strong>{r.name}</strong>
                  <p className="muted xs">{r.shortDescription}</p>
                </td>
                <td className="num strong">{r.costInPoints}</td>
                <td>
                  {r.levels.length === 0 ? (
                    <span className="muted xs">All tiers</span>
                  ) : (
                    r.levels.map((l) => (
                      <span key={l} className="chip">
                        {tierName(l)}
                      </span>
                    ))
                  )}
                </td>
                <td className="num">
                  {r.usageLimit === null ? (
                    <span className="muted">∞</span>
                  ) : (
                    r.usageLimit
                  )}
                </td>
                <td>
                  <span className={r.active ? 'dot ok' : 'dot off'} />
                  {r.active ? 'Active' : 'Inactive'}
                </td>
                <td className="num">
                  <button className="btn sm" onClick={() => toggle(r)}>
                    {r.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function NewRewardForm({
  tiers,
  onCreated,
}: {
  tiers: Tier[];
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [shortDescription, setDescription] = useState('');
  const [costInPoints, setCost] = useState('100');
  const [levels, setLevels] = useState<string[]>([]);
  const [usageLimit, setUsageLimit] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.createReward({
        name,
        shortDescription,
        costInPoints: Number(costInPoints),
        levels,
        usageLimit: usageLimit === '' ? null : Number(usageLimit),
      });
      onCreated();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not create reward');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form-card" onSubmit={submit}>
      <h2>New reward</h2>
      <div className="row">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Cost in points
          <input
            value={costInPoints}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </label>
      </div>
      <label>
        Description
        <input
          value={shortDescription}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="row">
        <label>
          Stock <span className="muted xs">(blank = unlimited)</span>
          <input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
        </label>
        <fieldset className="tier-picker">
          <legend>Restrict to tiers</legend>
          {tiers.map((t) => (
            <label key={t.levelId} className="check">
              <input
                type="checkbox"
                checked={levels.includes(t.levelId)}
                onChange={(e) =>
                  setLevels((cur) =>
                    e.target.checked
                      ? [...cur, t.levelId]
                      : cur.filter((l) => l !== t.levelId),
                  )
                }
              />
              {t.name}
            </label>
          ))}
        </fieldset>
      </div>
      {err && <div className="error">{err}</div>}
      <button className="btn primary" disabled={busy}>
        {busy ? 'Creating…' : 'Create reward'}
      </button>
    </form>
  );
}
