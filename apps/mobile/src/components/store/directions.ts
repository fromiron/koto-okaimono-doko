import type { Store } from '@koto/schema';

import { getAddressText } from './storeDisplay';

export type MapLinks = {
  provider: 'Apple Maps' | 'Google Maps';
  directions: string;
  map: string;
};

export function getStoreMapLinks(
  store: Store,
  platform: { os: string; version: string | number },
  // A null name denotes an unnamed location group; never route to its first tenant.
  facilityName?: string | null,
): MapLinks | null {
  const isFacility = facilityName !== undefined;
  const name = (isFacility ? facilityName : store.name)?.trim();
  const address = getAddressText(
    isFacility
      ? {
          ...store,
          address: store.floor
            ? store.address.replaceAll(store.floor, '').trim()
            : store.address,
          floor: null,
        }
      : store,
  );
  const officialDestination = address
    ? [name, address].filter(Boolean).join(' ')
    : null;
  const hasTrustedPoint =
    !isFacility &&
    !store.mallName &&
    !store.shoppingStreet &&
    !store.floor &&
    store.locationConfidence === 'high' &&
    ['manual-correction', 'geolonia-normalize-japanese-addresses'].includes(
      store.locationSource,
    ) &&
    store.lat !== null &&
    store.lng !== null &&
    Number.isFinite(store.lat) &&
    Number.isFinite(store.lng) &&
    Math.abs(store.lat) <= 90 &&
    Math.abs(store.lng) <= 180;
  const destination = hasTrustedPoint
    ? `${store.lat},${store.lng}`
    : officialDestination;
  if (!destination) return null;

  const [major, minor = 0] = String(platform.version).split('.').map(Number);
  // Apple's unified URLs require iOS 18.4; Google HTTPS URLs cover older iOS.
  const useApple =
    platform.os === 'ios' && (major > 18 || (major === 18 && minor >= 4));
  const encodedDestination = encodeURIComponent(destination);
  const encodedSearch = encodeURIComponent(officialDestination ?? destination);

  return useApple
    ? {
        provider: 'Apple Maps',
        directions: `https://maps.apple.com/directions?destination=${encodedDestination}`,
        map: `https://maps.apple.com/search?query=${encodedSearch}`,
      }
    : {
        provider: 'Google Maps',
        directions: `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`,
        map: `https://www.google.com/maps/search/?api=1&query=${encodedSearch}`,
      };
}

export async function openMapLink(
  url: string | undefined,
  openURL: (url: string) => Promise<unknown>,
): Promise<'opened' | 'failed' | 'missing-destination'> {
  if (!url) return 'missing-destination';
  try {
    await openURL(url);
    return 'opened';
  } catch {
    return 'failed';
  }
}
