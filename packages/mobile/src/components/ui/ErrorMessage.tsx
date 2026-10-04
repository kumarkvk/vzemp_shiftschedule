import { Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <View style={{ backgroundColor: '#FEF2F2', borderRadius: radius.md, padding: spacing.md }}>
      <Text style={{ color: colors.danger, fontWeight: '600' }}>{message}</Text>
    </View>
  );
}
