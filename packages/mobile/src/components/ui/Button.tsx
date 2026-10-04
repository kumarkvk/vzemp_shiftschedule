import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export function Button({
  title,
  loading,
  variant = 'primary',
  style,
  disabled,
  ...props
}: PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const palette = {
    primary: { backgroundColor: colors.primary, color: '#FFFFFF' },
    secondary: { backgroundColor: colors.primaryMuted, color: colors.primary },
    ghost: { backgroundColor: 'transparent', color: colors.text },
    danger: { backgroundColor: colors.danger, color: '#FFFFFF' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: palette.backgroundColor,
          paddingVertical: spacing.md,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={palette.color} /> : <Text style={{ color: palette.color, fontWeight: '700' }}>{title}</Text>}
    </Pressable>
  );
}
