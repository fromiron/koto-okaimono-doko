import { describe, expect, it } from 'vitest';

import { clusterByGrid, clusterIdentity } from './clusterGroups';

const g = (id: string, lat: number, lng: number, n = 1) => ({
  id,
  lat,
  lng,
  stores: Array.from({ length: n }, (_, i) => ({ id: `${id}-${i}` })),
});

describe('clusterByGrid', () => {
  it('merges nearby groups into one cluster and sums store counts', () => {
    const clusters = clusterByGrid(
      [g('a', 35.674, 139.81, 2), g('b', 35.6741, 139.8101, 3)],
      0.06,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(5);
    expect(clusters[0].items).toHaveLength(2);
  });

  it('keeps far-apart groups in separate clusters', () => {
    const clusters = clusterByGrid(
      [g('a', 35.674, 139.81), g('b', 35.69, 139.84)],
      0.06,
    );
    expect(clusters).toHaveLength(2);
  });

  it('resolves to individual items when zoomed in (small delta)', () => {
    const clusters = clusterByGrid(
      [g('a', 35.674, 139.81), g('b', 35.6745, 139.812)],
      0.006,
    );
    expect(clusters).toHaveLength(2);
    expect(clusters.every((c) => c.items.length === 1)).toBe(true);
  });

  it('keeps cluster identity stable when the member set has not changed', () => {
    const members = [g('a', 35.674, 139.81), g('b', 35.6741, 139.8101)];
    const first = clusterByGrid(members, 0.06);
    const shifted = clusterByGrid(
      [g('a', 35.68, 139.82), g('b', 35.6801, 139.8201)],
      0.06,
    );

    expect(first).toHaveLength(1);
    expect(shifted).toHaveLength(1);
    expect(first[0].id).toBe(clusterIdentity(['a', 'b']));
    expect(shifted[0].id).toBe(first[0].id);
  });

  it('renders a pinned location group as its own marker instead of a density cluster', () => {
    const clusters = clusterByGrid(
      [
        g('a', 35.674, 139.81),
        g('b', 35.6741, 139.8101),
        g('c', 35.6742, 139.8102),
      ],
      0.06,
      5,
      new Set(['a']),
    );
    const pinned = clusters.find((cluster) => cluster.id === 'a');
    const remainder = clusters.filter((cluster) => cluster.id !== 'a');

    expect(pinned?.items).toHaveLength(1);
    expect(pinned?.items[0].id).toBe('a');
    expect(remainder).toHaveLength(1);
    expect(remainder[0].items.map((item) => item.id).sort()).toEqual([
      'b',
      'c',
    ]);
  });
});
