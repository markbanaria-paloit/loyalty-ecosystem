/**
 * The member account shape the apps render.
 *
 * One place, because three endpoints hand it out — login, register and
 * `/api/me` — and a member app that got a different shape from enrolment than
 * from a later refresh would flicker or disagree with itself.
 */
import type { CustomerStatus } from '../openloyalty/client.js';

export interface Account {
  customerId: string;
  firstName: string;
  lastName: string;
  points: number;
  totalEarnedPoints: number;
  usedPoints: number;
  /** Tier identity, straight from the loyalty platform. */
  levelId: string | null;
  levelName: string | null;
  /** Rank within the tier set; 1 is the entry tier. */
  levelSortOrder: number | null;
  /** True when the tier was assigned (member type) rather than earned. */
  levelManuallyAssigned: boolean;
  labels: Array<{ key: string; value: string }>;
  nextLevelName: string | null;
  nextLevelConditionValue: number | null;
  pointsToNextLevel: number | null;
  pointsExpiringNextMonth: number;
}

/**
 * Rank of the member's tier within the ladder.
 *
 * `levelSortOrder` is an extension this mock adds; a stock OpenLoyalty
 * `CustomerStatus` does not carry it. Falling back to the tier's position in
 * the configured ladder keeps the member app's tier presentation working
 * against a real instance, where only `levelId`/`levelName` come back.
 */
export function rankOf(
  status: CustomerStatus,
  ladder: Array<{ levelId: string; name: string }>,
): number | null {
  if (typeof status.levelSortOrder === 'number') return status.levelSortOrder;
  const byId = ladder.findIndex((t) => t.levelId === status.levelId);
  if (byId >= 0) return byId + 1;
  const byName = ladder.findIndex((t) => t.name === status.levelName);
  return byName >= 0 ? byName + 1 : null;
}

export function toAccount(
  status: CustomerStatus,
  ladder: Array<{ levelId: string; name: string }> = [],
): Account {
  return {
    customerId: status.customerId,
    firstName: status.firstName,
    lastName: status.lastName,
    points: status.activePoints,
    totalEarnedPoints: status.earnedPoints,
    usedPoints: status.spentPoints,
    levelId: status.levelId ?? null,
    levelName: status.levelName,
    levelSortOrder: rankOf(status, ladder),
    levelManuallyAssigned: status.levelManuallyAssigned ?? false,
    labels: status.labels ?? [],
    nextLevelName: status.nextLevelName,
    nextLevelConditionValue: status.nextLevelConditionValue,
    pointsToNextLevel: status.pointsToNextLevel,
    pointsExpiringNextMonth: status.pointsExpiringNextMonth ?? 0,
  };
}

/**
 * The configured tier ladder, cached briefly.
 *
 * Read once per short window rather than per request: it is programme
 * configuration that changes rarely, and every account read would otherwise
 * cost an extra upstream call.
 */
let cached: { at: number; tiers: Array<{ levelId: string; name: string }> } | null = null;
const TTL_MS = 30_000;

export async function ladder(): Promise<Array<{ levelId: string; name: string }>> {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) return cached.tiers;
  try {
    const { olAdmin } = await import('../studio/olAdmin.js');
    const tiers = (await olAdmin.tiers()).map((t) => ({ levelId: t.levelId, name: t.name }));
    cached = { at: now, tiers };
    return tiers;
  } catch {
    // A ladder we cannot read must not take an account read down with it.
    return cached?.tiers ?? [];
  }
}
