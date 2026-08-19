import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Ticket, Car, BadgePercent, Gift, Zap, TrendingUp, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { TierBadge } from '../components/Ui.jsx';
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
    if (lower.includes('promo') || lower.includes('off')) return BadgePercent;
    if (lower.includes('birthday')) return Gift;
    if (lower.includes('early')) return Zap;
    if (lower.includes('earn')) return TrendingUp;
    if (lower.includes('pass')) return Ticket;
    if (lower.includes('welcome')) return Sparkles;
    return Star;
  }
  /**
   * Whether joining put this member above the entry tier.
   *
   * Keyed on the rank the platform reports, not on the persona that signed up:
   * a union member is promoted by a campaign paying out enough points to cross
   * the tier threshold, so a campaign that did not run leaves them on the entry
   * tier — and this screen should say so rather than congratulate them on an
   * upgrade they did not get.
   *
   * Nothing is announced to an entry-tier member. They cross the threshold by
   * spending, and a starting balance on this screen invites them to read it as
   * progress they have already made.
   */
  const rank = state.account.levelSortOrder ?? 1;
  const autoUpgraded = rank > 1;
  /**
   * The award as the loyalty platform actually granted it — which for a
   * promoted member is what carried them over the threshold, so it is the same
   * figure the tier was calculated from. Read from the enrolment result rather
   * than a locally invented ledger entry: the amount is campaign configuration.
   * Falls back to the balance, which at this point is the award and nothing
   * else.
   */
  const welcomePoints = state.enrolment?.welcomePoints ?? state.account.points ?? 0;
  const awardedBy = state.enrolment?.payouts?.[0]?.name ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50 to-white px-6 pb-10 pt-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="mt-1 text-3xl font-extrabold text-gray-900">Hi {state.user.name.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-gray-400">Your membership level is </p>
        <TierBadge tier={state.user.tier} label={state.user.tierName} className="mt-2" />
      </motion.div>

      {autoUpgraded && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500 to-gold-600 p-5 text-white shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <p className="text-sm font-bold">
              You have been auto-upgraded to {state.user.tierName ?? `Tier ${rank}`}
            </p>
          </div>
          {welcomePoints > 0 ? (
            <>
              <p className="mt-1 text-3xl font-extrabold">
                +{welcomePoints.toLocaleString()} pts
              </p>
              <p className="text-xs text-white/80">
                {awardedBy ? `${awardedBy} · credited to your account` : 'Credited to your account'}
              </p>
            </>
          ) : (
            /*
             * The tier is granted on membership, the points by a campaign, and
             * the two are independent. Where no award has landed there is no
             * figure to show — printing "+0 pts" under a promotion announces a
             * bonus that was never given.
             */
            <p className="mt-1 text-xs text-white/80">
              Your membership tier is yours from today.
            </p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-4"
      >
        <p className="mb-2 mt-4 text-sm text-gray-400">Your membership benefits include:</p>
        <div className="grid grid-cols-2 gap-2">
        {tierInfo.perks.map((p) => {
          const Icon = getPerkIcon(p);
          return (
            <div key={p} className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-md shadow-brand-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Icon size={20} />
              </div>
              <p className="text-[11px] leading-tight text-gray-600">{p}</p>
            </div>
          );
        })}
        </div>
      </motion.div>


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
