import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { subscribeToNetwork } from '@/services/network';

export function NetworkBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => subscribeToNetwork((state) => {
    setOffline(!(state.isConnected && state.isInternetReachable !== false));
  }), []);

  if (!offline) {
    return null;
  }

  return (
    <View style={{ backgroundColor: colors.warning, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
      <Text style={{ color: '#1E293B', textAlign: 'center', fontWeight: '600' }}>You are offline. Some actions may be unavailable.</Text>
    </View>
  );
}
