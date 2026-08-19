/**
 * Demo personas.
 *
 * A prototype has to be able to show both halves of the programme on demand:
 * a member who is joining now, and one who has been in it for a while. The
 * second cannot be created on the spot — it needs history — so it comes from
 * accounts that already exist on the loyalty platform.
 *
 * Two ways of finding them, in order:
 *
 *   1. Members labelled `demoPersona`. This is what the mock platform seeds,
 *      and the labels carry hand-written copy for each story.
 *   2. Failing that, members this app has already enrolled — the newest union
 *      member and the newest member without a union label. A live tenant seeds
 *      nothing, so without this the "already a member" list is empty there and
 *      every test run registers another member.
 *
 * Either way the accounts are real, with real balances and real tiers. The
 * passwords stay server-side: the app asks for a session by persona id and
 * never handles credentials.
 */
import { Router } from 'express';
import { config } from '../config.js';
import { olAdmin, type AdminMember } from '../studio/olAdmin.js';
import { memberIdFromToken, openLoyalty, OpenLoyaltyError } from '../openloyalty/client.js';
import { ladder, toAccount } from './account.js';

export const demoRouter = Router();

const PERSONA_LABEL = 'demoPersona';

/** Ids for the two members discovered on a tenant that seeds no personas. */
const FOUND_UNION = 'found_union';
const FOUND_PUBLIC = 'found_public';

/**
 * Passwords worth trying, in order.
 *
 * A seeded persona carries the platform's own demo password; a member this app
 * enrolled carries the one the member app registers with. Both are fixed for
 * the demo, and which of the two a given account has is not recorded anywhere,
 * so the session route tries each.
 *
 * `MEMBER_REGISTRATION_PASSWORD` must match `DEMO_PASSWORD` in the member app's
 * `lib/loyalty.js` — that is the password those accounts were created with.
 */
const CANDIDATE_PASSWORDS = [
  process.env.DEMO_PERSONA_PASSWORD ?? 'password',
  process.env.MEMBER_REGISTRATION_PASSWORD ?? 'NtucClub#2026',
];

const COPY: Record<string, { title: string; blurb: string }> = {
  existing_union: {
    title: 'Existing union member',
    blurb: 'Already enrolled, on the union tier, with points and history.',
  },
  existing_public: {
    title: 'Existing public member',
    blurb: 'Already enrolled on the entry tier, with points and history.',
  },
  spender_in_progress: {
    title: 'Public member, partway to Tier 2',
    blurb: 'Spending toward the $1.5K threshold. Shows tier progress.',
  },
  [FOUND_UNION]: {
    title: 'Existing union member',
    blurb: 'The most recent union member on this tenant. Resume instead of enrolling a new one.',
  },
  [FOUND_PUBLIC]: {
    title: 'Existing public member',
    blurb: 'The most recent public member on this tenant. Resume instead of enrolling a new one.',
  },
};

function labelValue(
  labels: Array<{ key: string; value: string }> | undefined,
  key: string,
): string | null {
  return labels?.find((l) => l.key === key)?.value ?? null;
}

/**
 * Whether this member is tagged as belonging to the union.
 *
 * The configured pair is what the app writes and what the tenant's campaign
 * matches. The second pair is what an earlier integration probe wrote, and
 * accounts carrying it are still on the stage tenant — reading both means a
 * tester resuming "the union member" gets one, rather than an empty list.
 */
function isUnion(member: AdminMember): boolean {
  const { unionLabelKey, unionLabelValue } = config.member;
  return (member.labels ?? []).some(
    (l) =>
      (l.key === unionLabelKey && l.value === unionLabelValue) ||
      (l.key === 'customerType' && l.value === 'union_member'),
  );
}

/**
 * The card number the member app enrolled this account under, if it did.
 *
 * Every registration address it writes is derived from the card number, so the
 * address carries it back. Two things follow: an account that does not match
 * was created some other way and this service does not hold its password, and
 * one that does can be resumed with a working QR rather than a card number
 * invented on the spot — which the till would read as unmatched.
 */
function cardNumberFromEmail(email: string | undefined): string | null {
  const match = /(?:^|\+)(nc[a-z0-9]{8})@/i.exec(email ?? '');
  return match ? match[1].toUpperCase() : null;
}

