import { mkdir, writeFile } from 'node:fs/promises';

import type { DatasetMeta } from '@koto/schema';

import { buildSqlite } from './buildSqlite';
import { exportManifest } from './exportManifest';
import { fetchOfficial } from './fetchOfficial';
import { normalizeRows } from './normalize';
import { parseHtmlPages } from './parseHtml';
import { parsePdfMetadata } from './parsePdf';
import { latestDir, mobileSeedDir, outputPaths } from './paths';
import { assertValidForBuild, validateStores } from './validate';

const DATASET_ID = 'koto-premium-coupon-2026';

export async function buildDataset(): Promise<void> {
  await fetchOfficial();

  const [rows, pdfMetadata] = await Promise.all([parseHtmlPages(), parsePdfMetadata()]);
  const stores = await normalizeRows(rows);
  const generatedAt = new Date().toISOString();
  const officialUpdatedAt = pdfMetadata.abUpdatedAt ?? pdfMetadata.bUpdatedAt ?? '2026-06-24';
  const meta: DatasetMeta = {
    datasetId: DATASET_ID,
    version: `${officialUpdatedAt}.1`,
    officialUpdatedAt,
    generatedAt,
    storeCount: stores.length,
  };

  const report = validateStores(stores);
  assertValidForBuild(report);

  await mkdir(latestDir, { recursive: true });
  await mkdir(mobileSeedDir, { recursive: true });
  await writeFile(outputPaths.storesJson, `${JSON.stringify(stores, null, 2)}\n`, 'utf8');
  await writeFile(outputPaths.validationReport, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await buildSqlite(stores, meta);
  await exportManifest(meta, stores);

  console.log(`Built dataset ${meta.version} with ${stores.length} stores.`);
  console.log(`Missing coordinates: ${report.missingCoordinates}`);
  console.log(`Low confidence locations: ${report.lowConfidenceLocations}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildDataset();
}
