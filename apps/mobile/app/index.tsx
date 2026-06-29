import { boundsFromRegion } from '@koto/core';
import { Filter, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import type MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/src/components/brand/BrandMark';
import { clusterByGrid, type MarkerCluster } from '@/src/components/map/clusterGroups';
import { StoreMap, type StoreLocationGroup } from '@/src/components/map/StoreMap';
import { UserLocationButton } from '@/src/components/map/UserLocationButton';
import { SHEET_PEEK_HEIGHT, StoreBottomSheet, type MapViewMode } from '@/src/components/store/StoreBottomSheet';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useDatasetUpdate } from '@/src/features/dataset/useDatasetUpdate';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { filterGroupsByRadius } from '@/src/features/filters/filterByRadius';
import { useFilterStore } from '@/src/features/filters/filterStore';
import { KOTO_INITIAL_REGION, useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { useSelectedStoreStore } from '@/src/features/selected-store/selectedStoreStore';
import { colors, space } from '@/src/theme/tokens';

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const repository = useStoreRepository();
  const region = useMapStore((state) => state.region);
  const setRegion = useMapStore((state) => state.setRegion);
  const userLocation = useMapStore((state) => state.userLocation);
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const filters = useFilterStore();
  const selectedStoreIds = useSelectedStoreStore((state) => state.selectedStoreIds);
  const selectStores = useSelectedStoreStore((state) => state.selectStores);
  const clearSelectedStore = useSelectedStoreStore((state) => state.clearSelectedStore);
  const meta = useDatasetStore((state) => state.meta);
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const { checkUpdate } = useDatasetUpdate();
  const [groups, setGroups] = useState<StoreLocationGroup[]>([]);
  const [viewMode, setViewMode] = useState<MapViewMode>('map');

  const visibleGroups = useMemo(
    () => filterGroupsByRadius(groups, locationEnabled ? userLocation : null, filters.radiusMeters),
    [groups, locationEnabled, userLocation, filters.radiusMeters],
  );

  const clusters = useMemo(
    () => clusterByGrid(visibleGroups, region.longitudeDelta),
    [visibleGroups, region.longitudeDelta],
  );

  useEffect(() => {
    void repository.getDatasetMeta().then(setDatasetMeta);
  }, [repository, setDatasetMeta]);

  useEffect(() => {
    if (!meta?.version) return;
    void checkUpdate();
  }, [meta?.version, checkUpdate]);

  useEffect(() => {
    if (!locationEnabled) setUserLocation(null);
  }, [locationEnabled, setUserLocation]);

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
    return visibleGroups.flatMap((group) => group.stores).filter((store) => selected.has(store.id));
  }, [visibleGroups, selectedStoreIds]);

  const visibleStoreCount = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.stores.length, 0),
    [visibleGroups],
  );

  const visibleStores = useMemo(
    () => visibleGroups.flatMap((group) => group.stores),
    [visibleGroups],
  );

  const top = Math.max(insets.top, space.lg);
  const allSelected =
    filters.couponType === 'all' &&
    filters.payment === 'all' &&
    filters.categoryMajorId === null;

  const handleRegionChange = useCallback(
    (nextRegion: typeof region) => {
      setRegion(nextRegion);
    },
    [setRegion],
  );

  const handleClusterPress = useCallback(
    (cluster: MarkerCluster<StoreLocationGroup>) => {
      mapRef.current?.animateToRegion(
        {
          latitude: cluster.lat,
          longitude: cluster.lng,
          latitudeDelta: Math.max(region.latitudeDelta / 2.5, 0.004),
          longitudeDelta: Math.max(region.longitudeDelta / 2.5, 0.004),
        },
        320,
      );
    },
    [region.latitudeDelta, region.longitudeDelta],
  );

  return (
    <View className="flex-1 bg-page">
      <View
        className="border-b border-line bg-page px-5 pb-4"
        style={{ paddingTop: top }}
      >
        <View className="mb-4 flex-row items-center justify-between gap-3">
          <BrandMark />
          <IconButton onPress={() => router.push('/settings')}>
            <Settings color={colors.muted} size={24} />
          </IconButton>
        </View>

        <SearchInput
          elevated
          onChangeText={filters.setKeyword}
          placeholder={t('map.searchPlaceholder')}
          value={filters.keyword}
        />

        <ScrollView
          className="-mx-5 mt-4"
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.xl }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip selected={allSelected} onPress={filters.reset}>
            {t('common.all')}
          </Chip>
          <Chip
            selected={filters.couponType === 'ab'}
            onPress={() => filters.setCouponType(filters.couponType === 'ab' ? 'all' : 'ab')}
          >
            {t('filters.ab')}
          </Chip>
          <Chip
            selected={filters.couponType === 'b_only'}
            tone="orange"
            onPress={() => filters.setCouponType(filters.couponType === 'b_only' ? 'all' : 'b_only')}
          >
            {t('filters.bOnly')}
          </Chip>
          <Chip
            selected={filters.payment === 'paper'}
            tone="neutral"
            onPress={() => filters.setPayment(filters.payment === 'paper' ? 'all' : 'paper')}
          >
            {t('filters.paper')}
          </Chip>
          <Chip
            selected={filters.payment === 'digital'}
            tone="neutral"
            onPress={() => filters.setPayment(filters.payment === 'digital' ? 'all' : 'digital')}
          >
            {t('filters.digital')}
          </Chip>
          <Chip
            selected={filters.categoryMajorId === 'eat_drink'}
            tone="neutral"
            onPress={() => filters.setCategoryMajorId(filters.categoryMajorId === 'eat_drink' ? null : 'eat_drink')}
          >
            {t('map.eatChip')}
          </Chip>
          <Chip
            selected={filters.categoryMajorId === 'shopping'}
            tone="neutral"
            onPress={() => filters.setCategoryMajorId(filters.categoryMajorId === 'shopping' ? null : 'shopping')}
          >
            {t('map.shopChip')}
          </Chip>
          <Chip leftIcon={<Filter color={colors.primary} size={16} />} onPress={() => router.push('/filters')}>
            {t('filters.title')}
          </Chip>
        </ScrollView>
      </View>

      <View className="min-h-0 flex-1">
        <StoreMap
          clusters={clusters}
          initialRegion={KOTO_INITIAL_REGION}
          mapRef={mapRef}
          onClusterPress={handleClusterPress}
          onMapPress={clearSelectedStore}
          onRegionChangeComplete={handleRegionChange}
          onSelectStores={(stores) => selectStores(stores.map((store) => store.id))}
          selectedStoreIds={selectedStoreIds}
          showsUserLocation={locationEnabled}
        />
        {selectedStoreIds.length === 0 ? (
          <View
            style={{ bottom: SHEET_PEEK_HEIGHT + insets.bottom + 12, elevation: 18, position: 'absolute', right: 20, zIndex: 18 }}
          >
            <UserLocationButton mapRef={mapRef} />
          </View>
        ) : null}
        <StoreBottomSheet
          onChangeViewMode={setViewMode}
          onResetFilters={filters.reset}
          onSelectStore={(id) => selectStores([id])}
          sourceDate={meta?.officialUpdatedAt}
          stores={selectedStores}
          userLocation={userLocation}
          viewMode={viewMode}
          visibleStoreCount={visibleStoreCount}
          visibleStores={visibleStores}
        />
      </View>
    </View>
  );
}
