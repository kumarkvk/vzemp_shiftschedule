import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as authService from '@/services/api/authService';
import { registerUnauthorizedHandler } from '@/services/api/client';
import type { RootState } from '@/store';
import { clearAuthState, hydrateAuthState, setAuthUser } from '@/store/slices/authSlice';
import { clearCartState } from '@/store/slices/cartSlice';
import type { AuthSession } from '@/types';
import { clearSecureSession, getSecureSession, saveSecureSession } from '@/utils/storage';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: RootState['auth']['user'];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (session: AuthSession) => {
    await saveSecureSession(session);
    dispatch(setAuthUser(session.user));
  }, [dispatch]);

  const restoreSession = useCallback(async () => {
    try {
      const session = await getSecureSession();
      dispatch(hydrateAuthState(session?.user ?? null));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void restoreSession();
    registerUnauthorizedHandler(() => {
      void clearSecureSession();
      dispatch(clearAuthState());
    });
  }, [dispatch, restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login({ email, password });
    await applySession(session);
  }, [applySession]);

  const register = useCallback(async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
    const session = await authService.register(payload);
    await applySession(session);
  }, [applySession]);

  const logout = useCallback(async () => {
    await clearSecureSession();
    dispatch(clearAuthState());
    dispatch(clearCartState());
  }, [dispatch]);

  const value = useMemo<AuthContextValue>(() => ({
    isLoading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isAdmin: auth.user?.role === 'admin',
    login,
    register,
    logout,
    restoreSession,
  }), [auth.isAuthenticated, auth.user, isLoading, login, logout, register, restoreSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
