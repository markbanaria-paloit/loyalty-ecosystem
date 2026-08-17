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
    res.json({
      customerId: status.customerId,
      firstName: status.firstName,
      lastName: status.lastName,
      points: status.activePoints,
      totalEarnedPoints: status.earnedPoints,
      usedPoints: status.spentPoints,
      levelName: status.levelName,
      nextLevelName: status.nextLevelName,
      nextLevelConditionValue: status.nextLevelConditionValue,
      pointsToNextLevel: status.pointsToNextLevel,
    });
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
