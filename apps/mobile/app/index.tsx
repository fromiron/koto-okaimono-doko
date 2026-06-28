import { boundsFromRegion } from '@koto/core';
import { Filter, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import type MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { StoreMap, type StoreLocationGroup } from '@/src/components/map/StoreMap';
import { UserLocationButton } from '@/src/components/map/UserLocationButton';
import { StoreBottomSheet } from '@/src/components/store/StoreBottomSheet';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { Text } from '@/src/components/ui/Text';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { checkForDatasetUpdate } from '@/src/features/dataset/DatasetUpdater';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { useFilterStore } from '@/src/features/filters/filterStore';
import { KOTO_INITIAL_REGION, useMapStore } from '@/src/features/map/mapStore';
import { useSelectedStoreStore } from '@/src/features/selected-store/selectedStoreStore';

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const repository = useStoreRepository();
  const region = useMapStore((state) => state.region);
  const setRegion = useMapStore((state) => state.setRegion);
  const filters = useFilterStore();
  const selectedStoreIds = useSelectedStoreStore((state) => state.selectedStoreIds);
  const selectStores = useSelectedStoreStore((state) => state.selectStores);
  const clearSelectedStore = useSelectedStoreStore((state) => state.clearSelectedStore);
  const meta = useDatasetStore((state) => state.meta);
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const setPendingManifest = useDatasetStore((state) => state.setPendingManifest);
  const setUpdateStatus = useDatasetStore((state) => state.setUpdateStatus);
  const [groups, setGroups] = useState<StoreLocationGroup[]>([]);

  useEffect(() => {
    void repository.getDatasetMeta().then(setDatasetMeta);
  }, [repository, setDatasetMeta]);

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    setUpdateStatus('checking');
    void checkForDatasetUpdate(meta).then(({ result, manifest }) => {
      if (cancelled) return;
      if (manifest) setPendingManifest(manifest);
      setUpdateStatus(result.status === 'failed' ? 'failed' : result.status === 'updated' ? 'updated' : 'idle');
    });
    return () => {
      cancelled = true;
    };
  }, [meta?.version]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void repository
        .getLocationGroups({
          keyword: filters.keyword,
          couponType: filters.couponType,
          payment: filters.payment,
          categoryMajorId: filters.categoryMajorId,
          bounds: boundsFromRegion(region),
          limit: 500,
        })
        .then(setGroups);
    }, 220);

    return () => clearTimeout(handle);
  }, [
    repository,
    region,
    filters.keyword,
    filters.couponType,
    filters.payment,
    filters.categoryMajorId,
  ]);

  const selectedStores = useMemo(() => {
    const selected = new Set(selectedStoreIds);
    return groups.flatMap((group) => group.stores).filter((store) => selected.has(store.id));
  }, [groups, selectedStoreIds]);

  const top = Math.max(insets.top, 14);

  const handleRegionChange = useCallback(
    (nextRegion: typeof region) => {
      setRegion(nextRegion);
    },
    [setRegion],
  );

  const handleMapPanDrag = useCallback(() => {
    clearSelectedStore();
  }, [clearSelectedStore]);

  return (
    <View className="flex-1 bg-paper-50">
      <StoreMap
        groups={groups}
        initialRegion={KOTO_INITIAL_REGION}
        mapRef={mapRef}
        onMapPanDrag={handleMapPanDrag}
        onRegionChangeComplete={handleRegionChange}
        onSelectStores={(stores) => selectStores(stores.map((store) => store.id))}
      />

      <View className="absolute left-0 right-0 gap-3 px-4" style={{ top }}>
        <View className="flex-row items-center gap-2">
          <View className="min-w-0 flex-1">
            <SearchInput
              onChangeText={filters.setKeyword}
              placeholder={t('map.searchPlaceholder')}
              value={filters.keyword}
            />
          </View>
          <IconButton onPress={() => router.push('/filters')}>
            <Filter color="#176762" size={21} />
          </IconButton>
          <IconButton onPress={() => router.push('/settings')}>
            <Settings color="#176762" size={21} />
          </IconButton>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <Chip selected={filters.couponType !== 'all'} onPress={() => router.push('/filters')}>
            {filters.couponType === 'b_only' ? t('filters.bOnly') : filters.couponType === 'ab' ? t('filters.ab') : t('filters.couponType')}
          </Chip>
          <Chip selected={filters.payment !== 'all'} onPress={() => router.push('/filters')}>
            {filters.payment === 'paper' ? t('filters.paper') : filters.payment === 'digital' ? t('filters.digital') : t('filters.payment')}
          </Chip>
          <Chip selected={Boolean(filters.categoryMajorId)} onPress={() => router.push('/filters')}>
            {filters.categoryMajorId
              ? t(`categories.major.${filters.categoryMajorId}`)
              : t('filters.category')}
          </Chip>
          {meta ? (
            <View className="rounded-full bg-paper-50 px-4 py-2">
              <Text variant="caption" tone="muted">
                {meta.officialUpdatedAt}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="absolute right-4 gap-2" style={{ bottom: Math.max(insets.bottom, 18) + 96 }}>
        <UserLocationButton mapRef={mapRef} />
      </View>

      <Pressable
        className="absolute bottom-8 left-4 rounded-full bg-paper-50 px-4 py-3"
        onPress={() => router.push('/filters')}
      >
        <Text variant="label">{groups.length} {t('common.stores')}</Text>
      </Pressable>

      <StoreBottomSheet sourceDate={meta?.officialUpdatedAt} stores={selectedStores} />
    </View>
  );
}
