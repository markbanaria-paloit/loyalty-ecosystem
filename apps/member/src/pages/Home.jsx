import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ChevronRight, ChevronDown, Bell, Cake, Target, Star, Check, Gift,
  Coins, Package, Sparkles, MapPin, Compass, Flame, Zap, Flag, Briefcase,
  Percent, Camera, Trophy, Crown,
} from 'lucide-react';
import { useApp, isBirthdayMonthNow } from '../context/AppContext.jsx';
import { TierBadge, TenantAvatar, tenantName } from '../components/Ui.jsx';
import { PROMOTIONS } from '../data/mockData.js';
import { CLUB_VENUES, PROPOSED_CHALLENGES, THIRD_HOME_HERO } from '../data/proposedChallenges.js';
import ScratchCard from '../components/ScratchCard.jsx';
import TierProgressCard from '../components/TierProgress.jsx';
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

  const challenge = useMemo(() => currentChallenge(state.challenges), [state.challenges]);
  /**
   * Whether we have heard from the platform yet.
   *
   * Until we have, neither banner is the right answer: showing the birthday
   * and swapping it for a challenge a few seconds later is a worse thing to
   * watch than a placeholder that resolves once.
   */
  const challengesUnknown = state.challenges === null;

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
        {/*
          * A challenge takes this slot when there is one to show. It is the
          * thing the member can act on today, where a birthday is a standing
          * fact about the month; when no challenge is running the birthday
          * banner has the space back.
          */}
        {challengesUnknown ? (
          <ChallengeSkeleton />
        ) : challenge ? (
          <ChallengeBanner challenge={challenge} />
        ) : (
          (isBirthdayMonthNow(user) || state.demoBirthdayMode) && <BirthdayBanner tier={user.tier} />
        )}
        {challenge && <RatingCard challenge={challenge} />}

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

        <ProposedChallenges />

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

/**
 * The challenge the member is closest to finishing, or nothing.
 *
 * One at a time: a list of goals is a chore, and the useful thing on a home
 * screen is the next step. Completed and closed-out challenges are dropped —
 * a goal already met is not something to announce.
 */
function currentChallenge(challenges) {
  const open = (challenges ?? []).filter(
    (c) =>
      // Not offered again once it has been done. The platform says this one is
      // repeatable — `limitReached` stays false and the milestones reset — so
      // this is a choice about what to put in front of a member, not something
      // the programme decided: a goal you have already met is not news, and
      // showing it again reads as the app having forgotten.
      !c.limitReached &&
      !c.completedCount &&
      c.milestones.some((m) => m.goal && m.current < m.goal),
  );
  if (!open.length) return null;
  const remaining = (c) =>
    c.milestones.reduce((sum, m) => sum + Math.max(0, (m.goal ?? 0) - m.current), 0);
  return [...open].sort((a, b) => remaining(a) - remaining(b))[0];
}

/** Wording for a milestone, in the terms the member did the thing in. */
function milestoneLabel(m) {
  if (m.trigger === 'transaction') return `${m.goal} purchases`;
  if (m.trigger === 'custom_event') return 'Leave a rating';
  return 'Goal';
}

const REWARD_ICON = { voucher: Gift, points: Coins, product: Package, scratch: Gift };

/** The face each concept leads with. Keyed by id — the theme names vary too much. */
const CHALLENGE_ICON = {
  'september-lull': Compass,
  'daily-visit-scratch': Flame,
  'social-share': Camera,
  'app-streak': Zap,
  'family-weekender': Trophy,
  'clubhouse-regular': Flag,
  'mice-return': Briefcase,
};

/**
 * Challenge concepts, offered for review rather than play.
 *
 * Folded behind one cinematic banner so the home screen carries a single
 * headline instead of six cards of homework; tapping it unrolls the carousel.
 * Clearly marked as ideas — the live challenge sits at the top of this screen
 * and comes from the platform, and nothing down here is scored, awarded or
 * configured anywhere.
 */
