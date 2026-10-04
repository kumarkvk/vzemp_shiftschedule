import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export function subscribeToNetwork(listener: (state: NetInfoState) => void): () => void {
  return NetInfo.addEventListener(listener);
}

export async function getCurrentNetworkState(): Promise<NetInfoState> {
  return NetInfo.fetch();
}
