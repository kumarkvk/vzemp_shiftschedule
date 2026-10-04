import { Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

export function ListEmptyComponent({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ padding: spacing.xl, alignItems: 'center', gap: spacing.sm }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
      <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{description}</Text>
    </View>
  );
}
