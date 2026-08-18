import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { EmptyState } from '../components/Ui.jsx';
import { fmtDate } from '../lib/helpers.js';

/**
 * The BFF reports points transfers in the loyalty platform's vocabulary
 * (`adding`/`spending`); the list renders the app's own. A transfer carrying
 * the enrolment comment is shown as a bonus rather than a purchase.
 */
function toEntry(t) {
  const positive = t.type === 'adding';
  const isBonus = positive && /welcome/i.test(t.comment ?? '');
  return {
    id: t.pointsTransferId,
    date: t.createdAt,
    type: isBonus ? 'bonus' : positive ? 'earn' : 'redeem',
    desc: t.comment || (positive ? 'Points earned' : 'Points redeemed'),
    amount: positive ? t.value : -t.value,
  };
}

const TABS = [
  { id: 'all',    label: 'All' },
  { id: 'earn',   label: 'Earned' },
  { id: 'redeem', label: 'Redeemed' },
  { id: 'adjust', label: 'Adjustments' },
];

export default function PointsLedger() {
  const { state } = useApp();
  const [tab, setTab] = useState('all');

  const entries = useMemo(
    () =>
      (state.account.history ?? [])
        .map(toEntry)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.account.history],
  );

  const filtered = entries.filter((l) => {
    if (tab === 'all')    return true;
    if (tab === 'earn')   return l.type === 'earn' || l.type === 'bonus';
    if (tab === 'redeem') return l.type === 'redeem';
    if (tab === 'adjust') return l.type === 'refund' || l.type === 'refund-flag';
    return true;
  });

  // The balance is what the platform reports, not a sum of the rows on screen.
  const balance = state.account.points;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Points Activity" subtitle={`Balance: ${balance.toLocaleString()} pts`} />

      <div className="px-5 pt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                tab === t.id ? 'bg-brand-600 text-white' : 'bg-white text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 && <EmptyState icon={Clock} title="Nothing here yet" body="Your points history will show up in this tab." />}
          {filtered.map((l) => (
            <LedgerRow key={l.id} entry={l} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LedgerRow({ entry }) {
  const isRefund = entry.type === 'refund';
  const isFlag = entry.type === 'refund-flag';
  const positive = entry.amount > 0;
  const isEarnLike = (entry.type === 'earn' || entry.type === 'bonus') && entry.expiryDate && !entry.refundStatus;

  let amountDisplay;
  if (isFlag) {
    amountDisplay = <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-500">Pending</span>;
  } else {
    amountDisplay = (
      <span className={`text-sm font-bold ${positive ? 'text-green-600' : isRefund ? 'text-red-500' : 'text-gray-400'}`}>
        {positive ? '+' : ''}
        {entry.amount.toLocaleString()}
      </span>
    );
  }

  return (
    <div className={`rounded-xl bg-white p-3.5 shadow-sm ${isRefund || isFlag ? 'border border-red-100' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-[13px] font-semibold text-gray-800">{entry.desc}</p>
          <p className="text-[11px] text-gray-400">{fmtDate(entry.date)}</p>
        </div>
        {amountDisplay}
      </div>
      {isEarnLike && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-50 text-gray-400">
          <Clock size={10} /> Expires {fmtDate(entry.expiryDate)}
        </div>
      )}
      {entry.refundStatus === 'reversed' && <p className="mt-1.5 text-[10px] font-semibold text-gray-400">Reversed due to refund</p>}
      {entry.refundStatus === 'flagged' && <p className="mt-1.5 text-[10px] font-semibold text-orange-500">Flagged — refund pending manual adjustment</p>}
    </div>
  );
}
