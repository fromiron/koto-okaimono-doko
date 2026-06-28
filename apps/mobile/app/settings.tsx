import type { SupportedLocale } from '@koto/schema';
import { supportedLocales } from '@koto/schema';
import { Link, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { useApplyCandidateDataset, checkForDatasetUpdate } from '@/src/features/dataset/DatasetUpdater';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { getStoredLanguage, setStoredLanguage } from '@/src/i18n';

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
      <View className="mb-8 flex-row items-center gap-3">
        <IconButton onPress={() => router.back()}>
          <ChevronLeft color="#176762" size={22} />
        </IconButton>
        <Text variant="title">{t('settings.title')}</Text>
      </View>

      <View className="mb-8 gap-3">
        <Text variant="label">{t('settings.language')}</Text>
        <View className="flex-row flex-wrap gap-2">
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
      </View>

      <View className="mb-8 gap-3 border-t border-line-200 pt-6">
        <Text variant="label">{t('settings.dataset')}</Text>
        <InfoRow label={t('settings.version')} value={meta?.version ?? '-'} />
        <InfoRow label={t('settings.officialUpdatedAt')} value={meta?.officialUpdatedAt ?? '-'} />
        <InfoRow label={t('settings.lastCheckedAt')} value={lastCheckedAt ?? '-'} />
        <Text variant="caption" tone="muted">
          {t(`update.${updateStatus}`)}
        </Text>
        <Button loading={updateStatus === 'checking' || updateStatus === 'downloading'} onPress={checkUpdate}>
          {t('settings.checkUpdate')}
        </Button>
        {pendingManifest ? (
          <Button onPress={applyUpdate} variant="secondary">
            {t('settings.applyUpdate')} {pendingManifest.version}
          </Button>
        ) : null}
      </View>

      <View className="gap-4 border-t border-line-200 pt-6">
        <Text>{t('settings.privacy')}</Text>
        <Text>{t('settings.unofficial')}</Text>
        <Link href="/about" asChild>
          <Button variant="ghost">{t('about.title')}</Button>
        </Link>
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text tone="muted">{label}</Text>
      <Text className="max-w-[58%] text-right" variant="label">
        {value}
      </Text>
    </View>
  );
}
