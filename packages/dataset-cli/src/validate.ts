import type { Store } from '@koto/schema';

export type ValidationReport = {
  storeCount: number;
  missingName: number;
  missingAddress: number;
  duplicateIds: string[];
  missingCoordinates: number;
  lowConfidenceLocations: number;
  generatedAt: string;
};

export function validateStores(stores: Store[]): ValidationReport {
  const idCounts = new Map<string, number>();
  for (const store of stores) {
    idCounts.set(store.id, (idCounts.get(store.id) ?? 0) + 1);
  }

  return {
    storeCount: stores.length,
    missingName: stores.filter((store) => !store.name).length,
    missingAddress: stores.filter((store) => !store.address).length,
    duplicateIds: [...idCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id),
    missingCoordinates: stores.filter((store) => store.lat === null || store.lng === null).length,
    lowConfidenceLocations: stores.filter((store) =>
      ['low', 'unknown'].includes(store.locationConfidence),
    ).length,
    generatedAt: new Date().toISOString(),
  };
}

export function assertValidForBuild(report: ValidationReport): void {
  const errors: string[] = [];
  if (report.storeCount <= 0) errors.push('No stores parsed.');
  if (report.missingName > 0) errors.push(`${report.missingName} stores are missing names.`);
  if (report.missingAddress > 0) errors.push(`${report.missingAddress} stores are missing addresses.`);
  if (report.duplicateIds.length > 0) errors.push(`${report.duplicateIds.length} duplicate ids found.`);

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}
