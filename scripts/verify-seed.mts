import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DatasetManifestSchema } from '../packages/schema/src/dataset';
import { validateDatabase } from '../apps/mobile/src/features/db/validateDatabase';
import type { StoreDatabase } from '../apps/mobile/src/features/db/StoreRepository';

const file = 'apps/mobile/src/assets/db/seed.sqlite';
const bytes = await readFile(file);
const manifest = DatasetManifestSchema.parse(
  JSON.parse(
    await readFile('apps/mobile/src/assets/db/seed.manifest.json', 'utf8'),
  ),
);
const sha256 = createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256, manifest.sqlite.sha256);
assert.equal(bytes.length, manifest.sqlite.size);
const directory = await mkdtemp(path.join(tmpdir(), 'koto-seed-'));
const copy = path.join(directory, 'seed.sqlite');
await writeFile(copy, bytes);
const db = new DatabaseSync(copy, { readOnly: true });
try {
  const adapter = {
    async getFirstAsync(sql: string, args: (string | number)[] = []) {
      return db.prepare(sql).get(...args) ?? null;
    },
    async getAllAsync(sql: string, args: (string | number)[] = []) {
      return db.prepare(sql).all(...args);
    },
  } as unknown as StoreDatabase;
  const meta = await validateDatabase(
    adapter,
    manifest.revision ? manifest : undefined,
  );
  for (const key of [
    'datasetId',
    'version',
    'generatedAt',
    'officialUpdatedAt',
    'storeCount',
  ] as const)
    assert.equal(meta[key], manifest[key]);
  const report = {
    ...meta,
    sha256,
    bytes: bytes.length,
    gitRevision: process.env.GITHUB_SHA ?? 'local',
    verified: true,
  };
  await writeFile(
    'seed-verification.json',
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(
    `Verified committed seed: ${meta.version}, ${meta.storeCount} stores, SHA-256 ${sha256}`,
  );
} finally {
  db.close();
  await rm(directory, { recursive: true, force: true });
}
