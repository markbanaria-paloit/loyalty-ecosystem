import { useState } from 'react';
import { ParkingCircle, Info, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ProgressBar, EmptyState } from '../components/Ui.jsx';
import { fmtDate, monthKey } from '../lib/helpers.js';

export default function Parking() {
  const { state, dispatch } = useApp();
  const tier = state.user.tier === 'tier2' ? 'tier2' : 'tier1';
  const capMinutes = state.config.parkingCapMinutes[tier];
  const used = state.parkingUsage[monthKey(new Date())] || 0;
  const remaining = Math.max(0, capMinutes - used);
  const [request, setRequest] = useState(30);

  const capped = Math.min(request, remaining || 30);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Free Parking" subtitle="Phase 1: printed coupon via loyalty channel" />

      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <ParkingCircle size={17} className="text-brand-500" /> This month's entitlement
            </p>
            <span className="text-xs font-bold text-gray-400">{tier === 'tier2' ? 'Tier 2 · 2 hrs/mo' : 'Tier 1 · 1 hr/mo'}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={used} max={capMinutes} />
            <p className="mt-1.5 text-[11px] text-gray-400">
              {Math.round(used)} of {capMinutes} minutes used this month · {remaining} min remaining
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-800">Request a parking coupon</p>
          <p className="mt-1 text-[11px] text-gray-400">Choose the duration, then collect your physical coupon at any Member Service counter.</p>
          <div className="mt-3 flex items-center gap-2">
            {[30, 60, 90, 120].map((m) => (
              <button
                key={m}
                onClick={() => setRequest(m)}
                disabled={m > (remaining || 0) && remaining > 0}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-colors ${
                  request === m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'
                } disabled:opacity-30`}
              >
                {m}min
              </button>
            ))}
          </div>
          <button
            disabled={remaining <= 0}
            onClick={() => dispatch({ type: 'REQUEST_PARKING_COUPON', payload: { minutes: capped } })}
            className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40"
          >
            {remaining <= 0 ? 'Monthly Cap Reached' : `Request ${Math.min(request, remaining)} min Coupon`}
          </button>
          {/* <p className="mt-2 flex items-start gap-1.5 text-[10.5px] text-gray-400">
            <Info size={12} className="mt-0.5 shrink-0" /> Live gantry integration lands in Phase 2 — today's coupon is fulfilled physically.
          </p> */}
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Issued coupons</p>
          {state.parkingCoupons.length === 0 && <EmptyState icon={Ticket} title="No coupons issued yet" />}
          <div className="space-y-2">
            {state.parkingCoupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-white p-3.5 shadow-sm">
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{c.minutes} min parking coupon</p>
                  <p className="text-[11px] text-gray-400">Code {c.code} · Issued {fmtDate(c.issuedDate)}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-500">Collect at counter</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
