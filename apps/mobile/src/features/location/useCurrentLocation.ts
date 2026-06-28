import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { useMapStore } from '@/src/features/map/mapStore';

export function useCurrentLocation() {
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'failed'>('idle');

  const requestCurrentLocation = useCallback(async () => {
    setStatus('requesting');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setStatus('denied');
      setUserLocation(null);
      return null;
    }

    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      const position =
        lastKnown ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(location);
      setStatus('granted');
      return location;
    } catch {
      setStatus('failed');
      setUserLocation(null);
      return null;
    }
  }, [setUserLocation]);

  return {
    requestCurrentLocation,
    status,
  };
}
