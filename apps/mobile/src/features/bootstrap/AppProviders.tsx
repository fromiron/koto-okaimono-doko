import AsyncStorage from '@react-native-async-storage/async-storage';
import { SQLiteProvider } from 'expo-sqlite';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { Text } from '@/src/components/ui/Text';
import { bootApp } from '@/src/features/bootstrap/appBoot';
import {
  activeDatabaseName,
  sqliteDirectory,
} from '@/src/features/dataset/datasetPaths';
import { getStoredLocationEnabled } from '@/src/features/preferences/locationPreference';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { i18nReady } from '@/src/i18n';

type DatabaseReloadContextValue = {
  reloadDatabase: () => void;
  unmountDatabase: () => void;
};

const DatabaseReloadContext = createContext<DatabaseReloadContextValue | null>(
  null,
);

const NOTICE_KEY = 'koto.unofficialNoticeSeen';

export function AppProviders({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [bootState, setBootState] = useState<'loading' | 'ready' | 'failed'>(
    'loading',
  );
  const [bootAttempt, setBootAttempt] = useState(0);
  const [databaseGeneration, setDatabaseGeneration] = useState(0);
  const [databaseMounted, setDatabaseMounted] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBootState('loading');
    Promise.all([bootApp(), i18nReady])
      .then(() => {
        if (!cancelled) {
          setDatabaseMounted(true);
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

  const reloadDatabase = useCallback(() => {
    setDatabaseMounted(true);
    setDatabaseGeneration((value) => value + 1);
  }, []);

  const unmountDatabase = useCallback(() => {
    setDatabaseMounted(false);
  }, []);

  const handleDatabaseError = useCallback(() => {
    setDatabaseMounted(false);
    setBootState('failed');
  }, []);

  const reloadContext = useMemo(
    () => ({ reloadDatabase, unmountDatabase }),
    [reloadDatabase, unmountDatabase],
  );

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
    <DatabaseReloadContext.Provider value={reloadContext}>
      {databaseMounted ? (
        <SQLiteProvider
          key={databaseGeneration}
          databaseName={activeDatabaseName}
          directory={sqliteDirectory}
          onError={handleDatabaseError}
        >
          {children}
        </SQLiteProvider>
      ) : (
        <LoadingState message={t('common.loading')} />
      )}
    </DatabaseReloadContext.Provider>
  );
}

export function useDatabaseReload() {
  const context = useContext(DatabaseReloadContext);
  if (!context) {
    throw new Error('useDatabaseReload must be used inside AppProviders');
  }
  return context;
}
