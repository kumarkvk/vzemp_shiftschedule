import { Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const palette = {
    default: { backgroundColor: colors.primaryMuted, color: colors.primary },
    success: { backgroundColor: '#DCFCE7', color: colors.success },
    warning: { backgroundColor: '#FEF3C7', color: colors.warning },
    danger: { backgroundColor: '#FEE2E2', color: colors.danger },
  }[tone];

  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.backgroundColor }}>
      <Text style={{ color: palette.color, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
