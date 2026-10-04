import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  tone?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    timers.current[id] = window.setTimeout(() => {
      dismissToast(id);
    }, 5000);
  }, [dismissToast]);

  useEffect(() => () => {
    Object.values(timers.current).forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toasts, addToast, dismissToast }), [addToast, dismissToast, toasts]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
