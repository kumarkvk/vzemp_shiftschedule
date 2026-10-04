import { View } from 'react-native';

import { colors } from '@/constants/theme';

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}
