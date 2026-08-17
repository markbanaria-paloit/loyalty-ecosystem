import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken, setToken } from './api/client';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { RewardsPage } from './pages/RewardsPage';
import { ActivityPage } from './pages/ActivityPage';

export function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));

  if (!authed) return <LoginPage onSuccess={() => setAuthed(true)} />;

  function logout() {
    setToken(null);
    setAuthed(false);
  }

  return (
    <div className="shell">
      <Sidebar onLogout={logout} />
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
