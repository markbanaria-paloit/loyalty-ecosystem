/**
 * Tier configuration overview: the store's tier set, the metrics it qualifies
 * on, and how many members sit on each tier.
 *
 * This is the landing spot for both "configure the first tiers" and "add a
 * third tier later" — the second is just the wizard opened on its conditions
 * step.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, CONDITION_LABELS, type TierSet } from '../api/client';
import { Callout } from '../components/wizard';

export function TiersPage() {
  const [params, setParams] = useSearchParams();
  const [sets, setSets] = useState<TierSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(() => {
    const recalculated = params.get('recalculated');
    return recalculated === null
      ? null
      : `Tier set saved. ${recalculated} member${recalculated === '1' ? '' : 's'} moved tier.`;
  });

  const load = useCallback(() => {
    setLoading(true);
    api
      .tierSets()
      .then((res) => setSets(res.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    if (params.has('recalculated')) {
      params.delete('recalculated');
      setParams(params, { replace: true });
    }
    // Only on mount: `params` is cleared here and must not retrigger the load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function recalculate() {
    setNotice(null);
    try {
      const res = await api.recalculateTiers();
      setNotice(
        `Recalculated ${res.totalMembers} members — ${res.membersRecalculated} moved tier.`,
      );
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recalculation failed');
    }
  }

  async function removeTier(levelId: string, name: string) {
    setError(null);
    try {
      await api.deleteTier(levelId);
      setNotice(`Removed ${name}. Members on it were requalified.`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove the tier');
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tiers</h1>
          <p className="muted sm">
            Membership levels and the conditions that qualify members for them.
          </p>
        </div>
        <div className="row">
          <button className="btn" onClick={recalculate}>
            Recalculate members
          </button>
          {sets.length === 0 ? (
            <Link className="btn primary" to="/tiers/new">
              Create tier set
            </Link>
          ) : (
            <Link className="btn primary" to={`/tiers/${sets[0]!.tierSetId}/edit?step=conditions`}>
              Add or edit tiers
            </Link>
          )}
        </div>
      </div>

      {notice && <div className="toast">{notice}</div>}
      {error && <div className="error">{error}</div>}
      {loading && <p className="muted sm">Loading tiers…</p>}

      {!loading && sets.length === 0 && (
        <div className="card empty-state">
          <h2>No tier set yet</h2>
          <p className="muted sm">
            A tier set holds the membership levels members move between, and the metrics they
            are measured on.
          </p>
          <Link className="btn primary" to="/tiers/new">
            Create tier set
          </Link>
        </div>
      )}

      {sets.map((set) => (
        <section className="card form-card" key={set.tierSetId}>
          <div className="page-head">
            <div>
              <h2>{set.name}</h2>
              <p className="muted sm">{set.description || 'No description'}</p>
            </div>
            <div className="row">
              <span className={`pill ${set.active ? 'live' : 'paused'}`}>
                {set.active ? 'Active' : 'Inactive'}
              </span>
              <Link className="btn sm" to={`/tiers/${set.tierSetId}/edit`}>
                Edit tier set
              </Link>
            </div>
          </div>

          <div>
            <h3>Conditions</h3>
            <div>
              {set.conditions.map((c) => (
                <span className="chip" key={c.id}>
                  {CONDITION_LABELS[c.attribute]}
                </span>
              ))}
            </div>
          </div>

          <Callout tone="info">
            A member holds a tier once they meet <strong>every</strong> condition on it. Saving
            a change here requalifies all members.
          </Callout>

          <div className="table-card card">
            <table>
              <thead>
                <tr>
                  <th>Tier</th>
                  {set.conditions.map((c) => (
                    <th key={c.id} className="num">
                      {CONDITION_LABELS[c.attribute]}
                    </th>
                  ))}
                  <th className="num">Members</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {set.tiers.map((tier) => (
                  <tr key={tier.levelId}>
                    <td>
                      <strong>{tier.name}</strong>
                      {tier.isDefault && <span className="tier-rank"> · entry tier</span>}
                    </td>
                    {set.conditions.map((c) => (
                      <td key={c.id} className="num">
                        {tier.conditions.find((tc) => tc.conditionId === c.id)?.value ?? 0}
                      </td>
                    ))}
                    <td className="num">{tier.memberCount}</td>
                    <td>
                      <span className={`pill ${tier.active ? 'live' : 'paused'}`}>
                        {tier.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="num">
                      <button
                        className="btn sm"
                        onClick={() =>
                          api
                            .setTierActive(tier.levelId, !tier.active)
                            .then(load)
                            .catch((e) => setError(e.message))
                        }
                      >
                        {tier.active ? 'Deactivate' : 'Activate'}
                      </button>{' '}
                      <button
                        className="btn sm"
                        disabled={set.tiers.length <= 1}
                        onClick={() => removeTier(tier.levelId, tier.name)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
