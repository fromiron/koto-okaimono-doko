import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';

import type { DatasetManifest, DatasetMeta, Store } from '@koto/schema';

import { datasetOutputPaths, outputPaths } from './paths';

const DATASET_BASE_URL =
  process.env.DATASET_BASE_URL ??
  'https://fromiron.github.io/koto-okaimono-doko';

export async function exportManifest(
  meta: DatasetMeta,
  stores: Store[],
  paths: ReturnType<typeof datasetOutputPaths> = outputPaths,
): Promise<DatasetManifest> {
  const [sqliteHash, sqliteStat, jsonHash, jsonStat] = await Promise.all([
    sha256File(paths.sqlite),
    stat(paths.sqlite),
    sha256File(paths.storesJson),
    stat(paths.storesJson),
  ]);

  const manifest: DatasetManifest = {
    ...meta,
    sqlite: {
      url: `${DATASET_BASE_URL}/stores.sqlite`,
      sha256: sqliteHash,
      size: sqliteStat.size,
    },
    json: {
      url: `${DATASET_BASE_URL}/stores.json`,
      sha256: jsonHash,
      size: jsonStat.size,
    },
  };

  await writeFile(
    paths.manifest,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    paths.storesGeoJson,
    `${JSON.stringify(toGeoJson(stores), null, 2)}\n`,
    'utf8',
  );

  return manifest;
}

async function sha256File(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function toGeoJson(stores: Store[]) {
  return {
    type: 'FeatureCollection',
    features: stores
      .filter((store) => store.lat !== null && store.lng !== null)
      .map((store) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.lng, store.lat],
        },
        properties: {
          id: store.id,
          name: store.name,
          couponType: store.couponType,
          categoryMajorId: store.categoryMajorId,
          categoryMinorId: store.categoryMinorId,
        },
      })),
  };
}
