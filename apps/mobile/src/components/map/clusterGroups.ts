export type Clusterable = { id: string; lat: number; lng: number; stores: unknown[] };

export type MarkerCluster<T extends Clusterable> = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  items: T[];
};

/**
 * Buckets location groups into a coarse grid sized to the current zoom so dense
 * areas collapse into one count bubble when zoomed out, and resolve to individual
 * markers as the user zooms in. Not a same-coordinate "Location Group" — this is
 * zoom-level density aggregation only.
 */
export function clusterByGrid<T extends Clusterable>(
  items: T[],
  longitudeDelta: number,
  columns = 5,
): MarkerCluster<T>[] {
  const cell = longitudeDelta / columns || 0.0001;
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    const key = `${Math.floor(item.lng / cell)}:${Math.floor(item.lat / cell)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  return [...buckets.entries()].map(([key, group]) => ({
    id: key,
    lat: group.reduce((sum, g) => sum + g.lat, 0) / group.length,
    lng: group.reduce((sum, g) => sum + g.lng, 0) / group.length,
    count: group.reduce((sum, g) => sum + g.stores.length, 0),
    items: group,
  }));
}
