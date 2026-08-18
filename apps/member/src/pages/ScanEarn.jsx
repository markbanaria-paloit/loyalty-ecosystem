import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Zap, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp, isBirthdayMonthNow } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { TenantAvatar, tenantName } from '../components/Ui.jsx';
import { TENANTS } from '../data/mockData.js';
import { fmtDate, roundPoints } from '../lib/helpers.js';

export default function ScanEarn() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState(TENANTS[0].id);
  const [amount, setAmount] = useState('12.50');

  const cfg = state.config;
  const numAmount = parseFloat(amount) || 0;
  const base = roundPoints(numAmount * cfg.earnRate, cfg.rounding);

  const { multiplier, reason, isBirthday } = useMemo(() => {
    const curMonthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    const inBirthdayWindow = state.demoBirthdayMode || isBirthdayMonthNow(state.user);
    const birthdayActive = inBirthdayWindow && state.birthdayClaimedMonthKey !== curMonthKey;
    if (birthdayActive) {
      const tier = state.user.tier === 'tier2' ? 'tier2' : 'tier1';
      return { multiplier: cfg.birthdayMultiplier[tier], reason: `Birthday bonus (${cfg.birthdayMultiplier[tier]}X)`, isBirthday: true };
    }
    if (cfg.campaign?.active && cfg.campaign.tenantId === tenantId) {
      return { multiplier: cfg.campaign.multiplier, reason: cfg.campaign.label, isBirthday: false };
    }
    return { multiplier: 1, reason: null, isBirthday: false };
  }, [state.demoBirthdayMode, state.birthdayClaimedMonthKey, cfg, tenantId, state.user.tier]);

  // Match the reducer's math exactly (rounds once, after applying the multiplier to
  // the raw spend) so this preview never drifts from the amount actually credited.
  const total = roundPoints(numAmount * cfg.earnRate * multiplier, cfg.rounding);

  function confirm() {
    if (numAmount <= 0) return;
    dispatch({ type: 'SIMULATE_PURCHASE', payload: { tenantId, amount: numAmount } });
    navigate('/scan/confirm', {
      state: {
        tenantId,
        spendAmount: numAmount,
        basePoints: base,
        multiplier,
        multiplierReason: reason,
        isBirthday,
        totalPoints: total,
        earnRate: cfg.earnRate,
      },
    });
  }

  const refundable = state.ledger.filter((l) => l.type === 'earn' && !l.refunded).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Scan & Earn" subtitle="Simulates a tenant scanning your membership QR at checkout" />

      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">1. Tenant scans your QR at</p>
          <div className="grid grid-cols-4 gap-2">
            {TENANTS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTenantId(t.id)}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 ${tenantId === t.id ? 'bg-brand-50 ring-2 ring-brand-400' : ''}`}
              >
                <TenantAvatar tenantId={t.id} size={36} />
                <span className="text-center text-[9.5px] font-medium leading-tight text-gray-600">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">2. Qualifying spend amount</p>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
            <span className="text-xl font-bold text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-2xl font-extrabold text-gray-900 outline-none"
            />
          </div>

          <div className="mt-4 space-y-1.5 rounded-xl bg-gray-50 p-3.5 text-[13px]">
            <div className="flex justify-between text-gray-500">
              <span>Base ({cfg.earnRate} pt / $1)</span>
              <span className="font-semibold text-gray-700">{base.toLocaleString()} pts</span>
            </div>
            {multiplier > 1 && (
              <div className="flex justify-between text-brand-600">
                <span className="flex items-center gap-1">
                  <Zap size={12} /> {reason}
                </span>
                <span className="font-semibold">×{multiplier}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-sm font-bold text-gray-900">
              <span>You'll earn</span>
              <span className="text-green-600">+{total.toLocaleString()} pts</span>
            </div>
          </div>

          <button
            onClick={confirm}
            disabled={numAmount <= 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-100 active:scale-[0.98] disabled:opacity-40"
          >
            <ScanLine size={18} /> Confirm Transaction at {tenantName(tenantId)}
          </button>
        </div>

        <div className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
            <RotateCcw size={12} /> Simulate a refund / reversal
          </p>
          <div className="space-y-2">
            {refundable.length === 0 && <p className="rounded-xl bg-white p-3.5 text-center text-xs text-gray-400 shadow-sm">No transactions to refund yet.</p>}
            {refundable.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-white p-3.5 shadow-sm">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-[13px] font-semibold text-gray-800">{l.desc}</p>
                  <p className="text-[11px] text-gray-400">
                    {fmtDate(l.date)} · +{l.amount.toLocaleString()} pts
                  </p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'REFUND_TRANSACTION', payload: { ledgerId: l.id } })}
                  className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-500 active:bg-gray-50"
                >
                  Refund
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
