import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from '@/types/navigation';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'ecommerceaks://', 'https://mobile.ecommerceaks.app'],
  config: {
    screens: {
      Splash: 'splash',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      App: {
        screens: {
          MainTabs: {
            screens: {
              HomeTab: 'home',
              ProductsTab: 'products',
              CartTab: 'cart',
              OrdersTab: 'orders',
              ProfileTab: 'profile',
            },
          },
          ProductDetail: 'products/:productId',
          Checkout: 'checkout',
          Payment: 'payment/:orderId',
          OrderDetail: 'orders/:orderId',
          AdminDashboard: 'admin',
          AdminProducts: 'admin/products',
        },
      },
    },
  },
};
