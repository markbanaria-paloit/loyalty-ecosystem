import { NavLink } from 'react-router-dom';
import { STORE_CODE } from '../api/client';

const nav = [
  { to: '/', label: 'Dashboard', icon: '▤' },
  { to: '/members', label: 'Members', icon: '☰' },
  { to: '/activity', label: 'Activity', icon: '↻' },
];

/** Programme configuration, kept apart from the day-to-day operational views. */
const configNav = [
  { to: '/tiers', label: 'Tiers', icon: '♛' },
  { to: '/campaigns', label: 'Campaigns', icon: '◎' },
  { to: '/rewards', label: 'Rewards', icon: '◈' },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark">◆</span>
        <div>
          <strong>Campaign Admin</strong>
          <p className="muted xs">store: {STORE_CODE}</p>
        </div>
      </div>
      <nav>
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon" aria-hidden>
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
        <p className="nav-group">Configuration</p>
        {configNav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon" aria-hidden>
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <button className="btn ghost logout" onClick={onLogout}>
        Sign out
      </button>
    </aside>
  );
}
