import { normalize } from '@geolonia/normalize-japanese-addresses';
import type { LocationConfidence, Store } from '@koto/schema';

import type { ParsedStoreRow } from './parseHtml';
import { loadLocationCorrections } from './corrections';

const NOW = new Date().toISOString();

export async function normalizeRows(rows: ParsedStoreRow[]): Promise<Store[]> {
  const corrections = await loadLocationCorrections();
  const geocodeCache = new Map<string, Awaited<ReturnType<typeof geocodeAddress>>>();
  const stores: Store[] = [];

  for (const row of rows) {
    const correction = corrections.get(row.id);
    const geocodeKey = normalizeAddressForGeocoder(row.address);
    const geocode =
      correction === undefined
        ? await cachedGeocode(geocodeKey, geocodeCache)
        : {
            lat: correction.lat,
            lng: correction.lng,
            source: 'manual-correction',
            confidence: correction.confidence,
            normalizedAddress: row.address,
          };

    stores.push({
      ...row,
      phone: null,
      mallName: inferMallName(row.address),
      shoppingStreet: null,
      floor: inferFloor(row.address),
      areaName: row.address.split(/[0-9０-９]/)[0]?.trim() || null,
      lat: geocode.lat,
      lng: geocode.lng,
      normalizedAddress: geocode.normalizedAddress ?? row.normalizedAddress,
      locationSource: geocode.source,
      locationConfidence: geocode.confidence,
      homepageUrl: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
  }

  return stores;
}

async function cachedGeocode(
  address: string,
  cache: Map<string, Awaited<ReturnType<typeof geocodeAddress>>>,
) {
  const cached = cache.get(address);
  if (cached) return cached;

  const result = await geocodeAddress(address);
  cache.set(address, result);
  return result;
}

async function geocodeAddress(address: string): Promise<{
  lat: number | null;
  lng: number | null;
  source: string;
  confidence: LocationConfidence;
  normalizedAddress: string | null;
}> {
  try {
    const result = await normalize(address);
    const point = result.point;
    const pointLevel = point?.level ?? 0;

    return {
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      source: 'geolonia-normalize-japanese-addresses',
      confidence: confidenceFromLevel(pointLevel),
      normalizedAddress: [result.pref, result.city, result.town, result.addr].filter(Boolean).join('') || null,
    };
  } catch {
    return {
      lat: null,
      lng: null,
      source: 'geocode-failed',
      confidence: 'unknown',
      normalizedAddress: null,
    };
  }
}

function normalizeAddressForGeocoder(address: string): string {
  return `東京都江東区${address}`
    .replace(/\s+/g, ' ')
    .replace(/地下\d+階|[0-9０-９]+階|[A-ZＡ-Ｚ]?[0-9０-９]+F/gi, '')
    .trim();
}

function confidenceFromLevel(level: number): LocationConfidence {
  if (level >= 8) return 'high';
  if (level >= 3) return 'medium';
  if (level > 0) return 'low';
  return 'unknown';
}

function inferMallName(address: string): string | null {
  const mallNames = ['アトレ亀戸', 'アーバンドック ららぽーと豊洲', 'カメイドクロック', '有明ガーデン'];
  return mallNames.find((mallName) => address.includes(mallName)) ?? null;
}

function inferFloor(address: string): string | null {
  const match = address.match(/(地下\d+階|[0-9０-９]+階|[A-ZＡ-Ｚ]?[0-9０-９]+F)/i);
  return match?.[1] ?? null;
}
