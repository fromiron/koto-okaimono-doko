import type { Store } from '@koto/schema';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Button } from '@/src/components/ui/Button';
import { SegmentedToggle } from '@/src/components/ui/SegmentedToggle';
import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { bottomSheetShadow, colors, radii } from '@/src/theme/tokens';

import { StoreDetailContent } from './StoreDetailContent';
import { getCategoryText, getDistanceValueText } from './storeDisplay';

/** Visible height of the collapsed peek (excluding the bottom safe-area inset). */
export const SHEET_PEEK_HEIGHT = 168;

export type MapViewMode = 'map' | 'list';

type StoreBottomSheetProps = {
  stores: Store[];
  visibleStores: Store[];
  visibleStoreCount: number;
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  viewMode: MapViewMode;
  onChangeViewMode: (mode: MapViewMode) => void;
  onSelectStore: (id: string) => void;
  onResetFilters: () => void;
};

export function StoreBottomSheet({
  onChangeViewMode,
  onResetFilters,
  onSelectStore,
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
  const listMode = !hasSelection && viewMode === 'list' && visibleStoreCount > 0;

  const targetIndex = hasSelection ? 1 : listMode ? 2 : 0;
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

  const header = (
    <NearbyHeader
      count={visibleStoreCount}
      hasLocation={!!userLocation}
      onChangeViewMode={onChangeViewMode}
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
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <StoreDetailContent sourceDate={sourceDate} stores={stores} userLocation={userLocation} />
        </BottomSheetScrollView>
      ) : listMode ? (
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
      ) : (
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
          {header}
          {visibleStoreCount === 0 ? (
            <View className="items-center gap-3 px-6 pb-8 pt-2">
              <Text className="text-center" variant="subtitle">
                {t('map.noStores')}
              </Text>
              <Text className="text-center" tone="muted">
                {t('map.emptyHint')}
              </Text>
              <Button onPress={onResetFilters}>{t('map.resetFilters')}</Button>
            </View>
          ) : (
            <Text className="px-5 pb-6" tone="muted">
              {t('map.selectPin')}
            </Text>
          )}
        </BottomSheetView>
      )}
    </BottomSheet>
  );
}

function NearbyHeader({
  count,
  hasLocation,
  onChangeViewMode,
  t,
  viewMode,
}: {
  count: number;
  hasLocation: boolean;
  viewMode: MapViewMode;
  onChangeViewMode: (mode: MapViewMode) => void;
  t: TFunction;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 px-5 pb-3 pt-1">
      <View className="min-w-0 flex-1">
        <Text tone="muted" variant="caption">
          {hasLocation ? t('map.nearby') : t('map.inThisArea')}
        </Text>
        <Text numberOfLines={1} variant="subtitle">
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
    <Pressable className="flex-row items-center gap-3 px-5 py-3" onPress={onPress}>
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
