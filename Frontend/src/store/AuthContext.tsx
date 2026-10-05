import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { login, register } from '../api/auth.api';
import { setApiAuthToken } from '../api/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'thefeeds.auth';

const readStoredSession = (): AuthResponse | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthResponse;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = readStoredSession();
    if (stored) {
      setApiAuthToken(stored.token);
      return stored.user;
    }
    return null;
  });

  const acceptSession = (session: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setApiAuthToken(session.token);
    setUser(session.user);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiAuthToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isEditor: user?.role === 'editor' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    signIn: async (credentials) => acceptSession(await login(credentials)),
    signUp: async (credentials) => acceptSession(await register(credentials)),
    signOut,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};