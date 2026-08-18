import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { TenantAvatar, tenantName, TierBadge, EmptyState } from '../components/Ui.jsx';
import { PROMOTIONS } from '../data/mockData.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'all-members', label: 'All Members' },
  { id: 'tier2', label: 'Tier 2 Exclusive' },
];

export default function Promotions() {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');

  const list = PROMOTIONS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'all-members') return p.audience === 'all';
    return p.audience === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Promotions" subtitle="Member-only deals, curated for you" back={false} />

      <div className="px-5 pt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                filter === f.id ? 'bg-brand-600 text-white' : 'bg-white text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {list.length === 0 && <EmptyState icon={Megaphone} title="No promotions in this filter" />}
          {list.map((p) => {
            const locked = p.audience === 'tier2' && state.user.tier !== 'tier2';
            return (
              <div key={p.id} className={`overflow-hidden rounded-2xl border shadow-sm ${locked ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-100 bg-white'}`}>
                {p.image && (
                  <img src={p.image} alt={p.title} className="h-[160px] w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.audience === 'tier2' ? 'bg-gold-500/15 text-gold-600' : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    {p.tag}
                  </span>

                </div>
                <p className="mt-2 text-sm font-bold text-gray-900">{p.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{p.body}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TenantAvatar tenantId={p.tenantId} size={22} />
                    <span className="text-[11px] font-medium text-gray-500">{tenantName(p.tenantId)}</span>
                  </div>
                  {locked && (
                    <span className="text-[10.5px] font-semibold text-gray-400">Tier 2 members only</span>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
