import { DatabaseSync } from 'node:sqlite';
import { DATASET_ID, type DatasetMeta, type Store } from '@koto/schema';
import { createDatabase } from '../buildSqlite';

export const fixtureMeta: DatasetMeta = {
  datasetId: DATASET_ID,
  schemaVersion: 1,
  revision: 'a'.repeat(64),
  version: `r1-${'a'.repeat(64)}`,
  officialUpdatedAt: '2026-10-09',
  generatedAt: '2026-10-09T00:00:00.000Z',
  storeCount: 2,
};

export const fixtureStores: Store[] = [
  {
    id: 'located',
    sourceDetailId: 'located',
    name: 'テスト商店',
    normalizedName: 'テスト商店',
    postalCode: null,
    address: '森下1-1',
    normalizedAddress: '森下1-1',
    phone: null,
    categoryMajorId: 'shopping',
    categoryMajorLabel: '買う',
    categoryMinorId: 'sweets_bread',
    categoryMinorLabel: '菓子・パン',
    couponType: 'ab',
    acceptsPaper: true,
    acceptsDigital: false,
    mallName: null,
    shoppingStreet: null,
    floor: null,
    areaName: null,
    lat: 35.68,
    lng: 139.8,
    locationSource: 'fixture',
    locationConfidence: 'high',
    officialDetailUrl: 'https://koto-okaimono-premium.jp/list/detail/located',
    homepageUrl: null,
    sourceUpdatedAt: '2026-10-09',
    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  },
];
fixtureStores.push({
  ...fixtureStores[0]!,
  id: 'unlocated',
  name: '座標なし商店',
  normalizedName: '座標なし商店',
  lat: null,
  lng: null,
  couponType: 'b_only',
  acceptsPaper: false,
  acceptsDigital: true,
  categoryMajorId: 'dining',
  categoryMajorLabel: '食べる',
});

export function createFixtureDatabase(
  file: string,
  meta = fixtureMeta,
  stores = fixtureStores,
) {
  createDatabase(file, stores, meta);
}

// Expo IO boundary adapter: queries and row conversions still run against real SQLite.
export function openTestDatabase(file: string) {
  const db = new DatabaseSync(file);
  return {
    async getFirstAsync<T>(
      sql: string,
      args: (string | number)[] = [],
    ): Promise<T | null> {
      return (db.prepare(sql).get(...args) as T | undefined) ?? null;
    },
    async getAllAsync<T>(
      sql: string,
      args: (string | number)[] = [],
    ): Promise<T[]> {
      return db.prepare(sql).all(...args) as T[];
    },
    async execAsync(sql: string) {
      db.exec(sql);
    },
    async closeAsync() {
      db.close();
    },
    db,
  };
}
