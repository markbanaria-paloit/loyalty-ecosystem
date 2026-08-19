import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, ChevronRight, Bell, Cake } from 'lucide-react';
import { useApp, isBirthdayMonthNow } from '../context/AppContext.jsx';
import { TierBadge, TenantAvatar, tenantName } from '../components/Ui.jsx';
import { PROMOTIONS } from '../data/mockData.js';
import { fmtDate, formatTierMetric } from '../lib/helpers.js';
import scanIcon from '../assets/icons/scan.png';
import rewardsIcon from '../assets/icons/rewards.png';
import parkingIcon from '../assets/icons/parking.png';
import activityIcon from '../assets/icons/coins.png';

export default function Home() {
  const { state } = useApp();
  const { user } = state;

  // Both come from the loyalty record the BFF reports — the app no longer
  // keeps a points history of its own.
  const expiringSoon = state.account.pointsExpiringNextMonth ?? 0;

  const recent = useMemo(
    () =>
      (state.account.history ?? [])
        .map((t) => {
          const positive = t.type === 'adding';
          return {
            id: t.pointsTransferId,
            date: t.createdAt,
            desc: t.comment || (positive ? 'Points earned' : 'Points redeemed'),
            amount: positive ? t.value : -t.value,
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4),
    [state.account.history],
  );
  const visiblePromos = PROMOTIONS.filter((p) => p.audience === 'all' || p.audience === user.tier);

  return (
    <div className="pb-24">
      <div className="-mt-11 relative overflow-hidden px-5 pb-8 pt-[60px] text-white" style={{ backgroundImage: "url('https://cdn.eventfinda.sg/uploads/locations/transformed/10767-167-34.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/75">Good evening,</p>
            <p className="text-lg font-extrabold">{user.name.split(' ')[0]}</p>
          </div>
          <TierBadge tier={user.tier} label={user.tierName} className="!bg-gold/20 !px-3 !py-1 !text-xs" />
        </div>

        <div className="mt-6">
          <div>
            <p className="text-xs font-medium text-white/70">Points Balance</p>
            <p className="text-4xl font-extrabold tracking-tight">{state.points.toLocaleString()}</p>
            <ToNextTier progress={state.tierProgress} />
            {expiringSoon > 0 && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Bell size={11} /> {expiringSoon.toLocaleString()} pts expiring within 30 days
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      <div className="relative z-10 -mt-5 px-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-lg shadow-gray-200/60">
          <QuickAction to="/rewards" img={rewardsIcon} label="Rewards" />
          <QuickAction to="/parking" img={parkingIcon} label="Parking" />
          <QuickAction to="/ledger" img={activityIcon} label="Points" />
        </div>
      </div>

      <div className="mt-5 space-y-5 px-4">
        <TierProgressCard progress={state.tierProgress} />
        {(isBirthdayMonthNow(user) || state.demoBirthdayMode) && <BirthdayBanner tier={user.tier} />}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">Just for you</h2>
            <Link to="/promotions" className="flex items-center text-xs font-semibold text-brand-600">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {visiblePromos.map((p) => (
              <div key={p.id} className="flex min-w-[240px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {p.image && (
                  <img src={p.image} alt={p.title} className="h-[120px] w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.tag === 'Tier 2 Exclusive' ? 'bg-gold-500/15 text-gold-600' : 'bg-brand-50 text-brand-600'}`}>{p.tag}</span>
                    <p className="mt-2 text-sm font-bold leading-snug text-gray-900">{p.title}</p>
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.body}</p>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <TenantAvatar tenantId={p.tenantId} size={20} />
                    <span className="text-[11px] font-medium text-gray-500">{tenantName(p.tenantId)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">Recent Activity</h2>
            <Link to="/ledger" className="flex items-center text-xs font-semibold text-brand-600">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && <p className="rounded-2xl bg-white p-4 text-center text-xs text-gray-400 shadow-sm">No activity yet — try Scan &amp; Earn!</p>}
            {recent.map((l) => (
              <ActivityRow key={l.id} entry={l} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BirthdayBanner({ tier }) {
  const multiplier = tier === 'tier2' ? 3 : 2;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-gold-500 to-brand-500 p-4 text-white shadow-lg"
    >
      <Cake size={26} />
      <div>
        <p className="text-sm font-bold">It's your birthday month! 🎉</p>
        <p className="text-xs text-white/85">Get {multiplier}X points on your first purchase this month.</p>
      </div>
    </motion.div>
  );
}

function QuickAction({ to, img, label }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-center active:bg-gray-50">
      <img src={img} alt="" className="h-12 w-12" draggable={false} />
      <span className="text-[10.5px] font-semibold leading-tight text-gray-600">{label}</span>
    </Link>
  );
}

function ActivityRow({ entry }) {
  const positive = entry.amount >= 0;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 shadow-sm">
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-[13px] font-semibold text-gray-800">{entry.tenantId ? tenantName(entry.tenantId) : entry.desc}</p>
        <p className="text-[11px] text-gray-400">{fmtDate(entry.date)}</p>
      </div>
      <span className={`text-sm font-bold ${positive ? 'text-green-600' : 'text-gray-500'}`}>
        {positive ? '+' : ''}
        {entry.amount.toLocaleString()}
      </span>
    </div>
  );
}

/**
 * Progress toward the next tier, exactly as the loyalty platform reports it.
 *
 * Every number here — the goal, the current value, the percentage, the date the
 * qualification period rolls over — comes from the platform. The app formats
 * them and nothing more, so a threshold changed in the console shows up here
 * without a release.
 */
function TierProgressCard({ progress }) {
  if (!progress?.nextTierName) return null;

  const condition = progress.nextTierCurrentProgress?.[0];
  const eligible = progress.nextTierEligible !== false;
  const pct = Math.max(0, Math.min(100, progress.currentProgress ?? 0));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12px] font-bold text-gray-800">
            {eligible
              ? `${formatTierMetric(
                  condition?.attribute,
                  Math.max(0, (condition?.valueGoal ?? 0) - (condition?.currentValue ?? 0)),
                )} to ${progress.nextTierName}`
              : `${progress.nextTierName} — members only`}
          </p>
          {eligible && condition && (
            <p className="text-[11px] font-semibold text-gray-400">
              {formatTierMetric(condition.attribute, condition.currentValue)} /{' '}
              {formatTierMetric(condition.attribute, condition.valueGoal)}
            </p>
          )}
        </div>

        {eligible ? (
          <>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {progress.nextRecalculationAt && (
              <p className="mt-1.5 text-[10.5px] text-gray-400">
                Qualifying period resets {fmtDate(progress.nextRecalculationAt)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {progress.nextTierName} is open to NTUC union members automatically, or on
            reaching the spend threshold.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * How much further to the next tier, in the unit that tier is measured in.
 *
 * Deliberately not "points": Tier 2 is qualified on spend, so a points figure
 * here would be a different number with the same name. `formatMetric` labels
 * whatever attribute the platform reports, so this stays correct if the
 * programme is re-keyed to units or tenure.
 *
 * Nothing is shown to a member who cannot reach the next tier at all — a
 * distance implies the journey is available.
 */
function ToNextTier({ progress }) {
  if (!progress?.nextTierName || progress.nextTierEligible === false) return null;
  const condition = progress.nextTierCurrentProgress?.[0];
  if (!condition) return null;

  const remaining = Math.max(0, (condition.valueGoal ?? 0) - (condition.currentValue ?? 0));
  if (remaining <= 0) return null;

  return (
    <p className="mt-1 text-[12px] font-semibold text-white/85">
      {formatTierMetric(condition.attribute, remaining)} to {progress.nextTierName}
    </p>
  );
}
