import { LocateFixed } from 'lucide-react-native';
import { Alert, Linking } from 'react-native';
import type MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { IconButton } from '@/src/components/ui/IconButton';
import { useFilterStore } from '@/src/features/filters/filterStore';
import { useCurrentLocation } from '@/src/features/location/useCurrentLocation';
import { useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { colors } from '@/src/theme/tokens';

type UserLocationButtonProps = {
  mapRef: React.RefObject<MapView | null>;
};

export function UserLocationButton({ mapRef }: UserLocationButtonProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { requestCurrentLocation, status } = useCurrentLocation();
  const region = useMapStore((state) => state.region);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);

  return (
    <IconButton
      accessibilityLabel={t('map.currentLocation')}
      disabled={!locationEnabled || status === 'requesting'}
      onPress={async () => {
        const result = await requestCurrentLocation();
        if (result.status === 'denied') {
          useFilterStore.getState().setRadiusMeters('all');
          Alert.alert(
            t('map.locationPermissionTitle'),
            t('map.locationPermissionBody'),
            result.canAskAgain
              ? undefined
              : [
                  { style: 'cancel', text: t('common.cancel') },
                  {
                    onPress: () => void Linking.openSettings(),
                    text: t('map.openSettings'),
                  },
                ],
          );
          return;
        }
        if (result.status === 'failed') {
          useFilterStore.getState().setRadiusMeters('all');
          Alert.alert(
            t('map.locationFailedTitle'),
            t('map.locationFailedBody'),
          );
          return;
        }
        if (!result.location) return;
        mapRef.current?.animateToRegion(
          {
            ...region,
            latitude: result.location.latitude,
            longitude: result.location.longitude,
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
