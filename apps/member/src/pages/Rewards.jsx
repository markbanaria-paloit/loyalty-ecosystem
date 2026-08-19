/**
 * Rewards — the programme's catalogue, as the loyalty platform holds it.
 *
 * The list is fetched, not written down here. Which rewards exist, what they
 * cost and which tiers may have them are programme configuration, and the
 * platform has already filtered to this member's tier, so a Tier 2 reward never
 * reaches a Tier 1 member to be hidden.
 *
 * Most of the catalogue costs nothing. The programme grants coupons as well as
 * selling them — the welcome bundle, the birthday parking, the tier parking
 * coupon — so those are listed as entitlements rather than priced, and only the
 * points voucher goes through the cart.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Ticket, Store, QrCode, X, CalendarDays, Gift, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { TenantAvatar, tenantName, EmptyState } from '../components/Ui.jsx';
import { fetchRewards } from '../lib/loyalty.js';
import { daysUntil, fmtDate } from '../lib/helpers.js';

/**
 * A platform reward in the shape the voucher model expects.
 *
 * `tenantId` is deliberately absent: a reward on the loyalty platform belongs
 * to the programme, not to a tenant, and guessing one from the name would put a
 * shop logo on a coupon that is not theirs.
 */
function asVoucher(reward) {
  return {
    id: reward.campaignId,
    title: reward.name,
    tenantId: null,
    cashValue: null,
    pointsCost: reward.costInPoints,
  };
}

/**
 * How the platform's fulfilment statuses read to a member.
 *
 * Only consulted when the coupon has not been spent — see `normalise`. This is
 * the reward's progress through Open Loyalty's fulfilment pipeline, which for a
 * coupon is mostly bookkeeping; the refusals are what a member needs to see.
 *
 * Note that `completed` does not retire a coupon here. Fulfilment finishing
 * means the reward was handed over as an order, not that the code has been
 * spent — only `usedAt` says that.
 */
const PLATFORM_STATUS = {
  issued: 'active',
  approved: 'active',
  completed: 'active',
  pending: 'pending',
  packing: 'pending',
  awaiting_shipping: 'pending',
  shipped: 'pending',
  returned: 'rejected',
  rejected: 'rejected',
  cancelled: 'rejected',
  canceled: 'rejected',
};

/**
 * One display shape for coupons from two places.
 *
 * The platform holds the ones that cost points, and it holds the fact of their
 * being spent — which is the whole point: the till writes it there. The welcome
 * bundle is local, because those are tenant deals the platform has no record
 * of, and it carries an expiry the platform's coupons do not.
 */
function normalise(state) {
  const fromPlatform = state.platformVouchers.map((v) => ({
    key: v.issuedRewardId,
    id: v.issuedRewardId,
    title: v.title ?? 'Reward',
    tenantId: null,
    code: v.couponCode,
    // `usedAt` decides, and is the only thing that can say "used". Spending a
    // coupon and moving the reward's fulfilment status are separate acts
    // upstream, so reading the status first would leave a coupon showing as
    // available after it had been handed over — the one mistake here that costs
    // the tenant money.
    status: v.usedAt
      ? 'used'
      : (PLATFORM_STATUS[String(v.status).toLowerCase()] ?? 'active'),
    issuedDate: v.issuedDate,
    expiryDate: null,
    local: false,
  }));

  const fromBundle = state.vouchers.map((v) => ({
    key: v.id,
    id: v.id,
    title: v.title,
    tenantId: v.tenantId,
    code: v.code,
    status: v.status === 'used' ? 'used' : daysUntil(v.expiryDate) < 0 ? 'expired' : 'active',
    issuedDate: v.issuedDate,
    expiryDate: v.expiryDate,
    local: true,
  }));

  return [...fromPlatform, ...fromBundle];
}

