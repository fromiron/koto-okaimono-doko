import type { Store } from '@koto/schema';
import { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { CircleMarkerView } from './CircleMarkerView';
import { getStoreMarkerDescriptor } from './markerDescriptor';
import { useMarkerBitmapCapture } from './useMarkerBitmapCapture';

type StoreMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  stores: Store[];
  selected?: boolean;
  onPress: () => void;
};

export function StoreMarker({
  id,
  lat,
  lng,
  onPress,
  selected = false,
  stores,
}: StoreMarkerProps) {
  const { t } = useTranslation();
  const descriptor = getStoreMarkerDescriptor(stores);
  const isFacility = descriptor.kind === 'facility';
  const accessibilityLabel = isFacility
    ? t('map.groupedStores', { count: stores.length })
    : `${stores[0]?.name ?? ''}, ${descriptor.label}`;
  const tracksViewChanges = useMarkerBitmapCapture(
    `${descriptor.kind}:${descriptor.color}:${descriptor.label}:${selected ? '1' : '0'}`,
  );

  return (
    <Marker
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 10 : 1}
    >
      <CircleMarkerView
        color={descriptor.color}
        label={descriptor.label}
        labelTone={descriptor.kind === 'b_only' ? 'default' : 'inverse'}
        selected={selected}
      />
    </Marker>
  );
}
