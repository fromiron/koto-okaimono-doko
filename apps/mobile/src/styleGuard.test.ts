/// <reference types="node" />

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function collectTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTsx(full));
    } else if (full.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

const files = [...collectTsx(path.join(mobileRoot, 'app')), ...collectTsx(path.join(mobileRoot, 'src'))];
const rel = (f: string) => path.relative(mobileRoot, f);

const RAW_RADIUS = /rounded-\[/;
const FRACTIONAL_SPACING = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-\d+\.5\b/;

describe('style guard (design-token discipline)', () => {
  it('uses radius tokens (rounded-card/sheet/thumb/input), never raw rounded-[Npx]', () => {
    const offenders = files.filter((f) => RAW_RADIUS.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('uses the 4pt spacing scale, no fractional spacing utilities', () => {
    const offenders = files.filter((f) => FRACTIONAL_SPACING.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });
});
