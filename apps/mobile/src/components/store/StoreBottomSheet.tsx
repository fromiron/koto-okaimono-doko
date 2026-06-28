import type { Store } from '@koto/schema';
import { ChevronDown, Store as StoreIcon } from 'lucide-react-native';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { bottomSheetShadow, colors } from '@/src/theme/tokens';

import { StoreDetailContent } from './StoreDetailContent';

type StoreBottomSheetProps = {
  stores: Store[];
  visibleStoreCount: number;
  sourceDate?: string | null;
  userLocation?: LatLng | null;
};

export function StoreBottomSheet({
  sourceDate,
  stores,
  userLocation,
  visibleStoreCount,
}: StoreBottomSheetProps) {
  const { height } = useWindowDimensions();
  const expandedHeight = Math.min(height * 0.56, 540);
  const collapsedHeight = 132;
  const sheetHeight = stores.length > 0 ? expandedHeight : collapsedHeight;

  return (
    <View
      className="rounded-t-[28px] bg-paper-50"
      style={[bottomSheetShadow, { height: sheetHeight }]}
    >
      <View className="items-center py-3">
        <View className="h-1.5 w-24 rounded-full bg-line-200" />
      </View>
      {stores.length === 0 ? (
        <CollapsedContent count={visibleStoreCount} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <StoreDetailContent sourceDate={sourceDate} stores={stores} userLocation={userLocation} />
        </ScrollView>
      )}
    </View>
  );
}

function CollapsedContent({ count }: { count: number }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-4 px-5 pb-6">
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
