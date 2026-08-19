/**
 * Member-facing loyalty routes. All require the OpenLoyalty Bearer token that
 * the client received at login; the BFF forwards it upstream.
 *
 * This layer also normalizes OpenLoyalty's vocabulary into the flatter shape
 * the PWA consumes (`items` envelopes unwrapped, point fields renamed).
 */
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  memberIdFromToken,
  openLoyalty,
  OpenLoyaltyError,
} from "../openloyalty/client.js";
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { olAdmin } from "../studio/olAdmin.js";
import { ladder, toAccount } from "./account.js";

export const loyaltyRouter = Router();

/**
 * Points converted in one go, when the caller does not say.
 *
 * The programme is written in thousands — "1,000 points = $5" — so a conversion
 * with no amount converts one step rather than a whole balance.
 */
const CONVERSION_STEP = Number(process.env.CONVERSION_STEP_POINTS ?? 1000);

interface TokenRequest extends Request {
  memberToken?: string;
  memberId?: string;
}

function requireToken(
  req: TokenRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const memberId = memberIdFromToken(token);
  if (!memberId) {
    res.status(401).json({ message: "Malformed token" });
    return;
  }
  req.memberToken = token;
  req.memberId = memberId;
  next();
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof OpenLoyaltyError) {
    if (err.status === 401) {
      res.status(401).json({ message: "Session expired" });
      return;
    }
    res.status(err.status >= 400 && err.status < 500 ? err.status : 502).json({
      message: err.message,
      // What the platform actually said, for whoever is diagnosing. The apps
      // show `message`; this is here so a refusal can be understood without
      // reading a deployment's logs.
      detail: err.detail,
    });
    return;
  }
  res.status(502).json({ message: "Upstream error" });
}

loyaltyRouter.use("/api/me", requireToken);
loyaltyRouter.use("/api/rewards", requireToken);

