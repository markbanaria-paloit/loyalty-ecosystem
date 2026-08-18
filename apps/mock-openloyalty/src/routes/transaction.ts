/**
 * Transaction endpoints, matching the real OpenLoyalty spec:
 *   POST /api/{storeCode}/transaction              (register a transaction)
 *   GET  /api/{storeCode}/transaction              (list)
 *   GET  /api/{storeCode}/transaction/{transaction}
 *   POST /api/{storeCode}/transaction/assign       (match to a member)
 *   GET  /api/{storeCode}/member/check             (existence check)
 *   POST /api/{storeCode}/redemption/{issuedReward}/status
 *
 * This is the merchant/POS surface. A point-of-sale never looks members up —
 * it attaches `customerData` to the transaction and OpenLoyalty matches it
 * server-side, then awards points via the store's earning rule.
 */
import { Router } from 'express';
import {
  assignTransaction,
  findCustomerByEmail,
  listEnvelope,
  matchCustomer,
  type RedemptionStatus,
  registerTransaction,
  type TransactionItem,
} from '../data.js';
import { requireAdmin, type AuthedRequest } from '../auth.js';

export const transactionRouter = Router();

const REDEMPTION_STATUSES: RedemptionStatus[] = [
  'issued',
  'pending',
  'approved',
  'packing',
  'awaiting_shipping',
  'shipped',
  'returned',
  'completed',
  'canceled',
  'rejected',
];

/**
 * Existence check used by a POS before attaching a member to a sale.
 * Mirrors the spec: returns only a count, never member details.
 */
transactionRouter.get(
  '/api/:storeCode/member/check',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const emailOrPhone = String(req.query.emailOrPhone ?? '');
    const identifier = String(req.query.identifier ?? '');

    let found = false;
    if (emailOrPhone) {
      found =
        Boolean(findCustomerByEmail(store, emailOrPhone)) ||
        [...store.customers.values()].some((c) => c.phone === emailOrPhone);
    }
    if (!found && identifier) {
      found = [...store.customers.values()].some(
        (c) => c.loyaltyCardNumber === identifier || c.customerId === identifier,
      );
    }
    res.json({ total: found ? 1 : 0 });
  },
);

/** Register a transaction. Spec nests the payload under `transaction`. */
transactionRouter.post(
  '/api/:storeCode/transaction',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const payload = req.body?.transaction ?? req.body ?? {};
    const { header, items, customerData } = payload;

    if (!header?.documentNumber || !header?.purchasedAt) {
      res.status(400).json({
        code: 400,
        message: 'header.documentNumber and header.purchasedAt are required',
      });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ code: 400, message: 'items must be a non-empty array' });
      return;
    }

    const parsed: TransactionItem[] = [];
    for (const item of items) {
      const grossValue = Number(item?.grossValue);
      if (!item?.sku || !item?.name || !item?.category || !Number.isFinite(grossValue)) {
        res.status(400).json({
          code: 400,
          message: 'each item requires sku, name, category and a numeric grossValue',
        });
        return;
      }
      parsed.push({
        sku: item.sku,
        name: item.name,
        category: item.category,
        grossValue,
        quantity: Number(item.quantity ?? item.highPrecisionQuantity ?? 1),
        maker: item.maker,
      });
    }

    const existing = [...store.transactions.values()].find(
      (t) => t.documentNumber === header.documentNumber,
    );
    if (existing) {
      res
        .status(400)
        .json({ code: 400, message: 'Transaction document number already exists' });
      return;
    }

    const transaction = registerTransaction(store, {
      documentNumber: header.documentNumber,
      documentType: header.documentType === 'return' ? 'return' : 'sell',
      purchasedAt: header.purchasedAt,
      purchasePlace: header.purchasePlace,
      items: parsed,
      customerData,
    });

    // Spec returns just the id; we add matched/pointsEarned so a POS can print
    // the earned points on the receipt without a second round-trip.
    res.json({
      transactionId: transaction.transactionId,
      matched: transaction.matched,
      pointsEarned: transaction.pointsEarned,
    });
  },
);

transactionRouter.get(
  '/api/:storeCode/transaction',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const items = [...store.transactions.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((t) => {
        const customer = t.customerId ? store.customers.get(t.customerId) : undefined;
        return {
          ...t,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : null,
        };
      });
    res.json(listEnvelope(items));
  },
);

transactionRouter.get(
  '/api/:storeCode/transaction/:transaction',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const transaction = store.transactions.get(req.params.transaction);
    if (!transaction) {
      res.status(404).json({ code: 404, message: 'Transaction not found' });
      return;
    }
    res.json(transaction);
  },
);

/** Manually match a previously unmatched transaction to a member. */
transactionRouter.post(
  '/api/:storeCode/transaction/assign',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const {
      transactionDocumentNumber,
      customerId,
      customerLoyaltyCardNumber,
      customerPhoneNumber,
    } = req.body ?? {};

    if (!transactionDocumentNumber) {
      res
        .status(400)
        .json({ code: 400, message: 'transactionDocumentNumber is required' });
      return;
    }
    const transaction = [...store.transactions.values()].find(
      (t) => t.documentNumber === transactionDocumentNumber,
    );
    if (!transaction) {
      res.status(404).json({ code: 404, message: 'Transaction not found' });
      return;
    }
    if (transaction.matched) {
      res
        .status(400)
        .json({ code: 400, message: 'Transaction is already assigned' });
      return;
    }

    const customer = matchCustomer(store, {
      customerId,
      loyaltyCardNumber: customerLoyaltyCardNumber,
      phone: customerPhoneNumber,
    });
    if (!customer) {
      res.status(404).json({ code: 404, message: 'Member not found' });
      return;
    }

    const updated = assignTransaction(store, transaction, customer);
    res.json({
      transactionId: updated.transactionId,
      customerId: updated.customerId,
      pointsEarned: updated.pointsEarned,
    });
  },
);

/** Move an issued reward through its fulfillment status (POS redemption). */
transactionRouter.post(
  '/api/:storeCode/redemption/:issuedReward/status',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const issued = store.issuedRewards.get(req.params.issuedReward);
    if (!issued) {
      res.status(404).json({ code: 404, message: 'Issued reward not found' });
      return;
    }
    const { status, comment } = req.body ?? {};
    if (!REDEMPTION_STATUSES.includes(status)) {
      res.status(400).json({
        code: 400,
        message: `status must be one of: ${REDEMPTION_STATUSES.join(', ')}`,
      });
      return;
    }
    issued.status = status;
    issued.statusHistory.push({
      status,
      comment,
      at: new Date().toISOString(),
    });
    res.json({ issuedRewardId: issued.issuedRewardId, status: issued.status });
  },
);

/** Look up an issued reward by coupon code, so a POS can validate a coupon. */
transactionRouter.get(
  '/api/:storeCode/redemption/by-code/:couponCode',
  requireAdmin,
  (req: AuthedRequest, res) => {
    const store = req.store;
    const code = req.params.couponCode.trim().toUpperCase();
    const issued = [...store.issuedRewards.values()].find(
      (r) => r.couponCode.toUpperCase() === code,
    );
    if (!issued) {
      res.status(404).json({ code: 404, message: 'Coupon not found' });
      return;
    }
    const customer = store.customers.get(issued.customerId);
    const reward = store.rewards.get(issued.rewardId);
    res.json({
      ...issued,
      rewardName: reward?.name ?? 'Unknown',
      customerName: customer
        ? `${customer.firstName} ${customer.lastName}`.trim()
        : 'Unknown',
    });
  },
);
