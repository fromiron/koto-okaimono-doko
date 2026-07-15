import { LocateFixed } from 'lucide-react-native';
import type MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { IconButton } from '@/src/components/ui/IconButton';
import { useCurrentLocationWithFeedback } from '@/src/features/location/useCurrentLocationWithFeedback';
import { useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { colors } from '@/src/theme/tokens';

type UserLocationButtonProps = {
  mapRef: React.RefObject<MapView | null>;
};

export function UserLocationButton({ mapRef }: UserLocationButtonProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { requestLocation, status } = useCurrentLocationWithFeedback();
  const region = useMapStore((state) => state.region);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);

  return (
    <IconButton
      accessibilityLabel={t('map.currentLocation')}
      disabled={!locationEnabled || status === 'requesting'}
      onPress={async () => {
        const location = await requestLocation();
        if (!location) return;
        mapRef.current?.animateToRegion(
          {
            ...region,
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          reduceMotion ? 0 : 350,
        );
      }}
      shadow
    >
      <LocateFixed color={colors.primary} size={24} />
    </IconButton>
  );
}
