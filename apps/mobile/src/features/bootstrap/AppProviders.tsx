import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useDatasetStore } from '../dataset/datasetStore';
import { validateDatabase } from '../db/validateDatabase';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { Text } from '@/src/components/ui/Text';
import { bootApp } from '@/src/features/bootstrap/appBoot';
import {
  activeDatabaseName,
  datasetPaths,
  sqliteDirectory,
} from '@/src/features/dataset/datasetPaths';
import { getStoredLocationEnabled } from '@/src/features/preferences/locationPreference';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { useVoucherClock } from '@/src/features/preferences/useVoucherClock';
import { useVoucherIntentStore } from '@/src/features/preferences/voucherIntentStore';
import { i18nReady } from '@/src/i18n';

const NOTICE_KEY = 'koto.unofficialNoticeSeen';

export function AppProviders({ children }: { children: ReactNode }) {
  useVoucherClock();
  const { t } = useTranslation();
  const [bootState, setBootState] = useState<'loading' | 'ready' | 'failed'>(
    'loading',
  );
  const [bootAttempt, setBootAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setBootState('loading');
    Promise.all([
      bootApp(),
      i18nReady,
      useVoucherIntentStore.getState().hydrate(),
    ])
      .then(() => {
        if (!cancelled) {
          setBootState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBootState('failed');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bootAttempt]);

  useEffect(() => {
    void getStoredLocationEnabled().then((enabled) => {
      usePreferencesStore.getState().setLocationEnabled(enabled);
    });
  }, []);

  useEffect(() => {
    if (bootState !== 'ready') return;

    void AsyncStorage.getItem(NOTICE_KEY).then((seen) => {
      if (seen) return;
      Alert.alert(t('notice.title'), t('notice.body'), [
        {
          text: t('common.close'),
          onPress: () => {
            void AsyncStorage.setItem(NOTICE_KEY, '1');
          },
        },
      ]);
    });
  }, [bootState, t]);

  const initializeDatabase = useCallback(async (db: SQLiteDatabase) => {
    const meta = await validateDatabase(db);
    const result = await bootApp();
    const state = useDatasetStore.getState();
    state.setDatasetMeta(meta);
    if (result.updated) {
      await FileSystem.deleteAsync(datasetPaths.localManifestUri, {
        idempotent: true,
      });
      state.setUpdateStatus('updated');
    } else if (result.error) {
      state.setUpdateStatus('failed', result.error);
    }
  }, []);

  const handleDatabaseError = useCallback(() => setBootState('failed'), []);

  if (bootState === 'loading') {
    return <LoadingState message={t('common.loading')} />;
  }

  if (bootState === 'failed') {
    return (
      <View
        accessibilityLiveRegion="assertive"
        className="flex-1 items-center justify-center gap-4 bg-page px-6"
      >
        <Text
          accessibilityRole="header"
          className="text-center"
          variant="subtitle"
        >
          {t('common.bootErrorTitle')}
        </Text>
        <Text className="text-center" tone="muted">
          {t('common.bootErrorBody')}
        </Text>
        <Button onPress={() => setBootAttempt((attempt) => attempt + 1)}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  return (
    <SQLiteProvider
      databaseName={activeDatabaseName}
      directory={sqliteDirectory}
      onInit={initializeDatabase}
      onError={handleDatabaseError}
    >
      {children}
    </SQLiteProvider>
  );
}
