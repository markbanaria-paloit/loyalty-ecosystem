import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import singpassLogo from '../assets/icons/singpass-logo.svg';
import ntucLogo from '../assets/icons/ntuc-club-logo.png';
import heroBg from '../assets/1024x682_147e6d56d-aacc-428a-8f7e-9d0a713ea3b2.jpg';

const GoogleG = (props) => (
  <svg viewBox="0 0 24 24" width={20} height={20} {...props}>
    <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.48a5.54 5.54 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.56-5.17 3.56-8.68z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.96-2.9l-3.88-3.02c-1.08.73-2.46 1.16-4.08 1.16-3.14 0-5.8-2.12-6.75-4.96H1.24v3.11A11.996 11.996 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.25 14.28A7.2 7.2 0 0 1 4.86 12c0-.79.14-1.56.39-2.28V6.61H1.24A11.996 11.996 0 0 0 0 12c0 1.94.46 3.77 1.24 5.39l4.01-3.11z" />
    <path fill="#EA4335" d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.24 6.61l4.01 3.11C6.2 6.88 8.86 4.76 12 4.76z" />
  </svg>
);
const AppleLogo = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" width={20} height={20} fill="currentColor" {...props}>
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
  </svg>
);

const authMethods = [
  { id: 'google', label: 'Continue with Google', icon: GoogleG },
  { id: 'apple', label: 'Continue with Apple', icon: AppleLogo },
  { id: 'email', label: 'Continue with Email', icon: Mail },
];

const MYINFO_FIELDS = ['Full name', 'Date of birth', 'Mobile number', 'Email address (if available)'];

