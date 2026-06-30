import { z } from 'zod';

export const OFFICIAL_SOURCE_ORIGIN = 'https://koto-okaimono-premium.jp';
const OFFICIAL_DETAIL_PATH_PREFIX = '/list/detail/';

export function isAllowedOfficialDetailUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.origin === OFFICIAL_SOURCE_ORIGIN &&
      url.pathname.startsWith(OFFICIAL_DETAIL_PATH_PREFIX) &&
      url.pathname.length > OFFICIAL_DETAIL_PATH_PREFIX.length
    );
  } catch {
    return false;
  }
}

export function normalizeOfficialDetailUrl(value: string): string | null {
  try {
    const url = new URL(value, OFFICIAL_SOURCE_ORIGIN);
    const normalized = url.toString();
    return isAllowedOfficialDetailUrl(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

export const OfficialDetailUrlSchema = z.string().url().refine(isAllowedOfficialDetailUrl, {
  message: 'Official detail URL must be an HTTPS koto-okaimono-premium.jp detail page',
});

export const CouponTypeSchema = z.enum(['ab', 'b_only']);
export type CouponType = z.infer<typeof CouponTypeSchema>;

export const LocationConfidenceSchema = z.enum(['high', 'medium', 'low', 'unknown']);
export type LocationConfidence = z.infer<typeof LocationConfidenceSchema>;

export const StoreSchema = z.object({
  id: z.string().min(1),
  sourceDetailId: z.string().nullable(),
  name: z.string().min(1),
  normalizedName: z.string().min(1),
  postalCode: z.string().nullable(),
  address: z.string().min(1),
  normalizedAddress: z.string().nullable(),
  phone: z.string().nullable(),
  categoryMajorId: z.string().min(1),
  categoryMajorLabel: z.string().min(1),
  categoryMinorId: z.string().nullable(),
  categoryMinorLabel: z.string().nullable(),
  couponType: CouponTypeSchema,
  acceptsPaper: z.boolean(),
  acceptsDigital: z.boolean(),
  mallName: z.string().nullable(),
  shoppingStreet: z.string().nullable(),
  floor: z.string().nullable(),
  areaName: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  locationSource: z.string(),
  locationConfidence: LocationConfidenceSchema,
  officialDetailUrl: OfficialDetailUrlSchema.nullable(),
  homepageUrl: z.string().url().nullable(),
  sourceUpdatedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Store = z.infer<typeof StoreSchema>;

export type StoreWithDistance = Store & {
  distanceMeters: number;
};

export type LocationGroup = {
  id: string;
  lat: number;
  lng: number;
  storeCount: number;
  stores: Store[];
};
