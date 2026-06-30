import { describe, expect, it } from 'vitest';

import { isAllowedOfficialDetailUrl, normalizeOfficialDetailUrl, StoreSchema } from './store';

describe('official detail URL policy', () => {
  it('normalizes official relative detail URLs', () => {
    expect(normalizeOfficialDetailUrl('/list/detail/example-id')).toBe(
      'https://koto-okaimono-premium.jp/list/detail/example-id',
    );
  });

  it('rejects executable and off-site URLs', () => {
    expect(normalizeOfficialDetailUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeOfficialDetailUrl('https://example.com/list/detail/example-id')).toBeNull();
    expect(isAllowedOfficialDetailUrl('tel:0312345678')).toBe(false);
  });

  it('rejects unsafe officialDetailUrl values in StoreSchema', () => {
    const candidate = {
      id: 'store-1',
      sourceDetailId: 'store-1',
      name: 'Store',
      normalizedName: 'store',
      postalCode: null,
      address: '森下1-1-1',
      normalizedAddress: '森下1-1-1',
      phone: null,
      categoryMajorId: 'shopping',
      categoryMajorLabel: '買う',
      categoryMinorId: null,
      categoryMinorLabel: null,
      couponType: 'ab',
      acceptsPaper: true,
      acceptsDigital: false,
      mallName: null,
      shoppingStreet: null,
      floor: null,
      areaName: null,
      lat: null,
      lng: null,
      locationSource: 'test',
      locationConfidence: 'unknown',
      officialDetailUrl: 'javascript:alert(1)',
      homepageUrl: null,
      sourceUpdatedAt: null,
      createdAt: '2026-06-28T00:00:00.000Z',
      updatedAt: '2026-06-28T00:00:00.000Z',
    };

    expect(() => StoreSchema.parse(candidate)).toThrow();
  });
});
