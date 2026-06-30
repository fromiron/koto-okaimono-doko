import { describe, expect, it } from 'vitest';

import { DatasetManifestSchema, MAX_SQLITE_DATASET_BYTES } from './dataset';

const baseManifest = {
  datasetId: 'koto-premium-2026',
  version: '2026-06-30',
  officialUpdatedAt: '2026-06-24',
  generatedAt: '2026-06-30T00:00:00.000Z',
  storeCount: 1444,
  sqlite: {
    url: 'https://fromiron.github.io/koto-okaimono-doko/stores.sqlite',
    sha256: 'a'.repeat(64),
    size: MAX_SQLITE_DATASET_BYTES,
  },
};

describe('DatasetManifestSchema', () => {
  it('accepts a SQLite dataset at the configured size cap', () => {
    expect(DatasetManifestSchema.parse(baseManifest).sqlite.size).toBe(MAX_SQLITE_DATASET_BYTES);
  });

  it('rejects a SQLite dataset before download when the manifest exceeds the size cap', () => {
    expect(() =>
      DatasetManifestSchema.parse({
        ...baseManifest,
        sqlite: {
          ...baseManifest.sqlite,
          size: MAX_SQLITE_DATASET_BYTES + 1,
        },
      }),
    ).toThrow();
  });
});
