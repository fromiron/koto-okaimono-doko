import { distanceMeters } from '@koto/core';
import type { Store } from '@koto/schema';
import type { TFunction } from 'i18next';

import type { LatLng } from '@/src/features/map/mapStore';

export function getCategoryText(store: Store, t: TFunction): string {
  const major = t(
    `categories.major.${store.categoryMajorId}`,
    store.categoryMajorLabel,
  );
  const minor = store.categoryMinorId
    ? t(
        `categories.minor.${store.categoryMinorId}`,
        store.categoryMinorLabel ?? '',
      )
    : null;

  return minor ? `${major} / ${minor}` : major;
}

export function getAddressText(store: Store): string {
  const sourceAddress = store.address.trim();
  if (!sourceAddress) return '';
  const address = sourceAddress.startsWith('東京都')
    ? sourceAddress
    : `東京都江東区${sourceAddress}`;
  if (store.floor && !address.includes(store.floor)) {
    return `${address}\n${store.floor}`;
  }
  return address;
}

export function getFacilityName(stores: Store[]): string | null {
  const first = stores[0];
  for (const field of ['mallName', 'shoppingStreet'] as const) {
    const name = first?.[field]?.trim();
    if (name && stores.every((store) => store[field]?.trim() === name)) {
      return name;
    }
  }
  return null;
}

export function getFacilityAddress(stores: Store[]): string {
  const addresses = stores.map((store) =>
    getAddressText({
      ...store,
      address: store.floor
        ? store.address.replaceAll(store.floor, '').trim()
        : store.address,
      floor: null,
    }),
  );
  return addresses[0] && addresses.every((address) => address === addresses[0])
    ? addresses[0]
    : '';
}

export function getDistanceValueText(
  store: Store,
  userLocation: LatLng | null | undefined,
  t: TFunction,
): string {
  if (!userLocation || store.lat === null || store.lng === null) {
    return t('store.distanceUnavailable');
  }

  const distance = distanceMeters(
    { lat: userLocation.latitude, lng: userLocation.longitude },
    { lat: store.lat, lng: store.lng },
  );
  if (distance < 1000) {
    return t('store.approxMeters', { value: Math.round(distance) });
  }
  return t('store.approxKilometers', { value: (distance / 1000).toFixed(1) });
}
