/**
 * Demo personas.
 *
 * A prototype has to be able to show both halves of the programme on demand:
 * a member who is joining now, and one who has been in it for a while. The
 * second cannot be created on the spot — it needs history — so it comes from
 * accounts the loyalty platform seeds.
 *
 * Personas are discovered from the platform by label rather than listed here,
 * so they always reflect real accounts with real balances and real tiers. The
 * shared demo password stays server-side: the app asks for a session by
 * persona id and never handles credentials.
 */
import { Router } from 'express';
import { olAdmin } from '../studio/olAdmin.js';
import { memberIdFromToken, openLoyalty, OpenLoyaltyError } from '../openloyalty/client.js';
import { ladder, toAccount } from './account.js';

export const demoRouter = Router();

const PERSONA_LABEL = 'demoPersona';
const CUSTOMER_TYPE_LABEL = 'customerType';
const UNION_MEMBER = 'union_member';

/** Seeded members share this password; it never leaves the server. */
const SEEDED_PASSWORD = process.env.DEMO_PERSONA_PASSWORD ?? 'password';

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
};

function labelValue(
  labels: Array<{ key: string; value: string }> | undefined,
  key: string,
): string | null {
  return labels?.find((l) => l.key === key)?.value ?? null;
}

/**
 * The personas that already exist on the platform.
 *
 * Members joining fresh are not listed: there is nothing to look up for them,
 * and the app offers them as sign-up options instead.
 */
demoRouter.get('/api/demo/personas', async (_req, res) => {
  try {
    const members = await olAdmin.membersWithLabel(PERSONA_LABEL);
    res.json({
      personas: members.map((m) => {
        const id = labelValue(m.labels, PERSONA_LABEL)!;
        return {
          personaId: id,
          title: COPY[id]?.title ?? id,
          blurb: COPY[id]?.blurb ?? '',
          name: `${m.firstName} ${m.lastName}`.trim(),
          email: m.email,
          union: labelValue(m.labels, CUSTOMER_TYPE_LABEL) === UNION_MEMBER,
          // Live figures, so the card shows what this member actually holds.
          levelName: m.levelName,
          points: m.activePoints,
        };
      }),
    });
  } catch {
    // A prototype convenience must never take the app down with it.
    res.json({ personas: [] });
  }
});

/** Start a session as one of the seeded personas. */
demoRouter.post('/api/demo/personas/:personaId/session', async (req, res) => {
  try {
    const members = await olAdmin.membersWithLabel(PERSONA_LABEL);
    const member = members.find(
      (m) => labelValue(m.labels, PERSONA_LABEL) === req.params.personaId,
    );
    if (!member) {
      res.status(404).json({ message: 'Unknown persona' });
      return;
    }

    const tokens = await openLoyalty.memberLogin(member.email, SEEDED_PASSWORD);
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
        loyaltyCardNumber: null,
        union: labelValue(member.labels, CUSTOMER_TYPE_LABEL) === UNION_MEMBER,
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
