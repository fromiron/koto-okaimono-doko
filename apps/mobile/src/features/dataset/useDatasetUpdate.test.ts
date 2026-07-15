import type { DatasetManifest } from '@koto/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => {
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

  return {
    applyCandidate: vi.fn(async () => {}),
    checkForDatasetUpdate: vi.fn(),
    downloadCandidateDataset: vi.fn(async () => {}),
    manifest,
    markUpdateChecked: vi.fn(),
    setDatasetMeta: vi.fn(),
    setPendingManifest: vi.fn(),
    setUpdateStatus: vi.fn(),
    verifyDownloadedCandidate: vi.fn(async () => {}),
  };
});

vi.mock('react', () => ({
  useCallback: <T extends (...args: never[]) => unknown>(callback: T) =>
    callback,
}));

vi.mock('./DatasetUpdater', () => ({
  checkForDatasetUpdate: fixture.checkForDatasetUpdate,
  downloadCandidateDataset: fixture.downloadCandidateDataset,
  useApplyCandidateDataset: () => fixture.applyCandidate,
  verifyDownloadedCandidate: fixture.verifyDownloadedCandidate,
}));

vi.mock('./datasetStore', () => {
  const state = {
    markUpdateChecked: fixture.markUpdateChecked,
    meta: null,
    pendingManifest: fixture.manifest,
    setDatasetMeta: fixture.setDatasetMeta,
    setPendingManifest: fixture.setPendingManifest,
    setUpdateStatus: fixture.setUpdateStatus,
  };
  const useDatasetStore = Object.assign(
    (selector: (value: typeof state) => unknown) => selector(state),
    { getState: () => state },
  );

  return { useDatasetStore };
});

describe('useDatasetUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses verified manifest metadata after remounting the database', async () => {
    const { useDatasetUpdate } = await import('./useDatasetUpdate');

    await useDatasetUpdate().applyUpdate();

    expect(fixture.applyCandidate).toHaveBeenCalledOnce();
    expect(fixture.setPendingManifest).toHaveBeenCalledWith(null);
    expect(fixture.setDatasetMeta).toHaveBeenCalledWith({
      datasetId: fixture.manifest.datasetId,
      generatedAt: fixture.manifest.generatedAt,
      officialUpdatedAt: fixture.manifest.officialUpdatedAt,
      storeCount: fixture.manifest.storeCount,
      version: fixture.manifest.version,
    });
    expect(fixture.setUpdateStatus).toHaveBeenLastCalledWith('updated');
  });
});
