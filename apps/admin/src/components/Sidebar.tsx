import { NavLink } from 'react-router-dom';
import { STORE_CODE } from '../api/client';

const nav = [
  { to: '/', label: 'Dashboard', icon: '▤' },
  { to: '/members', label: 'Members', icon: '☰' },
  { to: '/rewards', label: 'Rewards', icon: '◈' },
  { to: '/activity', label: 'Activity', icon: '↻' },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark">◆</span>
        <div>
          <strong>Loyalty Cockpit</strong>
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
      </nav>
      <button className="btn ghost logout" onClick={onLogout}>
        Sign out
      </button>
    </aside>
  );
}
