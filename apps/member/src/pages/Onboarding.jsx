import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Ticket, Car, BadgePercent, Gift, Zap, TrendingUp, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { TierBadge, tenantName } from '../components/Ui.jsx';
import { TIER_INFO } from '../data/mockData.js';

export default function Onboarding() {
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.user) navigate('/personas', { replace: true });
    // A resumed member did not just join, so there is no welcome to show them.
    else if (state.user.resumed) navigate('/', { replace: true });
  }, [state.user, navigate]);

  if (!state.user) return null;
  const tierInfo = TIER_INFO[state.user.tier] ?? TIER_INFO.tier1;

  function getPerkIcon(perk) {
    const lower = perk.toLowerCase();
    if (lower.includes('parking')) return Car;
    if (lower.includes('promo')) return BadgePercent;
    if (lower.includes('birthday')) return Gift;
    if (lower.includes('early')) return Zap;
    if (lower.includes('earn')) return TrendingUp;
    return Star;
  }
  /**
   * The welcome award as the loyalty platform actually granted it.
   *
   * Read from the enrolment result rather than a locally invented ledger entry:
   * the amount is campaign configuration, and a union member receives a
   * different one from everybody else. Falls back to the account balance, which
   * at this point is the welcome award and nothing else.
   */
  const welcomePoints = state.enrolment?.welcomePoints ?? state.account.points ?? 0;
  const awardedBy = state.enrolment?.payouts?.[0]?.name ?? null;
  const bundleVouchers = state.vouchers.filter((v) => v.fromWelcomeBundle);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50 to-white px-6 pb-10 pt-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="mt-1 text-3xl font-extrabold text-gray-900">Hi {state.user.name.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-gray-400">Your membership level is </p>
        <TierBadge tier={state.user.tier} label={state.user.tierName} className="mt-2" />
      </motion.div>

      <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500 to-gold-600 p-5 text-white shadow-xl"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={20} />
        <p className="text-sm font-bold">Welcome Bonus Credited</p>
      </div>
      <p className="mt-1 text-3xl font-extrabold">+{welcomePoints.toLocaleString()} pts</p>
      <p className="text-xs text-white/80">
        {awardedBy ? `${awardedBy} · credited to your account` : 'Credited to your account'}
      </p>
    </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-4"
      >
        <p className="mb-2 mt-4 text-sm text-gray-400">Your membership benefits include:</p>
        <div className="grid grid-cols-4 gap-2">
        {tierInfo.perks.map((p) => {
          const Icon = getPerkIcon(p);
          return (
            <div key={p} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-md shadow-brand-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Icon size={24} />
              </div>
              <p className="text-[11px] leading-tight text-gray-600">{p}</p>
            </div>
          );
        })}
        </div>
      </motion.div>

      {bundleVouchers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-4 space-y-2">
          {bundleVouchers.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Ticket size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{v.title}</p>
                <p className="text-[11px] text-gray-400">{tenantName(v.tenantId)} · Digital deal bundle</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => navigate('/')}
        className="mt-auto w-full rounded-2xl bg-brand-600 py-4 text-sm font-bold text-white shadow-lg shadow-brand-200 active:scale-[0.98]"
      >
        Start Exploring
      </motion.button>
    </div>
  );
}
