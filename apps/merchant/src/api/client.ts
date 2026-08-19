/**
 * POS client.
 *
 * Every call reaches Open Loyalty, but through the backend rather than
 * directly. The store credential that used to sit in this bundle — readable by
 * anyone who opened devtools, and able to read every member — now stays on the
 * server. The till signs in as an operator and gets a session scoped to what a
 * till does: identify the card in front of it, publish the sale, read back what
 * it earned, settle a voucher. Nothing that changes programme configuration.
 */

/**
 * Absolute origin of the **backend**, not of Open Loyalty.
 *
 * This used to point at the loyalty platform; it does not any more, and
 * pointing it back would send unauthenticated calls at a service that has never
 * heard of an operator session. Empty in development, where Vite proxies
 * `/api`.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

/**
 * Where to report that a member's points changed.
 *
 * The backend owns the push channel's credentials; the till only reports the
 * fact. Unset in a deployment without a backend, in which case nothing is
 * published and member apps fall back to polling.
 */
const EVENT_ENDPOINT = `${API_BASE}/api/events/member-changed`;
const EVENT_SECRET = import.meta.env.VITE_EVENT_PUBLISH_SECRET ?? '';
const TOKEN_KEY = 'pos.token';
export const STORE_CODE = import.meta.env.VITE_STORE_CODE ?? 'default';
export const PURCHASE_PLACE = import.meta.env.VITE_PURCHASE_PLACE ?? 'Main Street Store';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface ListResponse<T> {
  items: T[];
  total: { all: number; filtered: number; estimated: boolean };
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }
  return body as T;
}

/**
 * Operator-scoped route to Open Loyalty. The store code lives on the server —
 * the till no longer needs to know which tenant it is talking to.
 */
const s = () => '/api/ol';

