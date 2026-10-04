import { Text, type TextStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';

export function PriceDisplay({ amount, style }: { amount: number; style?: TextStyle }) {
  return <Text style={[{ color: colors.text, fontWeight: '700', fontSize: 18 }, style]}>{formatCurrency(amount)}</Text>;
}
