import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { rawPaths } from './paths';

const execFileAsync = promisify(execFile);

export type PdfMetadata = {
  abUpdatedAt: string | null;
  bUpdatedAt: string | null;
};

export async function parsePdfMetadata(): Promise<PdfMetadata> {
  const [abText, bText] = await Promise.all([pdftotext(rawPaths.abPdf), pdftotext(rawPaths.bPdf)]);

  return {
    abUpdatedAt: parsePdfUpdatedAt(abText),
    bUpdatedAt: parsePdfUpdatedAt(bText),
  };
}

async function pdftotext(filePath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-'], {
      maxBuffer: 32 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    throw new Error(`pdftotext failed for ${filePath}: ${String(error)}`);
  }
}

function parsePdfUpdatedAt(text: string): string | null {
  const match = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s+現在/);
  if (!match) return null;
  return `${match[1]}-${match[2]?.padStart(2, '0')}-${match[3]?.padStart(2, '0')}`;
}
