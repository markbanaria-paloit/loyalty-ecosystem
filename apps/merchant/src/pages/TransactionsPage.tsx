import { useEffect, useState } from 'react';
import { api, type TransactionRecord } from '../api/client';

export function TransactionsPage() {
  const [rows, setRows] = useState<TransactionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [card, setCard] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    api
      .transactions()
      .then((r) => setRows(r.items))
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function assign(documentNumber: string) {
    setMsg(null);
    try {
      const res = await api.assign({
        transactionDocumentNumber: documentNumber,
        customerLoyaltyCardNumber: card.trim(),
      });
      setMsg(`Assigned — ${res.pointsEarned} points awarded.`);
      setAssigning(null);
      setCard('');
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not assign');
    }
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="single-col wide">
      <h2>Sales</h2>
      <p className="muted sm">{rows.length} transactions published from this store.</p>
      {msg && <div className="toast">{msg}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Member</th>
              <th>When</th>
              <th className="num">Total</th>
              <th className="num">Points</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.transactionId}>
                <td>
                  <strong className="mono sm">{t.documentNumber}</strong>
                  <p className="muted xs">
                    {t.documentType} · {t.items.length} item
                    {t.items.length === 1 ? '' : 's'}
                  </p>
                </td>
                <td>
                  {t.matched ? (
                    t.customerName
                  ) : (
                    <span className="warn">Unmatched</span>
                  )}
                  {!t.matched && t.customerData?.email && (
                    <p className="muted xs">tried {t.customerData.email}</p>
                  )}
                </td>
                <td className="muted sm">
                  {new Date(t.purchasedAt).toLocaleString()}
                </td>
                <td className="num strong">${t.grossValue.toFixed(2)}</td>
                <td className="num strong ok">
                  {t.pointsEarned > 0 ? `+${t.pointsEarned}` : '—'}
                </td>
                <td className="num">
                  {!t.matched &&
                    (assigning === t.documentNumber ? (
                      <div className="assign-row">
                        <input
                          value={card}
                          onChange={(e) => setCard(e.target.value)}
                          placeholder="Loyalty card"
                        />
                        <button
                          className="btn sm primary"
                          onClick={() => assign(t.documentNumber)}
                        >
                          Assign
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn sm"
                        onClick={() => setAssigning(t.documentNumber)}
                      >
                        Assign
                      </button>
                    ))}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted center-cell">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
