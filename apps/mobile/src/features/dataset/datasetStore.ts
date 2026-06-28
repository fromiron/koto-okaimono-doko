import type { DatasetMeta, DatasetManifest } from '@koto/schema';
import { create } from 'zustand';

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'verifying' | 'updated' | 'failed';

type DatasetState = {
  meta: DatasetMeta | null;
  pendingManifest: DatasetManifest | null;
  lastCheckedAt: string | null;
  updateStatus: UpdateStatus;
  error: string | null;
  setDatasetMeta: (meta: DatasetMeta) => void;
  setPendingManifest: (manifest: DatasetManifest | null) => void;
  setUpdateStatus: (status: UpdateStatus, error?: string | null) => void;
};

export const useDatasetStore = create<DatasetState>((set) => ({
  meta: null,
  pendingManifest: null,
  lastCheckedAt: null,
  updateStatus: 'idle',
  error: null,
  setDatasetMeta: (meta) => set({ meta }),
  setPendingManifest: (pendingManifest) => set({ pendingManifest }),
  setUpdateStatus: (updateStatus, error = null) =>
    set({
      updateStatus,
      error,
      lastCheckedAt: new Date().toISOString(),
    }),
}));
