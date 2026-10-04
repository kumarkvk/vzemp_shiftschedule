import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService, type LoginPayload, type RegisterPayload } from '@/api/services/authService';
import { userService, type ProfileUpdatePayload } from '@/api/services/userService';
import { authSession } from '@/lib/authSession';
import { reportError } from '@/lib/monitoring';
import { isAdmin } from '@/lib/utils';
import type { SessionSnapshot, UserProfile } from '@/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload & { rememberMe?: boolean }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
}

const toSnapshot = (response: { token: string; refreshToken?: string; user: UserProfile }, rememberMe: boolean): SessionSnapshot => ({
  accessToken: response.token,
  refreshToken: response.refreshToken,
  user: { ...response.user, role: response.user.role ?? 'user' },
  rememberMe,
});

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [session, setSession] = useState<SessionSnapshot | null>(() => authSession.load());
  const [isLoading, setIsLoading] = useState(false);

  const syncFromStorage = useCallback(() => {
    setSession(authSession.load());
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      authSession.clear();
      setSession(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('auth:refreshed', syncFromStorage);
    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('auth:refreshed', syncFromStorage);
    };
  }, [syncFromStorage]);

  const persistSession = useCallback((nextSession: SessionSnapshot) => {
    authSession.save(nextSession);
    setSession(nextSession);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.login(payload);
      persistSession(toSnapshot(response, payload.rememberMe ?? false));
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (payload: RegisterPayload & { rememberMe?: boolean }) => {
    setIsLoading(true);
    try {
      const { rememberMe, ...rest } = payload;
      const response = await authService.register(rest);
      persistSession(toSnapshot(response, rememberMe ?? false));
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    authSession.clear();
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session) {
      return;
    }
    try {
      const user = await userService.getProfile();
      const updated = authSession.updateUser(() => ({ ...user, role: user.role ?? session.user.role ?? 'user' }));
      if (updated) {
        setSession(updated);
      }
    } catch (error) {
      reportError(error, { area: 'refresh-profile' });
    }
  }, [session]);

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const updatedUser = await userService.updateProfile(payload);
    const updated = authSession.updateUser((current) => ({ ...current, ...updatedUser, role: updatedUser.role ?? current.role ?? 'user' }));
    if (updated) {
      setSession(updated);
    }
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(session?.accessToken),
    isAdmin: isAdmin(session?.user),
    isLoading,
    user: session?.user ?? null,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
  }), [isLoading, login, logout, refreshProfile, register, session, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
