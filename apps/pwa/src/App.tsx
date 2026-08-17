import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RewardsPage } from './pages/RewardsPage';
import { HistoryPage } from './pages/HistoryPage';
import { TabBar } from './components/TabBar';
import type { ReactNode } from 'react';

function Protected({ children }: { children: ReactNode }) {
  const { member, ready } = useAuth();
  if (!ready) return <div className="center muted">Loading…</div>;
  if (!member) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <main className="content">{children}</main>
      <TabBar />
    </div>
  );
}

export function App() {
  const { member } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={member ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/rewards"
        element={
          <Protected>
            <RewardsPage />
          </Protected>
        }
      />
      <Route
        path="/history"
        element={
          <Protected>
            <HistoryPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
