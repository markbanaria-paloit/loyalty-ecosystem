/**
 * Authorization endpoints, matching the real OpenLoyalty spec:
 *   POST /api/admin/login_check
 *   POST /api/{storeCode}/member/login_check
 *   POST /api/token/refresh
 *   POST /api/{storeCode}/token/refresh
 *
 * All return `{ token, refresh_token }`.
 */
import { Router } from 'express';
import { findCustomerByEmail } from '../data.js';
import { signToken, verifyToken } from '../auth.js';

export const authRouter = Router();

const ADMIN_USERNAME = process.env.MOCK_OL_ADMIN_USER ?? 'admin';
const ADMIN_PASSWORD = process.env.MOCK_OL_ADMIN_PASSWORD ?? 'admin';

authRouter.post('/api/admin/login_check', (req, res) => {
  const { username, password } = req.body ?? {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ code: 401, message: 'Bad credentials.' });
    return;
  }
  const claims = {
    id: 'admin',
    username: ADMIN_USERNAME,
    roles: ['ROLE_ADMIN'],
    storeCode: '_admin',
  };
  res.json({ token: signToken(claims), refresh_token: signToken(claims) });
});

authRouter.post('/api/:storeCode/member/login_check', (req, res) => {
  const { storeCode } = req.params;
  const { username, password } = req.body ?? {};
  const store = req.store;
  const customer = username ? findCustomerByEmail(store, username) : undefined;
  if (!customer || !customer.active || customer.password !== password) {
    res.status(401).json({ code: 401, message: 'Bad credentials.' });
    return;
  }
  const claims = {
    id: customer.customerId,
    username: customer.email,
    roles: ['ROLE_PARTICIPANT'],
    storeCode,
  };
  res.json({ token: signToken(claims), refresh_token: signToken(claims) });
});

function refresh(req: import('express').Request, res: import('express').Response) {
  const { refresh_token } = req.body ?? {};
  try {
    const p = verifyToken(refresh_token);
    const claims = {
      id: p.id,
      username: p.username,
      roles: p.roles,
      storeCode: p.storeCode,
    };
    res.json({ token: signToken(claims), refresh_token: signToken(claims) });
  } catch {
    res.status(401).json({ code: 401, message: 'Invalid refresh token.' });
  }
}

authRouter.post('/api/token/refresh', refresh);
authRouter.post('/api/:storeCode/token/refresh', refresh);
