import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Ticket, Store, QrCode, X, CalendarDays, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { TenantAvatar, tenantName, EmptyState } from '../components/Ui.jsx';
import { REWARDS_CATALOG } from '../data/mockData.js';
import { daysUntil, fmtDate } from '../lib/helpers.js';

export default function Rewards() {
  const { state, redeemCart } = useApp();
  const [view, setView] = useState('catalog');
  const [cart, setCart] = useState([]);
  const [drawerVoucher, setDrawerVoucher] = useState(null);

  const totalCost = cart.reduce((s, id) => s + (REWARDS_CATALOG.find((r) => r.id === id)?.pointsCost || 0), 0);
  const canAfford = totalCost <= state.points && cart.length > 0;

  function toggle(id) {
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  function redeem() {
    const items = cart
      .map((id) => REWARDS_CATALOG.find((r) => r.id === id))
      .filter(Boolean);
    const description =
      items.length > 1 ? `Redeemed ${items.length} rewards` : `Redeemed: ${items[0]?.title}`;
    // Issues the vouchers locally and debits the real balance via the BFF.
    redeemCart(cart, totalCost, description);
    setCart([]);
    setView('vouchers');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title="Rewards" subtitle={`${state.points.toLocaleString()} pts available`} back={false} />

      <div className="px-5 pt-4">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {[
            { id: 'catalog', label: 'Catalog' },
            { id: 'vouchers', label: `My Vouchers (${state.vouchers.filter((v) => v.status === 'active').length})` },
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

        {view === 'catalog' ? (
          <div className="mt-4 space-y-3">
            <p className="text-[11px] text-gray-400">Tip: select multiple rewards to redeem together in one go.</p>
            {REWARDS_CATALOG.map((r) => {
              const selected = cart.includes(r.id);
              return (
                <div key={r.id} className={`flex items-center gap-3 rounded-2xl border p-3.5 shadow-sm ${selected ? 'border-brand-400 bg-brand-50/40' : 'border-gray-100 bg-white'}`}>
                  <TenantAvatar tenantId={r.tenantId} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-gray-900">{r.title}</p>
                    <p className="truncate text-[11px] text-gray-400">{r.description}</p>
                    <p className="mt-1 text-xs font-bold text-brand-600">{r.pointsCost.toLocaleString()} pts</p>
                  </div>
                  <button
                    onClick={() => toggle(r.id)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                      selected ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {selected ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {state.vouchers.length === 0 && <EmptyState icon={Ticket} title="No vouchers yet" body="Redeem points from the catalog to see them here." />}
            {state.vouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v} onUseNow={(voucher) => setDrawerVoucher(voucher)} />
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
            disabled={!canAfford}
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {canAfford ? 'Redeem Now' : 'Not Enough Points'}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {drawerVoucher && (
          <VoucherDrawer
            voucher={drawerVoucher}
            onClose={() => setDrawerVoucher(null)}
            onMarkUsed={() => {
              dispatch({ type: 'USE_VOUCHER', payload: { voucherId: drawerVoucher.id } });
              setDrawerVoucher(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function VoucherCard({ voucher, onUseNow }) {
  const expired = daysUntil(voucher.expiryDate) < 0;
  const status = voucher.status === 'used' ? 'used' : expired ? 'expired' : 'active';
  const badge = {
    active: 'bg-green-50 text-green-600',
    used: 'bg-gray-100 text-gray-400',
    expired: 'bg-red-50 text-red-500',
  }[status];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-3.5">
        <TenantAvatar tenantId={voucher.tenantId} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-gray-900">{voucher.title}</p>
          <p className="text-[11px] text-gray-400">{tenantName(voucher.tenantId)} · Code {voucher.code}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${badge}`}>{status}</span>
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-gray-100 bg-gray-50/60 px-3.5 py-2">
        <p className="flex items-center gap-1 text-[10.5px] text-gray-400">
          <Store size={11} /> Valid in-app &amp; at tenant POS · Exp {fmtDate(voucher.expiryDate)}
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

function VoucherDrawer({ voucher, onClose, onMarkUsed }) {
  const daysLeft = daysUntil(voucher.expiryDate);
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
            <TenantAvatar tenantId={voucher.tenantId} size={44} />
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 leading-tight">{voucher.title}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{tenantName(voucher.tenantId)}</p>
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
