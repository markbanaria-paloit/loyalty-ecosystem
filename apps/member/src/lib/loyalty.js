/**
 * Loyalty client for the NTUC Club member app.
 *
 * The app never talks to the loyalty platform directly — it calls the backend
 * BFF, which owns the OpenLoyalty vocabulary and the admin-only operations
 * (enrolment bonus, points grants). That keeps this surface to the flat,
 * app-shaped payloads the screens actually render.
 *
 *   member app  ──►  backend BFF (:4000)  ──►  loyalty platform
 *
 * `/api` is proxied to the BFF by Vite so the browser sees a single origin.
 */

/**
 * Absolute API origin for deployed builds.
 *
 * Empty in development, where Vite proxies `/api` to the upstream and the
 * browser sees a single origin. A static deploy has no proxy, so the origin has
 * to be baked in at build time — that is what `VITE_API_BASE_URL` is for.
 * Trailing slashes are trimmed so path concatenation stays predictable.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const TOKEN_KEY = 'ntuc-club-token';

/** The prefix makes a member QR self-describing at the scanner. */
export const QR_PREFIX = 'NTUCCLUB:MEMBER:';

/** Stable card number for a member id — must never drift once registered. */
export function cardNumberFor(userId) {
  return 'NC' + String(userId).slice(-8).toUpperCase();
}

