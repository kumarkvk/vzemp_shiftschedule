import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Loading } from '@/components/ui/Loading';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { colors, radius, spacing } from '@/constants/theme';
import * as adminService from '@/services/api/adminService';
import type { AdminDashboard } from '@/types';

export function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);

  useEffect(() => { void adminService.getDashboard().then(setDashboard); }, []);

  if (!dashboard) {
    return <Loading label="Loading dashboard" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <Header title="Admin dashboard" subtitle="Key business metrics and quick actions." />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }}><Text style={{ color: colors.textMuted }}>Orders</Text><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{dashboard.totalOrders}</Text></View>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }}><Text style={{ color: colors.textMuted }}>Users</Text><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>{dashboard.totalUsers}</Text></View>
      </View>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md }}><Text style={{ color: colors.textMuted }}>Revenue</Text><PriceDisplay amount={dashboard.totalRevenue} /></View>
      <Button title="Manage products" onPress={() => navigation.navigate('AdminProducts')} />
      <Text style={{ color: colors.text, fontWeight: '700' }}>Recent orders</Text>
      {dashboard.recentOrders.map((order) => <View key={order.id} style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }}><Text style={{ color: colors.text, fontWeight: '700' }}>#{order.id.slice(0, 8)}</Text><PriceDisplay amount={order.totalAmount} /></View>)}
    </ScrollView>
  );
}
