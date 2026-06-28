import { z } from 'zod';

export const supportedLocales = ['ja', 'en', 'ko', 'zh-Hans', 'zh-Hant'] as const;

export const SupportedLocaleSchema = z.enum(supportedLocales);

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'ja';

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}
