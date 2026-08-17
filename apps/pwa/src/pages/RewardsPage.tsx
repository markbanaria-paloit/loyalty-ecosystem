import { useEffect, useState } from 'react';
import { api, type Reward } from '../api/client';

export function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function load() {
    api
      .rewards()
      .then((r) => setRewards(r.rewards))
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function redeem(reward: Reward) {
    setRedeeming(reward.campaignId);
    setToast(null);
    try {
      const res = await api.redeem(reward.campaignId);
      setToast(`Redeemed! Coupon ${res.couponCode}`);
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Could not redeem');
    } finally {
      setRedeeming(null);
    }
  }

  if (error) return <div className="center error">{error}</div>;

  return (
    <div className="page">
      <header className="page-head">
        <h2>Rewards</h2>
      </header>

      {toast && <div className="toast">{toast}</div>}

      <div className="reward-grid">
        {rewards.map((r) => (
          <div key={r.campaignId} className="reward-card">
            <div className="reward-body">
              <h3>{r.name}</h3>
              <p className="muted small">{r.description}</p>
            </div>
            <div className="reward-foot">
              <span className="cost">{r.costInPoints} pts</span>
              <button
                className="btn primary sm"
                disabled={!r.canRedeem || redeeming === r.campaignId}
                onClick={() => redeem(r)}
              >
                {redeeming === r.campaignId
                  ? '…'
                  : r.canRedeem
                    ? 'Redeem'
                    : 'Not enough'}
              </button>
            </div>
          </div>
        ))}
        {rewards.length === 0 && <p className="muted">No rewards available.</p>}
      </div>
    </div>
  );
}
