import { describe, expect, it } from 'vitest';

import { clusterByGrid } from './clusterGroups';

const g = (id: string, lat: number, lng: number, n = 1) => ({
  id,
  lat,
  lng,
  stores: Array.from({ length: n }, (_, i) => ({ id: `${id}-${i}` })),
});

describe('clusterByGrid', () => {
  it('merges nearby groups into one cluster and sums store counts', () => {
    const clusters = clusterByGrid([g('a', 35.674, 139.81, 2), g('b', 35.6741, 139.8101, 3)], 0.06);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(5);
    expect(clusters[0].items).toHaveLength(2);
  });

  it('keeps far-apart groups in separate clusters', () => {
    const clusters = clusterByGrid([g('a', 35.674, 139.81), g('b', 35.69, 139.84)], 0.06);
    expect(clusters).toHaveLength(2);
  });

  it('resolves to individual items when zoomed in (small delta)', () => {
    const clusters = clusterByGrid([g('a', 35.6740, 139.8100), g('b', 35.6745, 139.8120)], 0.006);
    expect(clusters).toHaveLength(2);
    expect(clusters.every((c) => c.items.length === 1)).toBe(true);
  });
});
