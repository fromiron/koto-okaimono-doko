import { LocateFixed } from 'lucide-react-native';
import type MapView from 'react-native-maps';

import { IconButton } from '@/src/components/ui/IconButton';
import { useCurrentLocation } from '@/src/features/location/useCurrentLocation';
import { useMapStore } from '@/src/features/map/mapStore';

type UserLocationButtonProps = {
  mapRef: React.RefObject<MapView | null>;
};

export function UserLocationButton({ mapRef }: UserLocationButtonProps) {
  const { requestCurrentLocation, status } = useCurrentLocation();
  const region = useMapStore((state) => state.region);

  return (
    <IconButton
      accessibilityLabel="Current location"
      disabled={status === 'requesting'}
      onPress={async () => {
        const location = await requestCurrentLocation();
        if (!location) return;
        mapRef.current?.animateToRegion(
          {
            ...region,
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          350,
        );
      }}
    >
      <LocateFixed color="#176762" size={22} />
    </IconButton>
  );
}
