import type { DatasetUpdateResult } from '@koto/schema';
import { useCallback } from 'react';

import {
  checkForDatasetUpdate,
  downloadCandidateDataset,
  useApplyCandidateDataset,
  verifyDownloadedCandidate,
} from './DatasetUpdater';
import { useDatasetStore, type UpdateStatus } from './datasetStore';

function toUpdateStatus(result: DatasetUpdateResult): UpdateStatus {
  if (result.status === 'failed') return 'failed';
  if (result.status === 'updated') return 'available';
  if (result.status === 'up-to-date') return 'upToDate';
  if (result.reason === 'not-configured') return 'notConfigured';
  return 'idle';
}

/**
 * Centralizes the dataset update-check / apply flow so the map screen
 * (auto-check) and the settings screen (manual check + apply) share one
 * implementation and one status mapping.
 */
export function useDatasetUpdate() {
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const markUpdateChecked = useDatasetStore((state) => state.markUpdateChecked);
  const setPendingManifest = useDatasetStore(
    (state) => state.setPendingManifest,
  );
  const setUpdateStatus = useDatasetStore((state) => state.setUpdateStatus);
  const applyCandidate = useApplyCandidateDataset();

  const checkUpdate = useCallback(async () => {
    setUpdateStatus('checking');
    const { result, manifest } = await checkForDatasetUpdate(
      useDatasetStore.getState().meta,
    );
    if (result.status !== 'skipped' || result.reason !== 'not-configured') {
      markUpdateChecked();
    }
    if (manifest) {
      setPendingManifest(manifest);
    } else if (result.status === 'up-to-date') {
      setPendingManifest(null);
    }
    setUpdateStatus(
      toUpdateStatus(result),
      result.status === 'failed' ? result.reason : null,
    );
  }, [markUpdateChecked, setPendingManifest, setUpdateStatus]);

  const applyUpdate = useCallback(async () => {
    const manifest = useDatasetStore.getState().pendingManifest;
    if (!manifest) return;

    try {
      setUpdateStatus('downloading');
      await downloadCandidateDataset(manifest);
      setUpdateStatus('verifying');
      await verifyDownloadedCandidate(manifest);
      await applyCandidate();
      setPendingManifest(null);
      // applyCandidate remounts SQLiteProvider, which closes the repository
      // captured by this hook. The signed-off manifest is generated from the
      // same metadata as the verified SQLite file, so update the UI from it
      // instead of querying a connection that has just been closed.
      setDatasetMeta({
        datasetId: manifest.datasetId,
        generatedAt: manifest.generatedAt,
        officialUpdatedAt: manifest.officialUpdatedAt,
        storeCount: manifest.storeCount,
        version: manifest.version,
      });
      setUpdateStatus('updated');
    } catch (error) {
      setUpdateStatus(
        'failed',
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [
    applyCandidate,
    setDatasetMeta,
    setPendingManifest,
    setUpdateStatus,
  ]);

  return { applyUpdate, checkUpdate };
}
