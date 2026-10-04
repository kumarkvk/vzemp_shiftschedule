import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { colors, radius, spacing } from '@/constants/theme';
import type { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';

function ProductCardComponent({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, flex: 1 }}>
      <Image source={product.imageUrl} style={{ height: 150, borderRadius: radius.md }} contentFit="cover" transition={150} />
      <Text numberOfLines={2} style={{ color: colors.text, fontWeight: '700' }}>{product.name}</Text>
      <Text numberOfLines={2} style={{ color: colors.textMuted }}>{product.description}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <PriceDisplay amount={product.price} />
        {product.inventory > 0 ? <Badge label="In stock" tone="success" /> : <Badge label="Sold out" tone="danger" />}
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);
