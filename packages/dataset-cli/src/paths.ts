import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '../../..');

export const dataDir = path.join(repoRoot, 'data');
export const rawDir = path.join(dataDir, 'raw');
export const latestDir = path.join(dataDir, 'latest');
export const correctionsDir = path.join(dataDir, 'corrections');
export const mobileSeedDir = path.join(repoRoot, 'apps/mobile/src/assets/db');

export const rawPaths = {
  listPage: (page: number) => path.join(rawDir, `list-page-${page}.html`),
  abPdf: path.join(rawDir, 'storeListAB.pdf'),
  bPdf: path.join(rawDir, 'storeListB.pdf'),
};

export const outputPaths = {
  storesJson: path.join(latestDir, 'stores.json'),
  storesGeoJson: path.join(latestDir, 'stores.geojson'),
  sqlite: path.join(latestDir, 'stores.sqlite'),
  manifest: path.join(latestDir, 'manifest.json'),
  validationReport: path.join(latestDir, 'validation-report.json'),
  seedSqlite: path.join(mobileSeedDir, 'seed.sqlite'),
  seedManifest: path.join(mobileSeedDir, 'seed.manifest.json'),
};
