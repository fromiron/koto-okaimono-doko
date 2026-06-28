import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { correctionsDir } from './paths';

export type LocationCorrection = {
  storeId: string;
  lat: number;
  lng: number;
  confidence: 'high' | 'medium' | 'low';
  note: string | null;
};

export async function loadLocationCorrections(): Promise<Map<string, LocationCorrection>> {
  const filePath = path.join(correctionsDir, 'manual-geocodes.csv');
  const corrections = new Map<string, LocationCorrection>();

  try {
    const csv = await readFile(filePath, 'utf8');
    for (const line of csv.split(/\r?\n/).slice(1)) {
      if (!line.trim()) continue;
      const [storeId, lat, lng, confidence = 'high', note = ''] = line.split(',');
      if (!storeId || !lat || !lng) continue;
      corrections.set(storeId, {
        storeId,
        lat: Number(lat),
        lng: Number(lng),
        confidence: confidence as LocationCorrection['confidence'],
        note: note || null,
      });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  return corrections;
}
