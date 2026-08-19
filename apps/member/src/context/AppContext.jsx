import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { DEFAULT_CONFIG, REWARDS_CATALOG } from '../data/mockData.js';
import { addMonths, monthKey, roundPoints, uid } from '../lib/helpers.js';
import { realtimeConfigured, subscribeToMemberEvents } from '../lib/realtime.js';
import {
  cardNumberFor,
  ensureMember,
  fetchAccount,
  fetchHistory,
  fetchTierProgress,
  fetchTiers,
  spendPoints,
  startPersonaSession,
} from '../lib/loyalty.js';

const STORAGE_KEY = 'ntuc-club-state-v1';

/**
 * How often to re-read the balance while the app is on screen.
 *
 * Short enough that points appear to land while the member is still at the
 * counter, long enough not to hammer the platform. A push channel would make
 * this unnecessary — see docs/deployment.md.
 */
const LIVE_REFRESH_MS = 4000;

/** Backstop when the push channel is doing the work — a missed event, a dropped socket. */
const FALLBACK_REFRESH_MS = 30000;

const initialState = {
  user: null,
  points: 0,
  ledger: [],
  vouchers: [],
  parkingCoupons: [],
  consent: { email: true, sms: true, push: true, mail: false },
  parkingUsage: {}, // { [monthKey]: minutesUsed }
  welcomeBonusClaimed: false,
  birthdayClaimedMonthKey: null,
  demoBirthdayMode: false,
  config: DEFAULT_CONFIG,
  toast: null,
  /**
   * The programme's tier ladder, as configured on the loyalty platform.
   * Fetched, never hardcoded — the app presents whatever the platform holds.
   */
  tiers: [],
  /** What the platform awarded at enrolment; drives the welcome screen. */
  enrolment: null,
  /** Progress toward the next tier, as the platform reports it. */
  tierProgress: null,
  /** Loyalty record as reported by the BFF. The app never authors these. */
  account: {
    points: 0,
    levelId: null,
    levelName: null,
    levelSortOrder: null,
    levelManuallyAssigned: false,
    pointsToNextLevel: null,
    pointsExpiringNextMonth: 0,
    history: [],
    loaded: false,
  },
};

/**
 * Presentation key for a tier, derived from its rank on the platform.
 *
 * Keyed on rank rather than name so renaming a tier upstream cannot break the
 * app's styling, and so the platform stays the single source of which tier a
 * member is on.
 */
export function tierSlugForRank(rank) {
  return rank ? `tier${rank}` : 'tier1';
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const restored = { ...initialState, ...JSON.parse(raw), toast: null };
      // Migrate members who signed in before the card number existed. Without
      // this their QR would render a computed id that was never registered with
      // OpenLoyalty, and the till would read every sale as unmatched.
      if (restored.user && !restored.user.loyaltyCardNumber) {
        restored.user = {
          ...restored.user,
          loyaltyCardNumber: cardNumberFor(restored.user.id),
        };
      }
      return restored;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return initialState;
}

export function isBirthdayMonthNow(user) {
  return user?.birthdayMonth === new Date().getMonth() + 1;
}

