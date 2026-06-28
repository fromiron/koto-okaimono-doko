import AsyncStorage from '@react-native-async-storage/async-storage';
import { SQLiteProvider } from 'expo-sqlite';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LoadingState } from '@/src/components/ui/LoadingState';
import { Text } from '@/src/components/ui/Text';
import { bootApp } from '@/src/features/bootstrap/appBoot';
import { activeDatabaseName, sqliteDirectory } from '@/src/features/dataset/datasetPaths';

type DatabaseReloadContextValue = {
  reloadDatabase: () => void;
  unmountDatabase: () => void;
};

const DatabaseReloadContext = createContext<DatabaseReloadContextValue | null>(null);

const NOTICE_KEY = 'koto.unofficialNoticeSeen';

export function AppProviders({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [bootState, setBootState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [bootError, setBootError] = useState<string | null>(null);
  const [databaseGeneration, setDatabaseGeneration] = useState(0);
  const [databaseMounted, setDatabaseMounted] = useState(true);

  useEffect(() => {
    let cancelled = false;
    bootApp()
      .then(() => {
        if (!cancelled) setBootState('ready');
      })
      .catch((error) => {
        if (!cancelled) {
          setBootError(error instanceof Error ? error.message : String(error));
          setBootState('failed');
        }
      });
    return () => {
      cancelled = true;
    };
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

  const reloadContext = useMemo(
    () => ({ reloadDatabase, unmountDatabase }),
    [reloadDatabase, unmountDatabase],
  );

  if (bootState === 'loading') {
    return <LoadingState message={t('common.loading')} />;
  }

  if (bootState === 'failed') {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-paper-100 px-6">
        <Text variant="subtitle">Database error</Text>
        <Text className="text-center" tone="danger">
          {bootError}
        </Text>
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
