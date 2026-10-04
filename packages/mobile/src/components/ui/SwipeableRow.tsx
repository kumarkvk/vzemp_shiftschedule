import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { colors, spacing } from '@/constants/theme';

export function SwipeableRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable onPress={onDelete} style={{ backgroundColor: colors.danger, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Delete</Text>
        </Pressable>
      )}
    >
      <View>{children}</View>
    </Swipeable>
  );
}
