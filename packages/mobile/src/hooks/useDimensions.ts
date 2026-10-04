import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useDimensions() {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => ({
    width,
    height,
    fontScale,
    isTablet: width >= 768,
    columns: width >= 1024 ? 4 : width >= 768 ? 3 : 2,
  }), [fontScale, height, width]);
}
