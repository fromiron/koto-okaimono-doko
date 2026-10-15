import { distanceMeters } from '@koto/core';
import type { Store } from '@koto/schema';
import BottomSheet, {
  type BottomSheetBackgroundProps,
  BottomSheetFlatList,
  type BottomSheetFlatListMethods,
  type BottomSheetScrollViewMethods,
  type BottomSheetHandleProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { AlertCircle, ChevronLeft, SearchX } from 'lucide-react-native';
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  type FlatListProps,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  useWindowDimensions,
  View,
} from 'react-native';
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
import { StoreListRow } from './StoreListRow';
import {
  type BrowseTask,
  type ListPosition,
  INITIAL_LIST_POSITION,
} from '@/src/features/selected-store/selectedStoreStore';
import { getSheetHeightAtIndex, SHEET_PEEK_HEIGHT } from './sheetLayout';

export { SHEET_PEEK_HEIGHT };

export type MapViewMode = 'map' | 'list';

type StoreBottomSheetProps = {
  task: BrowseTask;
  contextVersion: number;
  datasetRevision?: string;
  sheetIndex: number;
  scrollPosition: ListPosition;
  onScrollPositionChange: (position: ListPosition) => void;
  backToFacility?: boolean;
  contextNotice?: string | null;
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
  onRetryQuery: () => void;
  queryFailed?: boolean;
  queryLoading?: boolean;
  onSheetIndexChange?: (index: number) => void;
};

export function StoreBottomSheet({
  task,
  contextVersion,
  datasetRevision,
  sheetIndex,
  scrollPosition,
  onScrollPositionChange,
  backToFacility = false,
  contextNotice,
  onChangeViewMode,
  onClearSelection,
  onResetFilters,
  onRetryQuery,
  onSelectStore,
  onSheetIndexChange,
  queryFailed = false,
  queryLoading = false,
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
  const { height } = useWindowDimensions();
  const snapPoints = useMemo(
    () =>
      [0, 1, 2].map((index) =>
        getSheetHeightAtIndex(index, height, insets.bottom),
      ),
    [height, insets.bottom],
  );
  const hasSelection = task !== 'browse';
  useEffect(() => {
    sheetRef.current?.snapToIndex(sheetIndex);
  }, [sheetIndex]);

  // Nearest-first when a location is known; otherwise keep the query order.
  const sortedStores = useMemo(() => {
    if (!userLocation) return visibleStores;
    const distance = (store: Store) =>
      store.lat != null && store.lng != null
        ? distanceMeters(
            { lat: userLocation.latitude, lng: userLocation.longitude },
            { lat: store.lat, lng: store.lng },
          )
        : Number.POSITIVE_INFINITY;
    return [...visibleStores].sort(
      (a, b) => distance(a) - distance(b) || a.id.localeCompare(b.id),
    );
  }, [visibleStores, userLocation]);

  const notice = contextNotice ? (
    <Text
      accessibilityLiveRegion="polite"
      className="px-5 pb-2"
      tone="muted"
      variant="caption"
    >
      {contextNotice}
    </Text>
  ) : null;
  const header = (
    <>
      {notice}
      <NearbyHeader
        count={visibleStoreCount}
        onChangeViewMode={onChangeViewMode}
        queryFailed={queryFailed}
        queryLoading={queryLoading}
        searching={searching}
        t={t}
        viewMode={viewMode}
      />
    </>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      accessibilityLabel={null}
      accessibilityRole={null}
      accessible={false}
      backgroundComponent={SheetBackground}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderRadius: radii.sheet,
      }}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
      handleComponent={SheetHandle}
      index={sheetIndex}
      onAnimate={(_fromIndex, toIndex) => onSheetIndexChange?.(toIndex)}
      onChange={onSheetIndexChange}
      snapPoints={snapPoints}
      style={bottomSheetShadow}
    >
      {hasSelection ? (
        <>
          <View
            className="flex-row items-center pb-2 pt-1"
            style={{
              paddingLeft: insets.left + 16,
              paddingRight: insets.right + 16,
            }}
          >
            <PressableScale
              accessibilityRole="button"
              className="min-h-12 max-w-full flex-row items-center gap-1 rounded-card border border-control-line bg-surface py-2 pl-2 pr-4 active:bg-neutral-soft"
              onPress={onClearSelection}
            >
              <ChevronLeft color={colors.ink} size={20} />
              <Text className="min-w-0 shrink" variant="label">
                {t(
                  backToFacility
                    ? 'navigation.backToFacility'
                    : 'map.backToList',
                )}
              </Text>
            </PressableScale>
          </View>
          <SelectionScroll
            key={`${contextVersion}:${datasetRevision}`}
            position={scrollPosition}
            onPositionChange={onScrollPositionChange}
            stores={stores}
            task={task}
            onSelectStore={onSelectStore}
            sourceDate={sourceDate}
            userLocation={userLocation}
            notice={notice}
            queryFailed={queryFailed}
            onRetryQuery={onRetryQuery}
          />
        </>
      ) : queryLoading && visibleStoreCount === 0 ? (
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
          showsVerticalScrollIndicator={false}
        >
          {header}
          <View
            accessibilityLabel={t('common.loading')}
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
            className="items-center gap-3 px-6 pb-8 pt-2"
          >
            <ActivityIndicator color={colors.primary} />
          </View>
        </BottomSheetScrollView>
      ) : visibleStoreCount === 0 ? (
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
          showsVerticalScrollIndicator={false}
        >
          {header}
          <View className="items-center gap-3 px-6 pb-8 pt-2">
            {queryFailed ? (
              <AlertCircle color={colors.danger} size={28} />
            ) : (
              <SearchX color={colors.muted} size={28} />
            )}
            <Text
              accessibilityLiveRegion={queryFailed ? 'assertive' : 'polite'}
              className="text-center"
              variant="subtitle"
            >
              {queryFailed
                ? t('map.dataErrorTitle')
                : searching
                  ? t('map.noSearchResults')
                  : t('map.noStores')}
            </Text>
            <Text className="text-center" tone="muted">
              {queryFailed
                ? t('map.dataErrorBody')
                : searching
                  ? t('map.searchEmptyHint')
                  : t('map.emptyHint')}
            </Text>
            <Button onPress={queryFailed ? onRetryQuery : onResetFilters}>
              {queryFailed
                ? t('common.retry')
                : searching
                  ? t('map.resetSearchAndFilters')
                  : t('map.resetFilters')}
            </Button>
          </View>
        </BottomSheetScrollView>
      ) : (
        <ResultList
          key={`${contextVersion}:${datasetRevision}`}
          stores={sortedStores}
          position={scrollPosition}
          onPositionChange={onScrollPositionChange}
          header={header}
          onSelectStore={onSelectStore}
          userLocation={userLocation}
        />
      )}
    </BottomSheet>
  );
}

