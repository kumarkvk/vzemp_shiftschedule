import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography } from '@/constants/theme';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const navigation = useNavigation();
  return (
    <View style={{ paddingVertical: spacing.md, gap: spacing.xs }}>
      {navigation.canGoBack() ? (
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back</Text>
        </Pressable>
      ) : null}
      <Text style={{ fontSize: typography.h2, fontWeight: '700', color: colors.text }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textMuted }}>{subtitle}</Text> : null}
    </View>
  );
}
