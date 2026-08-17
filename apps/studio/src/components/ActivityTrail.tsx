import { useState } from 'react';
import type { ToolActivity } from '../api/client';

const ICONS: Record<string, string> = {
  list_tiers: '▤',
  list_categories: '▦',
  list_campaigns: '☰',
  simulate_campaign: '◎',
  create_campaign: '✦',
  set_campaign_status: '⏻',
};

/**
 * What the agent actually did this turn. Showing the tool calls matters more
 * than streaming tokens here — the marketer needs to see what was inspected
 * and what was changed.
 */
export function ActivityTrail({ activity }: { activity: ToolActivity[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="trail">
      <button className="trail-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? '▾' : '▸'} {activity.length} action{activity.length === 1 ? '' : 's'}
      </button>
      {open && (
        <ul className="trail-list">
          {activity.map((a, i) => (
            <li key={i}>
              <span className="trail-icon" aria-hidden>
                {ICONS[a.name] ?? '•'}
              </span>
              <div>
                <code className="trail-name">{a.name}</code>
                <p className="muted xs">{a.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
