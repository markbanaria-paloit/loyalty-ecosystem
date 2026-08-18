/**
 * OpenLoyalty POS client.
 *
 * A till publishes transactions straight to the loyalty engine. It never reads
 * the member list — it attaches `customerData` to the sale and OpenLoyalty
 * matches the member server-side, then applies earning rules.
 */

/**
 * Absolute API origin for deployed builds.
 *
 * Empty in development, where Vite proxies `/api` to the upstream and the
 * browser sees a single origin. A static deploy has no proxy, so the origin has
 * to be baked in at build time — that is what `VITE_API_BASE_URL` is for.
 * Trailing slashes are trimmed so path concatenation stays predictable.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
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

const s = () => `/api/${STORE_CODE}`;

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
  status: string;
  createdAt: string;
  rewardName: string;
  customerName: string;
}

export const api = {
  async login(username: string, password: string) {
    const res = await req<{ token: string }>('/api/admin/login_check', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(res.token);
    return res;
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
    req<{ transactionId: string; matched: boolean; pointsEarned: number }>(
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
    req<CouponLookup>(`${s()}/redemption/by-code/${encodeURIComponent(code)}`),

  setRedemptionStatus: (issuedRewardId: string, status: string, comment?: string) =>
    req<{ status: string }>(`${s()}/redemption/${issuedRewardId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    }),
};
