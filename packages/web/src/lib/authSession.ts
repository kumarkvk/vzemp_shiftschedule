import type { SessionSnapshot } from '@/types';

const LOCAL_KEY = 'ecommerce.session';
const SESSION_KEY = 'ecommerce.session.temp';

const parseSnapshot = (raw: string | null): SessionSnapshot | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
};

const write = (key: string, value?: SessionSnapshot): void => {
  if (value) {
    window.localStorage.removeItem(key === SESSION_KEY ? LOCAL_KEY : SESSION_KEY);
    const storage = key === LOCAL_KEY ? window.localStorage : window.sessionStorage;
    storage.setItem(key, JSON.stringify(value));
    return;
  }

  window.localStorage.removeItem(LOCAL_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
};

export const authSession = {
  load(): SessionSnapshot | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return parseSnapshot(window.localStorage.getItem(LOCAL_KEY)) ?? parseSnapshot(window.sessionStorage.getItem(SESSION_KEY));
  },
  save(snapshot: SessionSnapshot): void {
    if (typeof window === 'undefined') {
      return;
    }

    write(snapshot.rememberMe ? LOCAL_KEY : SESSION_KEY, snapshot);
  },
  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    write(LOCAL_KEY);
  },
  getAccessToken(): string | null {
    return this.load()?.accessToken ?? null;
  },
  getRefreshToken(): string | null {
    return this.load()?.refreshToken ?? null;
  },
  updateTokens(accessToken: string, refreshToken?: string): SessionSnapshot | null {
    const snapshot = this.load();
    if (!snapshot) {
      return null;
    }

    const next = {
      ...snapshot,
      accessToken,
      refreshToken: refreshToken ?? snapshot.refreshToken,
    } satisfies SessionSnapshot;
    this.save(next);
    return next;
  },
  updateUser(updater: (current: SessionSnapshot['user']) => SessionSnapshot['user']): SessionSnapshot | null {
    const snapshot = this.load();
    if (!snapshot) {
      return null;
    }

    const next = {
      ...snapshot,
      user: updater(snapshot.user),
    } satisfies SessionSnapshot;
    this.save(next);
    return next;
  },
};
