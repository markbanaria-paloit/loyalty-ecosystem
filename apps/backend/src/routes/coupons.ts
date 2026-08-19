/**
 * Settling a coupon at the till.
 *
 * Two things happen when a member hands a coupon over, and Open Loyalty keeps
 * them apart:
 *
 *   consumed   the code is spent — `member/{id}/reward/redeem`, which stamps
 *              `usedAt` and answers 409 if it has been spent already.
 *   fulfilled  the issued reward moves along its status pipeline to
 *              `completed`, which is what the console's Rewards fulfilment
 *              screen reports.
 *
 * A till doing only the second has no double-spend guard: a status can be set
 * as many times as you like. A till doing only the first leaves the console
 * showing work still outstanding. So this does both, consumption first — a
 * refused coupon must leave the record exactly as it was.
 *
 * Lookup by coupon code is done here rather than upstream because Open Loyalty
 * has no by-code endpoint: `GET /redemption` is the documented way to find an
 * issued reward, and it is filtered on the way back.
 */
import { Router } from 'express';
import { openLoyalty, OpenLoyaltyError } from '../openloyalty/client.js';
import { requireOperator, type OperatorRequest } from './console.js';

export const couponsRouter = Router();

couponsRouter.use('/api/console/coupons', requireOperator);

/**
 * The coupon's code, exactly as the platform holds it.
 *
 * Not uppercased. Comparing codes case-insensitively is right — a cashier keys
 * what they see — but sending the uppercased form back is not: a store whose
 * codes carry mixed case ("Points to $ Coupon") will not find it, and the
 * failure reads as a coupon that cannot be settled rather than one we asked for
 * by the wrong name.
 */
function codeOf(issued: {
  couponCode?: string | null;
  issuedCoupon?: { code?: string | null } | null;
}): string {
  return issued.issuedCoupon?.code ?? issued.couponCode ?? '';
}

/** For matching only. */
const sameCode = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** The most the spec allows per page, so this walks the list in as few calls as it can. */
const PAGE_SIZE = 50;

/**
 * Stop after this many pages rather than walking a large tenant forever.
 *
 * Generous enough to cover any plausible pilot history, and a miss is reported
 * rather than answered as "not found" — a cashier told a real coupon does not
 * exist would turn a customer away.
 */
const MAX_PAGES = 200;

/**
 * Find an issued reward by the code printed on the member's coupon.
 *
 * Paged deliberately. `GET /redemption` returns ten records by default and
 * fifty at most, so reading the first response and stopping finds only the ten
 * most recent redemptions — which works on an empty tenant and fails on a real
 * one, quietly, at the till.
 */
async function findByCode(couponCode: string) {
  const wanted = couponCode.trim();
  let seen = 0;
  let previousFirst: string | null = null;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { items, total } = await openLoyalty.redemptions(page, PAGE_SIZE);
    const found = items.find((r) => sameCode(codeOf(r), wanted));
    if (found) return found;
    if (items.length === 0) return null;

    /**
     * Give up when the pages stop moving.
     *
     * This tenant ignores `page` on its listings — every page answers with the
     * same records — so a walk that trusts the parameter never ends and never
     * finds anything new. Repeating the first record is the signal that paging
     * is not supported here, and one pass is all there is to search.
     */
    const first = items[0]?.issuedRewardId ?? null;
    if (page > 1 && first !== null && first === previousFirst) return null;
    previousFirst = first;

    seen += items.length;
    if (typeof total?.all === 'number' && seen >= total.all) return null;
  }
  throw new Error(
    `Searched ${MAX_PAGES * PAGE_SIZE} redemptions without finding ${wanted}`,
  );
}

/** What the till shows before it acts: whose coupon, for what, and its state. */
couponsRouter.get('/api/console/coupons/:couponCode', async (req, res) => {
  try {
    const issued = await findByCode(req.params.couponCode);
    if (!issued) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    res.json({
      issuedRewardId: issued.issuedRewardId,
      couponCode: codeOf(issued),
      rewardName: issued.name ?? issued.reward ?? 'Reward',
      customerId: issued.customerId,
      status: issued.status,
      usedAt: issued.issuedCoupon?.usedAt ?? null,
    });
  } catch (err) {
    const status = err instanceof OpenLoyaltyError ? err.status : 502;
    res.status(status >= 400 && status < 500 ? status : 502).json({
      message: 'Could not look that coupon up',
      detail: err instanceof OpenLoyaltyError ? err.detail : undefined,
    });
  }
});

/**
 * Settle it: consume the coupon, then record the reward as fulfilled.
 *
 * The order is the guard. Consumption is the call that can refuse — 409 when
 * the code has already been spent — and a refusal must stop here, leaving the
 * status untouched, so the console never shows a coupon fulfilled twice.
 */
couponsRouter.post('/api/console/coupons/:couponCode/consume', async (req, res) => {
  try {
    const issued = await findByCode(req.params.couponCode);
    if (!issued) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    /**
     * Refuse a spent coupon here, before asking.
     *
     * The record already says whether it has been used, so this does not depend
     * on reading an upstream refusal — which is just as well: a store answers a
     * second attempt with a bare 400, not the 409 the spec implies, and a 400
     * is indistinguishable from every other way a form can be wrong.
     */
    if (issued.issuedCoupon?.usedAt) {
      res.status(409).json({ message: 'This coupon has already been used' });
      return;
    }

    try {
      await openLoyalty.consumeCoupon(issued.customerId, codeOf(issued));
    } catch (err) {
      if (err instanceof OpenLoyaltyError && err.status === 409) {
        res.status(409).json({ message: 'This coupon has already been used' });
        return;
      }
      throw err;
    }

    // Fulfilment is bookkeeping for the console, so a failure here is reported
    // but does not undo the consumption — the member has had the goods.
    let fulfilled = true;
    try {
      await openLoyalty.setRedemptionStatus(issued.issuedRewardId, 'completed');
    } catch (err) {
      console.error('Coupon consumed but not marked fulfilled:', err);
      fulfilled = false;
    }

    res.json({
      issuedRewardId: issued.issuedRewardId,
      couponCode: codeOf(issued),
      used: true,
      fulfilled,
    });
  } catch (err) {
    const status = err instanceof OpenLoyaltyError ? err.status : 502;
    res.status(status >= 400 && status < 500 ? status : 502).json({
      message: 'Could not settle that coupon',
      detail: err instanceof OpenLoyaltyError ? err.detail : undefined,
    });
  }
});

/** Undo, for a coupon settled by mistake. */
couponsRouter.post('/api/console/coupons/:couponCode/reissue', async (req, res) => {
  try {
    const issued = await findByCode(req.params.couponCode);
    if (!issued) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    await openLoyalty.reissueCoupon(issued.customerId, codeOf(issued));
    await openLoyalty
      .setRedemptionStatus(issued.issuedRewardId, 'issued')
      .catch((err) => console.error('Coupon reissued but status not reset:', err));
    res.json({ couponCode: codeOf(issued), used: false });
  } catch (err) {
    const status = err instanceof OpenLoyaltyError ? err.status : 502;
    res.status(status >= 400 && status < 500 ? status : 502).json({
      message: 'Could not reissue that coupon',
      detail: err instanceof OpenLoyaltyError ? err.detail : undefined,
    });
  }
});
