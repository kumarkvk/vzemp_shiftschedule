import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Loading } from '@/components/ui/Loading';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { colors, radius, spacing } from '@/constants/theme';
import { useCart } from '@/hooks/useCart';
import * as productService from '@/services/api/productService';
import type { Product } from '@/types';

export function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void productService.getProduct(route.params.productId).then(setProduct).finally(() => setLoading(false));
  }, [route.params.productId]);

  const gallery = useMemo(() => product?.images?.length ? product.images : product ? [product.imageUrl] : [], [product]);

  if (loading || !product) {
    return <Loading label="Loading product details" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title={product.name} subtitle={product.category.name} />
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {gallery.map((imageUrl) => <Image key={imageUrl} source={imageUrl} style={{ width: 300, height: 280, borderRadius: radius.lg, marginRight: spacing.md }} contentFit="cover" />)}
      </ScrollView>
      <PriceDisplay amount={product.price} style={{ fontSize: 28 }} />
      <Text style={{ color: colors.textMuted }}>{product.description}</Text>
      <Text style={{ color: colors.text }}>Rating: {product.rating ?? 0} / 5</Text>
      <Text style={{ color: product.inventory > 0 ? colors.success : colors.danger, fontWeight: '700' }}>{product.inventory > 0 ? `${product.inventory} items available` : 'Out of stock'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Button title="-" variant="secondary" onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={{ width: 48 }} />
        <Text style={{ minWidth: 40, textAlign: 'center', color: colors.text, fontWeight: '700' }}>{quantity}</Text>
        <Button title="+" variant="secondary" onPress={() => setQuantity((value) => value + 1)} style={{ width: 48 }} />
      </View>
      <Button title="Add to cart" onPress={() => void addItem(product.id, quantity)} testID="add-to-cart-button" />
      <Button title="Checkout now" variant="secondary" onPress={() => navigation.navigate('Checkout')} />
      <Pressable onPress={() => Share.share({ message: `${product.name} - ${product.description}` })}><Text style={{ color: colors.primary, fontWeight: '700' }}>Share product</Text></Pressable>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Reviews</Text>
        {(product.reviews ?? []).map((review) => <View key={review.id} style={{ backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md }}><Text style={{ color: colors.text, fontWeight: '700' }}>{review.authorName}</Text><Text style={{ color: colors.textMuted }}>Rating: {review.rating}/5</Text><Text style={{ color: colors.text }}>{review.comment}</Text></View>)}
      </View>
    </ScrollView>
  );
}
