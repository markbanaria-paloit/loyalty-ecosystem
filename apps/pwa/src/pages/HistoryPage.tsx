import { useEffect, useState } from 'react';
import { api, type Transaction } from '../api/client';

export function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .transactions()
      .then((t) => setTransactions(t.transactions))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="center error">{error}</div>;

  return (
    <div className="page">
      <header className="page-head">
        <h2>History</h2>
      </header>
      {transactions.length === 0 && <p className="muted">No activity yet.</p>}
      <ul className="list">
        {transactions.map((t) => (
          <li key={t.pointsTransferId} className="list-item">
            <div>
              <p className="item-title">{t.comment ?? t.type}</p>
              <p className="muted small">
                {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={t.type === 'adding' ? 'delta pos' : 'delta neg'}>
              {t.type === 'adding' ? '+' : '−'}
              {t.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
