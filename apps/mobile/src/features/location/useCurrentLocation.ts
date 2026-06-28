import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';

export function useCurrentLocation() {
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'failed' | 'disabled'>('idle');

  const requestCurrentLocation = useCallback(async () => {
    if (!locationEnabled) {
      setStatus('disabled');
      setUserLocation(null);
      return null;
    }

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
  }, [locationEnabled, setUserLocation]);

  return {
    requestCurrentLocation,
    status,
  };
}
