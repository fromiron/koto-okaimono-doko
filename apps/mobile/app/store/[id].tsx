import type { Store } from '@koto/schema';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/src/components/brand/AppHeader';
import { StoreDetailContent } from '@/src/components/store/StoreDetailContent';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { Screen } from '@/src/components/ui/Screen';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { useMapStore } from '@/src/features/map/mapStore';
import { colors } from '@/src/theme/tokens';

export default function StoreDetailScreen() {
  const { t } = useTranslation();
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
      <AppHeader centeredBrand showBack title={t('common.store')} />
      {store ? (
        <StoreDetailContent mode="page" sourceDate={sourceDate} stores={[store]} userLocation={userLocation} />
      ) : (
        <View className="items-center">
          <EmptyState
            message={`${t('store.missingTitle')}\n${t('store.missingBody')}`}
          />
          <AlertCircle color={colors.danger} size={30} />
        </View>
      )}
    </Screen>
  );
}
