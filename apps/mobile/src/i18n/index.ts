import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultLocale, isSupportedLocale, type SupportedLocale } from '@koto/schema';
import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

export const LANGUAGE_STORAGE_KEY = 'koto.language';

export function resolveDeviceLocale(): SupportedLocale {
  const locale = getLocales()[0];
  const tag = locale?.languageTag ?? '';
  const languageCode = locale?.languageCode ?? '';

  if (tag.startsWith('zh-Hant') || ['zh-TW', 'zh-HK', 'zh-MO'].includes(tag)) {
    return 'zh-Hant';
  }
  if (tag.startsWith('zh') || languageCode === 'zh') {
    return 'zh-Hans';
  }
  if (isSupportedLocale(languageCode)) {
    return languageCode;
  }
  return defaultLocale;
}

export async function getStoredLanguage(): Promise<SupportedLocale> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && isSupportedLocale(stored)) {
    return stored;
  }
  return resolveDeviceLocale();
}

export async function setStoredLanguage(locale: SupportedLocale): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  await i18next.changeLanguage(locale);
}

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: defaultLocale,
  interpolation: {
    escapeValue: false,
  },
  lng: defaultLocale,
  resources,
  returnNull: false,
});

void getStoredLanguage().then((locale) => i18next.changeLanguage(locale));

export { i18next };
