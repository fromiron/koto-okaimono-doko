import { distanceMeters, formatDistance } from '@koto/core';
import type { Store } from '@koto/schema';
import { Linking, Platform } from 'react-native';
import type { TFunction } from 'i18next';

import type { LatLng } from '@/src/features/map/mapStore';

export function getCategoryText(store: Store, t: TFunction): string {
  const major = t(`categories.major.${store.categoryMajorId}`, store.categoryMajorLabel);
  const minor = store.categoryMinorId
    ? t(`categories.minor.${store.categoryMinorId}`, store.categoryMinorLabel ?? '')
    : null;

  return minor ? `${major} / ${minor}` : major;
}

export function getAddressText(store: Store): string {
  const address = store.address.startsWith('東京都') ? store.address : `東京都江東区${store.address}`;
  if (store.floor && !address.includes(store.floor)) {
    return `${address}\n${store.floor}`;
  }
  return address;
}

export function getFacilityName(stores: Store[]): string | null {
  const first = stores[0];
  return first?.mallName ?? first?.shoppingStreet ?? null;
}

export function getFacilityAddress(stores: Store[]): string {
  const first = stores[0];
  return first ? getAddressText(first) : '';
}

export function getDistanceText(store: Store, userLocation: LatLng | null | undefined, t: TFunction): string {
  const distance = getDistanceValueText(store, userLocation, t);
  if (distance === t('store.distanceUnavailable')) {
    return distance;
  }

  return t('store.distanceFromCurrent', { distance });
}

export function getDistanceValueText(store: Store, userLocation: LatLng | null | undefined, t: TFunction): string {
  if (!userLocation || store.lat === null || store.lng === null) {
    return t('store.distanceUnavailable');
  }

  const distance = distanceMeters(
    { lat: userLocation.latitude, lng: userLocation.longitude },
    { lat: store.lat, lng: store.lng },
  );
  return `約${formatDistance(distance).replace(' ', '')}`;
}

export function openDirections(store: Store) {
  const query = encodeURIComponent(`${store.name} ${getAddressText(store)}`);
  const latLng = store.lat !== null && store.lng !== null ? `${store.lat},${store.lng}` : query;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${latLng}`;
  void Linking.openURL(url);
}
