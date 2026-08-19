/**
 * Auth routes for the PWA.
 *
 * The BFF is stateless: on login it returns the OpenLoyalty member token to the
 * client, which sends it back as a Bearer on subsequent calls. The BFF forwards
 * that token upstream. (For production, wrap this in your own httpOnly session
 * and keep the OpenLoyalty token server-side.)
 */
import { Router } from 'express';
import { z } from 'zod';
import {
  memberIdFromToken,
  openLoyalty,
  OpenLoyaltyError,
} from '../openloyalty/client.js';
import { ladder, toAccount } from './account.js';
import { config } from '../config.js';
import { olAdmin } from '../studio/olAdmin.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }
  try {
    const tokens = await openLoyalty.memberLogin(
      parsed.data.email,
      parsed.data.password,
    );
    const memberId = memberIdFromToken(tokens.token);
    if (!memberId) {
      res.status(502).json({ message: 'Could not resolve member from token' });
      return;
    }
    const status = await openLoyalty.status(tokens.token, memberId);
    res.json({
      token: tokens.token,
      refreshToken: tokens.refresh_token,
      member: {
        customerId: status.customerId,
        firstName: status.firstName,
        lastName: status.lastName,
        email: parsed.data.email,
      },
      // Same shape `/api/me` returns, so a client that signs in has the record
      // in hand without a follow-up call.
      account: toAccount(status, await ladder()),
    });
  } catch (err) {
    const status = err instanceof OpenLoyaltyError ? err.status : 502;
    res
      .status(status === 401 ? 401 : 502)
      .json({ message: status === 401 ? 'Invalid credentials' : 'Upstream error' });
  }
});

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  loyaltyCardNumber: z.string().min(1).optional(),
  /**
   * Member type and other tags, passed straight through in the spec's `Labels`
   * shape. Enrolment campaigns filter on them upstream, which is what decides
   * the welcome award and the starting tier.
   */
  labels: z
    .array(z.object({ key: z.string().min(1), value: z.string().min(1) }))
    .optional(),
});

authRouter.post('/api/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: 'Invalid registration', issues: parsed.error.issues });
    return;
  }
  try {
    // Enrolment takes more than one call against a real tenant, and the member
    // is not usable until all of them have run — so none of it happens after
    // this handler responds.
    const created = await openLoyalty.register(parsed.data);

    // Open Loyalty creates members inactive, and an inactive member cannot
    // transact. Tolerated if it fails: a platform that activates on
    // registration answers 404 here, and that is not an error.
    await openLoyalty.activate(created.customerId).catch(() => {});

    const { unionLabelKey, unionLabelValue } = config.member;
    const isUnionMember = (parsed.data.labels ?? []).some(
      (l) => l.key === unionLabelKey && l.value === unionLabelValue,
    );

    // Nothing here assigns a tier. The programme grants the union tier itself:
    // a campaign listening for `MemberWasActivated` matches the member's
    // `membertype` label and awards enough points to cross the tier's
    // threshold. Activating the member above is what triggers it — which is why
    // that call is not merely tidy-up, it is the whole mechanism.
    //
    // Assigning the tier here as well would put a member on it who had not been
    // given the points, and the two would disagree the moment either changed.

    // Immediately log the new member in for a smooth onboarding flow.
    const tokens = await openLoyalty.memberLogin(
      parsed.data.email,
      parsed.data.password,
    );

    /**
     * Wait for the enrolment award to land before answering.
     *
     * The platform scores campaigns after it accepts the activation, not
     * during, so a status read straight afterwards shows a member with no
     * points and the entry tier — and the member app would render exactly that,
     * then correct itself a beat later.
     *
     * Only members the programme should award are waited on: everyone else has
     * nothing coming and should not pay for the check.
     */
    if (isUnionMember) {
      // The tier is what we are waiting for, not the points. The award lands
      // first and the tier recalculates after it, so breaking on a non-zero
      // balance returns a member who has been paid but not yet promoted.
      const startedOn = await openLoyalty
        .status(tokens.token, created.customerId)
        .catch(() => null);
      const deadline = Date.now() + 8000;
      while (Date.now() < deadline) {
        const settling = await openLoyalty
          .status(tokens.token, created.customerId)
          .catch(() => null);
        if (settling && settling.levelName !== startedOn?.levelName) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Read the record back through the member's own token rather than trusting
    // the registration response, so what the client renders is the same view it
    // will get on every later refresh.
    const status = await openLoyalty.status(tokens.token, created.customerId);

    res.status(201).json({
      token: tokens.token,
      refreshToken: tokens.refresh_token,
      member: {
        customerId: created.customerId,
        email: created.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      },
      // The settled loyalty record. The client can render the dashboard
      // straight from this — no second round trip, no window where the balance
      // reads zero.
      account: toAccount(status, await ladder()),
      /** What enrolment actually did, for the welcome screen to show. */
      enrolment: {
        payouts: created.campaignPayouts ?? [],
        welcomePoints: (created.campaignPayouts ?? []).reduce(
          (sum, p) => sum + p.points,
          0,
        ),
      },
    });
  } catch (err) {
    // OpenLoyalty returns 400 for a duplicate email; surface it as a conflict.
    if (
      err instanceof OpenLoyaltyError &&
      /already exists/i.test(err.message)
    ) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    res.status(502).json({ message: 'Upstream error' });
  }
});
