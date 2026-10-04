import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ProductCard } from '@/components/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/ui/Header';
import { colors, radius, spacing } from '@/constants/theme';
import { featuredProducts } from '@/constants/mockData';
import { useAuth } from '@/hooks/useAuth';
import { trackScreen } from '@/services/analytics';
import { fullName } from '@/utils/format';

const quickLinks = ['Electronics', 'Accessories', 'Home', 'Beauty'];

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  useEffect(() => {
    trackScreen('home');
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, backgroundColor: colors.background }}>
      <Header title={`Hi ${fullName(user?.firstName, user?.lastName) || 'there'}`} subtitle="Discover trending picks and personalized recommendations." />
      <View style={{ backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm }}>
        <Badge label="Today only" />
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Fast checkout, fast delivery</Text>
        <Text style={{ color: '#DBEAFE' }}>Save time with secure payment and real-time order tracking.</Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Quick links</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {quickLinks.map((link) => (
            <Pressable key={link} onPress={() => navigation.navigate('ProductsTab')} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill }}>
              <Text style={{ color: colors.text }}>{link}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Trending now</Text>
        {featuredProducts.map((product) => <ProductCard key={product.id} product={product} onPress={() => navigation.navigate('ProductDetail', { productId: product.id })} />)}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Recommended for you</Text>
        <Text style={{ color: colors.textMuted }}>Recently viewed-inspired suggestions can be powered here once analytics data is available.</Text>
      </View>
    </ScrollView>
  );
}
