import { ActivityIndicator, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={{ padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textMuted }}>{label}</Text>
    </View>
  );
}