export default function Rewards() {
  const { state, loyaltySync, redeemCart } = useApp();
  const [view, setView] = useState('catalog');
  const [cart, setCart] = useState([]);
  const [drawerVoucher, setDrawerVoucher] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const vouchers = useMemo(() => normalise(state), [state]);
  const activeCount = vouchers.filter((v) => v.status === 'active').length;

  /**
   * Wait for the session before asking.
   *
   * The app re-asserts enrolment on every load and takes a fresh token doing
   * it, so a catalogue fetched on mount goes out under the previous token and
   * comes back 401 — an empty rewards page on every reload. Keying on the
   * linked session means the request is made once there is a token to make it
   * with.
   */
  const linked = loyaltySync.status === 'linked';
  const reload = useCallback(async () => {
    if (!linked) return;
    setLoading(true);
    try {
      setRewards(await fetchRewards());
    } catch {
      // An empty catalogue is the honest answer when the platform cannot be
      // reached; inventing one would show rewards nobody can actually claim.
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, [linked]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Split on cost, not on name: the platform decides what is bought and what is
  // granted, and it says so in the price.
  const [priced, included] = useMemo(
    () => [
      rewards.filter((r) => r.costInPoints > 0),
      rewards.filter((r) => r.costInPoints === 0),
    ],
    [rewards],
  );

  const totalCost = cart.reduce(
    (sum, id) => sum + (priced.find((r) => r.campaignId === id)?.costInPoints ?? 0),
    0,
  );
  const canAfford = totalCost <= state.points && cart.length > 0;

  function toggle(id) {
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  /**
   * Take rewards on the platform, and say so if it would not.
   *
   * Awaited, because what happens next depends on the answer. This used to fire
   * and forget — the cart emptied and the tab switched whether or not anything
   * had been redeemed, so a refusal looked exactly like a success that produced
   * no voucher. Anything that failed stays selected with the reason on screen.
   */
  async function take(items) {
    if (!items.length || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { redeemed, failures } = await redeemCart(items);
      // The catalogue prices affordability at fetch time, so it is re-read:
      // spending changes what the member can still take.
      await reload();
      if (failures.length) {
        setError(failures[0].message);
        setCart(failures.map((f) => f.id));
        return;
      }
      if (redeemed > 0) {
        setCart([]);
        setView('vouchers');
      }
    } finally {
      setBusy(false);
    }
  }

  const redeem = () =>
    take(
      cart
        .map((id) => priced.find((r) => r.campaignId === id))
        .filter(Boolean)
        .map(asVoucher),
    );

  /**
   * Claim a reward that costs nothing.
   *
   * Taken one at a time rather than through the cart. The cart exists to total
   * up a price and check it against a balance, and a free reward has neither —
   * putting one in it makes "0 pts / Redeem Now" the prompt, and mixes an
   * outcome that can be refused with one that cannot.
   */
  const claim = (reward) => take([asVoucher(reward)]);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title="Rewards" subtitle={`${state.points.toLocaleString()} pts available`} back={false} />

      <div className="px-5 pt-4">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {[
            { id: 'catalog', label: 'Catalog' },
            { id: 'vouchers', label: `My Vouchers (${activeCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${view === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-center text-[12px] font-semibold text-red-600">
            {error}
          </p>
        )}

        {view === 'catalog' ? (
          <div className="mt-4 space-y-3">
            {loading && (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-8 text-sm text-gray-400 shadow-sm">
                <Loader2 size={16} className="animate-spin" /> Loading rewards…
              </div>
            )}

            {!loading && rewards.length === 0 && (
              <EmptyState
                icon={Ticket}
                title="No rewards available"
                body="The programme has no rewards configured for your tier right now."
              />
            )}

            {priced.length > 0 && (
              <>
                <p className="text-[11px] text-gray-400">
                  Tip: select multiple rewards to redeem together in one go.
                </p>
                {priced.map((r) => {
                  const selected = cart.includes(r.campaignId);
                  return (
                    <div
                      key={r.campaignId}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 shadow-sm ${selected ? 'border-brand-400 bg-brand-50/40' : 'border-gray-100 bg-white'}`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Ticket size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold text-gray-900">{r.name}</p>
                        <p className="truncate text-[11px] text-gray-400">{r.description}</p>
                        <p className="mt-1 text-xs font-bold text-brand-600">
                          {r.costInPoints.toLocaleString()} pts
                        </p>
                      </div>
                      <button
                        onClick={() => toggle(r.campaignId)}
                        disabled={!r.canRedeem && !selected}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                          selected ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {selected ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {included.length > 0 && (
              <>
                <p className="pt-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Included with your membership
                </p>
                {included.map((r) => (
                  <div
                    key={r.campaignId}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <Gift size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-gray-900">{r.name}</p>
                      <p className="truncate text-[11px] text-gray-400">{r.description}</p>
                    </div>
                    <button
                      onClick={() => claim(r)}
                      // Costing nothing is not the same as being available.
                      // These are coupons drawn from a pool like any other, and
                      // offering one the store has none of produces a refusal
                      // the member can do nothing about.
                      disabled={busy || !r.canRedeem}
                      className="shrink-0 rounded-full bg-green-600 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
                    >
                      {r.canRedeem ? 'Claim free' : 'None left'}
                    </button>
                  </div>
                ))}
              </>
            )}

            {!loading && rewards.length > 0 && (
              <p className="pt-2 text-[11px] leading-relaxed text-gray-400">
                Points are valid for 1 year from the date they are earned and expire
                automatically. Tier 2 members must redeem 1,000 points before the expiry date
                to hold Tier 2 for the following membership year.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {vouchers.length === 0 && <EmptyState icon={Ticket} title="No vouchers yet" body="Redeem points from the catalog to see them here." />}
            {vouchers.map((v) => (
              <VoucherCard key={v.key} voucher={v} onUseNow={(voucher) => setDrawerVoucher(voucher)} />
            ))}
          </div>
        )}
      </div>

      {view === 'catalog' && cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-24 left-4 right-4 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-3.5 text-white shadow-2xl"
        >
          <div>
            <p className="text-[11px] text-gray-300">{cart.length} item{cart.length > 1 ? 's' : ''} selected</p>
            <p className="text-sm font-bold">{totalCost.toLocaleString()} pts</p>
          </div>
          <button
            onClick={redeem}
            disabled={!canAfford || busy}
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {busy ? 'Redeeming…' : canAfford ? 'Redeem Now' : 'Not Enough Points'}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {drawerVoucher && (
          <VoucherDrawer voucher={drawerVoucher} onClose={() => setDrawerVoucher(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Status is decided upstream in `normalise`, so this only has to dress it. */
const STATUS_BADGE = {
  active: 'bg-green-50 text-green-600',
  pending: 'bg-amber-50 text-amber-600',
  used: 'bg-gray-100 text-gray-400',
  expired: 'bg-red-50 text-red-500',
  rejected: 'bg-red-50 text-red-500',
};

function VoucherCard({ voucher, onUseNow }) {
  const { status } = voucher;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-3.5">
        {voucher.tenantId ? (
          <TenantAvatar tenantId={voucher.tenantId} size={40} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Ticket size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-gray-900">{voucher.title}</p>
          <p className="truncate text-[11px] text-gray-400">
            {voucher.tenantId ? `${tenantName(voucher.tenantId)} · ` : ''}Code {voucher.code}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_BADGE[status]}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-gray-100 bg-gray-50/60 px-3.5 py-2">
        <p className="flex items-center gap-1 text-[10.5px] text-gray-400">
          <Store size={11} /> Valid in-app &amp; at tenant POS
          {voucher.expiryDate ? ` · Exp ${fmtDate(voucher.expiryDate)}` : ''}
        </p>
        {status === 'active' && (
          <button onClick={() => onUseNow(voucher)} className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10.5px] font-bold text-white">
            <QrCode size={11} /> Use Now
          </button>
        )}
      </div>
    </div>
  );
}

function VoucherDrawer({ voucher, onClose }) {
  // Only the local bundle carries an expiry; a platform coupon's life is its
  // status, which the till writes when it fulfils the coupon.
  const daysLeft = voucher.expiryDate ? daysUntil(voucher.expiryDate) : null;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(voucher.code)}&bgcolor=ffffff&color=111111&margin=8`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="relative w-full max-w-md rounded-t-3xl bg-white pb-10 pt-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* handle */}
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-gray-200" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
        >
          <X size={16} />
        </button>

        <div className="px-6">
          {/* header */}
          <div className="flex items-center gap-3 mb-5">
            {voucher.tenantId ? (
              <TenantAvatar tenantId={voucher.tenantId} size={44} />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Ticket size={20} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 leading-tight">{voucher.title}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {voucher.tenantId ? tenantName(voucher.tenantId) : 'NTUC Club reward'}
              </p>
            </div>
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center rounded-2xl bg-gray-50 py-6 px-4 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Scan to redeem</p>
            <img
              src={qrUrl}
              alt="QR code"
              width={160}
              height={160}
              className="rounded-xl"
            />
            <p className="mt-4 font-mono text-sm font-bold tracking-widest text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-2">
              {voucher.code}
            </p>
          </div>

          {/* meta */}
          <div className="space-y-2.5 mb-6">
            {voucher.expiryDate && (
              <div className="flex items-center gap-2.5 text-[12.5px] text-gray-500">
                <CalendarDays size={14} className="shrink-0 text-gray-400" />
                <span>
                  Expires {fmtDate(voucher.expiryDate)}
                  {daysLeft >= 0 && daysLeft <= 30 && (
                    <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                      {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-[12.5px] text-gray-500">
              <Store size={14} className="shrink-0 text-gray-400" />
              <span>Valid in-app &amp; at tenant POS</span>
            </div>
          </div>


        </div>
      </motion.div>
    </motion.div>
  );
}