function computeMultiplier(state, tenantId) {
  const now = new Date();
  const curMonthKey = monthKey(now);
  const cfg = state.config;
  // Birthday takes precedence: first qualifying tx in birthday month.
  // Real birthday month match OR the demo override both count as "in birthday month".
  const inBirthdayWindow = state.demoBirthdayMode || isBirthdayMonthNow(state.user);
  const birthdayActive = inBirthdayWindow && state.birthdayClaimedMonthKey !== curMonthKey;
  if (birthdayActive) {
    const tier = state.user?.tier === 'tier2' ? 'tier2' : 'tier1';
    return { multiplier: cfg.birthdayMultiplier[tier], reason: `Birthday ${cfg.birthdayMultiplier[tier]}X bonus`, isBirthday: true };
  }
  if (cfg.campaign?.active && cfg.campaign.tenantId === tenantId) {
    return { multiplier: cfg.campaign.multiplier, reason: cfg.campaign.label, isBirthday: false };
  }
  return { multiplier: 1, reason: null, isBirthday: false };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SIGN_IN': {
      const { user } = action.payload;
      const cfg = state.config;

      // Points and history are no longer invented here. The BFF grants the
      // enrolment bonus against the loyalty platform and reports the balance,
      // so anything fabricated locally would simply be overwritten by the next
      // sync — and would disagree with what the till sees in the meantime.
      let vouchers = state.vouchers;
      let welcomeBonusClaimed = state.welcomeBonusClaimed;

      if (!welcomeBonusClaimed) {
        const bonus = cfg.welcomeBonus;
        const expiryDate = addDaysISO(bonus.validDays);
        // The welcome *bundle* stays local: these are tenant vouchers, not
        // points, and the loyalty platform holds no equivalent.
        vouchers = [
          ...bonus.bundle.map((b) => ({
            id: uid('vc'),
            rewardId: null,
            title: b.title,
            tenantId: b.tenantId,
            cashValue: null,
            code: genCode(),
            issuedDate: new Date().toISOString(),
            expiryDate,
            status: 'active',
            fromWelcomeBundle: true,
          })),
          ...vouchers,
        ];
        welcomeBonusClaimed = true;
      }

      // No celebration here. At this point the platform has not been asked what
      // the member was given, so a toast fired now says "your welcome bonus has
      // been credited" before anything has been credited — and the confetti is
      // over by the time the number arrives. It is dispatched once enrolment
      // has resolved, carrying the real figure.
      return { ...state, user, vouchers, welcomeBonusClaimed };
    }

    // The loyalty record landed from the BFF — it replaces whatever we held,
    // including which tier the member is on.
    case 'SET_ACCOUNT': {
      const account = { ...action.payload, loaded: true };
      const tier = tierSlugForRank(account.levelSortOrder);
      return {
        ...state,
        points: account.points,
        account,
        user: state.user ? { ...state.user, tier, tierName: account.levelName } : state.user,
      };
    }

    case 'SET_TIERS':
      return { ...state, tiers: action.payload };

    case 'SET_TIER_PROGRESS':
      return { ...state, tierProgress: action.payload };

    case 'SET_TOAST':
      return { ...state, toast: action.payload };

    /**
     * A balance that moved while the member was looking at the app.
     *
     * Points are awarded by the loyalty platform when the till publishes a
     * sale, so the first the member app hears of it is a larger number coming
     * back from a refresh. Announcing that is the difference between a balance
     * that quietly changes and one the member sees land.
     *
     * Only an increase is celebrated: a redemption already shows its own toast,
     * and a decrease the member did not cause is not good news.
     */
    case 'SYNC_ACCOUNT': {
      const account = { ...action.payload, loaded: true };
      const gained = account.points - state.points;
      const tier = tierSlugForRank(account.levelSortOrder);
      const promoted = state.user?.tier && tier !== state.user.tier;
      return {
        ...state,
        points: account.points,
        account,
        user: state.user ? { ...state.user, tier, tierName: account.levelName } : state.user,
        toast:
          promoted && account.levelName
            ? { kind: 'tier-up', tierName: account.levelName }
            : gained > 0 && state.account.loaded
              ? { kind: 'earn', earned: gained, multiplier: 1, reason: null }
              : state.toast,
      };
    }

    case 'SET_ENROLMENT':
      return { ...state, enrolment: action.payload };

    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    case 'SIMULATE_PURCHASE': {
      const { tenantId, amount } = action.payload;
      const cfg = state.config;
      const base = amount * cfg.earnRate;
      const { multiplier, reason, isBirthday } = computeMultiplier(state, tenantId);
      const earned = roundPoints(base * multiplier, cfg.rounding);
      const entry = {
        id: uid('lg'),
        date: new Date().toISOString(),
        type: 'earn',
        desc: reason ? `Qualifying spend (${reason})` : 'Qualifying spend',
        amount: earned,
        baseAmount: roundPoints(base, cfg.rounding),
        multiplier,
        tenantId,
        spend: amount,
        expiryDate: addMonthsISO(cfg.pointsExpiryMonths),
      };
      return {
        ...state,
        points: state.points + earned,
        ledger: [entry, ...state.ledger],
        birthdayClaimedMonthKey: isBirthday ? monthKey(new Date()) : state.birthdayClaimedMonthKey,
        toast: { kind: 'earn', earned, multiplier, reason },
      };
    }

    case 'REFUND_TRANSACTION': {
      const { ledgerId } = action.payload;
      const original = state.ledger.find((l) => l.id === ledgerId);
      if (!original || original.type !== 'earn' || original.refunded) return state;
      const canFullyReverse = state.points >= original.amount;
      const ledger = state.ledger.map((l) => (l.id === ledgerId ? { ...l, refunded: true, refundStatus: canFullyReverse ? 'reversed' : 'flagged' } : l));
      if (canFullyReverse) {
        const entry = {
          id: uid('lg'),
          date: new Date().toISOString(),
          type: 'refund',
          desc: 'Points reversed — transaction refunded',
          amount: -original.amount,
          relatedTxId: ledgerId,
          expiryDate: null,
        };
        return { ...state, points: state.points - original.amount, ledger: [entry, ...ledger], toast: { kind: 'refund', amount: original.amount, flagged: false } };
      }
      // already spent — flag for manual adjustment, auditable, no auto-deduction below zero
      const entry = {
        id: uid('lg'),
        date: new Date().toISOString(),
        type: 'refund-flag',
        desc: 'Refund flagged for manual adjustment (points already redeemed)',
        amount: 0,
        relatedTxId: ledgerId,
        expiryDate: null,
      };
      return { ...state, ledger: [entry, ...ledger], toast: { kind: 'refund', amount: original.amount, flagged: true } };
    }

    case 'REDEEM_CART': {
      const { rewardIds } = action.payload;
      const items = rewardIds.map((id) => REWARDS_CATALOG.find((r) => r.id === id)).filter(Boolean);
      const totalCost = items.reduce((s, r) => s + r.pointsCost, 0);
      if (totalCost > state.points || items.length === 0) return state;
      const cfg = state.config;
      const newVouchers = items.map((r) => ({
        id: uid('vc'),
        rewardId: r.id,
        title: r.title,
        tenantId: r.tenantId,
        cashValue: r.cashValue,
        code: genCode(),
        issuedDate: new Date().toISOString(),
        expiryDate: addMonthsISO(cfg.voucherExpiryMonths),
        status: 'active',
      }));
      const entry = {
        id: uid('lg'),
        date: new Date().toISOString(),
        type: 'redeem',
        desc: items.length > 1 ? `Redeemed ${items.length} rewards` : `Redeemed: ${items[0].title}`,
        amount: -totalCost,
        expiryDate: null,
      };
      return {
        ...state,
        points: state.points - totalCost,
        vouchers: [...newVouchers, ...state.vouchers],
        ledger: [entry, ...state.ledger],
        toast: { kind: 'redeem', count: items.length, cost: totalCost },
      };
    }

    case 'USE_VOUCHER': {
      const vouchers = state.vouchers.map((v) => (v.id === action.payload.voucherId ? { ...v, status: 'used', usedDate: new Date().toISOString() } : v));
      return { ...state, vouchers, toast: { kind: 'voucher-used' } };
    }

    case 'UPDATE_CONSENT': {
      return { ...state, consent: { ...state.consent, [action.payload.channel]: action.payload.value } };
    }

    case 'REQUEST_PARKING_COUPON': {
      const cfg = state.config;
      const tier = state.user?.tier === 'tier2' ? 'tier2' : 'tier1';
      const capMinutes = cfg.parkingCapMinutes[tier];
      const mKey = monthKey(new Date());
      const used = state.parkingUsage[mKey] || 0;
      const remaining = capMinutes - used;
      if (remaining <= 0) return { ...state, toast: { kind: 'parking-denied' } };
      const grant = Math.min(remaining, action.payload.minutes ?? capMinutes);
      const coupon = {
        id: uid('pk'),
        code: genCode('PK'),
        minutes: grant,
        issuedDate: new Date().toISOString(),
        status: 'pending-collection',
      };
      return {
        ...state,
        parkingUsage: { ...state.parkingUsage, [mKey]: used + grant },
        parkingCoupons: [coupon, ...state.parkingCoupons],
        toast: { kind: 'parking-issued', minutes: grant },
      };
    }

    case 'UPDATE_CONFIG': {
      return { ...state, config: { ...state.config, ...action.payload } };
    }

    case 'TOGGLE_DEMO_BIRTHDAY': {
      return { ...state, demoBirthdayMode: !state.demoBirthdayMode };
    }

    case 'FORCE_EXPIRE_SOON': {
      // Demo helper: push the newest active earn entry's expiry to 5 days away
      const idx = state.ledger.findIndex((l) => l.type === 'earn' && l.expiryDate);
      if (idx === -1) return state;
      const ledger = [...state.ledger];
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      ledger[idx] = { ...ledger[idx], expiryDate: soon.toISOString() };
      return { ...state, ledger, toast: { kind: 'expiry-notice', desc: ledger[idx].desc, amount: ledger[idx].amount } };
    }

    case 'SIGN_OUT':
      return { ...initialState };

    case 'RESET_DEMO':
      return { ...initialState };

    default:
      return state;
  }
}

