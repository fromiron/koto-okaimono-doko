import { useCallback } from 'react';
import {
  checkForDatasetUpdate,
  downloadCandidateDataset,
  stageCandidateDataset,
  verifyDownloadedCandidate,
} from './DatasetUpdater';
import { useDatasetStore } from './datasetStore';

let busy = false;

export function useDatasetUpdate() {
  const checkUpdate = useCallback(async () => {
    if (busy || useDatasetStore.getState().updateStatus === 'restartRequired')
      return;
    busy = true;
    const state = useDatasetStore.getState();
    try {
      state.setUpdateStatus('checking');
      const { result, manifest } = await checkForDatasetUpdate(state.meta);
      if (result.status !== 'skipped' || result.reason !== 'not-configured')
        state.markUpdateChecked();
      state.setPendingManifest(manifest);
      if (result.status === 'failed')
        state.setUpdateStatus('failed', result.reason);
      else if (result.status === 'updated') state.setUpdateStatus('available');
      else if (result.status === 'up-to-date')
        state.setUpdateStatus('upToDate');
      else
        state.setUpdateStatus(
          result.reason === 'not-configured' ? 'notConfigured' : 'idle',
        );
    } finally {
      busy = false;
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    const state = useDatasetStore.getState();
    const manifest = state.pendingManifest;
    if (busy || !manifest || state.updateStatus === 'restartRequired') return;
    busy = true;
    try {
      state.setUpdateStatus('downloading');
      await downloadCandidateDataset(manifest);
      state.setUpdateStatus('verifying');
      await verifyDownloadedCandidate(manifest);
      await stageCandidateDataset(manifest);
      state.setPendingManifest(null);
      state.setUpdateStatus('restartRequired');
    } catch (error) {
      state.setUpdateStatus(
        'failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      busy = false;
    }
  }, []);

  return { applyUpdate, checkUpdate };
}
