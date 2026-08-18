import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Cake, Zap, RotateCcw, ChevronDown, Settings2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { TierBadge } from '../components/Ui.jsx';
import { TIER_INFO } from '../data/mockData.js';
import { fmtDate } from '../lib/helpers.js';

const CONSENT_CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'push', label: 'Push notifications' },
  { id: 'mail', label: 'Postal mail' },
];

export default function Profile() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const { user } = state;
  // The tier may not have resolved yet (or at all, if the platform is down),
  // so presentation falls back to the entry tier rather than throwing.
  const tierInfo = TIER_INFO[user?.tier] ?? TIER_INFO.tier1;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Profile" back={false} />

      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-extrabold text-brand-600">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold text-gray-900">{user.name}</p>
              <p className="truncate text-xs text-gray-400">{user.email || user.maskedNric || 'Verified via ' + user.method}</p>
            </div>
            <TierBadge tier={user.tier} label={user.tierName} />
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-[11px] text-gray-400">
            <ShieldCheck size={13} /> Signed in via {labelForMethod(user.method)} · Member since {fmtDate(user.joinDate)}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-800">{user.tierName || tierInfo.label} Perks</p>
          <ul className="mt-2 space-y-1.5">
            {tierInfo.perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-[12.5px] text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-800">Marketing Consent</p>
          <p className="mt-0.5 text-[11px] text-gray-400">Manage how NTUC Club reaches you, per PDPA &amp; the Do Not Call Registry.</p>
          <div className="mt-3 space-y-3">
            {CONSENT_CHANNELS.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-[13px] text-gray-700">{c.label}</span>
                <Toggle checked={state.consent[c.id]} onChange={(v) => dispatch({ type: 'UPDATE_CONSENT', payload: { channel: c.id, value: v } })} />
              </div>
            ))}
          </div>
        </div>



        <button
          onClick={() => {
            dispatch({ type: 'SIGN_OUT' });
            // Back to the picker, so the next session can take a different path.
            navigate('/personas');
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3.5 text-sm font-bold text-gray-500 active:bg-gray-50"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { state, dispatch } = useApp();
  const cfg = state.config;

  return (
    <div className="mt-2 space-y-3 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
      <p className="text-[10.5px] leading-relaxed text-gray-400">
        These illustrate rules an administrator can tune without redevelopment (earn rate, multipliers, expiry). Changes apply instantly to Scan &amp; Earn / Ledger.
      </p>

      <Row label="Earn rate ($1 spend = N pts)">
        <NumberStepper value={cfg.earnRate} step={0.5} min={0.5} onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { earnRate: v } })} />
      </Row>

      <Row label="Points expiry (months)">
        <NumberStepper value={cfg.pointsExpiryMonths} step={1} min={1} onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { pointsExpiryMonths: v } })} />
      </Row>

      <Row label="Voucher expiry (months)">
        <NumberStepper value={cfg.voucherExpiryMonths} step={1} min={1} onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { voucherExpiryMonths: v } })} />
      </Row>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1.5 text-[13px] text-gray-700">
          <Zap size={14} className="text-brand-500" /> {cfg.campaign.label}
        </span>
        <Toggle checked={cfg.campaign.active} onChange={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { campaign: { ...cfg.campaign, active: v } } })} />
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] text-gray-700">
          <Cake size={14} className="text-gold-600" /> Simulate "It's my birthday month"
        </span>
        <Toggle checked={state.demoBirthdayMode} onChange={() => dispatch({ type: 'TOGGLE_DEMO_BIRTHDAY' })} />
      </div>

      <button
        onClick={() => {
          if (confirm('Reset all demo data (points, vouchers, activity) and sign out?')) {
            dispatch({ type: 'RESET_DEMO' });
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-xs font-bold text-gray-500"
      >
        <RotateCcw size={13} /> Reset Demo Data
      </button>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-gray-700">{label}</span>
      {children}
    </div>
  );
}

function NumberStepper({ value, step, min, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-1">
      <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} className="h-7 w-7 text-sm font-bold text-gray-500">
        −
      </button>
      <span className="w-10 text-center text-xs font-bold text-gray-800">{value}</span>
      <button onClick={() => onChange(+(value + step).toFixed(2))} className="h-7 w-7 text-sm font-bold text-gray-500">
        +
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function labelForMethod(m) {
  return { singpass: 'Singpass', google: 'Google', apple: 'Apple', email: 'Email' }[m] || m;
}
