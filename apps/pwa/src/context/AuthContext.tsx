import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, getToken, setToken, type Member } from '../api/client';

interface AuthState {
  member: Member | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);

  // On boot, if we have a token, confirm it still works.
  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api
      .me()
      .then((s) =>
        setMember({
          customerId: 'me',
          email: '',
          firstName: s.firstName,
          lastName: s.lastName,
        }),
      )
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      member,
      ready,
      async login(email, password) {
        const res = await api.login(email, password);
        setToken(res.token);
        setMember(res.member);
      },
      async register(input) {
        const res = await api.register(input);
        setToken(res.token);
        setMember(res.member);
      },
      logout() {
        setToken(null);
        setMember(null);
      },
    }),
    [member, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
