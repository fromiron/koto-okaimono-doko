import type { Store } from '@koto/schema';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { ChevronDown, Store as StoreIcon } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { bottomSheetShadow, colors } from '@/src/theme/tokens';

import { sheetSnapIndex } from './bottomSheetSnap';
import { StoreDetailContent } from './StoreDetailContent';

/** Visible height of the collapsed peek; map overlays (badge, location button) sit above it. */
export const SHEET_PEEK_HEIGHT = 148;

type StoreBottomSheetProps = {
  stores: Store[];
  visibleStoreCount: number;
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  onResetFilters: () => void;
};

export function StoreBottomSheet({
  onResetFilters,
  sourceDate,
  stores,
  userLocation,
  visibleStoreCount,
}: StoreBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [SHEET_PEEK_HEIGHT, '62%'], []);
  const hasSelection = stores.length > 0;

  useEffect(() => {
    sheetRef.current?.snapToIndex(sheetSnapIndex(hasSelection));
  }, [hasSelection]);

  return (
    <BottomSheet
      ref={sheetRef}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 28 }}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      handleIndicatorStyle={{ backgroundColor: colors.line, width: 56 }}
      index={sheetSnapIndex(hasSelection)}
      snapPoints={snapPoints}
      style={bottomSheetShadow}
    >
      {hasSelection ? (
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <StoreDetailContent sourceDate={sourceDate} stores={stores} userLocation={userLocation} />
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView>
          <CollapsedContent count={visibleStoreCount} onResetFilters={onResetFilters} />
        </BottomSheetView>
      )}
    </BottomSheet>
  );
}

function CollapsedContent({ count, onResetFilters }: { count: number; onResetFilters: () => void }) {
  const { t } = useTranslation();

  if (count === 0) {
    return (
      <View className="items-center gap-3 px-6 pb-8 pt-1">
        <Text className="text-center" variant="subtitle">
          {t('map.noStores')}
        </Text>
        <Text className="text-center" tone="muted">
          {t('map.emptyHint')}
        </Text>
        <Button onPress={onResetFilters}>{t('map.resetFilters')}</Button>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-4 px-5 pb-6 pt-1">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-paper-200">
        <StoreIcon color={colors.primary} size={26} />
      </View>
      <View className="min-w-0 flex-1">
        <Text variant="subtitle">{t('map.visibleStores', { count })}</Text>
        <Text tone="muted">{t('map.selectPin')}</Text>
      </View>
      <ChevronDown color={colors.inkMuted} size={26} />
    </View>
  );
}
