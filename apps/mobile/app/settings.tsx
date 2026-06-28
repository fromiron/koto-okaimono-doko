import type { SupportedLocale } from '@koto/schema';
import { supportedLocales } from '@koto/schema';
import { useRouter } from 'expo-router';
import { CloudCog, FileText, Github, Heart, Info, LocateFixed, RefreshCcw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Linking, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/src/components/brand/AppHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconBadge } from '@/src/components/ui/IconBadge';
import { NavRow } from '@/src/components/ui/NavRow';
import { Row } from '@/src/components/ui/Row';
import { Screen } from '@/src/components/ui/Screen';
import { Section } from '@/src/components/ui/Section';
import { Stack } from '@/src/components/ui/Stack';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import { Wrap } from '@/src/components/ui/Wrap';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useDatasetUpdate } from '@/src/features/dataset/useDatasetUpdate';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
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
  const setLocationEnabled = usePreferencesStore((state) => state.setLocationEnabled);
  const [language, setLanguage] = useState<SupportedLocale>('ja');

  useEffect(() => {
    void getStoredLanguage().then(setLanguage);
    void repository.getDatasetMeta().then(setDatasetMeta);
  }, [repository, setDatasetMeta]);

  return (
    <Screen>
      <AppHeader centeredBrand showBack title={t('settings.title')} />

      <Stack gap="2xl">
        <Section title={t('settings.dataset')}>
          <SurfaceCard className="overflow-hidden p-4">
            <Row align="start" gap="lg">
              <View className="h-24 w-24 flex-shrink-0 items-center justify-center rounded-card bg-primary-soft">
                <CloudCog color={colors.primary} size={48} />
              </View>
              <View className="min-w-0 flex-1">
                <SettingRow label={t('settings.version')} value={meta?.version ?? '-'} />
                <SettingRow label={t('settings.officialUpdatedAt')} value={meta?.officialUpdatedAt ?? '-'} />
                <SettingRow divider={false} label={t('settings.lastCheckedAt')} value={formatTimestamp(lastCheckedAt)} />
              </View>
            </Row>
            <Stack className="mt-4" gap="md">
              <Button
                leftIcon={<RefreshCcw color={colors.teal} size={iconSizes.md} />}
                loading={updateStatus === 'checking' || updateStatus === 'downloading'}
                onPress={checkUpdate}
                variant="teal"
              >
                {t('settings.checkUpdate')}
              </Button>
              {updateStatus !== 'idle' ? (
                <Text className="text-center" tone="muted" variant="caption">
                  {t(`update.${updateStatus}`)}
                </Text>
              ) : null}
              {pendingManifest ? (
                <Button onPress={applyUpdate}>
                  {t('settings.applyUpdate')} {pendingManifest.version}
                </Button>
              ) : null}
            </Stack>
          </SurfaceCard>
        </Section>

        <Section title={t('settings.locationTitle')}>
          <SurfaceCard className="px-4">
            <Row className="py-4" gap="md">
              <IconBadge>
                <LocateFixed color={colors.primary} size={iconSizes.xl} />
              </IconBadge>
              <Stack className="min-w-0 flex-1" gap="xs">
                <Text>{t('settings.locationUse')}</Text>
                <Text tone="muted">{t('settings.locationDetail')}</Text>
              </Stack>
            </Row>
            <Row className="justify-between border-t border-line py-4">
              <Text>{t('settings.locationToggle')}</Text>
              <Switch
                onValueChange={(next) => {
                  setLocationEnabled(next);
                  void setStoredLocationEnabled(next);
                }}
                trackColor={{ false: colors.line, true: colors.primary }}
                value={locationEnabled}
              />
            </Row>
          </SurfaceCard>
        </Section>

        <Section title={t('settings.appInfo')}>
          <SurfaceCard className="px-4">
            <NavRow
              icon={<Info color={colors.primary} size={iconSizes.xl} />}
              label={t('settings.aboutApp')}
              onPress={() => router.push('/about')}
            />
            <NavRow
              icon={<Github color={colors.primary} size={iconSizes.xl} />}
              label={t('settings.github')}
              onPress={() => Linking.openURL('https://github.com/fromiron/koto-okaimono-doko')}
            />
            <NavRow
              divider={false}
              icon={<FileText color={colors.primary} size={iconSizes.xl} />}
              label={t('settings.license')}
              onPress={() => Linking.openURL('https://github.com/fromiron/koto-okaimono-doko/blob/main/apps/mobile/LICENSE')}
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

        <Stack className="items-center pb-2" gap="sm">
          <Row gap="sm">
            <Heart color={colors.teal} fill={colors.teal} size={iconSizes.sm} />
            <Text className="text-center" tone="muted">
              {t('settings.footer')}
            </Text>
          </Row>
          <Text tone="muted" variant="caption">
            © 2026 koto okaimono doko
          </Text>
        </Stack>
      </Stack>
    </Screen>
  );
}

function formatTimestamp(value: string | null) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-';
}

function SettingRow({ divider = true, label, value }: { divider?: boolean; label: string; value: string }) {
  return (
    <View className={`flex-row items-center justify-between gap-3 py-3 ${divider ? 'border-b border-line' : ''}`}>
      <Text className="min-w-0 flex-1 pr-2" tone="muted">
        {label}
      </Text>
      <Text className="shrink-0 text-right">{value}</Text>
    </View>
  );
}