interface Persona {
  id: string;
  member: AdminMember;
}

/**
 * The personas available on whatever platform this service is pointed at.
 *
 * Seeded members win when there are any: their labels carry copy written for
 * specific stories, which discovery cannot reproduce. Discovery is the fallback
 * for a live tenant, and takes the newest of each member type so a tester who
 * has just enrolled someone finds them at the top of the list.
 */
async function personas(): Promise<Persona[]> {
  const seeded = await olAdmin.membersWithLabel(PERSONA_LABEL);
  if (seeded.length) {
    return seeded.map((member) => ({
      id: labelValue(member.labels, PERSONA_LABEL)!,
      member,
    }));
  }

  const candidates = (await olAdmin.members())
    .filter((m) => cardNumberFromEmail(m.email))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const entryTier = (await ladder())[0]?.name ?? null;
  const found: Persona[] = [];

  const union = candidates.find(isUnion);
  if (union) found.push({ id: FOUND_UNION, member: union });

  /**
   * The public persona has to actually be on the entry tier.
   *
   * "Existing public member" is offered as the other half of the story, and a
   * member who happens to have been promoted tells the same story as the one
   * above it. So the tier is part of what is being looked for, not just the
   * absence of a union label. Falling back to any non-union member keeps the
   * card present on a tenant where nobody is on the entry tier, which is better
   * than offering nothing.
   */
  const publicMember =
    candidates.find((m) => !isUnion(m) && (!entryTier || m.levelName === entryTier)) ??
    candidates.find((m) => !isUnion(m));
  if (publicMember) found.push({ id: FOUND_PUBLIC, member: publicMember });

  return found;
}

/**
 * The personas that already exist on the platform.
 *
 * Members joining fresh are not listed: there is nothing to look up for them,
 * and the app offers them as sign-up options instead.
 */
demoRouter.get('/api/demo/personas', async (_req, res) => {
  try {
    res.json({
      personas: (await personas()).map(({ id, member }) => ({
        personaId: id,
        title: COPY[id]?.title ?? id,
        blurb: COPY[id]?.blurb ?? '',
        name: `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || 'Member',
        email: member.email,
        union: isUnion(member),
        /**
         * Live figures, so the card shows what this member actually holds —
         * where the platform reports them. A tenant's member list is not
         * obliged to carry a balance or a tier on every row, and a missing one
         * is a figure to omit, not a reason to fail.
         */
        levelName: member.levelName ?? null,
        points: typeof member.activePoints === 'number' ? member.activePoints : null,
      })),
    });
  } catch {
    // A prototype convenience must never take the app down with it.
    res.json({ personas: [] });
  }
});

/** Start a session as one of the seeded personas. */
demoRouter.post('/api/demo/personas/:personaId/session', async (req, res) => {
  try {
    const found = (await personas()).find((p) => p.id === req.params.personaId);
    if (!found) {
      res.status(404).json({ message: 'Unknown persona' });
      return;
    }
    const { member } = found;

    // Try each demo password rather than recording which one this account was
    // created with. Only a 401 is worth moving on from — anything else is the
    // platform failing, and retrying would bury the reason.
    let tokens = null;
    let lastError: unknown = null;
    for (const password of CANDIDATE_PASSWORDS) {
      try {
        tokens = await openLoyalty.memberLogin(member.email, password);
        break;
      } catch (err) {
        lastError = err;
        if (!(err instanceof OpenLoyaltyError) || err.status !== 401) throw err;
      }
    }
    if (!tokens) throw lastError;

    const memberId = memberIdFromToken(tokens.token) ?? member.customerId;
    const status = await openLoyalty.status(tokens.token, memberId);

    res.json({
      token: tokens.token,
      refreshToken: tokens.refresh_token,
      member: {
        customerId: status.customerId,
        firstName: status.firstName,
        lastName: status.lastName,
        email: member.email,
        loyaltyCardNumber: cardNumberFromEmail(member.email),
        union: isUnion(member),
      },
      account: toAccount(status, await ladder()),
    });
  } catch (err) {
    const status = err instanceof OpenLoyaltyError ? err.status : 502;
    res.status(status === 401 ? 401 : 502).json({
      message: status === 401 ? 'Persona sign-in failed' : 'Upstream error',
    });
  }
});
