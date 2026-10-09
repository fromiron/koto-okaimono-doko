import { z } from 'zod';

export const MAX_SQLITE_DATASET_BYTES = 5 * 1024 * 1024;

export const DATASET_ID = 'koto-premium-coupon-2026';
export const DATASET_SCHEMA_VERSION = 1;

export const DatasetMetaSchema = z.object({
  datasetId: z.string().min(1),
  version: z.string().min(1),
  officialUpdatedAt: z.string().min(1),
  generatedAt: z.string().min(1),
  storeCount: z.number().int().nonnegative(),
  schemaVersion: z.number().int().positive().optional(),
  revision: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  sourceDates: z.object({ ab: z.string(), b: z.string() }).optional(),
});

export const DatasetManifestSchema = DatasetMetaSchema.extend({
  sqlite: z.object({
    url: z.string().url(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    size: z.number().int().positive().max(MAX_SQLITE_DATASET_BYTES),
  }),
  json: z
    .object({
      url: z.string().url(),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
      size: z.number().int().positive(),
    })
    .optional(),
});

export type DatasetManifest = z.infer<typeof DatasetManifestSchema>;

export type DatasetMeta = z.infer<typeof DatasetMetaSchema>;

export function assertSupportedDataset(
  meta: DatasetMeta,
  requireRevision = false,
): void {
  if (
    meta.datasetId !== DATASET_ID ||
    (meta.schemaVersion ?? 1) !== DATASET_SCHEMA_VERSION
  ) {
    throw new Error('Unsupported dataset or schema version');
  }
  if (
    requireRevision &&
    (!meta.revision ||
      meta.schemaVersion === undefined ||
      meta.version !== `r1-${meta.revision}`)
  ) {
    throw new Error('A versioned dataset revision is required');
  }
}

export function needsDatasetUpdate(
  current: DatasetMeta | null,
  next: DatasetMeta,
): boolean {
  assertSupportedDataset(next, true);
  if (!current) return true;
  assertSupportedDataset(current);
  if (current.revision === next.revision) return false;
  if (
    !Number.isFinite(Date.parse(next.generatedAt)) ||
    !Number.isFinite(Date.parse(current.generatedAt)) ||
    Date.parse(next.generatedAt) <= Date.parse(current.generatedAt)
  ) {
    throw new Error('Refusing an older or unordered dataset revision');
  }
  return true;
}

export type DatasetUpdateResult =
  | { status: 'up-to-date'; version: string }
  | { status: 'updated'; previousVersion: string | null; nextVersion: string }
  | { status: 'skipped'; reason: 'not-configured' | 'offline' | 'same-version' }
  | { status: 'failed'; reason: string };
