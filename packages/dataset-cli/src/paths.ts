import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '../../..');

export const dataDir = path.join(repoRoot, 'data');
export const rawDir = path.join(dataDir, 'raw');
export const latestDir = path.join(dataDir, 'latest');
export const correctionsDir = path.join(dataDir, 'corrections');
export const mobileSeedDir = path.join(repoRoot, 'apps/mobile/src/assets/db');

export function snapshotPaths(directory: string) {
  return {
    listPage: (page: number) => path.join(directory, `list-page-${page}.html`),
    abPdf: path.join(directory, 'storeListAB.pdf'),
    bPdf: path.join(directory, 'storeListB.pdf'),
  };
}

export function datasetOutputPaths(directory: string) {
  return {
    storesJson: path.join(directory, 'stores.json'),
    storesGeoJson: path.join(directory, 'stores.geojson'),
    sqlite: path.join(directory, 'stores.sqlite'),
    manifest: path.join(directory, 'manifest.json'),
    validationReport: path.join(directory, 'validation-report.json'),
  };
}

export const outputPaths = {
  ...datasetOutputPaths(latestDir),
  seedSqlite: path.join(mobileSeedDir, 'seed.sqlite'),
  seedManifest: path.join(mobileSeedDir, 'seed.manifest.json'),
};
