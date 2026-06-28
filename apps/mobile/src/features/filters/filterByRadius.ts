import { distanceMeters } from '@koto/core';

import type { RadiusMeters } from '@/src/features/filters/filterStore';
import type { LatLng } from '@/src/features/map/mapStore';

/**
 * Keeps only the location groups within `radius` metres of the user.
 * Returns the input unchanged when radius is 'all' or the user location is unknown,
 * so the map falls back to viewport-based results.
 */
export function filterGroupsByRadius<T extends { lat: number; lng: number }>(
  groups: T[],
  userLocation: LatLng | null | undefined,
  radius: RadiusMeters,
): T[] {
  if (radius === 'all' || !userLocation) {
    return groups;
  }

  return groups.filter(
    (group) =>
      distanceMeters(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        { lat: group.lat, lng: group.lng },
      ) <= radius,
  );
}
