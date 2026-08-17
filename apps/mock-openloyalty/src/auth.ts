/**
 * JWT helpers + auth middleware mirroring OpenLoyalty's Bearer-token model.
 *
 * OpenLoyalty issues a JWT from the `login_check` endpoints and expects it back
 * as `Authorization: Bearer <token>`. Its payload carries the authenticated
 * identity, which is how a client learns its own member id — we mirror that
 * with `id` / `username` / `roles` claims.
 */
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

export const JWT_SECRET =
  process.env.MOCK_OL_JWT_SECRET ?? 'mock-openloyalty-dev-secret';
export const JWT_TTL_SECONDS = 60 * 60 * 24; // 24h, matching OL

export interface TokenPayload {
  /** Member id (or "admin"). */
  id: string;
  username: string;
  roles: string[];
  storeCode: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL_SECONDS });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export interface AuthedRequest extends Request {
  auth?: TokenPayload;
}

function readBearer(req: Request): string | null {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = readBearer(req);
  if (!token) {
    res.status(401).json({ code: 401, message: 'JWT Token not found' });
    return;
  }
  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ code: 401, message: 'Invalid JWT Token' });
  }
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  requireAuth(req, res, () => {
    if (!req.auth?.roles.includes('ROLE_ADMIN')) {
      res.status(403).json({ code: 403, message: 'Access denied' });
      return;
    }
    next();
  });
}
