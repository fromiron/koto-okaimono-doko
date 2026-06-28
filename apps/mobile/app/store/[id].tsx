import type { Store } from '@koto/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StoreDetailContent } from '@/src/components/store/StoreDetailContent';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { IconButton } from '@/src/components/ui/IconButton';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';

export default function StoreDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const repository = useStoreRepository();
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
      <View className="mb-8 flex-row items-center gap-3">
        <IconButton onPress={() => router.back()}>
          <ChevronLeft color="#176762" size={22} />
        </IconButton>
        <Text variant="title">{t('common.store')}</Text>
      </View>
      {store ? <StoreDetailContent stores={[store]} /> : <EmptyState message={t('map.noStores')} />}
    </Screen>
  );
}
