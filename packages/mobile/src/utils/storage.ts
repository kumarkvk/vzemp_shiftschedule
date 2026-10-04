import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from '@/types';

const AUTH_SESSION_KEY = 'ecommerce.auth.session';

export async function saveSecureSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function getSecureSession(): Promise<AuthSession | null> {
  const value = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  return value ? (JSON.parse(value) as AuthSession) : null;
}

export async function clearSecureSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getStorageItem<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function removeStorageItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
