import type { SupportedLocale } from '@koto/schema';
import { supportedLocales } from '@koto/schema';
import { useRouter } from 'expo-router';
import { ChevronRight, CloudCog, FileText, Github, Info, LocateFixed, RefreshCcw } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Linking, Pressable, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/src/components/brand/AppHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconBadge } from '@/src/components/ui/IconBadge';
import { Screen } from '@/src/components/ui/Screen';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import { checkForDatasetUpdate, useApplyCandidateDataset } from '@/src/features/dataset/DatasetUpdater';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { getStoredLanguage, setStoredLanguage } from '@/src/i18n';
import { colors } from '@/src/theme/tokens';

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
  const applyCandidate = useApplyCandidateDataset();
  const meta = useDatasetStore((state) => state.meta);
  const pendingManifest = useDatasetStore((state) => state.pendingManifest);
  const updateStatus = useDatasetStore((state) => state.updateStatus);
  const lastCheckedAt = useDatasetStore((state) => state.lastCheckedAt);
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const setPendingManifest = useDatasetStore((state) => state.setPendingManifest);
  const setUpdateStatus = useDatasetStore((state) => state.setUpdateStatus);
  const [language, setLanguage] = useState<SupportedLocale>('ja');

  useEffect(() => {
    void getStoredLanguage().then(setLanguage);
    void repository.getDatasetMeta().then(setDatasetMeta);
  }, [repository, setDatasetMeta]);

  async function checkUpdate() {
    setUpdateStatus('checking');
    const { result, manifest } = await checkForDatasetUpdate(meta);
    if (manifest) setPendingManifest(manifest);
    setUpdateStatus(result.status === 'failed' ? 'failed' : result.status === 'updated' ? 'updated' : 'idle');
  }

  async function applyUpdate() {
    setUpdateStatus('verifying');
    await applyCandidate();
    setPendingManifest(null);
    const nextMeta = await repository.getDatasetMeta();
    setDatasetMeta(nextMeta);
    setUpdateStatus('idle');
  }

  return (
    <Screen>
      <AppHeader centeredBrand showBack title={t('settings.title')} />

      <SectionTitle>{t('settings.dataset')}</SectionTitle>
      <SurfaceCard className="mb-8 overflow-hidden px-5 py-5">
        <View className="flex-row gap-5">
          <View className="h-24 w-24 flex-shrink-0 items-center justify-center rounded-[24px] bg-water-100">
            <CloudCog color={colors.primary} size={48} />
          </View>
          <View className="min-w-0 flex-1">
            <SettingRow label={t('settings.version')} value={meta?.version ?? '-'} />
            <SettingRow label={t('settings.officialUpdatedAt')} value={meta?.officialUpdatedAt ?? '-'} />
            <SettingRow divider={false} label={t('settings.lastCheckedAt')} value={formatTimestamp(lastCheckedAt)} />
          </View>
        </View>
        <View className="mt-5 gap-3">
          <Text variant="caption" tone="muted">
            {t(`update.${updateStatus}`)}
          </Text>
          <Button
            leftIcon={<RefreshCcw color={colors.teal} size={20} />}
            loading={updateStatus === 'checking' || updateStatus === 'downloading'}
            onPress={checkUpdate}
            variant="secondary"
          >
            {t('settings.checkUpdate')}
          </Button>
          {pendingManifest ? (
            <Button onPress={applyUpdate}>
              {t('settings.applyUpdate')} {pendingManifest.version}
            </Button>
          ) : null}
        </View>
      </SurfaceCard>

      <SectionTitle>{t('settings.locationTitle')}</SectionTitle>
      <SurfaceCard className="mb-8 px-5">
        <View className="flex-row items-center gap-4 py-5">
          <IconBadge>
            <LocateFixed color={colors.primary} size={28} />
          </IconBadge>
          <View className="min-w-0 flex-1">
            <Text>{t('settings.locationUse')}</Text>
            <Text tone="muted">{t('settings.locationDetail')}</Text>
          </View>
          <ChevronRight color={colors.inkMuted} size={28} />
        </View>
        <View className="flex-row items-center justify-between border-t border-line-200 py-4">
          <Text>{t('settings.locationToggle')}</Text>
          <Switch disabled value trackColor={{ false: colors.line, true: colors.primary }} />
        </View>
      </SurfaceCard>

      <SectionTitle>{t('settings.appInfo')}</SectionTitle>
      <SurfaceCard className="mb-8 px-5">
        <ActionRow
          icon={<Info color={colors.primary} size={28} />}
          label={t('app.unofficial')}
          onPress={() => router.push('/about')}
        />
        <ActionRow
          icon={<Github color={colors.primary} size={28} />}
          label={t('settings.github')}
          onPress={() => Linking.openURL('https://github.com/fromiron/koto-okaimono-doko')}
        />
        <ActionRow
          divider={false}
          icon={<FileText color={colors.primary} size={28} />}
          label={t('settings.license')}
          onPress={() => Linking.openURL('https://github.com/fromiron/koto-okaimono-doko/blob/main/apps/mobile/LICENSE')}
        />
      </SurfaceCard>

      <SectionTitle>{t('settings.language')}</SectionTitle>
      <SurfaceCard className="mb-8 px-5 py-5">
        <View className="flex-row flex-wrap gap-3">
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
        </View>
      </SurfaceCard>

      <View className="items-center gap-2 pb-2">
        <View className="flex-row items-center gap-2">
          <CloudCog color={colors.teal} size={22} />
          <Text className="text-center" tone="muted">
            {t('settings.footer')}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          © 2026 koto okaimono doko
        </Text>
      </View>
    </Screen>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-3 text-water-700" variant="subtitle">
      {children}
    </Text>
  );
}

function formatTimestamp(value: string | null) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-';
}

function SettingRow({ divider = true, label, value }: { divider?: boolean; label: string; value: string }) {
  return (
    <View className={`flex-row justify-between gap-3 py-3 ${divider ? 'border-b border-line-200' : ''}`}>
      <Text className="min-w-0 flex-1 pr-2" tone="muted" variant="caption">
        {label}
      </Text>
      <Text className="shrink-0 text-right" tone="muted" variant="caption">
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  divider = true,
  icon,
  label,
  onPress,
}: {
  divider?: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`flex-row items-center gap-4 py-5 ${divider ? 'border-b border-line-200' : ''}`}
      onPress={onPress}
    >
      <IconBadge>{icon}</IconBadge>
      <Text className="min-w-0 flex-1">{label}</Text>
      <ChevronRight color={colors.inkMuted} size={28} />
    </Pressable>
  );
}
