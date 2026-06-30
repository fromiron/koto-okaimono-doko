import { z } from 'zod';

export const MAX_SQLITE_DATASET_BYTES = 5 * 1024 * 1024;

export const DatasetManifestSchema = z.object({
  datasetId: z.string().min(1),
  version: z.string().min(1),
  officialUpdatedAt: z.string().min(1),
  generatedAt: z.string().min(1),
  storeCount: z.number().int().nonnegative(),
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

export type DatasetMeta = {
  datasetId: string;
  version: string;
  officialUpdatedAt: string;
  generatedAt: string;
  storeCount: number;
};

export type DatasetUpdateResult =
  | { status: 'up-to-date'; version: string }
  | { status: 'updated'; previousVersion: string | null; nextVersion: string }
  | { status: 'skipped'; reason: 'offline' | 'same-version' }
  | { status: 'failed'; reason: string };
