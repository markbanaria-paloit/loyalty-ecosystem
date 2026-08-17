import { useMemo, useState, type FormEvent } from 'react';
import { api, type CartLine } from '../api/client';

/** A small catalogue so the till is usable without typing SKUs by hand. */
const CATALOGUE: Array<Omit<CartLine, 'quantity'>> = [
  { sku: 'CF-001', name: 'Flat White', category: 'coffee', unitPrice: 4.5 },
  { sku: 'CF-002', name: 'Bag of Beans 250g', category: 'coffee', unitPrice: 14 },
  { sku: 'FD-010', name: 'Almond Croissant', category: 'food', unitPrice: 5.25 },
  { sku: 'FD-011', name: 'Chicken Sandwich', category: 'food', unitPrice: 9.8 },
  { sku: 'EL-100', name: 'Wireless Earbuds', category: 'electronics', unitPrice: 89 },
  { sku: 'MD-200', name: 'Ceramic Mug', category: 'merch', unitPrice: 12 },
];

/** Mirrors the mock's earning rule so the till can preview points. */
const MULTIPLIERS: Record<string, number> = { electronics: 2, coffee: 3 };

interface Receipt {
  transactionId: string;
  documentNumber: string;
  matched: boolean;
  pointsEarned: number;
  total: number;
}

export function TillPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [email, setEmail] = useState('');
  const [card, setCard] = useState('');
  const [documentType, setDocumentType] = useState<'sell' | 'return'>('sell');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [check, setCheck] = useState<string | null>(null);

  const total = useMemo(
    () => lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0),
    [lines],
  );

  /** Client-side preview only — OpenLoyalty is the authority on points. */
  const previewPoints = useMemo(() => {
    if (documentType === 'return') return 0;
    return Math.floor(
      lines.reduce(
        (acc, l) =>
          acc + l.unitPrice * l.quantity * (MULTIPLIERS[l.category] ?? 1),
        0,
      ),
    );
  }, [lines, documentType]);

  function addLine(item: Omit<CartLine, 'quantity'>) {
    setLines((cur) => {
      const found = cur.find((l) => l.sku === item.sku);
      if (found) {
        return cur.map((l) =>
          l.sku === item.sku ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...cur, { ...item, quantity: 1 }];
    });
  }

  function setQuantity(sku: string, quantity: number) {
    setLines((cur) =>
      quantity <= 0
        ? cur.filter((l) => l.sku !== sku)
        : cur.map((l) => (l.sku === sku ? { ...l, quantity } : l)),
    );
  }

  async function verifyMember() {
    setCheck(null);
    if (!email && !card) {
      setCheck('Enter an email or loyalty card first.');
      return;
    }
    try {
      const res = await api.checkMember(email, card);
      setCheck(
        res.total > 0
          ? '✓ Member found — points will be awarded.'
          : '✗ No member matched. The sale will be recorded unmatched.',
      );
    } catch (e) {
      setCheck(e instanceof Error ? e.message : 'Lookup failed');
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Add at least one item.');
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
        lines,
        email: email || undefined,
        loyaltyCardNumber: card || undefined,
      });
      setReceipt({
        transactionId: res.transactionId,
        documentNumber,
        matched: res.matched,
        pointsEarned: res.pointsEarned,
        total,
      });
      setLines([]);
      setEmail('');
      setCard('');
      setCheck(null);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not publish transaction');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="till">
      <section className="catalogue">
        <h2>Catalogue</h2>
        <div className="product-grid">
          {CATALOGUE.map((p) => (
            <button key={p.sku} className="product" onClick={() => addLine(p)}>
              <strong>{p.name}</strong>
              <span className="muted xs">
                {p.sku} · {p.category}
                {MULTIPLIERS[p.category] ? ` · ${MULTIPLIERS[p.category]}×` : ''}
              </span>
              <span className="price">${p.unitPrice.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </section>

      <form className="cart" onSubmit={submit}>
        <h2>Sale</h2>

        {lines.length === 0 && <p className="muted sm">Tap a product to start.</p>}
        <ul className="cart-lines">
          {lines.map((l) => (
            <li key={l.sku}>
              <div className="cart-line-info">
                <strong>{l.name}</strong>
                <span className="muted xs">${l.unitPrice.toFixed(2)} each</span>
              </div>
              <div className="qty">
                <button
                  type="button"
                  onClick={() => setQuantity(l.sku, l.quantity - 1)}
                >
                  −
                </button>
                <span>{l.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(l.sku, l.quantity + 1)}
                >
                  +
                </button>
              </div>
              <span className="line-total">
                ${(l.unitPrice * l.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="totals">
          <div>
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="muted sm">
            <span>Points preview</span>
            <strong>{previewPoints}</strong>
          </div>
        </div>

        <fieldset className="member-block">
          <legend>Member (optional)</legend>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
            />
          </label>
          <label>
            Loyalty card
            <input
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="1000000001"
            />
          </label>
          <button type="button" className="btn sm" onClick={verifyMember}>
            Check member
          </button>
          {check && <p className="check-result sm">{check}</p>}
        </fieldset>

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

        {error && <div className="error">{error}</div>}

        <button className="btn primary lg" disabled={busy || lines.length === 0}>
          {busy ? 'Publishing…' : `Publish ${documentType}`}
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
                {receipt.matched ? 'Matched' : 'Unmatched'}
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
    </div>
  );
}
