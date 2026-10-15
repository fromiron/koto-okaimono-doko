import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { snapshotPaths } from './paths';
import { parseUpdatedDate } from './dates';

const execFileAsync = promisify(execFile);

export type PdfMetadata = {
  abUpdatedAt: string | null;
  bUpdatedAt: string | null;
};

export async function parsePdfMetadata(
  directory: string,
): Promise<PdfMetadata> {
  const rawPaths = snapshotPaths(directory);
  const [abText, bText] = await Promise.all([
    pdftotext(rawPaths.abPdf),
    pdftotext(rawPaths.bPdf),
  ]);

  return {
    abUpdatedAt: parsePdfUpdatedAt(abText),
    bUpdatedAt: parsePdfUpdatedAt(bText),
  };
}

async function pdftotext(filePath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      'pdftotext',
      ['-layout', filePath, '-'],
      {
        maxBuffer: 32 * 1024 * 1024,
      },
    );
    return stdout;
  } catch (error) {
    throw new Error(`pdftotext failed for ${filePath}: ${String(error)}`);
  }
}

export const parsePdfUpdatedAt = parseUpdatedDate;

export function sourceDateMetadata(metadata: PdfMetadata) {
  if (!metadata.abUpdatedAt || !metadata.bUpdatedAt) {
    throw new Error('Missing official PDF update date; review required');
  }
  const sourceDates = { ab: metadata.abUpdatedAt, b: metadata.bUpdatedAt };
  return {
    sourceDates,
    officialUpdatedAt: [sourceDates.ab, sourceDates.b].sort().at(-1)!,
  };
}
