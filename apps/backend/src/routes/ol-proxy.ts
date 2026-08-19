/**
 * Operator access to Open Loyalty, one allow-listed call at a time.
 *
 * A blanket proxy would move the exposure rather than remove it: sign in once
 * and you reach every endpoint the store credential can. So each role carries
 * the list of calls its app actually makes, taken from those apps' clients, and
 * anything not on it is refused.
 *
 * The list is the security boundary, so it fails closed — an unmatched path is
 * never forwarded, and a path that is allowed for one role is not thereby
 * allowed for another.
 */
import { Router } from 'express';
import { config } from '../config.js';
import { requireOperator, type OperatorRequest, type OperatorRole } from './console.js';

export const olProxyRouter = Router();

const { baseUrl, storeCode, apiKey, adminUsername, adminPassword } = config.openLoyalty;

/** `{}` matches exactly one path segment. */
type Rule = `${string}`;

/**
 * What the till does: identify the card in front of it, publish the sale, read
 * back what it earned, and settle a voucher. Nothing that changes programme
 * configuration, and nothing that moves points by hand.
 */
const TILL_RULES: Record<string, Rule[]> = {
  GET: ['member/check', 'member', 'member/{}/status', 'transaction', 'redemption/by-code/{}'],
  POST: ['transaction', 'transaction/assign', 'redemption/{}/status'],
};

/**
 * What the campaign console does: everything the till does not — the tier
 * ladder, campaigns, rewards, members and manual point adjustments.
 */
const CONSOLE_RULES: Record<string, Rule[]> = {
  GET: [
    'admin/stats', 'member', 'member/{}', 'member/{}/status', 'points', 'redemption',
    'reward', 'tier', 'tierSet', 'tierSet/{}', 'tierSet/{}/tiers', 'campaign', 'campaign/{}',
    'transaction',
  ],
  POST: [
    'points/add', 'points/spend', 'member/{}/activate', 'member/{}/deactivate',
    'member/{}/tier', 'member/{}/remove-manually-level', 'reward', 'reward/{}/activate',
    'reward/{}/deactivate', 'tier/{}/activate', 'tier/{}/deactivate', 'tier/recalculate',
    'tier/recalculate-periods', 'tierSet', 'campaign', 'campaign/simulate',
    'campaign/{}/activate', 'campaign/{}/deactivate',
  ],
  PUT: ['reward/{}', 'tierSet/{}', 'tierSet/{}/tiers', 'campaign/{}'],
  PATCH: ['campaign/{}'],
  DELETE: ['tier/{}', 'campaign/{}'],
};

const RULES: Record<OperatorRole, Record<string, Rule[]>> = {
  till: TILL_RULES,
  console: CONSOLE_RULES,
};

/** Segment-by-segment match; `{}` stands for exactly one segment. */
function matchesRule(rule: string, path: string): boolean {
  const want = rule.split('/');
  const have = path.split('/');
  if (want.length !== have.length) return false;
  return want.every((segment, i) => segment === '{}' || segment === have[i]);
}

export function isAllowed(role: OperatorRole, method: string, path: string): boolean {
  const rules = RULES[role]?.[method.toUpperCase()] ?? [];
  return rules.some((rule) => matchesRule(rule, path));
}

/** Exposed so the contract check can see the surface this service really calls. */
export const ALLOW_LIST = RULES;

olProxyRouter.use('/api/ol', requireOperator);

olProxyRouter.all('/api/ol/*', async (req: OperatorRequest, res) => {
  const role = req.operator!.role;
  // Everything after `/api/ol/`, without the query string.
  const path = req.path.replace(/^\/api\/ol\//, '');

  if (!isAllowed(role, req.method, path)) {
    res.status(403).json({
      message: `A ${role} operator may not ${req.method} ${path}`,
    });
    return;
  }

  const query = req.originalUrl.includes('?')
    ? `?${req.originalUrl.split('?').slice(1).join('?')}`
    : '';
  const target = `${baseUrl}/api/${storeCode}/${path}${query}`;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // The credential the browser no longer holds.
        ...(apiKey
          ? { 'X-AUTH-TOKEN': apiKey }
          : { Authorization: `Bearer ${await adminToken()}` }),
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body ?? {}),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.type('application/json');
    res.send(text || '{}');
  } catch (err) {
    console.error('Open Loyalty proxy failed', req.method, path, err);
    res.status(502).json({ message: 'Upstream error' });
  }
});

/* ------------------------- JWT fallback -------------------------- */

let cachedAdminToken: string | null = null;

/** Used only when no API key is configured — the mock authenticates this way. */
async function adminToken(): Promise<string> {
  if (cachedAdminToken) return cachedAdminToken;
  const res = await fetch(`${baseUrl}/api/admin/login_check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: adminUsername, password: adminPassword }),
  });
  const body = (await res.json()) as { token?: string };
  if (!body.token) throw new Error('Admin login failed');
  cachedAdminToken = body.token;
  return body.token;
}
