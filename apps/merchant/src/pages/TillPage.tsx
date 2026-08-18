import { useEffect, useRef, useState, type FormEvent } from 'react';
import QrScanner from 'qr-scanner';
import { api } from '../api/client';
import { CameraScanner } from '../components/CameraScanner';

/**
 * Member QR payloads are prefixed so a scanner can tell a membership apart from
 * a coupon code. We accept the bare card number too — a cashier keying the
 * number off the card face must land on the same identifier.
 */
const MEMBER_QR_PREFIX = /^NTUCCLUB:MEMBER:/i;

export function parseMemberQr(raw: string): string {
  return raw.trim().replace(MEMBER_QR_PREFIX, '').trim();
}

/**
 * A tenant rings up a total, not a basket — the till carries no product
 * catalogue. `general` keeps the sale outside the category campaigns so the
 * amount earns at the store's base rate.
 */
const SALE_CATEGORY = 'general';

interface Receipt {
  documentNumber: string;
  matched: boolean;
  pointsEarned: number;
  total: number;
  card: string;
}

export function TillPage() {
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('');
  const [documentType, setDocumentType] = useState<'sell' | 'return'>('sell');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [check, setCheck] = useState<{ ok: boolean; text: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  // Undetermined until asked; the scan button stays hidden on a device without
  // a camera rather than opening an overlay that can only fail.
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    QrScanner.hasCamera().then(setHasCamera).catch(() => setHasCamera(false));
  }, []);

  const parsed = Number.parseFloat(amount);
  const amountValid = Number.isFinite(parsed) && parsed > 0;
  const total = amountValid ? parsed : 0;

  /** Preview only — OpenLoyalty is the authority on points. */
  const previewPoints = documentType === 'return' ? 0 : Math.floor(total);

  /**
   * Handheld scanners emulate a keyboard and finish with Enter, so the scan
   * field commits on Enter rather than on every keystroke. Pasting the payload
   * behaves identically.
   */
  function acceptScan(raw: string) {
    const parsedCard = parseMemberQr(raw);
    if (!parsedCard) return;
    setCard(parsedCard);
    setCheck(null);
    if (scanRef.current) scanRef.current.value = '';
  }

  function acceptCameraScan(text: string) {
    acceptScan(text);
    setScanning(false);
  }

  function clearMember() {
    setCard('');
    setCheck(null);
    if (scanRef.current) scanRef.current.value = '';
  }

  async function verifyMember() {
    setCheck(null);
    if (!card) {
      setCheck({ ok: false, text: 'Scan a member QR first.' });
      return;
    }
    try {
      const res = await api.checkMember('', card);
      setCheck(
        res.total > 0
          ? { ok: true, text: '✓ Member found — points will be awarded.' }
          : { ok: false, text: '✗ No member matched. The sale will be recorded unmatched.' },
      );
    } catch (e) {
      setCheck({ ok: false, text: e instanceof Error ? e.message : 'Lookup failed' });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!amountValid) {
      setError('Enter an amount greater than zero.');
      return;
    }
    setBusy(true);
    setError(null);
    setReceipt(null);
    try {
      // Document numbers must be unique per store.
      const documentNumber = `POS-${Date.now().toString().slice(-9)}`;
      const res = await api.postTransaction({
        documentNumber,
        documentType,
        lines: [
          {
            sku: 'SALE',
            name: 'Qualifying spend',
            category: SALE_CATEGORY,
            unitPrice: Number(total.toFixed(2)),
            quantity: 1,
          },
        ],
        loyaltyCardNumber: card || undefined,
      });
      setReceipt({
        documentNumber,
        matched: res.matched,
        pointsEarned: res.pointsEarned,
        total,
        card,
      });
      setAmount('');
      clearMember();
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not publish transaction');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="till-card" onSubmit={submit}>
      {scanning && (
        <CameraScanner onScan={acceptCameraScan} onClose={() => setScanning(false)} />
      )}
      <div className="segmented">
        <button
          type="button"
          className={documentType === 'sell' ? 'active' : ''}
          onClick={() => setDocumentType('sell')}
        >
          Sale
        </button>
        <button
          type="button"
          className={documentType === 'return' ? 'active' : ''}
          onClick={() => setDocumentType('return')}
        >
          Return
        </button>
      </div>

      <label className="amount-field">
        <span>Transaction amount</span>
        <div className="amount-input">
          <span className="currency">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </label>

      <div className="scan-field">
        <span className="field-label">Member QR</span>
        {card ? (
          <div className="scanned">
            <div>
              <p className="xs muted">Loyalty ID</p>
              <p className="mono scanned-id">{card}</p>
            </div>
            <button type="button" className="btn sm ghost" onClick={clearMember}>
              Clear
            </button>
          </div>
        ) : (
          <div className="scan-entry">
            <input
              ref={scanRef}
              className="mono scan-input"
              placeholder="Scan or type loyalty ID…"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                // The scan field lives inside the sale form — don't publish.
                e.preventDefault();
                acceptScan(e.currentTarget.value);
              }}
              onPaste={(e) => {
                e.preventDefault();
                acceptScan(e.clipboardData.getData('text'));
              }}
            />
            {hasCamera && (
              <button
                type="button"
                className="btn scan-camera-btn"
                onClick={() => setScanning(true)}
              >
                Scan
              </button>
            )}
          </div>
        )}
        {card && (
          <button type="button" className="btn sm" onClick={verifyMember}>
            Check member
          </button>
        )}
        {check && (
          <p className={`check-result sm ${check.ok ? 'ok' : 'warn'}`}>
            {check.text}
          </p>
        )}
        {!card && (
          <p className="muted xs">
            Scan the member's card, or key the ID and press Enter. Optional — an
            unscanned sale is recorded unmatched.
          </p>
        )}
      </div>

      <div className="preview">
        <div>
          <span>Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
        <div className="muted sm">
          <span>Points preview</span>
          <strong>{previewPoints}</strong>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <button className="btn primary lg" disabled={busy || !amountValid}>
        {busy ? 'Publishing…' : documentType === 'sell' ? 'Publish sale' : 'Publish return'}
      </button>

      {receipt && (
        <div className="receipt">
          <h3>Published</h3>
          <p className="mono xs">{receipt.documentNumber}</p>
          <div className="receipt-row">
            <span>Total</span>
            <strong>${receipt.total.toFixed(2)}</strong>
          </div>
          <div className="receipt-row">
            <span>Member</span>
            <strong className={receipt.matched ? 'ok' : 'warn'}>
              {receipt.matched ? receipt.card : 'Unmatched'}
            </strong>
          </div>
          <div className="receipt-row big">
            <span>Points earned</span>
            <strong>{receipt.pointsEarned}</strong>
          </div>
          {!receipt.matched && (
            <p className="muted xs">
              No member was attached. Assign it later from the Sales tab.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
