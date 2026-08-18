/**
 * Request-scoped store checkout.
 *
 * Every store-scoped route reads and writes one `Store`. Rather than have 49
 * handlers each fetch it — and each remember to persist — the store is checked
 * out once per request here and written back when the response finishes.
 *
 * Handlers stay synchronous, which is the point: the domain logic in `data.ts`
 * is unchanged by persistence existing.
 */
import type { NextFunction, Request, Response } from 'express';
import { checkOutStore, type CheckedOutStore } from './persistence.js';
import type { Store } from './data.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** The store this request operates on. Throws if the middleware missed it. */
      store: Store;
    }
  }
}

/**
 * Path segments that sit where a store code would but are not one.
 *
 * `app.use('/api/:storeCode')` matches `/api/admin/login_check` too, and
 * checking out a store called "admin" would create one — a store nobody asked
 * for, seeded with a full programme, on every admin login.
 */
const RESERVED = new Set(['admin', 'healthcheck', 'token']);

export function storeContext(req: Request, res: Response, next: NextFunction): void {
  const code = req.params.storeCode;
  if (!code || RESERVED.has(code)) {
    next();
    return;
  }

  checkOutStore(code)
    .then((checkout: CheckedOutStore) => {
      req.store = checkout.store;

      let released = false;
      const release = (persist: boolean) =>
        released
          ? Promise.resolve()
          : ((released = true), checkout.release(persist));

      /**
       * Commit before the response goes out, not after.
       *
       * Persisting on `res.on('finish')` is a race: the client is told the write
       * succeeded and can immediately read it back from another instance that
       * has not seen the commit yet. Intercepting the send closes that window —
       * by the time a caller has its answer, the database has the write.
       */
      const sendAfterCommit = <A extends unknown[]>(
        original: (...args: A) => Response,
      ) =>
        function (this: Response, ...args: A): Response {
          release(true)
            .catch((err) => console.error('Failed to persist store', code, err))
            .finally(() => original.apply(this, args));
          return res;
        };

      const originalJson = res.json.bind(res);
      const originalEnd = res.end.bind(res);
      res.json = sendAfterCommit(originalJson) as typeof res.json;
      res.end = sendAfterCommit(originalEnd) as typeof res.end;

      // A client that disappears before the handler answers leaves the
      // transaction open; roll it back rather than persist a partial request.
      res.on('close', () => {
        if (!released) void release(false).catch(() => {});
      });

      next();
    })
    .catch(next);
}
