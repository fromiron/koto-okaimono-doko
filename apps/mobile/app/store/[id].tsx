import type { Store } from '@koto/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StoreDetailContent } from '@/src/components/store/StoreDetailContent';
import { Button } from '@/src/components/ui/Button';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Text } from '@/src/components/ui/Text';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { useMapStore } from '@/src/features/map/mapStore';
import { colors } from '@/src/theme/tokens';

export default function StoreDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const repository = useStoreRepository();
  const sourceDate = useDatasetStore((state) => state.meta?.officialUpdatedAt);
  const userLocation = useMapStore((state) => state.userLocation);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    void repository.getStoreById(id).then((result) => {
      if (!cancelled) {
        setStore(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, repository]);

  if (loading) {
    return <LoadingState message={t('common.loading')} />;
  }

  return (
    <Screen>
      <ScreenHeader title={t('store.detailTitle')} />

      {store ? (
        <StoreDetailContent mode="page" sourceDate={sourceDate} stores={[store]} userLocation={userLocation} />
      ) : (
        <View className="items-center gap-4 pt-10">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-danger-soft">
            <AlertCircle color={colors.danger} size={28} />
          </View>
          <Text className="text-center" variant="subtitle">
            {t('store.missingTitle')}
          </Text>
          <Text className="text-center" tone="muted">
            {t('store.missingBody')}
          </Text>
          <Button onPress={() => router.replace('/')}>{t('store.backToMap')}</Button>
        </View>
      )}
    </Screen>
  );
}
