import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';

export function useCurrentLocation() {
  const setUserLocation = useMapStore((state) => state.setUserLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied' | 'failed' | 'disabled'
  >('idle');

  const requestCurrentLocation = useCallback(async () => {
    if (!locationEnabled) {
      setStatus('disabled');
      setUserLocation(null);
      return { location: null, status: 'disabled' as const };
    }

    setStatus('requesting');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setStatus('denied');
        setUserLocation(null);
        return {
          canAskAgain: permission.canAskAgain,
          location: null,
          status: 'denied' as const,
        };
      }

      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 60_000,
        requiredAccuracy: 200,
      });
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
      return { canAskAgain: true, location, status: 'granted' as const };
    } catch {
      setStatus('failed');
      setUserLocation(null);
      return {
        canAskAgain: true,
        location: null,
        status: 'failed' as const,
      };
    }
  }, [locationEnabled, setUserLocation]);

  return {
    requestCurrentLocation,
    status,
  };
}
