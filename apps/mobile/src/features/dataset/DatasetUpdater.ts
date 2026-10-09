import type {
  DatasetManifest,
  DatasetMeta,
  DatasetUpdateResult,
} from '@koto/schema';
import { DatasetManifestSchema, needsDatasetUpdate } from '@koto/schema';
import * as FileSystem from 'expo-file-system/legacy';

import { datasetPaths, sqliteDirectory } from './datasetPaths';
import {
  verifyCandidateDatabase,
  verifyCandidateHash,
  verifyFileSize,
} from './verifyDataset';

const manifestUrl = process.env.EXPO_PUBLIC_DATASET_MANIFEST_URL?.trim();

export async function checkForDatasetUpdate(
  currentMeta: DatasetMeta | null,
): Promise<{
  result: DatasetUpdateResult;
  manifest: DatasetManifest | null;
}> {
  if (!manifestUrl) {
    return {
      result: { status: 'skipped', reason: 'not-configured' },
      manifest: null,
    };
  }

  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return {
        result: { status: 'skipped', reason: 'offline' },
        manifest: null,
      };
    }

    const manifest = DatasetManifestSchema.parse(await response.json());
    if (!needsDatasetUpdate(currentMeta, manifest)) {
      return {
        result: { status: 'up-to-date', version: manifest.version },
        manifest: null,
      };
    }

    return {
      result: {
        status: 'updated',
        previousVersion: currentMeta?.version ?? null,
        nextVersion: manifest.version,
      },
      manifest,
    };
  } catch (error) {
    return {
      result: {
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error),
      },
      manifest: null,
    };
  }
}

export async function downloadCandidateDataset(
  manifest: DatasetManifest,
): Promise<void> {
  await FileSystem.makeDirectoryAsync(sqliteDirectory, { intermediates: true });
  await FileSystem.deleteAsync(datasetPaths.candidateDatabaseUri, {
    idempotent: true,
  });

  try {
    await FileSystem.downloadAsync(
      manifest.sqlite.url,
      datasetPaths.candidateDatabaseUri,
    );
  } catch (error) {
    await FileSystem.deleteAsync(datasetPaths.candidateDatabaseUri, {
      idempotent: true,
    });
    throw error;
  }
}

export async function verifyDownloadedCandidate(
  manifest: DatasetManifest,
): Promise<void> {
  try {
    await verifyFileSize(
      datasetPaths.candidateDatabaseUri,
      manifest.sqlite.size,
    );
    await verifyCandidateHash(manifest.sqlite.sha256);
    await verifyCandidateDatabase(manifest);
  } catch (error) {
    await FileSystem.deleteAsync(datasetPaths.candidateDatabaseUri, {
      idempotent: true,
    });
    throw error;
  }
}

// Written only after verification; the running provider keeps its active database.
export async function stageCandidateDataset(
  manifest: DatasetManifest,
): Promise<void> {
  await FileSystem.writeAsStringAsync(
    datasetPaths.localManifestUri,
    JSON.stringify(manifest),
  );
}
