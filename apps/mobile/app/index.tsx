import { boundsFromRegion } from '@koto/core';
import { Filter, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, useWindowDimensions, View } from 'react-native';
import type MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import {
  clusterByGrid,
  type MarkerCluster,
} from '@/src/components/map/clusterGroups';
import {
  StoreMap,
  type StoreLocationGroup,
} from '@/src/components/map/StoreMap';
import { UserLocationButton } from '@/src/components/map/UserLocationButton';
import {
  StoreBottomSheet,
  type MapViewMode,
} from '@/src/components/store/StoreBottomSheet';
import {
  getMapCameraLatitude,
  getSheetHeightAtIndex,
} from '@/src/components/store/sheetLayout';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useDatasetUpdate } from '@/src/features/dataset/useDatasetUpdate';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { filterGroupsByRadius } from '@/src/features/filters/filterByRadius';
import { useFilterStore } from '@/src/features/filters/filterStore';
import {
  KOTO_INITIAL_REGION,
  type MapRegion,
  useMapStore,
} from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { useSelectedStoreStore } from '@/src/features/selected-store/selectedStoreStore';
import { colors, space } from '@/src/theme/tokens';

const QUERY_LIMIT = 2_000;
type QueryStatus = 'loading' | 'success' | 'error';

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const mapRef = useRef<MapView | null>(null);
  const pendingCameraRef = useRef<MapRegion | null>(null);
  const repository = useStoreRepository();
  const region = useMapStore((state) => state.region);
  const setRegion = useMapStore((state) => state.setRegion);
  const userLocation = useMapStore((state) => state.userLocation);
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const filters = useFilterStore();
  const selectedStoreIds = useSelectedStoreStore(
    (state) => state.selectedStoreIds,
  );
  const selectStores = useSelectedStoreStore((state) => state.selectStores);
  const clearSelectedStore = useSelectedStoreStore(
    (state) => state.clearSelectedStore,
  );
  const meta = useDatasetStore((state) => state.meta);
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const { checkUpdate } = useDatasetUpdate();
  const [groups, setGroups] = useState<StoreLocationGroup[]>([]);
  const [queryAttempt, setQueryAttempt] = useState(0);
  const [queryStatus, setQueryStatus] = useState<QueryStatus>('loading');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewMode, setViewMode] = useState<MapViewMode>('map');
  const [sheetIndex, setSheetIndex] = useState(0);
  const estimatedDeckHeight =
    Math.max(insets.top, space.lg) + 56 + space.md + 44;
  const [deckHeight, setDeckHeight] = useState(estimatedDeckHeight);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const visibleGroups = useMemo(
    () =>
      filterGroupsByRadius(
        groups,
        locationEnabled ? userLocation : null,
        filters.radiusMeters,
      ),
    [groups, locationEnabled, userLocation, filters.radiusMeters],
  );

  const pinnedGroupIds = useMemo(() => {
    if (selectedStoreIds.length === 0) return undefined;
    const selected = new Set(selectedStoreIds);
    return new Set(
      visibleGroups
        .filter((group) => group.stores.some((store) => selected.has(store.id)))
        .map((group) => group.id),
    );
  }, [visibleGroups, selectedStoreIds]);

  const clusters = useMemo(
    () =>
      clusterByGrid(visibleGroups, region.longitudeDelta, 5, pinnedGroupIds),
    [visibleGroups, region.longitudeDelta, pinnedGroupIds],
  );

  useEffect(() => {
    void repository
      .getDatasetMeta()
      .then(setDatasetMeta)
      .catch(() => {});
  }, [repository, setDatasetMeta]);

  useEffect(() => {
    if (!meta?.version) return;
    void checkUpdate();
  }, [meta?.version, checkUpdate]);

  useEffect(() => {
    if (!locationEnabled) setUserLocation(null);
  }, [locationEnabled, setUserLocation]);

  // Typing a keyword searches the WHOLE dataset (no viewport bounds) — users
  // expect global search; the visible-area constraint only applies to browsing.
  const searching = filters.keyword.trim().length > 0;

  useEffect(() => {
    // Keep the selected store's query result stable while its detail is open.
    // Closing the detail reruns this effect for the map's latest region.
    if (selectedStoreIds.length > 0) return;

    let cancelled = false;
    const handle = setTimeout(() => {
      setQueryStatus('loading');
      void repository
        .getLocationGroups({
          keyword: filters.keyword,
          couponType: filters.couponType,
          payment: filters.payment,
          categoryMajorId: filters.categoryMajorId,
          bounds: searching ? undefined : boundsFromRegion(region),
          limit: QUERY_LIMIT,
        })
        .then((nextGroups) => {
          if (cancelled) return;
          setGroups(nextGroups);
          setQueryStatus('success');
        })
        .catch(() => {
          if (!cancelled) setQueryStatus('error');
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [
    repository,
    region,
    searching,
    filters.keyword,
    filters.couponType,
    filters.payment,
    filters.categoryMajorId,
    selectedStoreIds.length,
    queryAttempt,
  ]);

  const selectedStores = useMemo(() => {
    const selected = new Set(selectedStoreIds);
    return visibleGroups
      .flatMap((group) => group.stores)
      .filter((store) => selected.has(store.id));
  }, [visibleGroups, selectedStoreIds]);

  useEffect(() => {
    if (selectedStoreIds.length > 0 && selectedStores.length === 0) {
      clearSelectedStore();
    }
  }, [clearSelectedStore, selectedStoreIds.length, selectedStores.length]);

  const visibleStoreCount = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.stores.length, 0),
    [visibleGroups],
  );

  const visibleStores = useMemo(
    () => visibleGroups.flatMap((group) => group.stores),
    [visibleGroups],
  );

  const queryLoading = queryStatus === 'loading';
  const queryFailed = queryStatus === 'error';
  const sheetHeight = getSheetHeightAtIndex(
    sheetIndex,
    screenHeight,
    insets.bottom,
  );
  const top = Math.max(insets.top, space.lg);
  // Concrete width for the absolutely-positioned deck so its flex-1 children
  // (search + chip row) always get a firm width instead of collapsing to 0.
  const allSelected = filters.couponType === 'all';
  // Only the coupon filter lives inline; payment / category / radius are set in
  // the filter sheet, so the filter button lights up when any of them is active.
  const advancedActive =
    filters.payment !== 'all' ||
    filters.categoryMajorId !== null ||
    filters.radiusMeters !== 'all';
  const locationButtonBottom = sheetHeight + space.md;

  const handleRegionChange = useCallback(
    (nextRegion: typeof region) => {
      setRegion(nextRegion);
    },
    [setRegion],
  );

  const queueCameraToStore = useCallback(
    (lat: number, lng: number, zoomIn: boolean) => {
      pendingCameraRef.current = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: zoomIn ? 0.008 : region.latitudeDelta,
        longitudeDelta: zoomIn ? 0.008 : region.longitudeDelta,
      };
    },
    [region.latitudeDelta, region.longitudeDelta],
  );

  useEffect(() => {
    const pending = pendingCameraRef.current;
    if (!pending) return;
    if (selectedStoreIds.length === 0) {
      pendingCameraRef.current = null;
      return;
    }
    if (sheetIndex !== 1) return;
    pendingCameraRef.current = null;
    // react-native-maps can crash Android while applying mapPadding to a
    // recreated map. Offset only the selection camera instead.
    mapRef.current?.animateToRegion(
      {
        ...pending,
        latitude: getMapCameraLatitude(
          pending.latitude,
          pending.latitudeDelta,
          screenHeight,
          deckHeight,
          sheetHeight,
        ),
      },
      reduceMotion ? 0 : 400,
    );
  }, [
    deckHeight,
    reduceMotion,
    screenHeight,
    selectedStoreIds,
    sheetHeight,
    sheetIndex,
  ]);

  // Selecting a store from the list (e.g. a global search result) flies the map
  // to it, so picking a far-away match lands the user on the right block.
  const handleSelectStore = useCallback(
    (id: string) => {
      Keyboard.dismiss();
      const store = visibleStores.find((candidate) => candidate.id === id);
      if (store?.lat != null && store.lng != null) {
        queueCameraToStore(store.lat, store.lng, true);
      }
      selectStores([id]);
    },
    [queueCameraToStore, selectStores, visibleStores],
  );

  const handleSelectStores = useCallback(
    (stores: StoreLocationGroup['stores']) => {
      const store = stores[0];
      if (store?.lat != null && store.lng != null) {
        queueCameraToStore(store.lat, store.lng, false);
      }
      selectStores(stores.map((item) => item.id));
    },
    [queueCameraToStore, selectStores],
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
        reduceMotion ? 0 : 320,
      );
    },
    [reduceMotion, region.latitudeDelta, region.longitudeDelta],
  );

  return (
    <View className="flex-1 bg-page">
      {/* The map is a normal flex child filling the screen; controls float over
          it. (An absolutely-positioned wrapper hides the Android map surface.) */}
      <StoreMap
        clusters={clusters}
        initialRegion={KOTO_INITIAL_REGION}
        mapRef={mapRef}
        onClusterPress={handleClusterPress}
        onMapPress={clearSelectedStore}
        onRegionChangeComplete={handleRegionChange}
        onSelectStores={handleSelectStores}
        selectedStoreIds={selectedStoreIds}
        showsUserLocation={locationEnabled}
      />

      {/* Search and task controls stay compact so the map remains readable. */}
      <View
        className="absolute left-0 top-0"
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height;
          setDeckHeight((current) =>
            current === nextHeight ? current : nextHeight,
          );
        }}
        pointerEvents="box-none"
        style={{
          paddingLeft: Math.max(insets.left, space.lg),
          paddingRight: Math.max(insets.right, space.lg),
          paddingTop: top,
          width: screenWidth,
        }}
      >
        <View pointerEvents="box-none">
          <View className="flex-row items-center gap-2">
            <View className="min-w-0 flex-1">
              <SearchInput
                accessibilityLabel={t('map.searchLabel')}
                clearAccessibilityLabel={t('map.clearSearch')}
                elevated
                onChangeText={filters.setKeyword}
                placeholder={t('map.searchPlaceholder')}
                value={filters.keyword}
              />
            </View>
            <IconButton
              accessibilityLabel={t('filters.title')}
              className="h-11 w-11"
              onPress={() => router.push('/filters')}
              selected={advancedActive}
            >
              <Filter
                color={advancedActive ? colors.surface : colors.primary}
                size={22}
              />
            </IconButton>
            <IconButton
              accessibilityLabel={t('settings.title')}
              className="h-11 w-11"
              onPress={() => router.push('/settings')}
            >
              <Settings color={colors.muted} size={22} />
            </IconButton>
          </View>

          {/* Only the coupon-type chips stay inline — the one decision every
              user makes constantly. Payment / genre / distance live behind the
              filter button so the map stays uncluttered. */}
          <View className="mt-3 flex-row flex-wrap" style={{ gap: space.sm }}>
            <Chip
              selected={allSelected}
              onPress={() => filters.setCouponType('all')}
            >
              {t('common.all')}
            </Chip>
            <Chip
              selected={filters.couponType === 'ab'}
              onPress={() =>
                filters.setCouponType(
                  filters.couponType === 'ab' ? 'all' : 'ab',
                )
              }
            >
              {t('filters.ab')}
            </Chip>
            <Chip
              selected={filters.couponType === 'b_only'}
              tone="orange"
              onPress={() =>
                filters.setCouponType(
                  filters.couponType === 'b_only' ? 'all' : 'b_only',
                )
              }
            >
              {t('filters.bOnly')}
            </Chip>
          </View>
        </View>
      </View>

      {selectedStoreIds.length === 0 &&
      viewMode === 'map' &&
      sheetIndex < 2 &&
      !keyboardVisible ? (
        <View
          style={{
            bottom: locationButtonBottom,
            elevation: 18,
            position: 'absolute',
            right: space.xl,
            zIndex: 18,
          }}
        >
          <UserLocationButton mapRef={mapRef} />
        </View>
      ) : null}
      <StoreBottomSheet
        onChangeViewMode={setViewMode}
        onClearSelection={clearSelectedStore}
        onResetFilters={filters.reset}
        onRetryQuery={() => setQueryAttempt((attempt) => attempt + 1)}
        onSheetIndexChange={setSheetIndex}
        queryFailed={queryFailed}
        queryLoading={queryLoading}
        onSelectStore={handleSelectStore}
        searching={searching}
        sourceDate={meta?.officialUpdatedAt}
        stores={selectedStores}
        userLocation={userLocation}
        viewMode={viewMode}
        visibleStoreCount={visibleStoreCount}
        visibleStores={visibleStores}
      />
    </View>
  );
}
