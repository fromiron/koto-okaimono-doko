import type { DatasetManifest } from '@koto/schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fileSystem = vi.hoisted(() => ({
  deleteAsync: vi.fn(async () => {}),
  documentDirectory: 'file:///test/',
  downloadAsync: vi.fn(async () => ({})),
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(async () => {}),
  moveAsync: vi.fn(),
}));

vi.mock('expo-file-system/legacy', () => fileSystem);
vi.mock('@/src/features/bootstrap/AppProviders', () => ({
  useDatabaseReload: () => ({
    reloadDatabase: vi.fn(),
    unmountDatabase: vi.fn(),
  }),
}));
vi.mock('./verifyDataset', () => ({
  verifyCandidateDatabase: vi.fn(async () => {}),
  verifyCandidateHash: vi.fn(async () => {}),
  verifyFileSize: vi.fn(async () => {}),
}));

const manifest: DatasetManifest = {
  datasetId: 'koto-2026',
  generatedAt: '2026-07-15T00:00:00.000Z',
  officialUpdatedAt: '2026-07-15',
  sqlite: {
    sha256: 'a'.repeat(64),
    size: 100,
    url: 'https://example.test/stores.sqlite',
  },
  storeCount: 10,
  version: '2026-07-15.1',
};

const originalManifestUrl = process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL;
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  delete process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalManifestUrl === undefined) {
    delete process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL;
  } else {
    process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL = originalManifestUrl;
  }
});

describe('dataset update staging', () => {
  it('skips network access when no manifest URL is configured', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
    const { checkForDatasetUpdate } = await import('./DatasetUpdater');

    await expect(checkForDatasetUpdate(null)).resolves.toEqual({
      manifest: null,
      result: { reason: 'not-configured', status: 'skipped' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('checks only the manifest until the user applies the update', async () => {
    process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL =
      'https://example.test/manifest.json';
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify(manifest), { status: 200 }),
    ) as unknown as typeof fetch;
    const { checkForDatasetUpdate } = await import('./DatasetUpdater');

    await expect(checkForDatasetUpdate(null)).resolves.toEqual({
      manifest,
      result: {
        nextVersion: manifest.version,
        previousVersion: null,
        status: 'updated',
      },
    });
    expect(fileSystem.downloadAsync).not.toHaveBeenCalled();
  });

  it('downloads the SQLite candidate only in the explicit download step', async () => {
    const { downloadCandidateDataset } = await import('./DatasetUpdater');

    await downloadCandidateDataset(manifest);

    expect(fileSystem.downloadAsync).toHaveBeenCalledWith(
      manifest.sqlite.url,
      expect.stringContaining('candidate.sqlite'),
    );
  });
});
