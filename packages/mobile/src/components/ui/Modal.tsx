import { Modal as NativeModal, Pressable, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export function Modal({
  visible,
  title,
  description,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <NativeModal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg }}>
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{title}</Text>
          {description ? <Text style={{ color: colors.textMuted }}>{description}</Text> : null}
          {children}
          <Pressable onPress={onClose} style={{ alignSelf: 'flex-end' }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </NativeModal>
  );
}
