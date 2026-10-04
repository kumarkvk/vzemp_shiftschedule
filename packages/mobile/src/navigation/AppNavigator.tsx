import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/hooks/useAuth';
import { MainTabs } from '@/navigation/MainTabs';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { AdminProductsScreen } from '@/screens/admin/AdminProductsScreen';
import { CartScreen } from '@/screens/cart/CartScreen';
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen';
import { PaymentScreen } from '@/screens/checkout/PaymentScreen';
import { OrderDetailScreen } from '@/screens/orders/OrderDetailScreen';
import { ProductDetailScreen } from '@/screens/products/ProductDetailScreen';
import type { AppStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Drawer = createDrawerNavigator();

function AppDrawer(): JSX.Element {
  const { isAdmin } = useAuth();

  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="MainTabs" component={MainTabs} options={{ title: 'Shop' }} />
      <Drawer.Screen name="CartShortcut" component={CartScreen} options={{ title: 'Cart' }} />
      {isAdmin ? <Drawer.Screen name="AdminDashboardShortcut" component={AdminDashboardScreen} options={{ title: 'Admin' }} /> : null}
    </Drawer.Navigator>
  );
}

export function AppNavigator(): JSX.Element {
  const { isAdmin } = useAuth();
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={AppDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product details' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order details' }} />
      {isAdmin ? <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin dashboard' }} /> : null}
      {isAdmin ? <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'Manage products' }} /> : null}
    </Stack.Navigator>
  );
}
