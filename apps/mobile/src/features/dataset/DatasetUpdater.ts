import type { DatasetManifest, DatasetMeta, DatasetUpdateResult } from '@koto/schema';
import { DatasetManifestSchema } from '@koto/schema';
import * as FileSystem from 'expo-file-system/legacy';

import { useDatabaseReload } from '@/src/features/bootstrap/AppProviders';

import {
  candidateDatabaseName,
  datasetPaths,
  sqliteDirectory,
} from './datasetPaths';
import {
  verifyCandidateDatabase,
  verifyCandidateHash,
  verifyFileSize,
} from './verifyDataset';

const manifestUrl =
  process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL ??
  'https://example.github.io/koto-okaimono-doko/data/latest/manifest.json';

export async function checkForDatasetUpdate(currentMeta: DatasetMeta | null): Promise<{
  result: DatasetUpdateResult;
  manifest: DatasetManifest | null;
}> {
  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return { result: { status: 'skipped', reason: 'offline' }, manifest: null };
    }

    const manifest = DatasetManifestSchema.parse(await response.json());
    if (currentMeta?.version === manifest.version) {
      return { result: { status: 'up-to-date', version: manifest.version }, manifest: null };
    }

    await FileSystem.makeDirectoryAsync(sqliteDirectory, { intermediates: true });
    await FileSystem.deleteAsync(datasetPaths.candidateDatabaseUri, { idempotent: true });
    await FileSystem.downloadAsync(manifest.sqlite.url, datasetPaths.candidateDatabaseUri);
    await verifyFileSize(datasetPaths.candidateDatabaseUri, manifest.sqlite.size);
    await verifyCandidateHash(manifest.sqlite.sha256);
    await verifyCandidateDatabase(manifest.storeCount);

    return {
      result: {
        status: 'updated',
        previousVersion: currentMeta?.version ?? null,
        nextVersion: manifest.version,
      },
      manifest,
    };
  } catch (error) {
    await FileSystem.deleteAsync(datasetPaths.candidateDatabaseUri, { idempotent: true });
    return {
      result: { status: 'failed', reason: error instanceof Error ? error.message : String(error) },
      manifest: null,
    };
  }
}

export async function applyCandidateDataset(): Promise<void> {
  const candidateInfo = await FileSystem.getInfoAsync(datasetPaths.candidateDatabaseUri);
  if (!candidateInfo.exists) {
    throw new Error(`No pending ${candidateDatabaseName}`);
  }

  await FileSystem.deleteAsync(datasetPaths.backupDatabaseUri, { idempotent: true });

  const activeInfo = await FileSystem.getInfoAsync(datasetPaths.activeDatabaseUri);
  if (activeInfo.exists) {
    await FileSystem.moveAsync({
      from: datasetPaths.activeDatabaseUri,
      to: datasetPaths.backupDatabaseUri,
    });
  }

  // The previous active database's WAL/SHM sidecars are not moved with the
  // .sqlite file, so remove the orphans before promoting the candidate. Leaving
  // them would let SQLite apply a stale WAL to the newly promoted database.
  await FileSystem.deleteAsync(`${datasetPaths.activeDatabaseUri}-wal`, { idempotent: true });
  await FileSystem.deleteAsync(`${datasetPaths.activeDatabaseUri}-shm`, { idempotent: true });

  try {
    await FileSystem.moveAsync({
      from: datasetPaths.candidateDatabaseUri,
      to: datasetPaths.activeDatabaseUri,
    });
  } catch (error) {
    const backupInfo = await FileSystem.getInfoAsync(datasetPaths.backupDatabaseUri);
    if (backupInfo.exists) {
      await FileSystem.moveAsync({
        from: datasetPaths.backupDatabaseUri,
        to: datasetPaths.activeDatabaseUri,
      });
    }
    throw error;
  }
}

export function useApplyCandidateDataset() {
  const { reloadDatabase, unmountDatabase } = useDatabaseReload();

  return async () => {
    unmountDatabase();
    try {
      await applyCandidateDataset();
    } finally {
      reloadDatabase();
    }
  };
}
