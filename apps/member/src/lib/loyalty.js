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
 * Registration email, always derived from the card number.
 *
 * This is what makes enrolment idempotent. The address is unique to this card,
 * so a conflict can only mean *this* member is already enrolled with *this*
 * card — never a different member we would need to work around. Registering
 * under the raw sign-in address instead would collide whenever the demo is
 * reset and the same person returns with a fresh card, and the retry would
 * quietly create a duplicate member holding the same card.
 */
function registrationEmail(cardNumber, email) {
  const slug = cardNumber.toLowerCase();
  if (!email) return `${slug}@ntucclub.demo`;
  const [local, domain] = email.split('@');
  return `${local}+${slug}@${domain}`;
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

  const [firstName, ...rest] = String(user.name || 'Member').trim().split(' ');
  const email = registrationEmail(cardNumber, user.email);
  const credentials = {
    firstName,
    lastName: rest.join(' ') || 'Member',
    email,
    password: DEMO_PASSWORD,
    loyaltyCardNumber: cardNumber,
    labels: labelsFor(user),
  };

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
 * Debit the member's real balance for a redemption.
 *
 * The voucher itself is issued locally from the app's own catalogue, but the
 * points it costs must leave the loyalty record — otherwise the balance the
 * dashboard shows drifts from what the member has actually spent. Returns the
 * balance after the debit.
 */
export async function spendPoints(points, comment) {
  const { points: remaining } = await req('/api/me/points/spend', {
    auth: true,
    method: 'POST',
    body: JSON.stringify({ points, comment }),
  });
  return remaining;
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

/** Resume one of them. Returns the same account shape enrolment does. */
export async function startPersonaSession(personaId) {
  const session = await req(`/api/demo/personas/${personaId}/session`, { method: 'POST' });
  setToken(session.token);
  return session;
}
