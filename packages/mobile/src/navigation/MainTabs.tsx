import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@/constants/theme';
import { CartScreen } from '@/screens/cart/CartScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { ProductsScreen } from '@/screens/products/ProductsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ProductsTab" component={ProductsScreen} options={{ title: 'Products' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
