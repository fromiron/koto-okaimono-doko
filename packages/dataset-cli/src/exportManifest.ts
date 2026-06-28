import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';

import type { DatasetManifest, DatasetMeta, Store } from '@koto/schema';

import { outputPaths } from './paths';

const DATASET_BASE_URL =
  process.env.DATASET_BASE_URL ?? 'https://example.github.io/koto-okaimono-doko/data/latest';

export async function exportManifest(meta: DatasetMeta, stores: Store[]): Promise<DatasetManifest> {
  const [sqliteHash, sqliteStat, jsonHash, jsonStat] = await Promise.all([
    sha256File(outputPaths.sqlite),
    stat(outputPaths.sqlite),
    sha256File(outputPaths.storesJson),
    stat(outputPaths.storesJson),
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

  await writeFile(outputPaths.manifest, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(outputPaths.seedManifest, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(outputPaths.storesGeoJson, `${JSON.stringify(toGeoJson(stores), null, 2)}\n`, 'utf8');

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
