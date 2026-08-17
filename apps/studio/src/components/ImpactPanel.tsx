import type { Simulation } from '../api/client';

/** Projected cost of the current draft, replayed against real history. */
export function ImpactPanel({
  simulation,
  draftName,
}: {
  simulation: Simulation | null;
  draftName: string | null;
}) {
  if (!simulation) {
    return (
      <section className="card">
        <h3>Projected impact</h3>
        <p className="muted sm">
          Describe a campaign and it will be replayed against the store&rsquo;s transaction
          history here before anything goes live.
        </p>
      </section>
    );
  }

  const hot = simulation.upliftPercent > 50;

  return (
    <section className="card impact">
      <h3>Projected impact</h3>
      {draftName && <p className="draft-name">{draftName}</p>}

      <div className={`headline ${hot ? 'hot' : ''}`}>
        <span className="headline-value">
          +{simulation.additionalPoints.toLocaleString()}
        </span>
        <span className="muted sm">
          extra points · {simulation.upliftPercent}% uplift
        </span>
      </div>

      <dl className="impact-grid">
        <div>
          <dt>Transactions hit</dt>
          <dd>
            {simulation.matchingTransactions}
            <span className="muted"> / {simulation.transactionsEvaluated}</span>
          </dd>
        </div>
        <div>
          <dt>Members affected</dt>
          <dd>{simulation.membersAffected}</dd>
        </div>
        <div>
          <dt>Points before</dt>
          <dd>{simulation.baselinePoints.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Points after</dt>
          <dd>{simulation.projectedPoints.toLocaleString()}</dd>
        </div>
      </dl>

      {hot && (
        <p className="warn sm">
          Large uplift — worth confirming the budget before this goes live.
        </p>
      )}

      {simulation.sampleImpacts.length > 0 && (
        <>
          <h4>Sample transactions</h4>
          <ul className="sample-list">
            {simulation.sampleImpacts.map((s) => (
              <li key={s.documentNumber}>
                <div>
                  <code className="xs">{s.documentNumber}</code>
                  <p className="muted xs">
                    {s.customerName} · ${s.grossValue.toFixed(2)}
                  </p>
                </div>
                <span className="delta">
                  {s.baselinePoints} → <strong>{s.projectedPoints}</strong>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
