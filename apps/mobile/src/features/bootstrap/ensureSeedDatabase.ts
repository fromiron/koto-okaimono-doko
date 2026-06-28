import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import seedDatabaseAsset from '@/src/assets/db/seed.sqlite';
import { activeDatabaseName, datasetPaths, sqliteDirectory } from '@/src/features/dataset/datasetPaths';

export async function ensureSeedDatabase(): Promise<void> {
  const directoryInfo = await FileSystem.getInfoAsync(sqliteDirectory);
  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDirectory, { intermediates: true });
  }

  const activeInfo = await FileSystem.getInfoAsync(datasetPaths.activeDatabaseUri);
  if (activeInfo.exists) {
    return;
  }

  const asset = Asset.fromModule(seedDatabaseAsset);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error(`Unable to load bundled ${activeDatabaseName}`);
  }

  await FileSystem.copyAsync({
    from: asset.localUri,
    to: datasetPaths.activeDatabaseUri,
  });
}
