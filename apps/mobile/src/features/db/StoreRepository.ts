import { boundsFromRadius, distanceMeters, normalizeSearchText } from '@koto/core';
import type {
  DatasetMeta,
  NearbySearchParams,
  Store,
  StoreRepository,
  StoreSearchParams,
  StoreWithDistance,
} from '@koto/schema';
import type { SQLiteDatabase } from 'expo-sqlite';

type StoreRow = {
  id: string;
  source_detail_id: string | null;
  name: string;
  normalized_name: string;
  postal_code: string | null;
  address: string;
  normalized_address: string | null;
  phone: string | null;
  category_major_id: string;
  category_major_label: string;
  category_minor_id: string | null;
  category_minor_label: string | null;
  coupon_type: 'ab' | 'b_only';
  accepts_paper: number;
  accepts_digital: number;
  mall_name: string | null;
  shopping_street: string | null;
  floor: string | null;
  area_name: string | null;
  lat: number | null;
  lng: number | null;
  location_source: string;
  location_confidence: Store['locationConfidence'];
  official_detail_url: string | null;
  homepage_url: string | null;
  source_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

export function createStoreRepository(db: SQLiteDatabase): StoreRepository & {
  getLocationGroups(params: StoreSearchParams): Promise<Array<{ id: string; lat: number; lng: number; stores: Store[] }>>;
} {
  return {
    async getStoreById(id) {
      const row = await db.getFirstAsync<StoreRow>('SELECT * FROM stores WHERE id = ?', [id]);
      return row ? rowToStore(row) : null;
    },

    async searchStores(params) {
      const { sql, args } = buildSearchQuery(params);
      const rows = await db.getAllAsync<StoreRow>(sql, args);
      return rows.map(rowToStore);
    },

    async findNearbyStores(params: NearbySearchParams) {
      const bounds = boundsFromRadius({ lat: params.lat, lng: params.lng }, params.radiusMeters);
      const stores = await this.searchStores({
        ...(params.filters ?? {}),
        bounds,
        limit: params.filters?.limit ?? 500,
      });

      return stores
        .filter((store): store is Store & { lat: number; lng: number } => store.lat !== null && store.lng !== null)
        .map<StoreWithDistance>((store) => ({
          ...store,
          distanceMeters: distanceMeters({ lat: params.lat, lng: params.lng }, { lat: store.lat, lng: store.lng }),
        }))
        .filter((store) => store.distanceMeters <= params.radiusMeters)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    },

    async getDatasetMeta() {
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM dataset_meta');
      const meta = Object.fromEntries(rows.map((row) => [row.key, row.value]));
      return {
        datasetId: meta.datasetId ?? 'unknown',
        version: meta.version ?? 'unknown',
        officialUpdatedAt: meta.officialUpdatedAt ?? 'unknown',
        generatedAt: meta.generatedAt ?? 'unknown',
        storeCount: Number(meta.storeCount ?? 0),
      } satisfies DatasetMeta;
    },

    async getLocationGroups(params) {
      const stores = await this.searchStores(params);
      const groups = new Map<string, { id: string; lat: number; lng: number; stores: Store[] }>();

      for (const store of stores) {
        if (store.lat === null || store.lng === null) continue;
        const key = `${store.lat.toFixed(6)},${store.lng.toFixed(6)}`;
        const group = groups.get(key) ?? {
          id: key,
          lat: store.lat,
          lng: store.lng,
          stores: [],
        };
        group.stores.push(store);
        groups.set(key, group);
      }

      return [...groups.values()];
    },
  };
}

function buildSearchQuery(params: StoreSearchParams) {
  const where: string[] = [];
  const args: Array<string | number> = [];

  if (params.keyword?.trim()) {
    const keyword = `%${normalizeSearchText(params.keyword)}%`;
    where.push(
      '(normalized_name LIKE ? OR normalized_address LIKE ? OR name LIKE ? OR address LIKE ? OR mall_name LIKE ? OR shopping_street LIKE ?)',
    );
    args.push(keyword, keyword, `%${params.keyword}%`, `%${params.keyword}%`, `%${params.keyword}%`, `%${params.keyword}%`);
  }

  if (params.couponType && params.couponType !== 'all') {
    where.push('coupon_type = ?');
    args.push(params.couponType);
  }

  if (params.payment === 'paper') {
    where.push('accepts_paper = 1');
  } else if (params.payment === 'digital') {
    where.push('accepts_digital = 1');
  }

  if (params.categoryMajorId) {
    where.push('category_major_id = ?');
    args.push(params.categoryMajorId);
  }

  if (params.categoryMinorId) {
    where.push('category_minor_id = ?');
    args.push(params.categoryMinorId);
  }

  if (params.bounds) {
    where.push('lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?');
    args.push(params.bounds.minLat, params.bounds.maxLat, params.bounds.minLng, params.bounds.maxLng);
  }

  args.push(params.limit ?? 500);

  return {
    sql: `
      SELECT *
      FROM stores
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY name COLLATE NOCASE
      LIMIT ?
    `,
    args,
  };
}

function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    sourceDetailId: row.source_detail_id,
    name: row.name,
    normalizedName: row.normalized_name,
    postalCode: row.postal_code,
    address: row.address,
    normalizedAddress: row.normalized_address,
    phone: row.phone,
    categoryMajorId: row.category_major_id,
    categoryMajorLabel: row.category_major_label,
    categoryMinorId: row.category_minor_id,
    categoryMinorLabel: row.category_minor_label,
    couponType: row.coupon_type,
    acceptsPaper: row.accepts_paper === 1,
    acceptsDigital: row.accepts_digital === 1,
    mallName: row.mall_name,
    shoppingStreet: row.shopping_street,
    floor: row.floor,
    areaName: row.area_name,
    lat: row.lat,
    lng: row.lng,
    locationSource: row.location_source,
    locationConfidence: row.location_confidence,
    officialDetailUrl: row.official_detail_url,
    homepageUrl: row.homepage_url,
    sourceUpdatedAt: row.source_updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
