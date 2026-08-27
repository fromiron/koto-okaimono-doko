import { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { colors } from '@/src/theme/tokens';

import { CircleMarkerView } from './CircleMarkerView';
import { useMarkerBitmapCapture } from './useMarkerBitmapCapture';

type ClusterMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  onPress: () => void;
};

export function ClusterMarker({
  count,
  id,
  lat,
  lng,
  onPress,
}: ClusterMarkerProps) {
  const { t } = useTranslation();
  const tracksViewChanges = useMarkerBitmapCapture(String(count));

  return (
    <Marker
      accessibilityLabel={t('map.groupedStores', { count })}
      accessibilityRole="button"
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracksViewChanges}
    >
      <CircleMarkerView
        color={colors.facility}
        label={String(count)}
        labelTone="inverse"
      />
    </Marker>
  );
}
