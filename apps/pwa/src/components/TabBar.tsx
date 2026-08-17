import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/rewards', label: 'Rewards', icon: '🎁' },
  { to: '/history', label: 'History', icon: '📜' },
];

export function TabBar() {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon" aria-hidden>
            {t.icon}
          </span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
