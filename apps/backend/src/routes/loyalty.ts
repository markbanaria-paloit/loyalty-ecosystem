/**
 * Member-facing loyalty routes. All require the OpenLoyalty Bearer token that
 * the client received at login; the BFF forwards it upstream.
 *
 * This layer also normalizes OpenLoyalty's vocabulary into the flatter shape
 * the PWA consumes (`items` envelopes unwrapped, point fields renamed).
 */
import { Router, type NextFunction, type Request, type Response } from 'express';
import {
  memberIdFromToken,
  openLoyalty,
  OpenLoyaltyError,
} from '../openloyalty/client.js';
import { olAdmin } from '../studio/olAdmin.js';
import { ladder, toAccount } from './account.js';

export const loyaltyRouter = Router();

interface TokenRequest extends Request {
  memberToken?: string;
  memberId?: string;
}

function requireToken(req: TokenRequest, res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  const memberId = memberIdFromToken(token);
  if (!memberId) {
    res.status(401).json({ message: 'Malformed token' });
    return;
  }
  req.memberToken = token;
  req.memberId = memberId;
  next();
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof OpenLoyaltyError) {
    if (err.status === 401) {
      res.status(401).json({ message: 'Session expired' });
      return;
    }
    res.status(err.status >= 400 && err.status < 500 ? err.status : 502).json({
      message: err.message,
    });
    return;
  }
  res.status(502).json({ message: 'Upstream error' });
}

loyaltyRouter.use('/api/me', requireToken);
loyaltyRouter.use('/api/rewards', requireToken);

// Profile + points + tier summary.
loyaltyRouter.get('/api/me', async (req: TokenRequest, res) => {
  try {
    const status = await openLoyalty.status(req.memberToken!, req.memberId!);
    res.json(toAccount(status, await ladder()));
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Where the member stands against the next tier.
 *
 * Proxied from the platform rather than computed here: qualification rules live
 * in the loyalty engine, and a BFF that worked out "how far to the next tier"
 * itself would be re-deriving rules it does not own — and would drift the
 * moment a threshold changed in the console.
 */
loyaltyRouter.get('/api/me/tier-progress', async (req: TokenRequest, res) => {
  try {
    const sets = await openLoyalty.memberTierSets(req.memberId!);
    const tierSetId = sets.items[0]?.tierSetId;
    if (!tierSetId) {
      res.json({ progress: null });
      return;
    }
    const progress = await openLoyalty.tierProgress(req.memberId!, tierSetId);
    res.json({ progress });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * The programme's tier ladder, as the loyalty platform holds it.
 *
 * The member app renders tiers from this rather than from a table of its own:
 * the names, the order and how many there are are all programme configuration,
 * and an app that hardcoded them would disagree with the console the moment a
 * tier was added or renamed.
 *
 * Unauthenticated on purpose — it is programme configuration, not member data,
 * and the sign-in screen needs it before a member exists.
 */
loyaltyRouter.get('/api/tiers', async (_req, res) => {
  try {
    const tiers = await olAdmin.tiers();
    res.json({
      tiers: tiers.map((t, index) => ({
        levelId: t.levelId,
        name: t.name,
        /** 1-based rank; the app keys its presentation off this, not the name. */
        rank: index + 1,
        /** Entered only by assignment (member type), never by spending. */
        assignmentOnly: t.assignmentOnly ?? false,
        conditions: t.conditions,
      })),
    });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Spend points against the member's own balance.
 *
 * The member app issues its own vouchers from a local catalogue, but the points
 * they cost have to leave the real account — otherwise the balance the BFF
 * reports drifts from what the member has actually spent. Debiting is an admin
 * operation upstream, so it is performed here on the authenticated member's
 * behalf and never trusted from the client beyond the amount.
 */
loyaltyRouter.post('/api/me/points/spend', async (req: TokenRequest, res) => {
  const points = Number(req.body?.points);
  const comment = typeof req.body?.comment === 'string' ? req.body.comment : 'Reward redemption';
  if (!Number.isFinite(points) || points <= 0) {
    res.status(400).json({ message: 'points must be a positive number' });
    return;
  }
  try {
    // Re-read the balance server-side: the client's view may be stale, and a
    // redemption must never take the account negative.
    const status = await openLoyalty.status(req.memberToken!, req.memberId!);
    if (status.activePoints < points) {
      res.status(409).json({
        message: 'Insufficient points',
        points: status.activePoints,
      });
      return;
    }
    await olAdmin.spendPoints(req.memberId!, points, comment);
    const after = await openLoyalty.status(req.memberToken!, req.memberId!);
    res.json({ points: after.activePoints });
  } catch (err) {
    handleError(err, res);
  }
});

// Points-transfer history.
loyaltyRouter.get('/api/me/transactions', async (req: TokenRequest, res) => {
  try {
    const { items } = await openLoyalty.points(req.memberToken!);
    res.json({
      transactions: items.map((t) => ({
        pointsTransferId: t.transferId,
        type: t.type,
        value: t.value,
        comment: t.comment,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Available rewards.
loyaltyRouter.get('/api/rewards', async (req: TokenRequest, res) => {
  try {
    const { items } = await openLoyalty.rewards(req.memberToken!);
    res.json({
      rewards: items.map((r) => ({
        campaignId: r.rewardId,
        name: r.name,
        description: r.shortDescription,
        costInPoints: r.costInPoints,
        unitsAvailable: r.usageLimit,
        canRedeem: r.canBeBoughtByCustomer ?? false,
      })),
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Redeem a reward. OpenLoyalty returns the issued-reward id; we look up the
// resulting coupon code so the PWA can show it immediately.
loyaltyRouter.post(
  '/api/rewards/:rewardId/redeem',
  async (req: TokenRequest, res) => {
    try {
      const issued = await openLoyalty.buyReward(
        req.memberToken!,
        req.params.rewardId,
      );
      const issuedRewardId = issued[0]?.issuedRewardId;
      const [status, bought] = await Promise.all([
        openLoyalty.status(req.memberToken!, req.memberId!),
        openLoyalty.boughtRewards(req.memberToken!),
      ]);
      const coupon = bought.items.find(
        (b) => b.issuedRewardId === issuedRewardId,
      );
      res.status(201).json({
        issuedRewardId,
        couponCode: coupon?.couponCode ?? null,
        pointsRemaining: status.activePoints,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
);
