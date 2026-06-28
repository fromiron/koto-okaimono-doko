import type { LatLng } from './distance';

export type Bounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export function boundsFromRadius(center: LatLng, radiusMeters: number): Bounds {
  const latDelta = radiusMeters / 111_320;
  const lngDelta = radiusMeters / (111_320 * Math.cos((center.lat * Math.PI) / 180));

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export function boundsFromRegion(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): Bounds {
  return {
    minLat: region.latitude - region.latitudeDelta / 2,
    maxLat: region.latitude + region.latitudeDelta / 2,
    minLng: region.longitude - region.longitudeDelta / 2,
    maxLng: region.longitude + region.longitudeDelta / 2,
  };
}
