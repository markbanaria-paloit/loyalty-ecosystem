import { useEffect, useState } from 'react';
import { api, type Redemption, type Transfer } from '../api/client';

type Tab = 'transfers' | 'redemptions';

export function ActivityPage() {
  const [tab, setTab] = useState<Tab>('transfers');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.transfers(), api.redemptions()])
      .then(([t, r]) => {
        setTransfers(t.items);
        setRedemptions(r.items);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Activity</h1>
          <p className="muted sm">Every points transfer and issued reward.</p>
        </div>
        <div className="segmented">
          <button
            className={tab === 'transfers' ? 'active' : ''}
            onClick={() => setTab('transfers')}
          >
            Transfers ({transfers.length})
          </button>
          <button
            className={tab === 'redemptions' ? 'active' : ''}
            onClick={() => setTab('redemptions')}
          >
            Redemptions ({redemptions.length})
          </button>
        </div>
      </header>

      <div className="card table-card">
        {tab === 'transfers' ? (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Comment</th>
                <th>Date</th>
                <th className="num">Points</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.transferId}>
                  <td>
                    <strong>{t.customerName}</strong>
                    <p className="muted xs">{t.customerEmail}</p>
                  </td>
                  <td>{t.comment ?? <span className="muted">—</span>}</td>
                  <td className="muted sm">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className={`num strong ${t.type === 'adding' ? 'pos' : 'neg'}`}>
                    {t.type === 'adding' ? '+' : '−'}
                    {t.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reward</th>
                <th>Member</th>
                <th>Coupon</th>
                <th>Date</th>
                <th className="num">Cost</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.issuedRewardId}>
                  <td>
                    <strong>{r.rewardName}</strong>
                  </td>
                  <td>{r.customerName}</td>
                  <td>
                    <code className="chip">{r.couponCode}</code>
                  </td>
                  <td className="muted sm">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="num strong neg">−{r.costInPoints}</td>
                </tr>
              ))}
              {redemptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted center-cell">
                    No redemptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
