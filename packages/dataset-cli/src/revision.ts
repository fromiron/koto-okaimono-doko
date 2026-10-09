import { createHash } from 'node:crypto';
import {
  DATASET_ID,
  DATASET_SCHEMA_VERSION,
  type DatasetMeta,
  type Store,
} from '@koto/schema';

export function datasetRevision(
  stores: Store[],
  sourceDates: NonNullable<DatasetMeta['sourceDates']>,
): string {
  const content = [...stores]
    .sort((a, b) => a.id.localeCompare(b.id, 'en'))
    .map(({ createdAt: _created, updatedAt: _updated, ...store }) =>
      Object.fromEntries(
        Object.entries(store).sort(([a], [b]) => a.localeCompare(b, 'en')),
      ),
    );
  return createHash('sha256')
    .update(
      JSON.stringify({
        datasetId: DATASET_ID,
        schemaVersion: DATASET_SCHEMA_VERSION,
        sourceDates: { ab: sourceDates.ab, b: sourceDates.b },
        stores: content,
      }),
    )
    .digest('hex');
}