export default function SignIn() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null); // 'singpass-loading' | 'myinfo-consent' | 'singpass-verifying' | 'google' | 'apple' | 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  /**
   * Which customer type this sign-up enrols as, chosen on the persona picker.
   *
   * Union membership would come from MyInfo in production. Here it is carried
   * in the URL, sent to the loyalty platform as a member label, and the tier
   * and welcome award that follow are decided there — not by this screen.
   */
  const [params] = useSearchParams();
  const customerType = params.get('type') === 'public' ? 'public' : 'union';

  /**
   * Hold the sign-in spinner until the loyalty platform has settled the member.
   *
   * The screen after this one shows a balance and a tier, so enrolment, tier
   * assignment and the welcome award all have to be resolved before we navigate
   * — otherwise it renders zero points and no tier while the request is still
   * in flight.
   */
  async function finishSignIn(method, profile) {
    setSheet('enrolling');
    await signIn(method, { ...profile, isNtucMember: customerType === 'union' });
    navigate('/onboarding');
  }

  function startMethod(id) {
    if (id === 'singpass') {
      setSheet('singpass-loading');
      setTimeout(() => setSheet('myinfo-consent'), 1100);
    } else if (id === 'google') {
      setSheet('google');
      setTimeout(() => finishSignIn('google', { name: 'Alex Tan', email: 'alex.tan@gmail.com' }), 1200);
    } else if (id === 'apple') {
      setSheet('apple');
      setTimeout(() => finishSignIn('apple', { name: 'Alex Tan', email: 'alex.tan@icloud.com' }), 1200);
    } else if (id === 'email') {
      setSheet('email');
    }
  }

  function authoriseSingpass() {
    setSheet('singpass-verifying');
    setTimeout(() => finishSignIn('singpass', { name: 'Alex Tan Wei Ming', maskedNric: 'S****123A' }), 1000);
  }

  function sendOtp(e) {
    e.preventDefault();
    setSheet('otp');
  }

  function verifyOtp(e) {
    e.preventDefault();
    const namePart = email.split('@')[0] || 'Member';
    finishSignIn('email', { name: namePart.charAt(0).toUpperCase() + namePart.slice(1), email });
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden pt-11">
      {/* Background photo */}
      <img src={heroBg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-right" />
      {/* Colorful gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-500/50 via-brand-600/60 to-brand-800/90" />
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/25 via-transparent to-cyan-300/20" />

      <div className="relative z-10 flex flex-1 flex-col px-6 pt-16">
        <div className="flex justify-center">
          <img src={ntucLogo} alt="NTUC Club" className="h-12 w-auto" />
        </div>

        <div className="mt-14 text-center">
          <h1 className="text-4xl font-bold leading-tight text-white" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.01em' }}>Every purchase,{'\n'}<em>rewarded</em></h1>
          <p className="mt-2 max-w-xs text-lg text-white/85 mx-auto">
            Earn points at 1,000+ participating tenants, unlock member-only deals, and redeem vouchers — all in one card.
          </p>
        </div>

        <div className="mt-auto mb-10 flex flex-col gap-3 pt-10">
          {/* Styled per the official Singpass button guidelines: white-filled, #C8C9CC border,
              #F5F5F7 hover, Poppins Bold "Log in" label, logo sized to the label's visual weight. */}
          <button
            onClick={() => startMethod('singpass')}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#C8C9CC] bg-white px-4 py-3.5 shadow-lg transition-transform hover:bg-[#F5F5F7] active:scale-[0.98] active:bg-[#F5F5F7]"
          >
            <span className="font-poppins text-[16px] font-bold leading-none text-gray-900">Log in with</span>
            <div className="pt-[5px]"><img src={singpassLogo} alt="Sing pass" className="h-4 w-auto shrink-0" /></div>
          </button>

          {authMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => startMethod(m.id)}
              className="flex items-center justify-center gap-3 rounded-2xl bg-white/95 px-4 py-3.5 text-[15px] font-semibold text-gray-800 shadow-lg transition-transform active:scale-[0.98]"
            >
              <m.icon />
              <span className="leading-none">{m.label}</span>
            </button>
          ))}
          <p className="mt-2 text-center text-[11px] leading-relaxed text-white/70">
            By continuing you agree to the Membership Terms &amp; PDPA Privacy Notice.
            <br />New here? Signing in creates your free membership instantly.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {sheet === 'myinfo-consent' && (
          <MyInfoConsentPage onAuthorise={authoriseSingpass} onCancel={() => setSheet(null)} />
        )}
        {sheet && sheet !== 'myinfo-consent' && (
          <Sheet onClose={() => setSheet(null)} dismissible={sheet === 'email' || sheet === 'otp'}>
            {sheet === 'enrolling' && <Spinner label="Setting up your membership…" />}
            {sheet === 'singpass-loading' && <Spinner label="Redirecting to Singpass…" />}
            {sheet === 'singpass-verifying' && <Spinner label="Verifying your identity…" />}
            {sheet === 'google' && <Spinner label="Signing in with Google…" />}
            {sheet === 'apple' && <Spinner label="Signing in with Apple…" />}
            {sheet === 'email' && <EmailForm email={email} setEmail={setEmail} onSubmit={sendOtp} />}
            {sheet === 'otp' && <OtpForm otp={otp} setOtp={setOtp} email={email} onSubmit={verifyOtp} />}
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sheet({ children, onClose, dismissible }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-white pt-11"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
    >
      {dismissible && (
        <div className="flex items-center border-b border-gray-100 px-4 py-4">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
      )}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        {children}
      </div>
    </motion.div>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader2 size={32} className="animate-spin text-brand-500" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

function MyInfoConsentPage({ onAuthorise, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-white pt-11"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center border-b border-gray-100 px-4 py-4">
        <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <X size={18} />
        </button>
        <p className="ml-3 text-base font-semibold text-gray-900">Data Access Request</p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-8 pb-10">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={singpassLogo} alt="Singpass" className="h-6 w-auto" />
          <div>
            <p className="text-base font-bold text-gray-900">SingPass MyInfo</p>
            <p className="text-xs text-gray-400">NTUC Club is requesting the following</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-gray-50 p-5">
          {MYINFO_FIELDS.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 size={18} className="shrink-0 text-green-500" />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          Only fields necessary for enrolment and programme administration are retrieved.
        </p>

        <div className="mt-auto pt-10 flex flex-col gap-3">
          <button onClick={onAuthorise} className="w-full rounded-2xl bg-brand-600 py-4 text-sm font-bold text-white active:scale-[0.98]">
            Authorise &amp; Continue
          </button>
          <button onClick={onCancel} className="w-full rounded-2xl py-3.5 text-sm font-semibold text-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmailForm({ email, setEmail, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <p className="mb-1 text-xl font-bold text-gray-900">Continue with Email</p>
      <p className="mb-6 text-sm text-gray-400">We'll send a one-time code to verify it's you.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400"
      />
      <button type="submit" className="mt-4 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white active:scale-[0.98]">
        Send OTP
      </button>
    </form>
  );
}

function OtpForm({ otp, setOtp, email, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <p className="mb-1 text-xl font-bold text-gray-900">Enter OTP</p>
      <p className="mb-6 text-sm text-gray-400">
        Sent to <span className="font-semibold text-gray-600">{email || 'your email'}</span> · Demo code:{' '}
        <span className="font-mono font-semibold text-brand-600">123456</span>
      </p>
      <input
        inputMode="numeric"
        maxLength={6}
        required
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        placeholder="••••••"
        className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-brand-400"
      />
      <button type="submit" className="mt-4 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white active:scale-[0.98]">
        Verify &amp; Continue
      </button>
    </form>
  );
}


