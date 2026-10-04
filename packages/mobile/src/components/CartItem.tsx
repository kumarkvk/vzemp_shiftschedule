import { Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { colors, radius, spacing } from '@/constants/theme';
import type { CartItem as CartItemType } from '@/types';

export function CartItem({
  item,
  onIncrease,
  onDecrease,
}: {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg }}>
      <Image source={item.product.imageUrl} style={{ width: 80, height: 80, borderRadius: radius.md }} contentFit="cover" />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{item.product.name}</Text>
        <PriceDisplay amount={item.product.price * item.quantity} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Button title="-" variant="secondary" onPress={onDecrease} style={{ width: 44 }} />
          <Text style={{ minWidth: 24, textAlign: 'center', color: colors.text }}>{item.quantity}</Text>
          <Button title="+" variant="secondary" onPress={onIncrease} style={{ width: 44 }} />
        </View>
      </View>
    </View>
  );
}
