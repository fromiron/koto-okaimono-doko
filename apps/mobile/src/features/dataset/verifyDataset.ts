import { File } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

import { candidateDatabaseName, datasetPaths, sqliteDirectory } from './datasetPaths';

export async function sha256File(uri: string): Promise<string> {
  const file = new File(uri);
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, await file.bytes());
  return arrayBufferToHex(digest);
}

export async function verifyFileSize(uri: string, expectedSize: number): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || info.size !== expectedSize) {
    throw new Error(`Expected ${expectedSize} bytes, got ${info.exists ? info.size : 'missing file'}`);
  }
}

export async function verifyCandidateDatabase(expectedStoreCount: number): Promise<void> {
  const db = await SQLite.openDatabaseAsync(candidateDatabaseName, {}, sqliteDirectory);
  try {
    const stores = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM stores');
    const meta = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM dataset_meta WHERE key = 'storeCount'",
    );

    if (!stores || stores.count !== expectedStoreCount) {
      throw new Error(`Candidate store count mismatch: ${stores?.count ?? 'unknown'}`);
    }
    if (!meta || Number(meta.value) !== expectedStoreCount) {
      throw new Error('Candidate dataset_meta storeCount mismatch');
    }
  } finally {
    await db.closeAsync();
  }
}

export async function verifyCandidateHash(expectedSha256: string): Promise<void> {
  const actual = await sha256File(datasetPaths.candidateDatabaseUri);
  if (actual !== expectedSha256) {
    throw new Error(`SHA-256 mismatch: expected ${expectedSha256}, got ${actual}`);
  }
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
