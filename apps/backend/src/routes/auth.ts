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

    /**
     * Put a union member on their tier, here, before answering.
     *
     * This used to be left to the enrolment campaign: activate the member, and
     * a rule matching the `membertype` label would award enough points to cross
     * the threshold. It works, eventually — and "eventually" is the problem. The
     * platform scores campaigns after it accepts the activation, so the member
     * saw the entry tier and no points, then watched both change underneath
     * them a beat later.
     *
     * Membership is not a thing you earn by degrees; it is true at the moment
     * you join. So the tier is assigned outright, which the platform holds
     * rather than recalculating away, and the member is on it the instant
     * enrolment returns. Whatever the campaign pays is then a welcome award and
     * nothing more — it no longer decides the tier.
     */
    if (isUnionMember) {
      const target = (await ladder()).find(
        (t) => t.name === config.member.unionTierName,
      );
      if (target) {
        await openLoyalty.assignTier(created.customerId, target.levelId);
      } else {
        // Worth saying out loud: the member is enrolled and will be answered
        // for, but on the entry tier, and the reason is configuration.
        console.error(
          `No tier named ${config.member.unionTierName} on this store — union member left on the entry tier.`,
        );
      }
    }

    // Immediately log the new member in for a smooth onboarding flow.
    const tokens = await openLoyalty.memberLogin(
      parsed.data.email,
      parsed.data.password,
    );

    /**
     * Give the enrolment award a moment to land.
     *
     * The platform scores campaigns after it accepts the activation, not
     * during, so a status read straight afterwards shows a member with nothing
     * credited. Waiting briefly means the welcome screen usually has the real
     * figure to celebrate rather than correcting itself a beat later.
     *
     * The tier does not depend on this — it was assigned above. This is only
     * about the number, so it gives up quietly: a campaign that is slow, or a
     * store with no enrolment campaign at all, leaves a member correctly on
     * their tier with nothing credited, and the screen says exactly that.
     *
     * The balance is what is watched. Watching the tier name was the old
     * mistake: with no baseline to compare against, "changed" was true on the
     * first pass and the wait ended immediately.
     *
     * Three seconds, not eight. An award lands in well under a second when a
     * campaign is configured, so a longer ceiling only makes every member on a
     * store without one wait for nothing — and the app polls, so a late award
     * still arrives, just without the confetti.
     */
    const awaitedAward = await (async () => {
      const deadline = Date.now() + 3000;
      while (Date.now() < deadline) {
        const settling = await openLoyalty
          .status(tokens.token, created.customerId)
          .catch(() => null);
        if (settling && settling.activePoints > 0) return true;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      return false;
    })();
    if (!awaitedAward) {
      console.warn(
        `No enrolment award landed for ${created.customerId} within 8s — answering without one.`,
      );
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
      /**
       * What enrolment actually did, for the welcome screen to show.
       *
       * The award is read from the settled balance rather than from the
       * registration response. Registration itself grants nothing on a real
       * tenant — the campaigns run on activation — so the payouts it returns
       * are empty there, and a figure taken from them would always be zero.
       * A member who has just joined has been given exactly one thing, so
       * their balance is the award.
       */
      enrolment: {
        payouts: created.campaignPayouts ?? [],
        welcomePoints:
          (created.campaignPayouts ?? []).reduce((sum, p) => sum + p.points, 0) ||
          status.activePoints,
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

    // Pass a rejected registration back as a rejection, not as "upstream
    // error". Collapsing a 400 into a 502 cost real time here: the platform was
    // saying the password failed its policy, and all anyone could see was that
    // something had gone wrong somewhere else.
    if (err instanceof OpenLoyaltyError && err.status >= 400 && err.status < 500) {
      console.error('Registration rejected by the loyalty platform:', err.message);
      res.status(err.status).json({ message: err.message });
      return;
    }

    console.error('Registration failed:', err);
    res.status(502).json({ message: 'Upstream error' });
  }
});