function ProposedChallenges() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  /**
   * A freshly opened track starts at the first card. Without this, mandatory
   * snapping is free to resolve the initial position to whichever card it
   * likes, and it has been seen picking the middle of the list. Keyed on
   * `open` only — anything that runs per render fights the member's swipe.
   */
  useEffect(() => {
    if (open && trackRef.current) {
      trackRef.current.scrollLeft = 0;
      setActive(0);
    }
  }, [open]);

  /** Which card the snap landed on, read off the scroll position. */
  function onTrackScroll() {
    const track = trackRef.current;
    const card = track?.querySelector('[data-card]');
    if (!card) return;
    const step = card.offsetWidth + 12; // card + the gap-3 between cards
    setActive(Math.max(0, Math.min(PROPOSED_CHALLENGES.length - 1, Math.round(track.scrollLeft / step))));
  }

  return (
    <section>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="relative block w-full cursor-pointer overflow-hidden rounded-3xl text-left shadow-lg shadow-gray-300/60"
      >
        <img src={THIRD_HOME_HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
        <div className="relative flex items-center justify-between gap-3 px-5 py-5">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-400">
              <Sparkles size={11} /> September at the Club
            </p>
            <p className="mt-1 font-poppins text-[23px] font-extrabold leading-[1.04] tracking-tight text-white">
              Your third home
              <span className="block font-playfair italic tracking-normal text-gold-400">
                just got better.
              </span>
            </p>
            {!open && (
              <p className="mt-1.5 text-[11px] font-medium text-white/70">
                Challenge concepts — tap to explore
              </p>
            )}
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-sm"
          >
            <ChevronDown size={18} />
          </motion.span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="concepts"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <p className="px-1 pt-3 text-[11px] leading-snug text-gray-400">
              Concept challenges for September. Not live yet — nothing here
              awards anything.
            </p>
            <div
              ref={trackRef}
              onScroll={onTrackScroll}
              className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-3"
            >
              {PROPOSED_CHALLENGES.map((c, i) => (
                <ProposedChallengeCard key={c.id} challenge={c} index={i} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {PROPOSED_CHALLENGES.map((c, i) => (
                <span
                  key={c.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-5 bg-brand-500' : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProposedChallengeCard({ challenge, index }) {
  const [scratched, setScratched] = useState(null);
  const RewardIcon = REWARD_ICON[challenge.reward.kind] ?? Gift;
  const ThemeIcon = CHALLENGE_ICON[challenge.id] ?? Target;
  // A streak card earns its scratch on the last step, so the card only appears
  // once the goal is in reach — otherwise it is a prize before the work.
  const streak = challenge.milestones[0];
  const scratchReady =
    challenge.reward.kind === 'scratch' && streak.current >= streak.goal - 1;

  return (
    <motion.div
      data-card
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="relative flex min-h-[420px] w-[78%] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] shadow-xl shadow-gray-400/40"
    >
      <img src={challenge.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/* The accent keeps six different photos reading as one set. */}
      <div className={`absolute inset-0 bg-gradient-to-br ${challenge.accent} opacity-25 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />

      <div className="relative flex items-start justify-between gap-2 p-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          <ThemeIcon size={11} /> {challenge.theme}
        </span>
        <span className="rounded-full bg-black/35 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-md">
          Concept
        </span>
      </div>

      <div className="relative space-y-3 p-5 pt-10">
        <div>
          <p className="font-poppins text-[26px] font-extrabold leading-[1.02] tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
            {challenge.name}
          </p>
          <p className="mt-1.5 text-xs leading-snug text-white/80">{challenge.blurb}</p>
        </div>

        {challenge.milestones.length > 0 && (
          <div className="space-y-2">
            {challenge.milestones.map((m) => {
              const pct = Math.min(100, Math.round((m.current / m.goal) * 100));
              const done = m.current >= m.goal;
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-medium text-white/85">
                      {done && <Check size={11} className="text-gold-400" />}
                      {m.label}
                    </span>
                    <span className="font-bold text-white/70">
                      {m.current}/{m.goal}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-gold-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {challenge.leaderboard && (
          <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Leaderboard · {challenge.leaderboard.metric}
            </p>
            <div className="mt-1.5">
              {challenge.leaderboard.entries.map((e) => (
                <div key={e.rank} className="flex items-center gap-2 py-1 text-xs">
                  <span
                    className={`w-4 shrink-0 text-center font-black ${
                      e.rank === 1 ? 'text-gold-400' : 'text-white/50'
                    }`}
                  >
                    {e.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-white/90">
                    {e.name}
                  </span>
                  {e.rank === 1 && <Crown size={12} className="shrink-0 text-gold-400" />}
                  <span className="font-bold text-white/70">{e.value}</span>
                </div>
              ))}
              <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/15 px-2 py-1.5 text-xs">
                <span className="w-4 shrink-0 text-center font-black text-gold-400">
                  {challenge.leaderboard.you.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-white">
                  {challenge.leaderboard.you.name}
                </span>
                <span className="font-bold text-white/85">
                  {challenge.leaderboard.you.value}
                </span>
              </div>
            </div>
          </div>
        )}

        {scratchReady && (
          <div className="rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md">
            <ScratchCard
              prize={challenge.prizes[0]}
              onRevealed={(p) => setScratched(p)}
            />
            {scratched && (
              <p className="mt-1.5 text-center text-[10.5px] text-white/70">
                Concept only — nothing has been credited.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md">
          <RewardIcon size={15} className="shrink-0 text-gold-400" />
          <p className="min-w-0 flex-1 truncate text-xs font-bold text-white">
            {challenge.reward.label}
          </p>
        </div>

        <p className="flex items-center gap-1 text-[10px] font-medium leading-snug text-white/60">
          <MapPin size={10} className="shrink-0" />
          <span className="min-w-0 truncate">
            {challenge.segment}
            {challenge.venues.length > 0 && (
              <> · {challenge.venues.map((v) => CLUB_VENUES[v]).join(', ')}</>
            )}
          </span>
        </p>
      </div>
    </motion.div>
  );
}

function ChallengeSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gray-200/70 p-4">
      <div className="h-4 w-40 rounded bg-gray-300/80" />
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-300/80" />
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-300/80" />
    </div>
  );
}

/**
 * What the live challenge pays, mirrored from the campaign's rules on the
 * platform: each milestone's progression hands out the shopping discount, and
 * completing the whole challenge adds the points. The member-progress API
 * reports progress but not rule effects, so until the BFF maps effects through
 * these labels are presentation copy kept in step with the campaign by hand.
 */
const CHALLENGE_EARNS = [
  { icon: Percent, headline: '10% off', detail: 'your next shop, for each step done' },
  { icon: Coins, headline: '+50 pts', detail: 'when the whole challenge is done' },
];

/**
 * Display titles for live challenges. The platform names campaigns for the
 * console ("Purchase & review"); a member should get the sell. Keyed by the
 * campaign's name so an unmapped challenge still shows what the platform
 * calls it.
 */
const CHALLENGE_TITLES = {
  'Purchase & review': 'Shop, rate, get rewarded',
};

function ChallengeBanner({ challenge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
          </span>
          Live challenge
        </span>
        <Target size={16} className="text-brand-500" />
      </div>

      <p className="mt-3 font-poppins text-[22px] font-extrabold leading-[1.05] tracking-tight text-gray-900">
        {CHALLENGE_TITLES[challenge.name] ?? challenge.name}
      </p>
      {challenge.description && (
        <p className="mt-1 text-xs leading-snug text-gray-400">{challenge.description}</p>
      )}

      <div className="mt-3.5 space-y-2">
        {challenge.milestones.map((m) => {
          const goal = m.goal ?? 0;
          const done = goal > 0 && m.current >= goal;
          const pct = goal > 0 ? Math.min(100, Math.round((m.current / goal) * 100)) : 0;
          return (
            <div key={m.milestoneId}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-gray-600">
                  {done && <Check size={11} className="text-brand-500" />} {milestoneLabel(m)}
                </span>
                <span className="font-bold text-gray-400">
                  {Math.min(m.current, goal)}/{goal}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
          What you'll earn
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {CHALLENGE_EARNS.map(({ icon: Icon, headline, detail }) => (
            <div key={headline} className="rounded-2xl bg-brand-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Icon size={14} className="shrink-0 text-brand-500" />
                <p className="font-poppins text-sm font-extrabold text-gray-900">{headline}</p>
              </div>
              <p className="mt-0.5 text-[10.5px] leading-snug text-gray-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Rate us — which is how the review milestone advances.
 *
 * Shown only while that milestone is outstanding: a member who has already
 * rated has nothing to do here, and a card asking again would be asking for a
 * thing that no longer counts.
 */
function RatingCard({ challenge }) {
  const { rate } = useApp();
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const milestone = challenge.milestones.find((m) => m.trigger === 'custom_event');
  if (!milestone) return null;

  /**
   * Whether this member has already rated.
   *
   * Read from the milestone, not from having tapped: the platform is what knows,
   * and a member returning to this screen should find the stars as they left
   * them. `done` covers the seconds between the tap and the platform agreeing.
   */
  const rated = done || Boolean(milestone.goal && milestone.current >= milestone.goal);
  // Filled means rated. Empty means there is something to do. The two are never
  // crossed: a filled star is never clickable, and an empty one always is.
  const filled = rated ? 5 : score;

  async function send(value) {
    setScore(value);
    setBusy(true);
    setError(null);
    try {
      await rate(value);
      setDone(true);
    } catch (e) {
      // Said out loud. A rating that fails silently leaves the stars filled and
      // the goal untouched, which reads as an app that ignored the tap.
      setError(e instanceof Error ? e.message : 'Could not send your rating');
      setScore(0);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-gray-900">How are we doing?</p>
      <p className="mt-0.5 text-[11px] text-gray-400">
        {rated
          ? 'Thanks for rating — that part of the challenge is done.'
          : 'Leave a rating to complete this part of the challenge.'}
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={busy || rated}
            onClick={() => send(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="p-1 disabled:cursor-default"
          >
            <Star
              size={26}
              className={n <= filled ? 'fill-gold-500 text-gold-500' : 'text-gray-300'}
            />
          </button>
        ))}
        {/*
          * The platform takes several seconds to score an event, so the rating
          * is acknowledged here rather than left to look ignored until the
          * challenge catches up.
          */}
        {busy && <span className="ml-1 text-[11px] text-gray-400">Sending…</span>}
        {rated && !busy && (
          <span className="ml-1 text-[11px] font-semibold text-green-600">Thanks!</span>
        )}
      </div>
      {error && <p className="mt-2 text-[11px] font-semibold text-red-600">{error}</p>}
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