function NearbyHeader({
  count,
  onChangeViewMode,
  queryFailed,
  queryLoading,
  searching,
  t,
  viewMode,
}: {
  count: number;
  queryFailed: boolean;
  queryLoading: boolean;
  searching: boolean;
  viewMode: MapViewMode;
  onChangeViewMode: (mode: MapViewMode) => void;
  t: TFunction;
}) {
  const { fontScale, width } = useWindowDimensions();
  const stackHeader = width / fontScale < 360;

  return (
    <View
      accessibilityState={{ busy: queryLoading }}
      className="gap-3 px-5 pb-3 pt-1"
    >
      <View
        className={
          stackHeader ? 'gap-3' : 'flex-row items-center justify-between gap-3'
        }
      >
        <View className="min-w-0 flex-1">
          <Text tone="muted" variant="caption">
            {searching ? t('map.searchResults') : t('map.inThisArea')}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text
              accessibilityLiveRegion="polite"
              tabularNums
              variant="subtitle"
            >
              {queryLoading && count === 0
                ? t('common.loading')
                : t('map.visibleStores', { count })}
            </Text>
            {queryLoading && count > 0 ? (
              <ActivityIndicator
                accessibilityLabel={t('common.loading')}
                accessibilityRole="progressbar"
                color={colors.primary}
                size="small"
              />
            ) : null}
          </View>
          {queryFailed && count > 0 ? (
            <Text
              accessibilityLiveRegion="assertive"
              tone="danger"
              variant="caption"
            >
              {t('map.dataErrorTitle')}
            </Text>
          ) : null}
        </View>
        <View className={stackHeader ? 'self-start' : ''}>
          <SegmentedToggle
            onChange={onChangeViewMode}
            options={[
              {
                accessibilityHint: t('map.viewMapHint'),
                label: t('map.viewMap'),
                value: 'map',
              },
              {
                accessibilityHint: t('map.viewListHint'),
                label: t('map.viewList'),
                value: 'list',
              },
            ]}
            value={viewMode}
          />
        </View>
      </View>
    </View>
  );
}

