import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Loading } from '@/components/ui/Loading';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { colors, radius, spacing } from '@/constants/theme';
import * as orderService from '@/services/api/orderService';
import type { Order } from '@/types';
import { formatDate } from '@/utils/format';

export function OrderDetailScreen() {
  const route = useRoute<any>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    void orderService.getOrder(route.params.orderId).then(setOrder);
  }, [route.params.orderId]);

  if (!order) {
    return <Loading label="Loading order" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title={`Order #${order.id.slice(0, 8)}`} subtitle={formatDate(order.createdAt)} />
      <Badge label={order.status} tone={order.status === 'delivered' ? 'success' : 'warning'} />
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Shipping address</Text>
        <Text style={{ color: colors.textMuted }}>{order.shippingAddress.street}</Text>
        <Text style={{ color: colors.textMuted }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</Text>
        <Text style={{ color: colors.textMuted }}>{order.shippingAddress.country}</Text>
      </View>
      {order.items.map((item) => (
        <View key={item.id} style={{ flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }}>
          <Image source={item.product.imageUrl} style={{ width: 72, height: 72, borderRadius: radius.md }} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{item.product.name}</Text>
            <Text style={{ color: colors.textMuted }}>Qty {item.quantity}</Text>
            <PriceDisplay amount={item.product.price * item.quantity} />
          </View>
        </View>
      ))}
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Total breakdown</Text>
        <PriceDisplay amount={order.totalAmount} />
      </View>
      <Button title="Track shipment" variant="secondary" onPress={() => undefined} />
    </ScrollView>
  );
}