export interface CartLine {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface TransactionRecord {
  transactionId: string;
  documentNumber: string;
  documentType: 'sell' | 'return';
  purchasedAt: string;
  grossValue: number;
  pointsEarned: number;
  matched: boolean;
  customerName: string | null;
  customerData: { email?: string; loyaltyCardNumber?: string };
  items: Array<{ sku: string; name: string; grossValue: number; quantity: number }>;
}

export interface CouponLookup {
  issuedRewardId: string;
  couponCode: string;
  /** Fulfilment stage on the platform — not whether the coupon was spent. */
  status: string;
  /** Set once the coupon has been consumed. This is the one that blocks reuse. */
  usedAt: string | null;
  rewardName: string;
  customerId: string;
}

export const api = {
  async login(username: string, password: string) {
    const res = await req<{ token: string }>('/api/console/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(res.token);
    return res;
  },

  /**
   * The member behind a loyalty card, with their current balance.
   *
   * Needed because a real Open Loyalty returns only `transactionId` when a sale
   * is published — no `matched`, no `pointsEarned`. The till reads the balance
   * either side of the sale and reports the difference, which is the only way
   * to put an award on the receipt.
   */
  async memberByCard(loyaltyCardNumber: string) {
    const found = await req<ListResponse<{ customerId: string; firstName: string; lastName: string }>>(
      `${s()}/member?loyaltyCardNumber=${encodeURIComponent(loyaltyCardNumber)}`,
    );
    const member = found.items[0];
    if (!member) return null;
    const status = await req<{ activePoints: number; levelName: string | null }>(
      `${s()}/member/${member.customerId}/status`,
    );
    return {
      customerId: member.customerId,
      name: `${member.firstName} ${member.lastName}`.trim(),
      activePoints: status.activePoints ?? 0,
      levelName: status.levelName ?? null,
    };
  },

  /** Current balance for a member we already know. */
  async memberPoints(customerId: string): Promise<number> {
    const status = await req<{ activePoints: number }>(`${s()}/member/${customerId}/status`);
    return status.activePoints ?? 0;
  },

  /**
   * Wait for a sale's points to land.
   *
   * Publishing a transaction returns as soon as it is accepted, not once it has
   * been scored — a balance read immediately afterwards still shows the old
   * figure, and the credit appears a moment later. Reading once would print a
   * receipt saying zero points for a sale that earned some.
   *
   * Gives up rather than hanging the till: an unchanged balance is reported as
   * no award, which is also the right answer for an unmatched sale.
   */
  async awaitPointsChange(
    customerId: string,
    before: number,
    timeoutMs = 6000,
  ): Promise<number | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const now = await this.memberPoints(customerId).catch(() => null);
      if (now !== null && now !== before) return now;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    return null;
  },

  /**
   * Tell the member's app that their points moved.
   *
   * Open Loyalty has no knowledge of our push channel, so nothing else can
   * report this. The till is the only party that both caused the award and
   * watched it land — by the time it calls this, the balance has already
   * changed, so the app is never told to look at something that is not there.
   *
   * Best-effort: a member app that misses the push falls back to polling, and a
   * sale must never fail because a notification did not go out.
   */
  async publishMemberChanged(customerId: string): Promise<void> {
    if (!EVENT_ENDPOINT) return;
    try {
      await fetch(EVENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(EVENT_SECRET ? { 'x-event-secret': EVENT_SECRET } : {}),
        },
        body: JSON.stringify({ memberId: customerId, kind: 'points_changed', storeCode: STORE_CODE }),
      });
    } catch {
      /* the member app still polls */
    }
  },

  /** Existence check — returns a count only, never member details. */
  checkMember: (emailOrPhone: string, identifier: string) =>
    req<{ total: number }>(
      `${s()}/member/check?emailOrPhone=${encodeURIComponent(emailOrPhone)}&identifier=${encodeURIComponent(identifier)}`,
    ),

  /**
   * Publish a sale. The spec nests everything under `transaction`, with
   * per-item `grossValue` carrying the line total.
   */
  postTransaction: (input: {
    documentNumber: string;
    documentType: 'sell' | 'return';
    lines: CartLine[];
    email?: string;
    loyaltyCardNumber?: string;
  }) =>
    req<{ transactionId: string; matched?: boolean; pointsEarned?: number }>(
      `${s()}/transaction`,
      {
        method: 'POST',
        body: JSON.stringify({
          transaction: {
            header: {
              documentNumber: input.documentNumber,
              documentType: input.documentType,
              purchasedAt: new Date().toISOString(),
              purchasePlace: PURCHASE_PLACE,
            },
            items: input.lines.map((l) => ({
              sku: l.sku,
              name: l.name,
              category: l.category,
              grossValue: Number((l.unitPrice * l.quantity).toFixed(2)),
              quantity: l.quantity,
            })),
            customerData: {
              ...(input.email ? { email: input.email } : {}),
              ...(input.loyaltyCardNumber
                ? { loyaltyCardNumber: input.loyaltyCardNumber }
                : {}),
            },
          },
        }),
      },
    ),

  transactions: () => req<ListResponse<TransactionRecord>>(`${s()}/transaction`),

  /** Attach a member to a sale that could not be matched at the till. */
  assign: (input: {
    transactionDocumentNumber: string;
    customerLoyaltyCardNumber?: string;
    customerPhoneNumber?: string;
  }) =>
    req<{ transactionId: string; pointsEarned: number }>(`${s()}/transaction/assign`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  lookupCoupon: (code: string) =>
    req<CouponLookup>(`/api/console/coupons/${encodeURIComponent(code)}`),

  /**
   * Settle a coupon: spend it, then record the reward as fulfilled.
   *
   * Both happen server-side and in that order, so a code presented twice is
   * refused with a 409 rather than quietly fulfilled again.
   */
  consumeCoupon: (code: string) =>
    req<{ used: boolean; fulfilled: boolean }>(
      `/api/console/coupons/${encodeURIComponent(code)}/consume`,
      { method: 'POST' },
    ),

  /** Undo a coupon settled by mistake. */
  reissueCoupon: (code: string) =>
    req<{ used: boolean }>(`/api/console/coupons/${encodeURIComponent(code)}/reissue`, {
      method: 'POST',
    }),
};