// Profile + points + tier summary.
loyaltyRouter.get("/api/me", async (req: TokenRequest, res) => {
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
loyaltyRouter.get("/api/me/tier-progress", async (req: TokenRequest, res) => {
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
    // Answered as "no progress", never as an error.
    //
    // These are admin-scoped reads: the member's own token is not what
    // authenticates them, so an upstream 401 says this service's credentials
    // failed, not that the member's session did. Passing it through as a 401
    // told the app its token was dead and made it throw a working session away
    // — and every later call failed with it. Progress is presentational and
    // every caller already tolerates its absence.
    console.error("Tier progress unavailable:", err);
    res.json({ progress: null });
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
loyaltyRouter.get("/api/tiers", async (_req, res) => {
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
loyaltyRouter.post("/api/me/points/spend", async (req: TokenRequest, res) => {
  const points = Number(req.body?.points);
  const comment =
    typeof req.body?.comment === "string"
      ? req.body.comment
      : "Reward redemption";
  if (!Number.isFinite(points) || points <= 0) {
    res.status(400).json({ message: "points must be a positive number" });
    return;
  }
  try {
    // Re-read the balance server-side: the client's view may be stale, and a
    // redemption must never take the account negative.
    const status = await openLoyalty.status(req.memberToken!, req.memberId!);
    if (status.activePoints < points) {
      res.status(409).json({
        message: "Insufficient points",
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
loyaltyRouter.get("/api/me/transactions", async (req: TokenRequest, res) => {
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
loyaltyRouter.get("/api/rewards", async (req: TokenRequest, res) => {
  try {
    const { items } = await openLoyalty.rewards(req.memberToken!);
    res.json({
      rewards: items.map((r) => {
        // `-1` is unlimited, `0` is none left, and a plain number is a legacy
        // shape this still tolerates.
        const limit = r.usageLimit;
        const general =
          typeof limit === "number"
            ? limit
            : typeof limit?.general === "number"
              ? limit.general
              : null;
        return {
          campaignId: r.rewardId,
          name: r.name,
          description: r.shortDescription,
          costInPoints: r.costInPoints,
          unitsAvailable: general,
          /**
           * Affordable *and* issuable.
           *
           * The platform's own answer covers the balance and nothing else, so a
           * reward whose coupons have run out still came back as redeemable —
           * and taking it failed with a validation error that named nothing. A
           * count of zero means there is none to give.
           */
          canRedeem: (r.canBeBoughtByCustomer ?? false) && general !== 0,
          /**
           * What kind of reward this is, as the store reports it. Passed through
           * rather than kept back: buying one takes a payload shaped to its kind,
           * so this is the field that says which — and when a store's answer
           * differs from the vendored schema, this is where it shows.
           */
          type: r.reward ?? null,
          /**
           * What a point is worth, and how a fractional result rounds.
           *
           * A conversion coupon has no fixed price: the member says how many
           * points to convert and the platform applies this ratio. "1,000
           * points = $5" is a ratio of 0.005, which makes the programme's
           * rebate rate a single number held on the platform rather than a sum
           * done here.
           */
          conversion: r.unitsConversion
            ? {
                ratio: r.unitsConversion.ratio ?? null,
                rounding: r.unitsConversion.rounding ?? null,
              }
            : null,
        };
      }),
    });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Raise a custom event for this member — a review left, say.
 *
 * The type is checked against a configured list rather than taken as given. An
 * event is a trigger: challenges and campaigns wait on them, and a route that
 * forwarded whatever it was handed would let a member advance any challenge on
 * the store and collect whatever it pays out. What the event is worth remains
 * the platform's business; this only reports that it happened.
 */
loyaltyRouter.post('/api/me/events', async (req: TokenRequest, res) => {
  const type = String(req.body?.type ?? '').trim();
  if (!config.member.memberEventTypes.includes(type)) {
    res.status(400).json({ message: 'Unknown event type' });
    return;
  }
  try {
    await openLoyalty.logCustomEvent({
      memberId: req.memberId!,
      type,
      // Supplied by the caller where it can be, so a retry or a double tap is
      // the same event rather than a second one.
      eventId: String(req.body?.eventId ?? randomUUID()),
      body: typeof req.body?.body === 'object' && req.body.body ? req.body.body : undefined,
    });
    res.status(201).json({ logged: true, type });
  } catch (err) {
    /**
     * An id the platform already holds means the event is recorded.
     *
     * That is what an idempotency key is for, and answering an error for it
     * turns a harmless repeat — a retry, a second tap that got through — into
     * a failure the member is shown. The event happened; say so.
     */
    if (
      err instanceof OpenLoyaltyError &&
      /already exists/i.test(err.message)
    ) {
      res.status(200).json({ logged: true, type, duplicate: true });
      return;
    }
    handleError(err, res);
  }
});

/**
 * The challenges this member is in, and how far through them they are.
 *
 * A challenge is a goal made of milestones — spend this often, in this many
 * consecutive weeks — that the platform advances as transactions and events
 * arrive, and that pays out through the same effects a campaign uses: points,
 * a reward, an attribute. So this is a read and only a read. Progress is scored
 * by the loyalty engine off the sale the till already publishes; an app that
 * pushed progress of its own would be running the programme rather than showing
 * it, and the two would disagree the first time a rule changed.
 */
loyaltyRouter.get('/api/me/challenges', async (req: TokenRequest, res) => {
  try {
    const { items } = await openLoyalty.memberChallenges(req.memberId!);
    res.json({
      challenges: items.map((c) => ({
        campaignId: c.campaignId,
        name: c.campaignName,
        description: c.campaignDescription ?? null,
        /** True once the member has had all of this challenge they may have. */
        limitReached: c.limitReached ?? false,
        completedCount: c.memberProgress?.completedCount ?? 0,
        milestones: (c.memberProgress?.milestones ?? []).map((m) => ({
          milestoneId: m.milestoneId,
          /** What the member has done, against what the milestone asks for. */
          current: m.currentPeriodValue ?? 0,
          goal: m.periodGoal ?? null,
          /** Streaks: how many consecutive periods are needed, and are done. */
          periodsRequired: m.consecutivePeriods ?? null,
          periodsCompleted: m.completedConsecutivePeriods ?? 0,
          periodType: m.periodType ?? null,
          trigger: m.trigger ?? null,
        })),
      })),
    });
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * The coupons this member holds, and whether they have been used.
 *
 * Read from the platform on every call rather than mirrored here. The till
 * marks a coupon fulfilled against the same record, so asking the platform is
 * the only way the member app can show a coupon as used the moment it is —
 * anything cached would say "active" until it happened to refresh.
 */
loyaltyRouter.get("/api/me/vouchers", async (req: TokenRequest, res) => {
  try {
    const { items } = await openLoyalty.boughtRewards(req.memberToken!);
    res.json({
      vouchers: items.map((v) => ({
        issuedRewardId: v.issuedRewardId,
        couponCode: v.issuedCoupon?.code ?? v.couponCode ?? null,
        title: v.name ?? v.reward ?? null,
        /** The platform's own fulfilment vocabulary; the client maps it. */
        status: v.status,
        /**
         * Set once a till has spent the coupon. Carried separately from
         * `status` because it answers a different question — whether the member
         * can still use this, rather than how far the reward's fulfilment got —
         * and the two move independently upstream.
         */
        usedAt: v.issuedCoupon?.usedAt ?? null,
        issuedDate: v.createdAt,
      })),
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Redeem a reward. OpenLoyalty returns the issued-reward id; we look up the
// resulting coupon code so the PWA can show it immediately.
loyaltyRouter.post(
  "/api/rewards/:rewardId/redeem",
  async (req: TokenRequest, res) => {
    try {
      // Buying needs the reward's kind, because the payload is shaped to it.
      // Read from the member's own catalogue rather than taken on trust from
      // the client: the client knows an id, and the platform decides what that
      // id is.
      const catalogue = await openLoyalty.rewards(req.memberToken!);
      const reward = catalogue.items.find(
        (r) => r.rewardId === req.params.rewardId,
      );
      /**
       * How many points to convert, when the reward converts them.
       *
       * The caller may say; otherwise one step is converted rather than a
       * balance — a conversion coupon with no amount would otherwise be a
       * member handing over everything they hold by accident. The programme's
       * step is a thousand points, which is what "1,000 points = $5" means.
       */
      const units =
        reward?.reward === 'conversion_coupon'
          ? Number(req.body?.units) || CONVERSION_STEP
          : null;

      const issued = await openLoyalty.buyReward(
        req.memberToken!,
        req.params.rewardId,
        {
          type: reward?.reward ?? null,
          couponValue: reward?.couponValue ?? null,
          units,
        },
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
        // Read the same way the vouchers list reads it: the code is nested
        // under `issuedCoupon` on a real store and flat on the mock, and taking
        // only the flat one answered a freshly bought coupon with `null`.
        couponCode: coupon?.issuedCoupon?.code ?? coupon?.couponCode ?? null,
        pointsRemaining: status.activePoints,
      });
    } catch (err) {
      handleError(err, res);
    }
  },
);
