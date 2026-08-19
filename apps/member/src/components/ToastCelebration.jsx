import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PartyPopper, Sparkles, RotateCcw, Gift, Bell, ParkingCircle, XCircle, Target, Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

function fire() {
  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 32,
    origin: { y: 0.3 },
    colors: ['#ee3224', '#f4c95d', '#f26f5c', '#1f7a5c'],
  });
}

function toastContent(toast) {
  switch (toast?.kind) {
    case 'welcome':
      // The figure comes from the platform, so it is only shown when there is
      // one — a programme with no enrolment award should not claim a bonus.
      return {
        icon: PartyPopper,
        title: 'Welcome to NTUC Club!',
        body: toast.earned
          ? `${toast.earned.toLocaleString()} welcome points credited${toast.tierName ? ` · ${toast.tierName}` : ''}`
          : toast.tierName
            ? `Your membership is ready · ${toast.tierName}`
            : 'Your membership is ready.',
        confetti: true,
      };
    /**
     * A goal met, and a goal finished.
     *
     * The member did the thing minutes ago and the platform scored it since, so
     * without a word the only sign is a bar that has quietly moved. The
     * completion carries a way to the reward it paid: it is sitting in their
     * vouchers, and the toast is the only moment they are looking.
     */
    case 'milestone':
      return {
        icon: Target,
        title: 'Milestone reached',
        body: toast.name ? `You're closer to finishing ${toast.name}` : 'Keep going',
        confetti: false,
      };
    case 'challenge-done':
      return {
        icon: Trophy,
        title: `${toast.name ?? 'Challenge'} complete!`,
        body: 'Your reward is in My Vouchers',
        confetti: true,
        to: '/rewards?tab=vouchers',
      };

    case 'tier-up':
      return {
        icon: Sparkles,
        title: `Welcome to ${toast.tierName}!`,
        body: 'Your membership level just went up',
        confetti: true,
      };

    case 'earn':
      return {
        icon: Sparkles,
        title: `+${toast.earned.toLocaleString()} points earned!`,
        body: toast.multiplier > 1 ? `${toast.multiplier}X applied — ${toast.reason}` : 'Added to your balance',
        confetti: toast.multiplier > 1,
      };
    case 'refund':
      return {
        icon: RotateCcw,
        title: toast.flagged ? 'Refund flagged for review' : 'Points reversed',
        body: toast.flagged
          ? `${toast.amount.toLocaleString()} pts already redeemed — sent for manual adjustment`
          : `${toast.amount.toLocaleString()} pts removed (auditable entry logged)`,
        confetti: false,
      };
    case 'redeem':
      return { icon: Gift, title: 'Redeemed!', body: `${toast.count} voucher${toast.count > 1 ? 's' : ''} added to My Vouchers`, confetti: true };
    case 'parking-issued':
      return { icon: ParkingCircle, title: 'Parking coupon requested', body: `${toast.minutes} min — collect physical coupon at Member Service counter`, confetti: false };
    case 'parking-denied':
      return { icon: XCircle, title: 'Monthly parking cap reached', body: 'Try again next month', confetti: false };
    case 'expiry-notice':
      return { icon: Bell, title: 'Points expiring soon', body: `${toast.amount.toLocaleString()} pts (${toast.desc}) expiring in 5 days`, confetti: false };
    default:
      return null;
  }
}

export default function ToastCelebration() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const content = toastContent(state.toast);

  useEffect(() => {
    if (!content) return;
    if (content.confetti) fire();
    const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.toast]);

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="safe-top fixed left-0 right-0 top-0 z-[60] flex justify-center px-3 pt-3"
        >
          <div
            role={content.to ? 'button' : undefined}
            onClick={content.to ? () => navigate(content.to) : undefined}
            className={`flex max-w-md items-start gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-xl ${
              content.to ? 'cursor-pointer active:scale-[0.99]' : ''
            }`}
          >
            <content.icon size={20} className="mt-0.5 shrink-0 text-brand-400" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">{content.title}</p>
              <p className="text-xs text-gray-300">{content.body}</p>
            </div>
            {content.to && <ChevronRight size={16} className="mt-0.5 shrink-0 text-gray-400" />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
