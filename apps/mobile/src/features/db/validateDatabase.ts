import {
  assertSupportedDataset,
  StoreSchema,
  type DatasetManifest,
  type DatasetMeta,
} from '@koto/schema';

import { createStoreRepository, type StoreDatabase } from './StoreRepository';

// Validate the same columns and conversions used by search and detail views.
export async function validateDatabase(
  db: StoreDatabase,
  expected?: DatasetManifest,
): Promise<DatasetMeta> {
  const integrity = await db.getFirstAsync<{ integrity_check: string }>(
    'PRAGMA integrity_check',
  );
  if (integrity?.integrity_check !== 'ok')
    throw new Error('Database integrity check failed');
  const columns = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(stores)',
  );
  const names = new Set(columns.map((column) => column.name));
  for (const column of [
    'id',
    'source_detail_id',
    'name',
    'normalized_name',
    'category_major_id',
    'category_major_label',
    'category_minor_id',
    'category_minor_label',
    'coupon_type',
    'accepts_paper',
    'accepts_digital',
    'postal_code',
    'address',
    'normalized_address',
    'phone',
    'mall_name',
    'shopping_street',
    'floor',
    'area_name',
    'lat',
    'lng',
    'location_source',
    'location_confidence',
    'official_detail_url',
    'homepage_url',
    'source_updated_at',
    'created_at',
    'updated_at',
  ]) {
    if (!names.has(column)) throw new Error(`Missing store column: ${column}`);
  }
  const repository = createStoreRepository(db);
  const meta = await repository.getDatasetMeta();
  assertSupportedDataset(meta, !!expected);
  if (expected) {
    assertSupportedDataset(expected, true);
    for (const key of [
      'datasetId',
      'schemaVersion',
      'revision',
      'version',
      'storeCount',
      'officialUpdatedAt',
      'generatedAt',
    ] as const) {
      if (meta[key] !== expected[key])
        throw new Error(`Database metadata mismatch: ${key}`);
    }
    if (
      JSON.stringify(meta.sourceDates) !== JSON.stringify(expected.sourceDates)
    ) {
      throw new Error('Database metadata mismatch: sourceDates');
    }
  }
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM stores',
  );
  if (!count || count.count <= 0 || count.count !== meta.storeCount)
    throw new Error('Database store count mismatch');
  const stores = await repository.searchStores({ limit: count.count });
  for (const store of stores) StoreSchema.parse(store);
  // Exercise the parameterized detail query as well as the search query.
  StoreSchema.parse(await repository.getStoreById(stores[0]!.id));
  return meta;
}
