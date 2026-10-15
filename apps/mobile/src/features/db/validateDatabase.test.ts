import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createFixtureDatabase,
  fixtureMeta,
  fixtureStores,
  openTestDatabase,
} from '../../../../../packages/dataset-cli/src/testing/database';
import { createStoreRepository, type StoreDatabase } from './StoreRepository';
import { validateDatabase } from './validateDatabase';

let dir: string;
const expected = {
  ...fixtureMeta,
  sqlite: { url: 'https://example.test/db', size: 100, sha256: 'a'.repeat(64) },
};
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'koto-db-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

async function withDb(
  run: (
    db: ReturnType<typeof openTestDatabase>,
    repository: ReturnType<typeof createStoreRepository>,
  ) => Promise<void>,
) {
  const file = path.join(dir, 'fixture.sqlite');
  createFixtureDatabase(file);
  const db = openTestDatabase(file);
  try {
    await run(db, createStoreRepository(db as unknown as StoreDatabase));
  } finally {
    await db.closeAsync();
  }
}

describe('real SQLite contracts', () => {
  it('validates metadata, search and detail including missing coordinates', async () => {
    await withDb(async (db, repository) => {
      await expect(
        validateDatabase(db as unknown as StoreDatabase, expected),
      ).resolves.toEqual(fixtureMeta);
      expect(await repository.searchStores({ keyword: '商店' })).toHaveLength(
        2,
      );
      expect(
        await repository.getLocationGroups({ keyword: '商店' }),
      ).toHaveLength(1);
      expect(await repository.getStoreById('unlocated')).toEqual(
        fixtureStores[1],
      );
      expect(
        await repository.searchStores({
          couponType: 'b_only',
          payment: 'digital',
          categoryMajorId: 'dining',
        }),
      ).toEqual([fixtureStores[1]]);
    });
  });

  it.each([
    'datasetId',
    'revision',
    'version',
    'schemaVersion',
    'storeCount',
    'officialUpdatedAt',
    'generatedAt',
  ])('rejects mismatched %s', async (key) => {
    await withDb(async (db) => {
      db.db
        .prepare('UPDATE dataset_meta SET value = ? WHERE key = ?')
        .run('999', key);
      await expect(
        validateDatabase(db as unknown as StoreDatabase, expected),
      ).rejects.toThrow();
    });
  });

  it.each(['phone', 'accepts_paper'])(
    'rejects missing column %s even if count matches',
    async (column) => {
      await withDb(async (db) => {
        db.db.exec('DROP INDEX idx_stores_payment');
        db.db.exec(`ALTER TABLE stores DROP COLUMN ${column}`);
        await expect(
          validateDatabase(db as unknown as StoreDatabase, expected),
        ).rejects.toThrow();
      });
    },
  );

  it('accepts legacy seed locally but not as a downloaded revision', async () => {
    await withDb(async (db) => {
      db.db.exec(
        "DELETE FROM dataset_meta WHERE key IN ('schemaVersion', 'revision')",
      );
      await expect(
        validateDatabase(db as unknown as StoreDatabase),
      ).resolves.toMatchObject({ datasetId: fixtureMeta.datasetId });
      await expect(
        validateDatabase(db as unknown as StoreDatabase, expected),
      ).rejects.toThrow();
    });
  });

  it('rejects a corrupt SQLite file', () => {
    const file = path.join(dir, 'corrupt.sqlite');
    writeFileSync(file, 'not sqlite');
    const db = new DatabaseSync(file);
    try {
      expect(() => db.exec('PRAGMA integrity_check')).toThrow();
    } finally {
      db.close();
    }
  });
});
