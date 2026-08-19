import { useState, type FormEvent } from 'react';
import { api } from '../api/client';

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  // The till signs in as a till operator, not as an administrator — the
  // session it gets back cannot reach programme configuration.
  const [username, setUsername] = useState('till');
  const [password, setPassword] = useState('till');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.login(username, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="brand center-brand">
          <span className="brand-mark">▤</span>
          <strong>Loyalty POS</strong>
        </div>
        <p className="muted sm">Sign in to open the till.</p>
        <label>
          Operator
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn primary lg" disabled={busy}>
          {busy ? 'Signing in…' : 'Open till'}
        </button>
      </form>
    </div>
  );
}
