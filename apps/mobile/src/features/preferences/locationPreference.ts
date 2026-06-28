import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATION_ENABLED_STORAGE_KEY = 'koto.locationEnabled';

/** Reads the persisted location preference. Defaults to ON when never set. */
export async function getStoredLocationEnabled(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(LOCATION_ENABLED_STORAGE_KEY);
  return stored === null ? true : stored === '1';
}

export async function setStoredLocationEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(LOCATION_ENABLED_STORAGE_KEY, enabled ? '1' : '0');
}
