import { z } from 'zod';

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
  officialDetailUrl: z.string().url().nullable(),
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
