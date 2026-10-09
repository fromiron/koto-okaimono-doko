import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import {
  DATASET_ID,
  DATASET_SCHEMA_VERSION,
  DatasetManifestSchema,
  type DatasetMeta,
} from '@koto/schema';

import { createDatabase } from './buildSqlite';
import { exportManifest } from './exportManifest';
import { fetchOfficial, type SourceSnapshot } from './fetchOfficial';
import { normalizeRows } from './normalize';
import { parseHtmlPages } from './parseHtml';
import { parsePdfMetadata, sourceDateMetadata } from './parsePdf';
import {
  datasetOutputPaths,
  latestDir,
  outputPaths,
  rawDir,
  repoRoot,
} from './paths';
import { datasetRevision } from './revision';
import { assertValidForBuild, validateStores } from './validate';

export function assertCountChange(
  count: number,
  previous: number,
  reason = '',
) {
  if (count < previous * 0.9 && !reason.trim()) {
    throw new Error(
      `Store count dropped from ${previous} to ${count}; review required (DATASET_ALLOW_DECREASE_REASON)`,
    );
  }
}

async function baselineCount() {
  const url = `${process.env.DATASET_BASE_URL ?? 'https://fromiron.github.io/koto-okaimono-doko'}/manifest.json`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (response.status === 404)
    return DatasetManifestSchema.parse(
      JSON.parse(await readFile(outputPaths.seedManifest, 'utf8')),
    ).storeCount;
  if (!response.ok)
    throw new Error(`Cannot verify deployed baseline: ${response.status}`);
  const manifest = DatasetManifestSchema.parse(await response.json());
  if (manifest.datasetId !== DATASET_ID)
    throw new Error('Unexpected baseline dataset');
  return manifest.storeCount;
}

export async function buildDataset(fixture = false): Promise<void> {
  const previousCount = fixture ? 0 : await baselineCount();
  const fixtureDir = path.join(
    repoRoot,
    'packages/dataset-cli/src/testing/snapshot',
  );
  const snapshot: SourceSnapshot = fixture
    ? {
        ...JSON.parse(
          await readFile(path.join(fixtureDir, 'snapshot.json'), 'utf8'),
        ),
        directory: fixtureDir,
      }
    : await fetchOfficial();
  const [rows, pdfMetadata] = await Promise.all([
    parseHtmlPages(snapshot),
    parsePdfMetadata(snapshot.directory),
  ]);
  const { sourceDates, officialUpdatedAt } = sourceDateMetadata(pdfMetadata);
  const stores = await normalizeRows(rows, fixture);
  const revision = datasetRevision(stores, sourceDates);
  const meta: DatasetMeta = {
    datasetId: DATASET_ID,
    schemaVersion: DATASET_SCHEMA_VERSION,
    revision,
    version: `r1-${revision}`,
    sourceDates,
    officialUpdatedAt,
    generatedAt: new Date().toISOString(),
    storeCount: stores.length,
  };
  const report = validateStores(stores);
  assertValidForBuild(report);
  const decreaseReason = process.env.DATASET_ALLOW_DECREASE_REASON ?? '';
  assertCountChange(stores.length, previousCount, decreaseReason);
  await mkdir(rawDir, { recursive: true });
  const staging = await mkdtemp(path.join(rawDir, 'build-'));
  const paths = datasetOutputPaths(staging);
  await writeFile(path.join(staging, '.gitkeep'), '');
  await writeFile(paths.storesJson, `${JSON.stringify(stores, null, 2)}\n`);
  await writeFile(
    paths.validationReport,
    `${JSON.stringify({ ...report, snapshot: path.basename(snapshot.directory), previousCount, decreaseReason, revision, schemaVersion: meta.schemaVersion, sourceDates, complete: true }, null, 2)}\n`,
  );
  createDatabase(paths.sqlite, stores, meta);
  const manifest = await exportManifest(meta, stores, paths);
  DatasetManifestSchema.parse(manifest);
  if (fixture) {
    // CI artifacts must never replace the bundled production seed or live output.
    console.log(
      `Fixture contract built: ${manifest.version}, ${stores.length} stores`,
    );
    await rm(staging, { recursive: true });
    return;
  }
  const backup = `${latestDir}.previous`;
  await rm(backup, { recursive: true, force: true });
  await rename(latestDir, backup).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error;
  });
  try {
    await rename(staging, latestDir);
  } catch (error) {
    await rename(backup, latestDir);
    throw error;
  }
  await rm(backup, { recursive: true, force: true });
  console.log(`Built dataset ${meta.version} with ${stores.length} stores.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildDataset(process.argv.includes('--fixture'));
}
