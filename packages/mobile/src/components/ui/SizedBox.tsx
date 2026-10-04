import { View } from 'react-native';

export function SizedBox({ width, height }: { width?: number; height?: number }) {
  return <View style={{ width, height }} />;
}
