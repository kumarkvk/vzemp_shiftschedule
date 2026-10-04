import { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { CartItem } from '@/components/CartItem';
import { Button } from '@/components/ui/Button';
import { ListEmptyComponent } from '@/components/ui/ListEmptyComponent';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { colors, radius, spacing } from '@/constants/theme';
import { useCart } from '@/hooks/useCart';

export function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, subtotal, refreshCart, removeItem, updateItem } = useCart();

  useEffect(() => { void refreshCart(); }, [refreshCart]);

  if (!items.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background, gap: spacing.lg }}>
        <ListEmptyComponent title="Your cart is empty" description="Browse products and add something you love." />
        <View style={{ paddingHorizontal: spacing.lg }}><Button title="Continue shopping" onPress={() => navigation.navigate('ProductsTab')} /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.md, gap: spacing.md, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => <SwipeableRow onDelete={() => void removeItem(item.id)}><CartItem item={item} onIncrease={() => void updateItem(item.id, item.quantity + 1)} onDecrease={() => void updateItem(item.id, Math.max(1, item.quantity - 1))} /></SwipeableRow>}
      />
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><PriceDisplay amount={subtotal} /><PriceDisplay amount={subtotal * 0.08} /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><PriceDisplay amount={subtotal * 1.08} /><Button title="Checkout" onPress={() => navigation.navigate('Checkout')} testID="checkout-button" /></View>
      </View>
    </View>
  );
}
