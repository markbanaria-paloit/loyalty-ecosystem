import { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { getToken, setToken, PURCHASE_PLACE } from './api/client';
import ntucLogo from './assets/ntuc-club-logo.png';
import { LoginPage } from './pages/LoginPage';
import { TillPage } from './pages/TillPage';
import { CouponPage } from './pages/CouponPage';
import { TransactionsPage } from './pages/TransactionsPage';

const tabs = [
  { to: '/', label: 'Till' },
  { to: '/coupons', label: 'Coupons' },
  { to: '/transactions', label: 'Sales' },
];

export function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));

  if (!authed) return <LoginPage onSuccess={() => setAuthed(true)} />;

  return (
    <div className="pos">
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src={ntucLogo} alt="NTUC Club" />
          <div>
            <strong>Merchant Till</strong>
            <p className="muted xs">{PURCHASE_PLACE}</p>
          </div>
        </div>
        <nav className="tabs">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="btn ghost"
          onClick={() => {
            setToken(null);
            setAuthed(false);
          }}
        >
          Sign out
        </button>
      </header>

      <main className="pos-main">
        <Routes>
          <Route path="/" element={<TillPage />} />
          <Route path="/coupons" element={<CouponPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
