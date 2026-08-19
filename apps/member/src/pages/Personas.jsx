/**
 * Persona picker — the demo entry point.
 *
 * Four ways into the app, along two axes that change what you see:
 *
 *   new vs existing   — a new member runs enrolment, so the welcome campaign
 *                       fires and the tier is assigned in front of you. An
 *                       existing member resumes an account that already has
 *                       history, which cannot be conjured on the spot.
 *   union vs public   — the member type sent to the loyalty platform as a
 *                       label. Everything that follows from it (which tier,
 *                       how many welcome points) is decided there.
 *
 * The existing personas are read from the platform with their live tier and
 * balance, so the cards state what those accounts actually hold rather than
 * what someone once wrote down. On a tenant that seeds nothing they are the
 * newest union and public members this app has already enrolled — so testing
 * the same journey twice does not leave two members behind.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, History, Users, User, RotateCw, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { fetchPersonas } from '../lib/loyalty.js';
import ntucLogo from '../assets/icons/ntuc-club-logo.png';

const NEW_PERSONAS = [
  {
    id: 'new_union',
    type: 'union',
    title: 'New union member',
    blurb: 'Signs up now. Watch the union welcome campaign run.',
  },
  {
    id: 'new_public',
    type: 'public',
    title: 'New public member',
    blurb: 'Signs up now. Watch the standard welcome campaign run.',
  },
];

export default function Personas() {
  const { signInAsPersona, signInWithCard } = useApp();
  const navigate = useNavigate();
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [card, setCard] = useState('');

  /**
   * Re-read the members on the platform.
   *
   * Exposed as a refresh because the list is discovered rather than fixed: a
   * tester who has just enrolled someone should be able to pull them into the
   * resumable list without reloading the app.
   */
  const load = useCallback(() => {
    setLoading(true);
    return fetchPersonas()
      .then(setExisting)
      .catch(() => setExisting([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resumeCard() {
    setBusy('card');
    setError(null);
    try {
      await signInWithCard(card);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not find that loyalty ID');
      setBusy(null);
    }
  }

  async function resume(personaId) {
    setBusy(personaId);
    setError(null);
    try {
      await signInAsPersona(personaId);
      // Straight to the dashboard: a returning member has no welcome to see.
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open that persona');
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 px-5 pb-10 pt-16">
      <div className="mx-auto flex max-w-md flex-col">
        <div className="flex justify-center">
          <img src={ntucLogo} alt="NTUC Club" className="h-10 w-auto" />
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-extrabold text-white">Choose a persona</h1>
          <p className="mt-1 text-sm text-white/70">
            Each one enters the programme differently. Pick the story you want to show.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-500/20 px-3 py-2 text-center text-xs font-semibold text-white">
            {error}
          </p>
        )}

        <p className="mt-7 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
          <Sparkles size={12} /> Joining now
        </p>
        <div className="mt-2 grid gap-2.5">
          {NEW_PERSONAS.map((p) => (
            <PersonaCard
              key={p.id}
              icon={p.type === 'union' ? Users : User}
              title={p.title}
              blurb={p.blurb}
              badge={p.type === 'union' ? 'Union' : 'Public'}
              onClick={() => navigate(`/signin?type=${p.type}`)}
            />
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between px-1">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/50">
            <History size={12} /> Already a member
          </p>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/50 disabled:opacity-40"
          >
            <RotateCw size={12} className={loading ? 'animate-spin' : undefined} /> Refresh
          </button>
        </div>
        <div className="mt-2 grid gap-2.5">
          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-6 text-sm text-white/70">
              <Loader2 size={16} className="animate-spin" /> Loading members…
            </div>
          )}
          {!loading && existing.length === 0 && (
            <p className="rounded-2xl bg-white/10 px-4 py-5 text-center text-xs text-white/70">
              No members found on this tenant yet. Join once above, then come back and
              refresh — that account becomes the one you resume from here.
            </p>
          )}
          {existing.map((p) => (
            <PersonaCard
              key={p.personaId}
              icon={p.union ? Users : User}
              title={p.title}
              blurb={p.blurb}
              badge={p.levelName}
              // The balance is shown when the platform reports one. Assuming it
              // is always there took the whole page down on a tenant whose
              // member list does not carry it.
              meta={
                typeof p.points === 'number'
                  ? `${p.name} · ${p.points.toLocaleString()} pts`
                  : p.name
              }
              busy={busy === p.personaId}
              onClick={() => resume(p.personaId)}
            />
          ))}
        </div>

        {/*
          * The way in for a particular person rather than a story. Discovery
          * offers the newest of each kind, which is right for a demo and no use
          * at all when you want the member you were just looking at in the
          * console — the card number is what identifies them there.
          */}
        <p className="mt-7 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
          <CreditCard size={12} /> Or use a loyalty ID
        </p>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            resumeCard();
          }}
        >
          <input
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="NCXXXXXXXX"
            className="min-w-0 flex-1 rounded-2xl bg-white/95 px-4 py-3.5 font-mono text-[13px] uppercase tracking-wide text-gray-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!card.trim() || busy === 'card'}
            className="shrink-0 rounded-2xl bg-white px-4 py-3.5 text-[13px] font-bold text-brand-700 shadow-lg disabled:opacity-50"
          >
            {busy === 'card' ? <Loader2 size={16} className="animate-spin" /> : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-white/45">
          Tier and welcome points are decided by the loyalty platform, not by this app.
        </p>
      </div>
    </div>
  );
}

function PersonaCard({ icon: Icon, title, blurb, badge, meta, busy, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/95 p-4 text-left shadow-lg disabled:opacity-70"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {busy ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-gray-900">{title}</span>
          {badge && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-gray-500">{blurb}</span>
        {meta && <span className="mt-1 block text-[11px] font-semibold text-gray-400">{meta}</span>}
      </span>
    </motion.button>
  );
}
