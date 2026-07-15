import type { SupportedLocale } from '@koto/schema';
import { supportedLocales } from '@koto/schema';
import { useRouter } from 'expo-router';
import { Github, Info, RefreshCcw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Linking, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { NavRow } from '@/src/components/ui/NavRow';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Section } from '@/src/components/ui/Section';
import { Stack } from '@/src/components/ui/Stack';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import { Wrap } from '@/src/components/ui/Wrap';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useDatasetUpdate } from '@/src/features/dataset/useDatasetUpdate';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { useFilterStore } from '@/src/features/filters/filterStore';
import { setStoredLocationEnabled } from '@/src/features/preferences/locationPreference';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { getStoredLanguage, setStoredLanguage } from '@/src/i18n';
import { colors, iconSizes } from '@/src/theme/tokens';

const localeLabels: Record<SupportedLocale, string> = {
  ja: '日本語',
  en: 'English',
  ko: '한국어',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const repository = useStoreRepository();
  const { applyUpdate, checkUpdate } = useDatasetUpdate();
  const meta = useDatasetStore((state) => state.meta);
  const pendingManifest = useDatasetStore((state) => state.pendingManifest);
  const updateStatus = useDatasetStore((state) => state.updateStatus);
  const lastCheckedAt = useDatasetStore((state) => state.lastCheckedAt);
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const setLocationEnabled = usePreferencesStore(
    (state) => state.setLocationEnabled,
  );
  const [language, setLanguage] = useState<SupportedLocale>('ja');
  const updateBusy =
    updateStatus === 'checking' ||
    updateStatus === 'downloading' ||
    updateStatus === 'verifying';

  useEffect(() => {
    void getStoredLanguage().then(setLanguage);
    void repository.getDatasetMeta().then(setDatasetMeta);
  }, [repository, setDatasetMeta]);

  return (
    <Screen>
      <ScreenHeader title={t('settings.title')} />

      <Stack gap="2xl">
        <Section title={t('settings.dataset')}>
          <SurfaceCard className="overflow-hidden p-4">
            <Stack className="pb-3" gap="xs">
              <Text tone="muted" variant="caption">
                {t('settings.version')}
              </Text>
              <Text numberOfLines={1} variant="subtitle">
                {meta?.version ?? '-'}
              </Text>
            </Stack>
            <View className="border-t border-line">
              <SettingRow
                label={t('settings.officialUpdatedAt')}
                value={meta?.officialUpdatedAt ?? '-'}
              />
              <SettingRow
                divider={false}
                label={t('settings.lastCheckedAt')}
                value={formatTimestamp(lastCheckedAt, language)}
              />
            </View>
            <Stack className="mt-2" gap="md">
              <Button
                disabled={updateBusy}
                leftIcon={
                  <RefreshCcw
                    color={colors.primaryStrong}
                    size={iconSizes.md}
                  />
                }
                loading={updateStatus === 'checking'}
                onPress={checkUpdate}
                variant="secondary"
              >
                {t('settings.checkUpdate')}
              </Button>
              {updateStatus !== 'idle' ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="text-center"
                  tone="muted"
                  variant="caption"
                >
                  {t(`update.${updateStatus}`)}
                </Text>
              ) : null}
              {pendingManifest ? (
                <Button
                  disabled={updateBusy}
                  loading={
                    updateStatus === 'downloading' ||
                    updateStatus === 'verifying'
                  }
                  onPress={applyUpdate}
                >
                  {t('settings.applyUpdate')} {pendingManifest.version}
                </Button>
              ) : null}
            </Stack>
          </SurfaceCard>
        </Section>

        <Section title={t('settings.locationTitle')}>
          <SurfaceCard className="px-4">
            <Stack className="py-4" gap="xs">
              <Text>{t('settings.locationUse')}</Text>
              <Text tone="muted">{t('settings.locationDetail')}</Text>
            </Stack>
            <View className="flex-row items-center justify-between border-t border-line py-4">
              <Text>{t('settings.locationToggle')}</Text>
              <Switch
                accessibilityLabel={t('settings.locationToggle')}
                ios_backgroundColor={colors.controlLine}
                onValueChange={(next) => {
                  setLocationEnabled(next);
                  if (!next) {
                    useFilterStore.getState().setRadiusMeters('all');
                  }
                  void setStoredLocationEnabled(next);
                }}
                // Keep the thumb visible against both track states.
                thumbColor={colors.surface}
                trackColor={{
                  false: colors.controlLine,
                  true: colors.primaryStrong,
                }}
                value={locationEnabled}
              />
            </View>
          </SurfaceCard>
        </Section>

        <Section title={t('settings.appInfo')}>
          <SurfaceCard className="px-4">
            <NavRow
              icon={<Info color={colors.primaryStrong} size={iconSizes.lg} />}
              label={t('settings.aboutApp')}
              onPress={() => router.push('/about')}
            />
            <NavRow
              divider={false}
              icon={<Github color={colors.primaryStrong} size={iconSizes.lg} />}
              label={t('settings.github')}
              onPress={() =>
                Linking.openURL(
                  'https://github.com/fromiron/koto-okaimono-doko',
                )
              }
              role="link"
            />
          </SurfaceCard>
        </Section>

        <Section title={t('settings.language')}>
          <SurfaceCard className="p-4">
            <Wrap gap="sm">
              {supportedLocales.map((locale) => (
                <Chip
                  key={locale}
                  selected={language === locale}
                  onPress={() => {
                    setLanguage(locale);
                    void setStoredLanguage(locale);
                  }}
                >
                  {localeLabels[locale]}
                </Chip>
              ))}
            </Wrap>
          </SurfaceCard>
        </Section>
      </Stack>
    </Screen>
  );
}

function formatTimestamp(value: string | null, locale: SupportedLocale) {
  if (!value) return '-';
  return new Date(value).toLocaleString(locale, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function SettingRow({
  divider = true,
  label,
  value,
}: {
  divider?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View
      className={`flex-row items-center justify-between gap-3 py-3 ${divider ? 'border-b border-line' : ''}`}
    >
      <Text className="min-w-0 flex-1 pr-2" tone="muted">
        {label}
      </Text>
      <Text className="shrink-0 text-right">{value}</Text>
    </View>
  );
}
