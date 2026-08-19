/**
 * Till access to Open Loyalty, one allow-listed call at a time.
 *
 * The till used to hold a store credential in its bundle, readable by anyone
 * who opened devtools and able to read every member. The credential now lives
 * here and the till gets a session instead.
 *
 * A blanket proxy would have moved the exposure rather than removed it: sign in
 * once and you reach everything the credential can. So the list is the security
 * boundary and it fails closed — an unmatched path is never forwarded.
 */
import { Router } from 'express';
import { config } from '../config.js';
import { requireOperator, type OperatorRequest, type OperatorRole } from './console.js';

export const olProxyRouter = Router();

const { baseUrl, storeCode, apiKey, adminUsername, adminPassword } = config.openLoyalty;

/** `{}` matches exactly one path segment. */
type Rule = `${string}`;

/**
 * What the till does: identify the card in front of it, publish the sale, and
 * read back what it earned.
 *
 * This is the whole allow-list. Programme configuration — tiers, campaigns,
 * rewards, manual point adjustments — is not here because it is not ours to
 * do: Open Loyalty's own console owns that, and re-exposing it through this
 * service would be duplicating a backoffice that already exists and is
 * maintained by the people who ship the platform.
 *
 * Settling a coupon is not here either, though the till does it. It takes two
 * upstream calls that have to happen in order and stop if the first refuses, so
 * it is a route of its own (`routes/coupons.ts`) rather than something a client
 * assembles from proxied parts.
 */
const TILL_RULES: Record<string, Rule[]> = {
  GET: ['member/check', 'member', 'member/{}/status', 'transaction'],
  POST: ['transaction', 'transaction/assign'],
};

const RULES: Record<OperatorRole, Record<string, Rule[]>> = {
  till: TILL_RULES,
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