function addMonthsISO(months) {
  return addMonths(new Date(), months).toISOString();
}
function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function genCode(prefix = 'NC') {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);
  // 'idle' | 'syncing' | 'linked' | 'error' — whether the platform knows this card.
  const [loyaltySync, setLoyaltySync] = useState({ status: 'idle', error: null });

  // Enrolment reads the current user without making it a dependency — the
  // effect must fire on card change only, not on every points update.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const card = state.user?.loyaltyCardNumber;

  /** Pull the loyalty record from the BFF; it is the authority on points. */
  const refreshAccount = useCallback(async (announce = false) => {
    if (!card) return;
    const [account, history, progress] = await Promise.all([
      fetchAccount(),
      fetchHistory(),
      fetchTierProgress().catch(() => null),
    ]);
    dispatch({ type: announce ? 'SYNC_ACCOUNT' : 'SET_ACCOUNT', payload: { ...account, history } });
    dispatch({ type: 'SET_TIER_PROGRESS', payload: progress });
  }, [card]);

  /**
   * Push: the platform tells the app when this member's record changed.
   *
   * Preferred over asking, because it lands in about the time it takes the till
   * to finish the sale rather than on the next tick.
   */
  useEffect(() => {
    const memberId = state.account.customerId;
    if (!memberId) return undefined;
    return subscribeToMemberEvents(memberId, () => {
      refreshAccount(true).catch(() => {});
    });
    // Only re-subscribe when the member changes, not on every balance update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.account.customerId, refreshAccount]);

  /**
   * Keep the balance current while the member is actually looking.
   *
   * There is no push channel from the loyalty platform, so the app asks. It
   * asks only while the tab is visible — a backgrounded phone polling all day
   * is a battery and request cost for nothing — and it asks again the moment
   * the member comes back, which is when a scan at the till has just happened
   * and the answer has changed.
   */
  useEffect(() => {
    if (!card) return undefined;

    const tick = () => {
      if (document.visibilityState === 'visible') {
        refreshAccount(true).catch(() => {});
      }
    };

    // With a push channel this is only a safety net, so it can be lazy. Without
    // one it is the whole mechanism, so it has to be prompt.
    const interval = setInterval(tick, realtimeConfigured ? FALLBACK_REFRESH_MS : LIVE_REFRESH_MS);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [card, refreshAccount]);

  // Enrol on every load, not just at sign-in: the loyalty platform is in-memory
  // in dev and reseeds on restart while this app's state survives in
  // localStorage, so the membership behind the QR has to be re-asserted.
  const syncMember = useCallback(async () => {
    if (!card) return;
    const current = stateRef.current.user;
    // A resumed persona is already a member of the platform. Re-asserting
    // enrolment would register a second account under a derived address and
    // leave the session pointing at the wrong member.
    if (current?.resumed) {
      setLoyaltySync({ status: 'linked', error: null });
      await refreshAccount().catch(() => {});
      return;
    }
    setLoyaltySync({ status: 'syncing', error: null });
    try {
      const result = await ensureMember(current);
      // Enrolment already returns the settled record — tier assigned, welcome
      // points minted. Render from it directly rather than fetching again, so
      // there is no window in which the balance reads zero.
      if (result.account) {
        const [history, progress] = await Promise.all([
          fetchHistory().catch(() => []),
          fetchTierProgress().catch(() => null),
        ]);
        dispatch({ type: 'SET_ACCOUNT', payload: { ...result.account, history } });
        dispatch({ type: 'SET_TIER_PROGRESS', payload: progress });
      } else {
        await refreshAccount();
      }
      if (result.enrolment) dispatch({ type: 'SET_ENROLMENT', payload: result.enrolment });
      setLoyaltySync({ status: 'linked', error: null });
    } catch (e) {
      setLoyaltySync({ status: 'error', error: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  }, [card, refreshAccount]);

  useEffect(() => {
    syncMember().catch(() => {});
  }, [syncMember]);

  // The tier ladder is programme configuration, so it is loaded once and does
  // not depend on there being a signed-in member.
  useEffect(() => {
    fetchTiers()
      .then((tiers) => dispatch({ type: 'SET_TIERS', payload: tiers }))
      .catch(() => {});
  }, []);

  /**
   * Resume a member the platform already holds.
   *
   * No enrolment runs, so no welcome campaign fires — which is the point: this
   * is what a returning member sees, tier and balance included.
   */
  const signInAsPersona = useCallback(async (personaId) => {
    setLoyaltySync({ status: 'syncing', error: null });
    const session = await startPersonaSession(personaId);
    const m = session.member;
    dispatch({
      type: 'SIGN_IN',
      payload: {
        user: {
          id: m.customerId,
          // Resumed members already hold a card on the platform; keep theirs
          // rather than deriving a new one, or the QR would stop matching.
          loyaltyCardNumber: m.loyaltyCardNumber ?? m.customerId,
          name: `${m.firstName} ${m.lastName}`.trim() || 'Member',
          email: m.email,
          method: 'persona',
          isNtucMember: Boolean(m.union),
          tier: null,
          tierName: null,
          joinDate: new Date().toISOString(),
          birthdayMonth: new Date().getMonth() + 1,
          maskedNric: null,
          /** Marks the session as a resumed account, not a fresh enrolment. */
          resumed: true,
        },
      },
    });
    const [history, progress] = await Promise.all([
      fetchHistory().catch(() => []),
      fetchTierProgress().catch(() => null),
    ]);
    dispatch({ type: 'SET_ACCOUNT', payload: { ...session.account, history } });
    dispatch({ type: 'SET_TIER_PROGRESS', payload: progress });
    // A resumed member did not just enrol, so there is no welcome award to show.
    dispatch({ type: 'SET_ENROLMENT', payload: null });
    setLoyaltySync({ status: 'linked', error: null });
  }, []);

  /**
   * Sign in and do not resolve until the platform has settled the member.
   *
   * The screens that follow show a balance and a tier, so both have to be real
   * before we get there — otherwise the dashboard renders 0 points and no tier
   * for as long as the round trip takes.
   */
  const signIn = useCallback(async (method, profile) => {
    const memberId = uid('mem');
    // Built here, not in the reducer, so the very same card number is both
    // stored and enrolled — a second id would register a member the QR never
    // points at.
    const user = {
      id: memberId,
      loyaltyCardNumber: cardNumberFor(memberId),
      name: profile?.name || 'Member',
      email: profile?.email || '',
      method,
      // Union membership is what the app knows. It goes to the platform as a
      // member label; the tier that follows is decided there by an enrolment
      // campaign and comes back on the account.
      isNtucMember: profile?.isNtucMember ?? method === 'singpass',
      /** Filled in from the platform once enrolment resolves. */
      tier: null,
      tierName: null,
      joinDate: new Date().toISOString(),
      birthdayMonth: profile?.birthdayMonth ?? new Date().getMonth() + 1,
      maskedNric: profile?.maskedNric || null,
    };
    dispatch({ type: 'SIGN_IN', payload: { user } });
    try {
      const result = await ensureMember(user);
      if (result.enrolment) dispatch({ type: 'SET_ENROLMENT', payload: result.enrolment });
      if (result.account) {
        const [history, progress] = await Promise.all([
          fetchHistory().catch(() => []),
          fetchTierProgress().catch(() => null),
        ]);
        dispatch({ type: 'SET_ACCOUNT', payload: { ...result.account, history } });
        dispatch({ type: 'SET_TIER_PROGRESS', payload: progress });
      }
      setLoyaltySync({ status: 'linked', error: null });

      // Now that the platform has answered, celebrate what it actually gave.
      // `welcomePoints` comes from the enrolment result where the platform
      // reports it; where it does not, the balance of a member who has just
      // joined is the welcome award and nothing else.
      const awarded = result.enrolment?.welcomePoints ?? result.account?.points ?? 0;
      dispatch({
        type: 'SET_TOAST',
        payload: { kind: 'welcome', earned: awarded, tierName: result.account?.levelName ?? null },
      });
    } catch (e) {
      setLoyaltySync({ status: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  /**
   * Redeem from the local catalogue, then debit the real balance. The reducer
   * issues the voucher optimistically; the refresh afterwards reconciles the
   * points against whatever the platform actually recorded.
   */
  const redeemCart = useCallback(
    async (rewardIds, totalCost, description) => {
      dispatch({ type: 'REDEEM_CART', payload: { rewardIds } });
      try {
        await spendPoints(totalCost, description);
      } catch (e) {
        console.error('Redemption debit failed', e);
      }
      await refreshAccount().catch(() => {});
    },
    [refreshAccount],
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      loyaltySync,
      signIn,
      signInAsPersona,
      syncMember,
      refreshAccount,
      redeemCart,
    }),
    [state, loyaltySync, signIn, signInAsPersona, syncMember, refreshAccount, redeemCart],
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
