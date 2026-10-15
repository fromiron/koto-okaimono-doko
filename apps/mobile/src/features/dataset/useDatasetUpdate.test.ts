// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fixtureMeta } from '../../../../../packages/dataset-cli/src/testing/database';

const io = vi.hoisted(() => ({
  checkForDatasetUpdate: vi.fn(),
  downloadCandidateDataset: vi.fn(),
  verifyDownloadedCandidate: vi.fn(),
  stageCandidateDataset: vi.fn(),
}));
vi.mock('./DatasetUpdater', () => io);
import { useDatasetUpdate } from './useDatasetUpdate';
import { useDatasetStore } from './datasetStore';

const manifest = {
  ...fixtureMeta,
  sqlite: { url: 'https://example.test/db', size: 100, sha256: 'a'.repeat(64) },
};
beforeEach(() => {
  vi.resetAllMocks();
  useDatasetStore.setState({
    meta: null,
    pendingManifest: manifest,
    updateStatus: 'available',
    error: null,
  });
});
afterEach(cleanup);

it('keeps the active metadata and waits for restart instead of reporting premature success', async () => {
  const { result } = renderHook(useDatasetUpdate);
  await act(async () => {
    await result.current.applyUpdate();
  });
  expect(io.stageCandidateDataset).toHaveBeenCalledWith(manifest);
  expect(useDatasetStore.getState()).toMatchObject({
    meta: null,
    pendingManifest: null,
    updateStatus: 'restartRequired',
  });
});

it('serializes duplicate apply and check calls across separate mounted consumers', async () => {
  let release!: () => void;
  io.downloadCandidateDataset.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const first = renderHook(useDatasetUpdate);
  const second = renderHook(useDatasetUpdate);
  await act(async () => {
    const pending = first.result.current.applyUpdate();
    await second.result.current.applyUpdate();
    await second.result.current.checkUpdate();
    expect(io.downloadCandidateDataset).toHaveBeenCalledTimes(1);
    expect(io.checkForDatasetUpdate).not.toHaveBeenCalled();
    release();
    await pending;
  });
});

it('preserves active metadata and allows retry after staging failure', async () => {
  io.stageCandidateDataset.mockRejectedValueOnce(new Error('disk full'));
  const { result } = renderHook(useDatasetUpdate);
  await act(async () => {
    await result.current.applyUpdate();
  });
  expect(useDatasetStore.getState()).toMatchObject({
    meta: null,
    updateStatus: 'failed',
    error: 'disk full',
  });
  await act(async () => {
    await result.current.applyUpdate();
  });
  expect(useDatasetStore.getState().updateStatus).toBe('restartRequired');
});
