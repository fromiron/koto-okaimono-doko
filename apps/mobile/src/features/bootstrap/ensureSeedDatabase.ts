import { DatasetManifestSchema, needsDatasetUpdate } from '@koto/schema';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import seedDatabaseAsset from '@/src/assets/db/seed.sqlite';
import {
  activeDatabaseName,
  backupDatabaseName,
  datasetPaths,
  sqliteDirectory,
} from '../dataset/datasetPaths';
import { verifyDatabaseFile } from '../dataset/verifyDataset';
import { verifyDownloadedCandidate } from '../dataset/DatasetUpdater';

export type BootDatabaseResult = { updated: boolean; error?: string };

async function removeActive() {
  for (const suffix of ['-wal', '-shm', '']) {
    await FileSystem.deleteAsync(`${datasetPaths.activeDatabaseUri}${suffix}`, {
      idempotent: true,
    });
  }
}

async function restoreUsableDatabase() {
  try {
    return await verifyDatabaseFile(activeDatabaseName);
  } catch {
    try {
      await verifyDatabaseFile(backupDatabaseName);
    } catch {
      const asset = Asset.fromModule(seedDatabaseAsset);
      await asset.downloadAsync();
      if (!asset.localUri) throw new Error('Unable to load bundled database');
      await removeActive();
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: datasetPaths.activeDatabaseUri,
      });
      return verifyDatabaseFile(activeDatabaseName);
    }
    await removeActive();
    // Keep the validated backup intact if the copy is interrupted.
    await FileSystem.copyAsync({
      from: datasetPaths.backupDatabaseUri,
      to: datasetPaths.activeDatabaseUri,
    });
    return verifyDatabaseFile(activeDatabaseName);
  }
}

// Called once at startup, before SQLiteProvider or any repository is mounted.
export async function ensureSeedDatabase(): Promise<BootDatabaseResult> {
  await FileSystem.makeDirectoryAsync(sqliteDirectory, { intermediates: true });
  const current = await restoreUsableDatabase();
  if (!(await FileSystem.getInfoAsync(datasetPaths.localManifestUri)).exists)
    return { updated: false };

  let replacing = false;
  try {
    const manifest = DatasetManifestSchema.parse(
      JSON.parse(
        await FileSystem.readAsStringAsync(datasetPaths.localManifestUri),
      ),
    );
    if (current.revision === manifest.revision) {
      await verifyDatabaseFile(activeDatabaseName, manifest);
      return { updated: true };
    }
    if (!needsDatasetUpdate(current, manifest)) return { updated: false };
    await verifyDownloadedCandidate(manifest);
    // Every verification connection has closed before any file operation begins.
    await FileSystem.deleteAsync(datasetPaths.backupDatabaseUri, {
      idempotent: true,
    });
    await FileSystem.copyAsync({
      from: datasetPaths.activeDatabaseUri,
      to: datasetPaths.backupDatabaseUri,
    });
    await verifyDatabaseFile(backupDatabaseName);
    replacing = true;
    await removeActive();
    await FileSystem.moveAsync({
      from: datasetPaths.candidateDatabaseUri,
      to: datasetPaths.activeDatabaseUri,
    });
    await verifyDatabaseFile(activeDatabaseName, manifest);
    return { updated: true };
  } catch (error) {
    if (replacing) {
      await verifyDatabaseFile(backupDatabaseName);
      await removeActive();
      await FileSystem.copyAsync({
        from: datasetPaths.backupDatabaseUri,
        to: datasetPaths.activeDatabaseUri,
      });
      await verifyDatabaseFile(activeDatabaseName);
    } else {
      await restoreUsableDatabase();
    }
    await FileSystem.deleteAsync(datasetPaths.localManifestUri, {
      idempotent: true,
    });
    return {
      updated: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
