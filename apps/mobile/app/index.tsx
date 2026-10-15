import { boundsFromRegion } from '@koto/core';
import { Filter, Settings } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, useWindowDimensions, View } from 'react-native';
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
import { Button } from '@/src/components/ui/Button';
import { IconButton } from '@/src/components/ui/IconButton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useDatasetUpdate } from '@/src/features/dataset/useDatasetUpdate';
import { groupStoresByLocation } from '@/src/features/db/StoreRepository';
import { useStoreSearch } from '@/src/features/db/useStoreSearch';
import { useStoreRepository } from '@/src/features/db/useStoreRepository';
import { filterGroupsByRadius } from '@/src/features/filters/filterByRadius';
import { useFilterStore } from '@/src/features/filters/filterStore';
import { type MapRegion, useMapStore } from '@/src/features/map/mapStore';
import { useVoucherIntentStore } from '@/src/features/preferences/voucherIntentStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import {
  type ListPosition,
  useSelectedStoreStore,
} from '@/src/features/selected-store/selectedStoreStore';
import { colors, space } from '@/src/theme/tokens';

const QUERY_LIMIT = 2_000;

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const {
    height: screenHeight,
    width: screenWidth,
    fontScale,
  } = useWindowDimensions();
  const mapRef = useRef<MapView | null>(null);
  const pendingCameraRef = useRef<MapRegion | null>(null);
  const userPannedRef = useRef(false);
  const programmaticMoveRef = useRef(true);
  const repository = useStoreRepository();
  const region = useMapStore((state) => state.region);
  const setRegion = useMapStore((state) => state.setRegion);
  const searchRegion = useMapStore((state) => state.searchRegion);
  const pendingSearchRegion = useMapStore((state) => state.pendingSearchRegion);
  const proposeSearchRegion = useMapStore((state) => state.proposeSearchRegion);
  const searchThisArea = useMapStore((state) => state.searchThisArea);
  const clearPendingSearch = useMapStore((state) => state.clearPendingSearch);
  const userLocation = useMapStore((state) => state.userLocation);
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const filters = useFilterStore();
  const voucherIntent = useVoucherIntentStore((state) => state.intent);
  const selectedStoreIds = useSelectedStoreStore(
    (state) => state.selectedStoreIds,
  );
  const selectStores = useSelectedStoreStore((state) => state.selectStores);
  const navigation = useSelectedStoreStore();
  const {
    sheetIndex,
    setSheetIndex,
    task,
    scrollPosition,
    setScrollPosition,
    contextVersion,
    startSearch,
    goBack,
  } = navigation;
  const latestScrollPosition = useRef(scrollPosition);
  const scrollContext = useRef(contextVersion);
  if (scrollContext.current !== contextVersion) {
    latestScrollPosition.current = scrollPosition;
    scrollContext.current = contextVersion;
  }
  const captureScrollPosition = useCallback((position: ListPosition) => {
    latestScrollPosition.current = position;
  }, []);
  const meta = useDatasetStore((state) => state.meta);
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const { checkUpdate } = useDatasetUpdate();
  const [queryAttempt, setQueryAttempt] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const viewMode: MapViewMode = sheetIndex === 2 ? 'list' : 'map';
  const [contextNotice, setContextNotice] = useState<string | null>(null);
  const previousRevision = useRef(meta?.version);
  const setViewMode = useCallback(
    (mode: MapViewMode) => setSheetIndex(mode === 'list' ? 2 : 0),
    [setSheetIndex],
  );
  useEffect(() => {
    if (screenWidth / fontScale < 360 || screenHeight < 600) setSheetIndex(2);
  }, [screenWidth, screenHeight, fontScale, setSheetIndex]);

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

  const searching = filters.keyword.trim().length > 0;
  const searchParams = useMemo(
    () => ({
      medium: voucherIntent.medium,
      voucher: voucherIntent.voucher,
      keyword: filters.keyword,
      couponType: filters.couponType,
      payment: filters.payment,
      categoryMajorId: filters.categoryMajorId,
      bounds: searching ? undefined : boundsFromRegion(searchRegion),
      limit: QUERY_LIMIT,
    }),
    [
      voucherIntent.medium,
      voucherIntent.voucher,
      filters.keyword,
      filters.couponType,
      filters.payment,
      filters.categoryMajorId,
      searching,
      searchRegion,
    ],
  );
  const {
    stores,
    selectedStores,
    queryStatus,
    selectionStatus,
    selectionFailed,
  } = useStoreSearch(
    repository,
    searchParams,
    selectedStoreIds,
    queryAttempt,
    meta?.version,
  );
  const visibleStores = useMemo(
    () =>
      filterGroupsByRadius(
        stores,
        locationEnabled ? userLocation : null,
        filters.radiusMeters,
      ),
    [stores, locationEnabled, userLocation, filters.radiusMeters],
  );
  const visibleGroups = useMemo(
    () => groupStoresByLocation(visibleStores),
    [visibleStores],
  );
  const visibleStoreCount = visibleStores.length;

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

  const queryLoading = queryStatus === 'loading';
  const queryFailed = queryStatus === 'error' || selectionFailed;
  const sheetHeight = getSheetHeightAtIndex(
    sheetIndex,
    screenHeight,
    insets.bottom,
  );
  const top = Math.max(insets.top, space.lg);
  // The filter indicator describes extra constraints beyond the visible voucher choice.
  const advancedActive =
    filters.couponType !== 'all' ||
    filters.payment !== 'all' ||
    filters.categoryMajorId !== null ||
    filters.radiusMeters !== 'all';
  const locationButtonBottom = sheetHeight + space.md;

  const handleRegionChange = useCallback(
    (nextRegion: MapRegion, details: { isGesture?: boolean }) => {
      setRegion(nextRegion);
      if (
        details.isGesture ||
        userPannedRef.current ||
        (details.isGesture == null && !programmaticMoveRef.current)
      ) {
        proposeSearchRegion(nextRegion);
      }
      userPannedRef.current = false;
      programmaticMoveRef.current = false;
    },
    [proposeSearchRegion, setRegion],
  );

  const clearSelectedStore = useCallback(() => {
    Keyboard.dismiss();
    pendingCameraRef.current = null;
    const parent = goBack();
    if (parent) {
      clearPendingSearch();
      userPannedRef.current = false;
      setRegion(parent.camera);
      programmaticMoveRef.current = true;
      mapRef.current?.animateToRegion(parent.camera, reduceMotion ? 0 : 320);
    }
  }, [clearPendingSearch, goBack, reduceMotion, setRegion]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (Keyboard.isVisible()) {
            Keyboard.dismiss();
            return true;
          }
          if (useSelectedStoreStore.getState().task === 'browse') return false;
          clearSelectedStore();
          return true;
        },
      );
      return () => subscription.remove();
    }, [clearSelectedStore]),
  );

  const searchSession = JSON.stringify([
    searchParams,
    filters.radiusMeters,
    locationEnabled ? userLocation : null,
  ]);
  useEffect(() => {
    startSearch(searching);
  }, [searchSession, searching, startSearch]);

  useEffect(() => {
    if (
      previousRevision.current &&
      previousRevision.current !== meta?.version
    ) {
      setContextNotice(t('navigation.resultsChanged'));
    }
    previousRevision.current = meta?.version;
  }, [meta?.version, t]);

  useEffect(() => {
    if (
      selectedStoreIds.length > 0 &&
      selectionStatus === 'success' &&
      selectedStores.length === 0
    ) {
      clearSelectedStore();
      setContextNotice(t('navigation.selectionMissing'));
    }
  }, [
    clearSelectedStore,
    selectedStoreIds,
    selectedStores,
    selectionStatus,
    t,
  ]);

  const commitSearchArea = useCallback(() => {
    // Explicit area search replaces the current comparison session.
    while (useSelectedStoreStore.getState().parents.length > 0) goBack();
    pendingCameraRef.current = null;
    searchThisArea();
    filters.setKeyword('');
    setContextNotice(null);
  }, [filters, goBack, searchThisArea]);

  const queueCameraToStore = useCallback(
    (lat: number, lng: number, zoomIn: boolean) => {
      clearPendingSearch();
      userPannedRef.current = false;
      pendingCameraRef.current = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: zoomIn ? 0.008 : region.latitudeDelta,
        longitudeDelta: zoomIn ? 0.008 : region.longitudeDelta,
      };
    },
    [clearPendingSearch, region.latitudeDelta, region.longitudeDelta],
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
    programmaticMoveRef.current = true;
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
      const store = [...visibleStores, ...selectedStores].find(
        (candidate) => candidate.id === id,
      );
      if (store?.lat != null && store.lng != null) {
        queueCameraToStore(store.lat, store.lng, true);
      }
      setScrollPosition(latestScrollPosition.current);
      selectStores([id], region);
    },
    [
      queueCameraToStore,
      region,
      selectStores,
      selectedStores,
      setScrollPosition,
      visibleStores,
    ],
  );

  const handleSelectStores = useCallback(
    (stores: StoreLocationGroup['stores']) => {
      const store = stores[0];
      if (store?.lat != null && store.lng != null) {
        queueCameraToStore(store.lat, store.lng, false);
      }
      Keyboard.dismiss();
      setScrollPosition(latestScrollPosition.current);
      selectStores(
        stores.map((item) => item.id),
        region,
      );
    },
    [queueCameraToStore, region, selectStores, setScrollPosition],
  );

  const handleClusterPress = useCallback(
    (cluster: MarkerCluster<StoreLocationGroup>) => {
      const nextRegion = {
        latitude: cluster.lat,
        longitude: cluster.lng,
        latitudeDelta: Math.max(region.latitudeDelta / 2.5, 0.004),
        longitudeDelta: Math.max(region.longitudeDelta / 2.5, 0.004),
      };
      proposeSearchRegion(nextRegion);
      programmaticMoveRef.current = true;
      mapRef.current?.animateToRegion(nextRegion, reduceMotion ? 0 : 320);
    },
    [
      proposeSearchRegion,
      reduceMotion,
      region.latitudeDelta,
      region.longitudeDelta,
    ],
  );

  return (
    <View className="flex-1 bg-page">
      {/* The map is a normal flex child filling the screen; controls float over
          it. (An absolutely-positioned wrapper hides the Android map surface.) */}
      <StoreMap
        clusters={clusters}
        initialRegion={region}
        mapRef={mapRef}
        onClusterPress={handleClusterPress}
        onMapPress={clearSelectedStore}
        onRegionChangeComplete={handleRegionChange}
        onPanDrag={() => {
          userPannedRef.current = true;
        }}
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

          <View className="mt-3">
            <Button
              accessibilityLabel={`${t('voucher.label')}: ${t(
                'voucher.summary',
                {
                  medium: t(
                    `voucher.${voucherIntent.medium === 'any' ? 'notSpecified' : voucherIntent.medium}`,
                  ),
                  voucher: t(
                    `voucher.${voucherIntent.voucher === 'any' ? 'notSpecified' : voucherIntent.voucher}`,
                  ),
                },
              )}`}
              onPress={() => router.push('/filters')}
              variant="secondary"
            >
              {t('voucher.label')}:{' '}
              {t('voucher.summary', {
                medium: t(
                  `voucher.${voucherIntent.medium === 'any' ? 'notSpecified' : voucherIntent.medium}`,
                ),
                voucher: t(
                  `voucher.${voucherIntent.voucher === 'any' ? 'notSpecified' : voucherIntent.voucher}`,
                ),
              })}
            </Button>
          </View>
        </View>
      </View>

      {pendingSearchRegion && !keyboardVisible && sheetIndex < 2 ? (
        <View
          className="absolute self-center"
          style={{ top: deckHeight + space.sm }}
        >
          <Button onPress={commitSearchArea} variant="secondary">
            {t('map.searchHere')}
          </Button>
        </View>
      ) : null}
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
          <UserLocationButton mapRef={mapRef} onLocate={proposeSearchRegion} />
        </View>
      ) : null}
      <StoreBottomSheet
        task={task}
        contextVersion={contextVersion}
        datasetRevision={meta?.version}
        sheetIndex={sheetIndex}
        scrollPosition={scrollPosition}
        onScrollPositionChange={captureScrollPosition}
        backToFacility={navigation.parents.at(-1)?.task === 'facility'}
        contextNotice={
          contextNotice ??
          (task === 'store' &&
          queryStatus === 'success' &&
          selectedStores.length > 0 &&
          !visibleStores.some((store) => store.id === selectedStoreIds[0])
            ? t('navigation.outsideResults')
            : null)
        }
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
