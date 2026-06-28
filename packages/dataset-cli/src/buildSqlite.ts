import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { DatasetMeta, Store } from '@koto/schema';

import { latestDir, mobileSeedDir, outputPaths } from './paths';

export async function buildSqlite(stores: Store[], meta: DatasetMeta): Promise<void> {
  await mkdir(latestDir, { recursive: true });
  await mkdir(mobileSeedDir, { recursive: true });
  await rm(outputPaths.sqlite, { force: true });
  await rm(outputPaths.seedSqlite, { force: true });

  createDatabase(outputPaths.sqlite, stores, meta);
  createDatabase(outputPaths.seedSqlite, stores, meta);
}

function createDatabase(filePath: string, stores: Store[], meta: DatasetMeta): void {
  const db = new DatabaseSync(filePath);
  db.exec(schemaSql);

  const insertStore = db.prepare(`
    INSERT INTO stores (
      id, source_detail_id, name, normalized_name, category_major_id, category_major_label,
      category_minor_id, category_minor_label, coupon_type, accepts_paper, accepts_digital,
      postal_code, address, normalized_address, phone, mall_name, shopping_street, floor,
      area_name, lat, lng, location_source, location_confidence, official_detail_url,
      homepage_url, source_updated_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertMeta = db.prepare('INSERT INTO dataset_meta (key, value) VALUES (?, ?)');

  db.exec('BEGIN');
  for (const store of stores) {
    insertStore.run(
      store.id,
      store.sourceDetailId,
      store.name,
      store.normalizedName,
      store.categoryMajorId,
      store.categoryMajorLabel,
      store.categoryMinorId,
      store.categoryMinorLabel,
      store.couponType,
      store.acceptsPaper ? 1 : 0,
      store.acceptsDigital ? 1 : 0,
      store.postalCode,
      store.address,
      store.normalizedAddress,
      store.phone,
      store.mallName,
      store.shoppingStreet,
      store.floor,
      store.areaName,
      store.lat,
      store.lng,
      store.locationSource,
      store.locationConfidence,
      store.officialDetailUrl,
      store.homepageUrl,
      store.sourceUpdatedAt,
      store.createdAt,
      store.updatedAt,
    );
  }

  for (const [key, value] of Object.entries(meta)) {
    insertMeta.run(key, String(value));
  }
  db.exec('COMMIT');
  db.close();

  if (!path.isAbsolute(filePath)) {
    throw new Error('Database path must be absolute.');
  }
}

const schemaSql = `
PRAGMA journal_mode = WAL;

CREATE TABLE dataset_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  source_detail_id TEXT,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category_major_id TEXT NOT NULL,
  category_major_label TEXT NOT NULL,
  category_minor_id TEXT,
  category_minor_label TEXT,
  coupon_type TEXT NOT NULL,
  accepts_paper INTEGER NOT NULL DEFAULT 0,
  accepts_digital INTEGER NOT NULL DEFAULT 0,
  postal_code TEXT,
  address TEXT NOT NULL,
  normalized_address TEXT,
  phone TEXT,
  mall_name TEXT,
  shopping_street TEXT,
  floor TEXT,
  area_name TEXT,
  lat REAL,
  lng REAL,
  location_source TEXT NOT NULL DEFAULT 'unknown',
  location_confidence TEXT NOT NULL DEFAULT 'unknown',
  official_detail_url TEXT,
  homepage_url TEXT,
  source_updated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_stores_normalized_name ON stores(normalized_name);
CREATE INDEX idx_stores_coupon_type ON stores(coupon_type);
CREATE INDEX idx_stores_payment ON stores(accepts_paper, accepts_digital);
CREATE INDEX idx_stores_category ON stores(category_major_id, category_minor_id);
CREATE INDEX idx_stores_location ON stores(lat, lng);
CREATE INDEX idx_stores_mall ON stores(mall_name);
`;

if (import.meta.url === `file://${process.argv[1]}`) {
  throw new Error('Run packages/dataset-cli/src/index.ts to build SQLite from parsed data.');
}
