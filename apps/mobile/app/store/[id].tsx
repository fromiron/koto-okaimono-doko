import type { Store } from '@koto/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ChevronLeft, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/src/components/brand/BrandMark';
import { StoreDetailContent } from '@/src/components/store/StoreDetailContent';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { IconButton } from '@/src/components/ui/IconButton';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { Screen } from '@/src/components/ui/Screen';
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
      <View className="mb-6">
        <View className="min-h-12 flex-row items-center justify-between gap-3">
          <BrandMark />
          <IconButton onPress={() => router.push('/settings')}>
            <Settings color={colors.inkMuted} size={26} />
          </IconButton>
        </View>
        <View className="mt-4 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ChevronLeft color={colors.ink} size={26} />
          </IconButton>
          <Text className="text-center" variant="title">
            {t('store.detailTitle')}
          </Text>
          <View className="h-12 w-12" />
        </View>
      </View>

      {store ? (
        <StoreDetailContent mode="page" sourceDate={sourceDate} stores={[store]} userLocation={userLocation} />
      ) : (
        <View className="items-center">
          <EmptyState message={`${t('store.missingTitle')}\n${t('store.missingBody')}`} />
          <AlertCircle color={colors.danger} size={30} />
        </View>
      )}
    </Screen>
  );
}
