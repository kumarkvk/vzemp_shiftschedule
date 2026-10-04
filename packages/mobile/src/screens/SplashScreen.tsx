import { Text, View } from 'react-native';

import { Loading } from '@/components/ui/Loading';
import { colors, spacing, typography } from '@/constants/theme';

export function SplashScreenView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background }}>
      <Text style={{ fontSize: typography.h1, fontWeight: '800', color: colors.text }}>Ecommerce AKS</Text>
      <Text style={{ color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg }}>Loading your personalized storefront</Text>
      <Loading label="Preparing your experience" />
    </View>
  );
}
