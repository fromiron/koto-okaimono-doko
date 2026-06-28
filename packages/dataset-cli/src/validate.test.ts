import type { Store } from '@koto/schema';
import { describe, expect, it } from 'vitest';

import { validateStores } from './validate';

describe('validateStores', () => {
  it('reports duplicate ids and missing coordinates', () => {
    const store = {
      id: 'same',
      sourceDetailId: 'same',
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
      officialDetailUrl: null,
      homepageUrl: null,
      sourceUpdatedAt: null,
      createdAt: '2026-06-28T00:00:00.000Z',
      updatedAt: '2026-06-28T00:00:00.000Z',
    } satisfies Store;

    const report = validateStores([store, store]);

    expect(report.duplicateIds).toEqual(['same']);
    expect(report.missingCoordinates).toBe(2);
  });
});
