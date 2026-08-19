import { useEffect, useState, type FormEvent } from 'react';
import QrScanner from 'qr-scanner';
import { ApiError, api, type CouponLookup } from '../api/client';
import { CameraScanner } from '../components/CameraScanner';

export function CouponPage() {
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<CouponLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  // Undetermined until asked; the scan button stays hidden on a device without
  // a camera rather than opening an overlay that can only fail.
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    QrScanner.hasCamera().then(setHasCamera).catch(() => setHasCamera(false));
  }, []);

  async function lookupCode(raw: string) {
    const trimmed = raw.trim();
    setError(null);
    setMsg(null);
    setCoupon(null);
    setCode(trimmed);
    if (!trimmed) return;
    try {
      setCoupon(await api.lookupCoupon(trimmed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    }
  }

  function lookup(e: FormEvent) {
    e.preventDefault();
    void lookupCode(code);
  }

  /**
   * The member's coupon QR carries the code and nothing else, so a scan is the
   * same lookup a cashier would type — and is run straight away rather than
   * only filling the field, because scanning is the whole gesture.
   */
  function acceptScan(raw: string) {
    setScanning(false);
    void lookupCode(raw);
  }

  /**
   * Hand the reward over.
   *
   * Spending the coupon and marking the reward fulfilled are two different
   * things upstream, and the server does both in the order that keeps them
   * honest. All this has to get right is the refusal: a coupon already spent
   * comes back 409, and the cashier needs to be told that rather than shown a
   * generic failure.
   */
  async function consume() {
    if (!coupon) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await api.consumeCoupon(coupon.couponCode);
      setCoupon({ ...coupon, usedAt: new Date().toISOString(), status: 'completed' });
      setMsg(
        res.fulfilled
          ? 'Coupon accepted. Hand the reward over.'
          : 'Coupon accepted, but the reward was not marked fulfilled — check the console.',
      );
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'This coupon has already been used. Do not hand the reward over.'
          : err instanceof Error
            ? err.message
            : 'Could not settle that coupon',
      );
    } finally {
      setBusy(false);
    }
  }

  /** Put a coupon back, for one accepted in error. */
  async function reissue() {
    if (!coupon) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await api.reissueCoupon(coupon.couponCode);
      setCoupon({ ...coupon, usedAt: null, status: 'issued' });
      setMsg('Coupon put back. The member can use it again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not put that coupon back');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="single-col">
      <h2>Redeem a coupon</h2>
      <p className="muted sm">
        Scan the QR in the member&rsquo;s app, or key the code in, to verify and fulfil it.
      </p>

      {scanning && (
        <CameraScanner onScan={acceptScan} onClose={() => setScanning(false)} />
      )}

      <form className="lookup-form" onSubmit={lookup}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="OL-XXXXXX"
          className="code-input"
        />
        {hasCamera && (
          <button type="button" className="btn scan-camera-btn" onClick={() => setScanning(true)}>
            Scan
          </button>
        )}
        <button className="btn primary">Look up</button>
      </form>

      {error && <div className="error">{error}</div>}
      {msg && <div className="toast ok">{msg}</div>}

      {coupon && (
        <div className="coupon-card">
          <div className="coupon-head">
            <div>
              <h3>{coupon.rewardName}</h3>
              <p className="muted sm">
                {coupon.usedAt
                  ? `Used ${new Date(coupon.usedAt).toLocaleString()}`
                  : 'Not yet used'}
              </p>
            </div>
            <span className={`status ${coupon.usedAt ? 'completed' : 'issued'}`}>
              {coupon.usedAt ? 'used' : 'unused'}
            </span>
          </div>
          <div className="coupon-meta">
            <code className="mono">{coupon.couponCode}</code>
            <span className="muted xs">fulfilment: {coupon.status}</span>
          </div>
          <div className="row">
            <button className="btn primary" disabled={busy || !!coupon.usedAt} onClick={consume}>
              {coupon.usedAt ? 'Already used' : 'Accept coupon'}
            </button>
            {coupon.usedAt && (
              <button className="btn" disabled={busy} onClick={reissue}>
                Undo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
