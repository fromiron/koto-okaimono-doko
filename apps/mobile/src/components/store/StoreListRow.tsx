import type { Store } from '@koto/schema';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import type { LatLng } from '@/src/features/map/mapStore';
import { colors } from '@/src/theme/tokens';

import { DirectionsActions } from './DirectionsActions';
import { VoucherStatus } from './VoucherStatus';
import { getCategoryText, getDistanceValueText } from './storeDisplay';

export function StoreListRow({
  onPress,
  onLayout,
  store,
  userLocation,
}: {
  store: Store;
  userLocation?: LatLng | null;
  onPress?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { t } = useTranslation();
  const datasetId = useDatasetStore((state) => state.meta?.datasetId);
  const location = [
    store.areaName,
    store.mallName ?? store.shoppingStreet,
    store.floor,
  ]
    .filter(Boolean)
    .join(' / ');
  const located = store.lat != null && store.lng != null;

  return (
    <View className="gap-2 px-5 py-3" onLayout={onLayout}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        className="min-h-11 flex-row items-center gap-3 rounded-card active:bg-neutral-soft"
        disabled={!onPress}
        onPress={onPress}
      >
        <View className="min-w-0 flex-1 gap-1">
          <Text numberOfLines={2} variant="label">
            {store.name}
          </Text>
          <VoucherStatus datasetId={datasetId} store={store} />
          <Text tone="muted" variant="caption">
            {getCategoryText(store, t)}
          </Text>
          {location ? (
            <Text tone="muted" variant="caption">
              {location}
            </Text>
          ) : null}
          {userLocation && located ? (
            <Text tone="muted" variant="caption">
              {t('listing.straightDistance', {
                distance: getDistanceValueText(store, userLocation, t),
              })}
            </Text>
          ) : !located ? (
            <Text tone="muted" variant="caption">
              {t('listing.locationUnknown')}
            </Text>
          ) : null}
        </View>
        {onPress ? <ChevronRight color={colors.muted} size={20} /> : null}
      </Pressable>
      <DirectionsActions compact store={store} />
    </View>
  );
}
