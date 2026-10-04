import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

const ToastContext = createContext<{ showToast: (message: string) => void } | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState('');

  const showToast = useCallback((value: string) => {
    setMessage(value);
    setTimeout(() => setMessage(''), 2800);
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {message ? (
        <View style={{ position: 'absolute', bottom: spacing.xl, left: spacing.lg, right: spacing.lg, backgroundColor: colors.text, padding: spacing.md, borderRadius: radius.md }}>
          <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>{message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
