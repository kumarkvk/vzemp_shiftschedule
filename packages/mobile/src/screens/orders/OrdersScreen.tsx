import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { Badge } from '@/components/ui/Badge';
import { ListEmptyComponent } from '@/components/ui/ListEmptyComponent';
import { Loading } from '@/components/ui/Loading';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { colors, radius, spacing } from '@/constants/theme';
import * as orderService from '@/services/api/orderService';
import type { RootState } from '@/store';
import { setOrders } from '@/store/slices/ordersSlice';
import { formatDate } from '@/utils/format';

export function OrdersScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.items);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void orderService.listOrders().then((response) => dispatch(setOrders(response.data))).finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return <Loading label="Loading orders" />;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SwipeableRow onDelete={() => {}}>
          <Pressable onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Order #{item.id.slice(0, 8)}</Text>
              <Badge label={item.status} tone={item.status === 'delivered' ? 'success' : 'warning'} />
            </View>
            <Text style={{ color: colors.textMuted }}>{formatDate(item.createdAt)}</Text>
            <PriceDisplay amount={item.totalAmount} />
          </Pressable>
        </SwipeableRow>
      )}
      ListEmptyComponent={<ListEmptyComponent title="No orders yet" description="Your completed purchases will appear here." />}
    />
  );
}
