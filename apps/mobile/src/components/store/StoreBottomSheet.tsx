import type { Store } from '@koto/schema';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { SegmentedToggle } from '@/src/components/ui/SegmentedToggle';
import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { bottomSheetShadow, colors, radii } from '@/src/theme/tokens';

import { StoreDetailContent } from './StoreDetailContent';
import { getCategoryText, getDistanceValueText } from './storeDisplay';

/** Visible height of the collapsed peek (excluding the bottom safe-area inset). */
export const SHEET_PEEK_HEIGHT = 208;

export type MapViewMode = 'map' | 'list';

type StoreBottomSheetProps = {
  stores: Store[];
  visibleStores: Store[];
  visibleStoreCount: number;
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  viewMode: MapViewMode;
  /** True while a global keyword search is active — the sheet opens to show results. */
  searching?: boolean;
  onChangeViewMode: (mode: MapViewMode) => void;
  onSelectStore: (id: string) => void;
  onClearSelection: () => void;
  onResetFilters: () => void;
};

export function StoreBottomSheet({
  onChangeViewMode,
  onClearSelection,
  onResetFilters,
  onSelectStore,
  searching = false,
  sourceDate,
  stores,
  userLocation,
  viewMode,
  visibleStoreCount,
  visibleStores,
}: StoreBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [SHEET_PEEK_HEIGHT + insets.bottom, '58%', '92%'], [insets.bottom]);
  const hasSelection = stores.length > 0;
  // The 地図/リスト toggle just controls how far the sheet opens; the browse
  // surface is always the same vertical list, so it scans cleanly at any size.
  const expandList = !hasSelection && viewMode === 'list' && visibleStoreCount > 0;

  // Search results open to half height (map + list both visible); tapping a
  // result then shows that store's detail at the same height.
  const targetIndex = hasSelection ? 1 : expandList ? 2 : searching ? 1 : 0;
  useEffect(() => {
    sheetRef.current?.snapToIndex(targetIndex);
  }, [targetIndex]);

  // Nearest-first when a location is known; otherwise keep the query order.
  const sortedStores = useMemo(() => {
    if (!userLocation) return visibleStores;
    const distance = (store: Store) =>
      store.lat != null && store.lng != null
        ? (userLocation.latitude - store.lat) ** 2 + (userLocation.longitude - store.lng) ** 2
        : Number.POSITIVE_INFINITY;
    return [...visibleStores].sort((a, b) => distance(a) - distance(b));
  }, [visibleStores, userLocation]);

  const abCount = useMemo(
    () => visibleStores.filter((store) => store.couponType !== 'b_only').length,
    [visibleStores],
  );

  const header = (
    <NearbyHeader
      abCount={abCount}
      count={visibleStoreCount}
      hasLocation={!!userLocation}
      onChangeViewMode={onChangeViewMode}
      searching={searching}
      t={t}
      viewMode={viewMode}
    />
  );

  return (
    <BottomSheet
      ref={sheetRef}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: radii.sheet }}
      enableDynamicSizing={false}
      handleIndicatorStyle={{ backgroundColor: colors.line, width: 56 }}
      index={targetIndex}
      snapPoints={snapPoints}
      style={bottomSheetShadow}
    >
      {hasSelection ? (
        <>
          <View className="flex-row items-center px-4 pb-2 pt-1">
            <PressableScale
              accessibilityRole="button"
              className="h-10 flex-row items-center gap-1 rounded-full border border-line bg-surface pl-2 pr-4 active:bg-neutral-soft"
              onPress={onClearSelection}
            >
              <ChevronLeft color={colors.ink} size={20} />
              <Text variant="label">{t('map.backToList')}</Text>
            </PressableScale>
          </View>
          <BottomSheetScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            <StoreDetailContent sourceDate={sourceDate} stores={stores} userLocation={userLocation} />
          </BottomSheetScrollView>
        </>
      ) : visibleStoreCount === 0 ? (
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
          {header}
          <View className="items-center gap-3 px-6 pb-8 pt-2">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-soft">
              <SearchX color={colors.muted} size={28} />
            </View>
            <Text className="text-center" variant="subtitle">
              {t('map.noStores')}
            </Text>
            <Text className="text-center" tone="muted">
              {t('map.emptyHint')}
            </Text>
            <Button onPress={onResetFilters}>{t('map.resetFilters')}</Button>
          </View>
        </BottomSheetView>
      ) : (
        <BottomSheetFlatList
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
          data={sortedStores}
          ItemSeparatorComponent={() => <View className="bg-line" style={{ height: 1, marginHorizontal: 20 }} />}
          keyExtractor={(store) => store.id}
          renderItem={({ item }) => (
            <StoreListRow onPress={() => onSelectStore(item.id)} store={item} t={t} userLocation={userLocation} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BottomSheet>
  );
}

function NearbyHeader({
  abCount,
  count,
  hasLocation,
  onChangeViewMode,
  searching,
  t,
  viewMode,
}: {
  abCount: number;
  count: number;
  hasLocation: boolean;
  searching: boolean;
  viewMode: MapViewMode;
  onChangeViewMode: (mode: MapViewMode) => void;
  t: TFunction;
}) {
  const bCount = Math.max(count - abCount, 0);

  return (
    <View className="gap-3 px-5 pb-3 pt-1">
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text tone="muted" variant="caption">
            {searching ? t('map.searchResults') : hasLocation ? t('map.nearby') : t('map.inThisArea')}
          </Text>
          <Text numberOfLines={1} tabularNums variant="title">
            {t('map.visibleStores', { count })}
          </Text>
        </View>
        <SegmentedToggle
          onChange={onChangeViewMode}
          options={[
            { label: t('map.viewMap'), value: 'map' },
            { label: t('map.viewList'), value: 'list' },
          ]}
          value={viewMode}
        />
      </View>
      {count > 0 ? (
        <View className="flex-row gap-2">
          <CountPill
            dotColor={colors.primary}
            label={t('filters.ab')}
            tint="bg-primary-soft"
            value={abCount}
          />
          <CountPill
            dotColor={colors.couponB}
            label={t('filters.bOnly')}
            tint="bg-coupon-b-soft"
            value={bCount}
          />
        </View>
      ) : null}
    </View>
  );
}

/** A tiny legend chip on the coupon's soft wash: dot + label + count. */
function CountPill({
  dotColor,
  label,
  tint,
  value,
}: {
  dotColor: string;
  label: string;
  tint: string;
  value: number;
}) {
  return (
    <View className={`flex-row items-center gap-2 rounded-full px-3 py-1 ${tint}`}>
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      <Text tone="muted" variant="caption">
        {label}
      </Text>
      <Text tabularNums variant="label">
        {value}
      </Text>
    </View>
  );
}

function StoreListRow({
  onPress,
  store,
  t,
  userLocation,
}: {
  store: Store;
  userLocation?: LatLng | null;
  onPress: () => void;
  t: TFunction;
}) {
  const isAb = store.couponType !== 'b_only';
  const raw = getDistanceValueText(store, userLocation, t);
  const distanceText = userLocation && raw !== t('store.distanceUnavailable') ? raw : null;

  return (
    <Pressable className="flex-row items-center gap-3 px-5 py-3 active:bg-neutral-soft" onPress={onPress}>
      <View
        className="items-center justify-center rounded-thumb px-2 py-1"
        style={{ backgroundColor: isAb ? colors.primary : colors.couponB, minWidth: 46 }}
      >
        <Text tone="inverse" variant="micro">
          {isAb ? 'A・B' : 'B'}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} variant="label">
          {store.name}
        </Text>
        <Text numberOfLines={1} tone="muted" variant="caption">
          {getCategoryText(store, t)}
        </Text>
      </View>
      {distanceText ? <Text variant="label">{distanceText}</Text> : null}
      <ChevronRight color={colors.muted} size={20} />
    </Pressable>
  );
}
