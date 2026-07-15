import type { LatLng } from '@/src/features/map/mapStore';

import type { RadiusMeters } from './filterStore';

export type DistanceRadius = Exclude<RadiusMeters, 'all'>;

type SelectRadiusWithLocationOptions = {
  currentLocation: LatLng | null;
  radius: DistanceRadius;
  requestLocation: () => Promise<LatLng | null>;
  selectRadius: (radius: DistanceRadius) => void;
};

export async function selectRadiusWithLocation({
  currentLocation,
  radius,
  requestLocation,
  selectRadius,
}: SelectRadiusWithLocationOptions): Promise<boolean> {
  const location = currentLocation ?? (await requestLocation());
  if (!location) return false;

  selectRadius(radius);
  return true;
}
