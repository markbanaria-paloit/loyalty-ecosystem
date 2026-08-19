import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { qrPayloadFor } from '../lib/loyalty.js';
import PageHeader from '../components/PageHeader.jsx';
import { TierBadge } from '../components/Ui.jsx';
import TierProgressCard from '../components/TierProgress.jsx';

export default function DigitalCard() {
  const { state, loyaltySync, syncMember } = useApp();
  const { user } = state;
  const [fullscreen, setFullscreen] = useState(false);
  // Read the card off state — this is the value registered with OpenLoyalty.
  // Recomputing it here would risk drifting from what the till matches on.
  const memberId = user.loyaltyCardNumber;
  const qrValue = qrPayloadFor(memberId);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Digital Membership Card" subtitle="Present this at checkout to earn & redeem" />

      <div className="px-5 pt-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-6 text-white shadow-xl shadow-brand-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-white/70">NTUC Club Member</p>
              <p className="mt-0.5 text-lg font-extrabold">{user.name}</p>
            </div>
            <TierBadge tier={user.tier} label={user.tierName} className="!bg-white/20" />
          </div>

          <div className="mt-5 flex justify-center rounded-2xl bg-white p-4">
            <QRCodeSVG value={qrValue} size={168} fgColor="#1a1a1a" bgColor="#ffffff" />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <div>
              <p className="text-white/60">Member ID</p>
              <p className="font-mono font-bold tracking-wide">{memberId}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60">Member since</p>
              <p className="font-semibold">{new Date(user.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>


        {/* The same platform-reported tier progress the home screen shows —
          * repeated here because the card is where a member checks their
          * standing on the way to a till. */}
        <div className="mt-3">
          <TierProgressCard progress={state.tierProgress} />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">How it works at the counter</p>
          <ol className="mt-2 space-y-1.5 text-[12px] text-gray-500">
            <li>1. Present this QR to the cashier at checkout.</li>
            <li>2. Tenant scans it with their NTUC Club scanner/app.</li>
            <li>3. Your qualifying spend is captured &amp; points credited instantly.</li>
          </ol>
        </div>

        <LoyaltyLink sync={loyaltySync} onRetry={syncMember} />
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8"
            onClick={() => setFullscreen(false)}
          >
            <button className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
            <QRCodeSVG value={qrValue} size={260} fgColor="#1a1a1a" bgColor="#ffffff" />
            <p className="mt-6 font-mono text-lg font-bold tracking-widest text-gray-800">{memberId}</p>
            <p className="mt-1 text-sm text-gray-400">{user.name}</p>
            <p className="mt-8 text-xs text-gray-300">Tap anywhere to close</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Whether this card is live on the loyalty engine. Worth surfacing: the QR is
 * only scannable if OpenLoyalty holds a member carrying this card number.
 */
function LoyaltyLink({ sync, onRetry }) {
  const copy = {
    idle: { dot: 'bg-gray-300', text: 'Not linked yet' },
    syncing: { dot: 'bg-amber-400 animate-pulse', text: 'Linking to loyalty engine…' },
    linked: { dot: 'bg-green-500', text: 'Linked to loyalty engine' },
    error: { dot: 'bg-red-500', text: 'Could not reach the loyalty engine' },
  }[sync?.status ?? 'idle'];

  return (
    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[12px] text-gray-500">
      <span className={`h-2 w-2 shrink-0 rounded-full ${copy.dot}`} />
      <span className="flex-1">{copy.text}</span>
      {sync?.status === 'error' && (
        <button onClick={onRetry} className="font-semibold text-brand-600">
          Retry
        </button>
      )}
    </div>
  );
}
