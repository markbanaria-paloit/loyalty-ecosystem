import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import ToastCelebration from './components/ToastCelebration.jsx';
import BottomNav from './components/BottomNav.jsx';
import StatusBar from './components/StatusBar.jsx';
import { QrCode } from 'lucide-react';
import SignIn from './pages/SignIn.jsx';
import Personas from './pages/Personas.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import DigitalCard from './pages/DigitalCard.jsx';
import ScanEarn from './pages/ScanEarn.jsx';
import ScanConfirm from './pages/ScanConfirm.jsx';
import PointsLedger from './pages/PointsLedger.jsx';
import Rewards from './pages/Rewards.jsx';
import Promotions from './pages/Promotions.jsx';
import Parking from './pages/Parking.jsx';
import Profile from './pages/Profile.jsx';

function RequireAuth() {
  const { state } = useApp();
  // The persona picker is the way in: it decides which of the four programme
  // paths this session demonstrates before any sign-in happens.
  if (!state.user) return <Navigate to="/personas" replace />;
  return <Outlet />;
}

function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 pb-16 pt-11">
      <Outlet />
      <BottomNav />
      {pathname === '/' && (
        <Link
          to="/card"
          className="fixed bottom-20 right-4 z-30 flex flex-col items-center gap-1 rounded-2xl bg-brand-500/80 px-4 py-3 text-white shadow-lg shadow-brand-500/30 active:scale-95"
        >
          <QrCode size={22} />
          <span className="text-[10px] font-semibold">My Card</span>
        </Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <StatusBar />
        <ToastCelebration />
        <Routes>
          <Route path="/personas" element={<Personas />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/card" element={<DigitalCard />} />
              <Route path="/scan" element={<ScanEarn />} />
              <Route path="/scan/confirm" element={<ScanConfirm />} />
              <Route path="/ledger" element={<PointsLedger />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/parking" element={<Parking />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