export function qrPayloadFor(cardNumber) {
  return `${QR_PREFIX}${cardNumber}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class LoyaltyError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function req(path, { auth = false, ...init } = {}) {
  const token = auth ? getToken() : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new LoyaltyError(res.status, body?.message ?? res.statusText);
  }
  return body;
}

/**
 * The address a card is enrolled under. Derived from the card and nothing else.
 *
 * Two things at once. It makes enrolment idempotent — the address is unique to
 * this card, so a conflict can only mean *this* member is already enrolled with
 * *this* card. And it keeps the member's real address out of the loyalty
 * platform, which has no use for it: the programme is run on the card number,
 * not on who anybody is.
 */
function registrationEmail(cardNumber) {
  return `${cardNumber.toLowerCase()}@ntucclub.demo`;
}

/**
 * The address a card used to be enrolled under, when one was derived from the
 * member's own.
 *
 * Kept only to find those members again. Enrolment answers 409 for an address
 * it already holds, so without this a member enrolled under the old scheme
 * would not be recognised and a second record would be created against the same
 * card — two members, one card number, and a till that matches whichever it
 * finds first.
 */
function legacyRegistrationEmail(cardNumber, email) {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!local || !domain) return null;
  return `${local}+${cardNumber.toLowerCase()}@${domain}`;
}

/**
 * Fixed for the demo — the app's own sign-in is the real authentication.
 *
 * Must satisfy the loyalty platform's password policy — upper, lower, digit and
 * a special character — which rejects the registration outright otherwise. The
 * member never types it; the app's own sign-in is the real authentication.
 */
const DEMO_PASSWORD = 'NtucClub#2026';

/**
 * Member-type tag, in the loyalty platform's own label shape.
 *
 * This is the whole of what the app decides about tiering. Which tier a union
 * member lands on, and what they are given for joining, are campaign
 * configuration on the platform — the app only reports who the member is.
 */
/**
 * Exactly as the tenant's campaign matches it — lowercase, no underscore. Their
 * rule compares the label as a string, so a near-miss grants nothing and looks
 * like the member simply was not eligible.
 */
export const CUSTOMER_TYPE_LABEL = 'membertype';
export const UNION_MEMBER = 'unionmember';

function labelsFor(user) {
  return user?.isNtucMember ? [{ key: CUSTOMER_TYPE_LABEL, value: UNION_MEMBER }] : [];
}

/**
 * Make sure this member is enrolled and we hold a token for them.
 *
 * Runs on every app load, not just at sign-in: the loyalty platform is
 * in-memory in dev and reseeds on restart while this app's state survives in
 * localStorage, so enrolment has to be re-asserted or the QR would point at a
 * member the platform has forgotten.
 *
 * Resolves only once the platform has settled the member completely — tier
 * assigned, welcome points minted — and returns that record, so a caller can
 * render a balance without a second round trip.
 */
export async function ensureMember(user) {
  const cardNumber = user.loyaltyCardNumber;
  if (!cardNumber) throw new Error('user has no loyaltyCardNumber');

  const email = registrationEmail(cardNumber);

  // Whoever the member is stays here. The platform is sent the card number and
  // the member type, and builds its own pseudonymous profile from the first —
  // it never learns a name, an address or an NRIC, because it never needs one.
  const credentials = {
    password: DEMO_PASSWORD,
    loyaltyCardNumber: cardNumber,
    labels: labelsFor(user),
  };

  // A member enrolled before addresses were derived from the card alone is
  // holding an account under the old one. Finding them first is what stops a
  // second record being opened against the same card.
  const legacy = legacyRegistrationEmail(cardNumber, user.email);
  if (legacy) {
    try {
      const session = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: legacy, password: DEMO_PASSWORD }),
      });
      setToken(session.token);
      return {
        cardNumber,
        email: legacy,
        enrolled: false,
        account: session.account ?? null,
        enrolment: null,
      };
    } catch {
      // No such member: this card has not been enrolled under the old scheme.
    }
  }

  try {
    const created = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(created.token);
    return {
      cardNumber,
      email,
      enrolled: true,
      account: created.account ?? null,
      enrolment: created.enrolment ?? null,
    };
  } catch (e) {
    // 409 means this card is already enrolled — sign in to that record instead.
    if (!(e instanceof LoyaltyError) || e.status !== 409) throw e;
    const session = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: DEMO_PASSWORD }),
    });
    setToken(session.token);
    return {
      cardNumber,
      email,
      enrolled: false,
      account: session.account ?? null,
      enrolment: null,
    };
  }
}

/**
 * The programme's tier ladder, from the loyalty platform.
 *
 * Fetched rather than hardcoded so the app follows whatever the Campaign Admin
 * has configured — add or rename a tier there and this app follows without a
 * code change.
 */
export async function fetchTiers() {
  const { tiers } = await req('/api/tiers');
  return tiers ?? [];
}

/** Points balance, tier and progress — the loyalty record, from the BFF. */
export function fetchAccount() {
  return req('/api/me', { auth: true });
}

/**
 * Progress toward the next tier, straight from the loyalty platform.
 *
 * Not computed here on purpose: qualification is the platform's rule, and an
 * app that worked out its own "distance to the next tier" would disagree with
 * the console the moment a threshold changed.
 */
export async function fetchTierProgress() {
  const { progress } = await req('/api/me/tier-progress', { auth: true });
  return progress ?? null;
}

/** Points-transfer history backing the activity list. */
export async function fetchHistory() {
  const { transactions } = await req('/api/me/transactions', { auth: true });
  return transactions ?? [];
}

/**
 * The reward catalogue this member is entitled to, from the loyalty platform.
 *
 * Fetched rather than listed in the app: which rewards exist, what they cost
 * and which tiers may have them are all programme configuration, and the
 * platform has already filtered the list to this member's tier — so a reward
 * the member cannot have never arrives, rather than arriving and being hidden.
 *
 * Most of them cost nothing. The programme grants coupons as well as selling
 * them, so a zero cost is a real entitlement, not missing data.
 */
export async function fetchRewards() {
  const { rewards } = await req('/api/rewards', { auth: true });
  return rewards ?? [];
}

/**
 * The challenges this member is in, with their progress.
 *
 * Progress is the platform's to keep — it advances when a sale or an event
 * matches a milestone — so this only ever reads.
 */
export async function fetchChallenges() {
  const { challenges } = await req('/api/me/challenges', { auth: true });
  return challenges ?? [];
}

/**
 * Tell the programme something happened that no till would have seen.
 *
 * A rating is one of these: nothing is bought, but a challenge is waiting on
 * it. `eventId` is sent so a double tap is the same event rather than a second
 * one — the platform counts occurrences, and a member who rated once should
 * count once.
 */
export async function logEvent(type, eventId, body) {
  return req('/api/me/events', {
    auth: true,
    method: 'POST',
    // `body` is omitted unless a caller has one: a store declares what an event
    // may carry, and sending a field it does not know about is refused outright
    // rather than ignored.
    body: JSON.stringify(body ? { type, eventId, body } : { type, eventId }),
  });
}

/**
 * The coupons this member holds, straight from the loyalty platform.
 *
 * Their status is the platform's, not a copy: the till marks a coupon fulfilled
 * against the same record, so re-reading is what lets this app show a coupon as
 * used the moment it is handed over.
 */
export async function fetchVouchers() {
  const { vouchers } = await req('/api/me/vouchers', { auth: true });
  return vouchers ?? [];
}

/**
 * Take a reward, on the platform.
 *
 * The coupon code has to be the platform's — the till validates by looking the
 * code up there — so it cannot be minted locally. Debits the points upstream as
 * part of the same call, which is why nothing here spends them separately.
 */
export async function redeemReward(rewardId) {
  return req(`/api/rewards/${rewardId}/redeem`, { auth: true, method: 'POST' });
}

/* --------------------------- Demo personas --------------------------- *
 * A prototype needs to show both a member joining now and one who has been
 * in the programme a while. The second cannot be created on the spot, so it
 * resumes an account the platform already holds. Credentials stay on the
 * server: the app asks for a session by persona id.
 * --------------------------------------------------------------------- */

/** Pre-existing members available to sign in as, with their live standing. */
export async function fetchPersonas() {
  const { personas } = await req('/api/demo/personas');
  return personas ?? [];
}

/**
 * Resume whoever holds this card number.
 *
 * The card is what a member is known by at the till, so it is the natural thing
 * to type when you want a particular person rather than a story.
 */
export async function startCardSession(cardNumber) {
  const session = await req(
    `/api/demo/card/${encodeURIComponent(cardNumber.trim())}/session`,
    { method: 'POST' },
  );
  setToken(session.token);
  return session;
}

/** Resume one of them. Returns the same account shape enrolment does. */
export async function startPersonaSession(personaId) {
  const session = await req(`/api/demo/personas/${personaId}/session`, { method: 'POST' });
  setToken(session.token);
  return session;
}
