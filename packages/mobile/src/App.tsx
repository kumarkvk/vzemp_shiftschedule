import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';

import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { env } from '@/config/env';
import { AuthProvider } from '@/contexts/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { trackEvent } from '@/services/analytics';
import { persistor, store } from '@/store';

export default function App(): JSX.Element {
  useEffect(() => {
    trackEvent('app_opened');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <SafeAreaProvider>
              <StripeProvider publishableKey={env.stripePublishableKey}>
                <ToastProvider>
                  <StatusBar style="dark" />
                  <NetworkBanner />
                  <RootNavigator />
                </ToastProvider>
              </StripeProvider>
            </SafeAreaProvider>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
