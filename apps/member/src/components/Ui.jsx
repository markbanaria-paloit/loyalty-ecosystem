import { Crown } from 'lucide-react';
import { TENANTS, TIER_INFO } from '../data/mockData.js';

export function TenantAvatar({ tenantId, size = 40 }) {
  const t = TENANTS.find((x) => x.id === tenantId);
  if (!t) return null;
  if (t.logo) {
    return (
      <img
        src={t.logo}
        alt={t.name}
        className="shrink-0 rounded-xl object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl font-bold text-white"
      style={{ background: t.color, width: size, height: size, fontSize: size * 0.34 }}
    >
      {t.initials}
    </div>
  );
}

export function tenantName(tenantId) {
  return TENANTS.find((t) => t.id === tenantId)?.name || 'Participating Tenant';
}

/**
 * `tier` selects the visual treatment (app-side presentation); `label` is the
 * tier's name as the loyalty platform reports it and wins when present, so a
 * tier renamed in the console shows through without a code change here.
 */
export function TierBadge({ tier, label, className = '' }) {
  const info = TIER_INFO[tier] || TIER_INFO.tier1;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide text-white ${className}`}
      style={{ background: info.color }}
    >
      <Crown size={13} strokeWidth={2.5} />
      {label || info.name}
    </span>
  );
}

export function ProgressBar({ value, max, colorClass = 'bg-brand-500' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-gray-900">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-10 text-center">
      {Icon && <Icon size={30} className="mb-3 text-gray-300" />}
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {body && <p className="mt-1 text-xs text-gray-400">{body}</p>}
    </div>
  );
}
