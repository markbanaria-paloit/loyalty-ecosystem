import { useState, type FormEvent } from 'react';
import { api, type CouponLookup } from '../api/client';

/** Statuses a till realistically sets when handing over a reward. */
const ACTIONS = [
  { status: 'completed', label: 'Mark fulfilled' },
  { status: 'rejected', label: 'Reject' },
];

export function CouponPage() {
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<CouponLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setCoupon(null);
    try {
      setCoupon(await api.lookupCoupon(code.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    }
  }

  async function setStatus(status: string) {
    if (!coupon) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.setRedemptionStatus(coupon.issuedRewardId, status);
      setCoupon({ ...coupon, status: res.status });
      setMsg(`Coupon marked ${res.status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="single-col">
      <h2>Redeem a coupon</h2>
      <p className="muted sm">
        Enter the code from the member&rsquo;s app to verify and fulfil it.
      </p>

      <form className="lookup-form" onSubmit={lookup}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="OL-XXXXXX"
          className="code-input"
        />
        <button className="btn primary">Look up</button>
      </form>

      {error && <div className="error">{error}</div>}
      {msg && <div className="toast">{msg}</div>}

      {coupon && (
        <div className="coupon-card">
          <div className="coupon-head">
            <div>
              <h3>{coupon.rewardName}</h3>
              <p className="muted sm">{coupon.customerName}</p>
            </div>
            <span className={`status ${coupon.status}`}>{coupon.status}</span>
          </div>
          <div className="coupon-meta">
            <code className="mono">{coupon.couponCode}</code>
            <span className="muted xs">
              issued {new Date(coupon.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="row">
            {ACTIONS.map((a) => (
              <button
                key={a.status}
                className={`btn ${a.status === 'completed' ? 'primary' : ''}`}
                disabled={busy || coupon.status === a.status}
                onClick={() => setStatus(a.status)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
