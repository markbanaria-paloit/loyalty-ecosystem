/**
 * Till access to Open Loyalty.
 *
 * The till used to call Open Loyalty straight from the browser with a store
 * credential — readable by anyone who opened devtools, and able to read every
 * member. The credential now stays here and the till signs in for a session
 * scoped to what a till does.
 *
 * Programme configuration is deliberately not reachable from here. Open
 * Loyalty's own console owns that.
 */
import { Router, type NextFunction, type Request, type Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

export const consoleRouter = Router();

export type OperatorRole = 'till';

interface OperatorRequest extends Request {
  operator?: { username: string; role: OperatorRole };
}

/* --------------------------- Sessions ---------------------------- */

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac('sha256', config.console.sessionSecret).update(payload).digest('base64url');
}

function issueToken(username: string, role: OperatorRole): string {
  const body = Buffer.from(
    JSON.stringify({ username, role, exp: Date.now() + SESSION_TTL_MS }),
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string): { username: string; role: OperatorRole } | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  // Constant-time compare: a signature check that returns early leaks how much
  // of a forgery was right.
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof claims.exp !== 'number' || claims.exp < Date.now()) return null;
    return { username: claims.username, role: claims.role };
  } catch {
    return null;
  }
}

/** Credentials are compared in constant time for the same reason. */
function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

consoleRouter.post('/api/console/login', (req, res) => {
  const username = String(req.body?.username ?? '');
  const password = String(req.body?.password ?? '');
  const { operators } = config.console;

  const operator = operators.find(
    (o) => matches(username, o.username) && matches(password, o.password),
  );
  if (!operator) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json({
    token: issueToken(operator.username, operator.role),
    role: operator.role,
    username: operator.username,
  });
});

/** Reject anything without a valid operator session. */
export function requireOperator(req: OperatorRequest, res: Response, next: NextFunction): void {
  const [scheme, token] = (req.header('authorization') ?? '').split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    res.status(401).json({ message: 'Not signed in' });
    return;
  }
  const operator = verifyToken(token);
  if (!operator) {
    res.status(401).json({ message: 'Session expired' });
    return;
  }
  req.operator = operator;
  next();
}

export type { OperatorRequest };
