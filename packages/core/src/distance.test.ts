import { describe, expect, it } from 'vitest';

import { boundsFromRadius } from './bounds';
import { distanceMeters } from './distance';

describe('geo utilities', () => {
  it('computes nearby distances in meters', () => {
    const meters = distanceMeters(
      { lat: 35.681236, lng: 139.767125 },
      { lat: 35.680959, lng: 139.767306 },
    );

    expect(meters).toBeGreaterThan(30);
    expect(meters).toBeLessThan(40);
  });

  it('builds a bounding box around a point', () => {
    const bounds = boundsFromRadius({ lat: 35.6728, lng: 139.8174 }, 500);

    expect(bounds.minLat).toBeLessThan(35.6728);
    expect(bounds.maxLat).toBeGreaterThan(35.6728);
    expect(bounds.minLng).toBeLessThan(139.8174);
    expect(bounds.maxLng).toBeGreaterThan(139.8174);
  });
});
