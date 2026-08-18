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
    // Enrolment is settled entirely by the loyalty platform: registering raises
    // its `CustomerRegistered` event, and the campaigns listening for it assign
    // the tier and mint the welcome points before this call returns. The BFF
    // grants nothing itself — a welcome award is programme configuration, and
    // crediting it here would double it and put the amount out of the
    // programme's reach.
    const created = await openLoyalty.register(parsed.data);

    // Immediately log the new member in for a smooth onboarding flow.
    const tokens = await openLoyalty.memberLogin(
      parsed.data.email,
      parsed.data.password,
    );

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
