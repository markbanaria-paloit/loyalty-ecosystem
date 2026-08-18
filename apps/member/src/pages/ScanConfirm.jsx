import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { TenantAvatar, tenantName } from '../components/Ui.jsx';

const TIER_LABELS = { tier1: 'Classic', tier2: 'Plus' };

export default function ScanConfirm() {
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
  const { state } = useApp();

  // routeState is set by ScanEarn when it navigates here
  const {
    tenantId,
    spendAmount,
    basePoints,
    multiplier,
    multiplierReason,
    isBirthday,
    totalPoints,
    earnRate,
  } = routeState ?? {};

  // Fallback if page is hit directly without state
  if (!routeState) {
    navigate('/scan', { replace: true });
    return null;
  }

  const tier = state.user?.tier ?? 'tier1';
  const tierLabel = TIER_LABELS[tier] ?? tier;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-10">
      {/* ── Hero confirmation banner ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-purple-600 via-rose-500 to-pink-400 px-6 pb-10 pt-14 text-white">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative flex flex-col items-center gap-3 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-400/90">
              <Check size={36} strokeWidth={3} className="text-white" />
            </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Qualifying Spend Confirmed</h1>
          <p className="text-sm text-white/80">
            Your transaction at <strong className="text-white">{tenantName(tenantId)}</strong> has been verified.
          </p>
        </motion.div>

        {/* spend pill */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="relative mt-6 flex items-center justify-between rounded-2xl bg-white/15 px-5 py-3.5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <TenantAvatar tenantId={tenantId} size={36} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Spend amount</p>
              <p className="text-xl font-extrabold">${Number(spendAmount).toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Points earned</p>
            <p className="text-2xl font-extrabold text-white">+{totalPoints.toLocaleString()}</p>
          </div>
        </motion.div>
      </div>

      {/* ── Points breakdown ── */}
      <div className="px-5 pt-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-400">Points Calculation</h2>

          {/* Tier row */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Star size={15} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{tierLabel} Member tier</p>
                <p className="text-[11px] text-gray-400">{earnRate} pt per $1 qualifying spend</p>
              </div>
            </div>
            <span className="text-[13px] font-bold text-gray-700">{basePoints.toLocaleString()} pts</span>
          </div>

          {/* Campaign / bonus row */}
          {multiplier > 1 && (
            <div className="flex items-center justify-between border-b border-gray-100 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isBirthday ? 'bg-pink-50 text-pink-500' : 'bg-amber-50 text-amber-500'}`}>
                  {isBirthday ? <Star size={15} /> : <Tag size={15} />}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">
                    {isBirthday ? 'Birthday bonus' : 'Campaign rule'}
                  </p>
                  <p className="text-[11px] text-gray-400">{multiplierReason}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 text-[13px] font-bold ${isBirthday ? 'text-pink-500' : 'text-amber-600'}`}>
                <Zap size={13} />×{multiplier}
              </span>
            </div>
          )}

          {/* Total row */}
          <div className="flex items-center justify-between pt-3.5">
            <p className="text-sm font-bold text-gray-900">Total credited</p>
            <p className="text-lg font-extrabold text-green-600">+{totalPoints.toLocaleString()} pts</p>
          </div>
        </motion.div>

        {/* ── Updated balance pill ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mt-4 flex items-center justify-between rounded-2xl bg-brand-50 px-5 py-4"
        >
          <p className="text-sm font-semibold text-brand-700">Your new balance</p>
          <p className="text-xl font-extrabold text-brand-700">{state.points.toLocaleString()} pts</p>
        </motion.div>

        {/* ── Active rules summary ── */}
        {/* ── CTAs ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.54 }}
          className="mt-6 flex gap-3"
        >
          <button
            onClick={() => navigate('/ledger')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm active:scale-[0.98]"
          >
            View history
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-100 active:scale-[0.98]"
          >
            Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
