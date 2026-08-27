export type Clusterable = {
  id: string;
  lat: number;
  lng: number;
  stores: unknown[];
};

export type MarkerCluster<T extends Clusterable> = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  items: T[];
};

export function clusterIdentity(ids: readonly string[]): string {
  return [...ids].sort().join('|');
}

function toCluster<T extends Clusterable>(items: T[]): MarkerCluster<T> {
  return {
    id: clusterIdentity(items.map((item) => item.id)),
    lat: items.reduce((sum, item) => sum + item.lat, 0) / items.length,
    lng: items.reduce((sum, item) => sum + item.lng, 0) / items.length,
    count: items.reduce((sum, item) => sum + item.stores.length, 0),
    items,
  };
}

/**
 * Buckets location groups into a coarse grid sized to the current zoom so dense
 * areas collapse into one count bubble when zoomed out, and resolve to individual
 * markers as the user zooms in. Not a same-coordinate "Location Group" — this is
 * zoom-level density aggregation only.
 *
 * Cluster ids are the sorted member-set, so they stay stable when the same
 * groups remain together after a camera update. `pinnedIds` are rendered as
 * individual markers and never absorbed into a density cluster.
 */
export function clusterByGrid<T extends Clusterable>(
  items: T[],
  longitudeDelta: number,
  columns = 5,
  pinnedIds?: ReadonlySet<string>,
): MarkerCluster<T>[] {
  const cell = longitudeDelta / columns || 0.0001;
  const buckets = new Map<string, T[]>();
  const pinned: MarkerCluster<T>[] = [];

  for (const item of items) {
    if (pinnedIds?.has(item.id)) {
      pinned.push(toCluster([item]));
      continue;
    }

    const key = `${Math.floor(item.lng / cell)}:${Math.floor(item.lat / cell)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  return [...buckets.values()].map(toCluster).concat(pinned);
}
