import * as FileSystem from 'expo-file-system/legacy';

export const activeDatabaseName = 'stores.active.sqlite';
export const candidateDatabaseName = 'stores.candidate.sqlite';
export const backupDatabaseName = 'stores.backup.sqlite';
export const localManifestName = 'manifest.local.json';

export const sqliteDirectory = `${FileSystem.documentDirectory ?? ''}SQLite`;

export const datasetPaths = {
  activeDatabaseUri: `${sqliteDirectory}/${activeDatabaseName}`,
  candidateDatabaseUri: `${sqliteDirectory}/${candidateDatabaseName}`,
  backupDatabaseUri: `${sqliteDirectory}/${backupDatabaseName}`,
  localManifestUri: `${sqliteDirectory}/${localManifestName}`,
};
