import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { login, register } from '../api/auth.api';
import { setApiAuthToken } from '../api/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const acceptSession = (session: AuthResponse) => {
    setApiAuthToken(session.token);
    setUser(session.user);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    signIn: async (credentials) => acceptSession(await login(credentials)),
    signUp: async (credentials) => acceptSession(await register(credentials)),
    signOut: () => {
      setApiAuthToken(null);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