function SheetBackground({ pointerEvents, style }: BottomSheetBackgroundProps) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      pointerEvents={pointerEvents}
      style={style}
    />
  );
}

function SheetHandle(_props: BottomSheetHandleProps) {
  return (
    <View
      accessible={false}
      className="h-7 items-center justify-center"
      importantForAccessibility="no-hide-descendants"
    >
      <View className="h-1 w-14 rounded-full bg-control-line" />
    </View>
  );
}

function positionAtOffset(
  offset: number,
  rows: Map<string, number>,
): ListPosition {
  const entries = [...rows].sort((a, b) => a[1] - b[1]);
  const anchor = entries.findLast(([, y]) => y <= offset) ?? entries[0];
  return {
    offset,
    storeId: anchor?.[0] ?? null,
    relativeOffset: anchor ? offset - anchor[1] : 0,
  };
}

function ResultList({
  stores,
  position,
  onPositionChange,
  header,
  onSelectStore,
  userLocation,
}: {
  stores: Store[];
  position: ListPosition;
  onPositionChange: (position: ListPosition) => void;
  header: React.ReactElement;
  onSelectStore: (id: string) => void;
  userLocation?: LatLng | null;
}) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const rows = useRef(new Map<string, number>());
  const anchorIndex = stores.findIndex(
    (store) => store.id === position.storeId,
  );
  const [fallback, setFallback] = useState(
    !!position.storeId && anchorIndex < 0,
  );
  const pending = useRef(fallback ? INITIAL_LIST_POSITION : position);
  const latestOffset = useRef(pending.current.offset);
  const restored = useRef(false);
  const attempts = useRef(0);
  const retry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();
  useEffect(
    () => () => {
      if (retry.current) clearTimeout(retry.current);
    },
    [],
  );
  const remember = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    restored.current = true;
    latestOffset.current = event.nativeEvent.contentOffset.y;
    onPositionChange(positionAtOffset(latestOffset.current, rows.current));
  };
  const restore = useCallback(() => {
    if (restored.current || !listRef.current) return;
    const saved = pending.current;
    const y = saved.storeId ? rows.current.get(saved.storeId) : undefined;
    if (y != null || saved.offset === 0 || anchorIndex < 0) {
      listRef.current?.scrollToOffset({
        offset: Math.max(
          0,
          y == null ? saved.offset : y + saved.relativeOffset,
        ),
        animated: false,
      });
      restored.current = true;
    } else {
      listRef.current?.scrollToIndex({
        index: anchorIndex,
        viewOffset: -saved.relativeOffset,
        animated: false,
      });
    }
  }, [anchorIndex]);
  const Cell = useCallback(
    (
      props: ComponentProps<
        NonNullable<FlatListProps<Store>['CellRendererComponent']>
      >,
    ) => (
      <View
        style={props.style}
        onLayout={(event) => {
          props.onLayout?.(event);
          rows.current.set(props.item.id, event.nativeEvent.layout.y);
          if (props.item.id === pending.current.storeId) restore();
        }}
      >
        {props.children}
      </View>
    ),
    [restore],
  );
  return (
    <BottomSheetFlatList
      ref={listRef}
      CellRendererComponent={Cell}
      ListHeaderComponent={
        <>
          {fallback ? (
            <Text accessibilityLiveRegion="polite" className="px-5 pb-2">
              {t('navigation.positionReset')}
            </Text>
          ) : null}
          {header}
        </>
      }
      contentContainerStyle={{
        paddingBottom: insets.bottom + 8,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      data={stores}
      ItemSeparatorComponent={() => (
        <View className="bg-line" style={{ height: 1, marginHorizontal: 20 }} />
      )}
      keyboardShouldPersistTaps="handled"
      keyExtractor={(store) => store.id}
      {...{
        // Gorhom forwards onScroll at runtime although its FlatList type omits it.
        onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          latestOffset.current = event.nativeEvent.contentOffset.y;
          onPositionChange(
            positionAtOffset(latestOffset.current, rows.current),
          );
        },
      }}
      onScrollBeginDrag={() => {
        restored.current = true;
      }}
      onContentSizeChange={restore}
      onScrollToIndexFailed={({ averageItemLength, index }) => {
        if (restored.current || retry.current) return;
        if (attempts.current++ >= 3) {
          restored.current = true;
          listRef.current?.scrollToOffset({ offset: 0, animated: false });
          onPositionChange(INITIAL_LIST_POSITION);
          setFallback(true);
          return;
        }
        listRef.current?.scrollToOffset({
          offset: Math.max(
            0,
            averageItemLength * index + pending.current.relativeOffset,
          ),
          animated: false,
        });
        retry.current = setTimeout(() => {
          retry.current = null;
          restore();
        }, 100);
      }}
      onScrollEndDrag={remember}
      renderItem={({ item }) => (
        <StoreListRow
          onPress={() => {
            onPositionChange(
              positionAtOffset(latestOffset.current, rows.current),
            );
            onSelectStore(item.id);
          }}
          store={item}
          userLocation={userLocation}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

function SelectionScroll({
  position,
  onPositionChange,
  stores,
  task,
  onSelectStore,
  sourceDate,
  userLocation,
  notice,
  queryFailed,
  onRetryQuery,
}: {
  position: ListPosition;
  onPositionChange: (position: ListPosition) => void;
  stores: Store[];
  task: BrowseTask;
  onSelectStore: (id: string) => void;
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  notice: React.ReactNode;
  queryFailed: boolean;
  onRetryQuery: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const ref = useRef<BottomSheetScrollViewMethods>(null);
  const rows = useRef(new Map<string, number>());
  const saved = useRef(position);
  const latestOffset = useRef(position.offset);
  const restored = useRef(false);
  const detailY = useRef(0);
  const remember = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    restored.current = true;
    latestOffset.current = event.nativeEvent.contentOffset.y;
    onPositionChange(positionAtOffset(latestOffset.current, rows.current));
  };
  const restore = () => {
    if (restored.current || !ref.current || stores.length === 0) return;
    const id = saved.current.storeId;
    const anchorY = id ? rows.current.get(id) : undefined;
    const missing = id && !stores.some((store) => store.id === id);
    ref.current?.scrollTo({
      y: Math.max(
        0,
        missing
          ? 0
          : anchorY == null
            ? saved.current.offset
            : anchorY + saved.current.relativeOffset,
      ),
      animated: false,
    });
    if (missing || anchorY != null || saved.current.offset === 0)
      restored.current = true;
  };
  return (
    <BottomSheetScrollView
      ref={ref}
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      keyboardShouldPersistTaps="handled"
      onScroll={(event) => {
        latestOffset.current = event.nativeEvent.contentOffset.y;
        onPositionChange(positionAtOffset(latestOffset.current, rows.current));
      }}
      onScrollBeginDrag={() => {
        restored.current = true;
      }}
      onContentSizeChange={restore}
      onScrollEndDrag={remember}
      showsVerticalScrollIndicator={false}
    >
      {notice}
      {queryFailed ? (
        <Button onPress={onRetryQuery}>{t('common.retry')}</Button>
      ) : stores.length === 0 ? (
        <ActivityIndicator
          accessibilityLabel={t('common.loading')}
          color={colors.primary}
        />
      ) : null}
      <View
        onLayout={(event) => {
          const y = event.nativeEvent.layout.y;
          const delta = y - detailY.current;
          rows.current.forEach((rowY, id) =>
            rows.current.set(id, rowY + delta),
          );
          detailY.current = y;
          restore();
        }}
      >
        <StoreDetailContent
          forceFacility={task === 'facility'}
          onSelectStore={(id) => {
            onPositionChange(
              positionAtOffset(latestOffset.current, rows.current),
            );
            onSelectStore(id);
          }}
          onStoreLayout={(id, y) => {
            rows.current.set(id, y + detailY.current);
            restore();
          }}
          sourceDate={sourceDate}
          stores={stores}
          userLocation={userLocation}
        />
      </View>
    </BottomSheetScrollView>
  );
}
