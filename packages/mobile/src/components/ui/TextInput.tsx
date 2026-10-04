import { forwardRef } from 'react';
import { Text, TextInput as NativeTextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export const TextInput = forwardRef<NativeTextInput, TextInputProps & { label: string; error?: string }>(
  ({ label, error, style, ...props }, ref) => (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
      <NativeTextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
            color: colors.text,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  )
);

TextInput.displayName = 'TextInput';
