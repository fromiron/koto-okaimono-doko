import type { DatasetUpdateResult } from '@koto/schema';
import { useCallback } from 'react';

import { useStoreRepository } from '@/src/features/db/useStoreRepository';

import { checkForDatasetUpdate, useApplyCandidateDataset } from './DatasetUpdater';
import { useDatasetStore, type UpdateStatus } from './datasetStore';

function toUpdateStatus(status: DatasetUpdateResult['status']): UpdateStatus {
  if (status === 'failed') return 'failed';
  if (status === 'updated') return 'updated';
  if (status === 'up-to-date') return 'upToDate';
  return 'idle';
}

/**
 * Centralizes the dataset update-check / apply flow so the map screen
 * (auto-check) and the settings screen (manual check + apply) share one
 * implementation and one status mapping.
 */
export function useDatasetUpdate() {
  const setDatasetMeta = useDatasetStore((state) => state.setDatasetMeta);
  const setPendingManifest = useDatasetStore((state) => state.setPendingManifest);
  const setUpdateStatus = useDatasetStore((state) => state.setUpdateStatus);
  const repository = useStoreRepository();
  const applyCandidate = useApplyCandidateDataset();

  const checkUpdate = useCallback(async () => {
    setUpdateStatus('checking');
    const { result, manifest } = await checkForDatasetUpdate(useDatasetStore.getState().meta);
    if (manifest) setPendingManifest(manifest);
    setUpdateStatus(toUpdateStatus(result.status));
  }, [setPendingManifest, setUpdateStatus]);

  const applyUpdate = useCallback(async () => {
    setUpdateStatus('verifying');
    await applyCandidate();
    setPendingManifest(null);
    setDatasetMeta(await repository.getDatasetMeta());
    setUpdateStatus('idle');
  }, [applyCandidate, repository, setDatasetMeta, setPendingManifest, setUpdateStatus]);

  return { applyUpdate, checkUpdate };
}
