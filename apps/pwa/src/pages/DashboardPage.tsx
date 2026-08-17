import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Status, type Transaction } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { logout } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.me(), api.transactions()])
      .then(([s, t]) => {
        setStatus(s);
        setRecent(t.transactions.slice(0, 3));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="center error">{error}</div>;
  if (!status) return <div className="center muted">Loading…</div>;

  const progress =
    status.nextLevelConditionValue && status.pointsToNextLevel != null
      ? Math.min(
          100,
          Math.round(
            ((status.nextLevelConditionValue - status.pointsToNextLevel) /
              status.nextLevelConditionValue) *
              100,
          ),
        )
      : 100;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="muted small">Welcome back</p>
          <h2>{status.firstName || 'Member'}</h2>
        </div>
        <button className="btn ghost" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="points-card">
        <p className="points-label">Your points</p>
        <p className="points-value">{status.points.toLocaleString()}</p>
        <div className="tier-row">
          <span className="tier-badge">{status.levelName ?? 'Member'}</span>
          {status.nextLevelName && status.pointsToNextLevel != null && (
            <span className="muted small">
              {status.pointsToNextLevel.toLocaleString()} pts to{' '}
              {status.nextLevelName}
            </span>
          )}
        </div>
        {status.nextLevelName && (
          <div className="progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </section>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-value">
            {status.totalEarnedPoints.toLocaleString()}
          </span>
          <span className="muted small">Earned</span>
        </div>
        <div className="stat">
          <span className="stat-value">{status.usedPoints.toLocaleString()}</span>
          <span className="muted small">Redeemed</span>
        </div>
      </div>

      <section>
        <div className="section-head">
          <h3>Recent activity</h3>
          <Link to="/history" className="link">
            See all
          </Link>
        </div>
        {recent.length === 0 && <p className="muted">No activity yet.</p>}
        <ul className="list">
          {recent.map((t) => (
            <li key={t.pointsTransferId} className="list-item">
              <div>
                <p className="item-title">{t.comment ?? t.type}</p>
                <p className="muted small">
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={t.type === 'adding' ? 'delta pos' : 'delta neg'}
              >
                {t.type === 'adding' ? '+' : '−'}
                {t.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Link to="/rewards" className="btn primary block">
        Browse rewards
      </Link>
    </div>
  );
}
