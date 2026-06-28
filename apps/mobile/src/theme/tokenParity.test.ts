/// <reference types="node" />

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { colors, radii } from './tokens';

const css = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../global.css'),
  'utf8',
);

const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function parseTheme(prefix: string): Record<string, string> {
  const re = new RegExp(`--${prefix}-([a-z-]+):\\s*([^;]+);`, 'g');
  const out: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = re.exec(css)) !== null) {
    out[kebabToCamel(match[1])] = match[2].trim();
  }
  return out;
}

describe('design token parity (global.css <-> tokens.ts)', () => {
  it('every @theme color matches a tokens.ts color', () => {
    const cssColors = parseTheme('color');
    expect(Object.keys(cssColors).length).toBeGreaterThan(10);
    for (const [name, hex] of Object.entries(cssColors)) {
      expect(`${name}=${colors[name as keyof typeof colors]?.toLowerCase()}`).toBe(
        `${name}=${hex.toLowerCase()}`,
      );
    }
  });

  it('every @theme radius matches a tokens.ts radius', () => {
    const cssRadii = parseTheme('radius');
    expect(Object.keys(cssRadii).length).toBeGreaterThan(0);
    for (const [name, value] of Object.entries(cssRadii)) {
      expect(`${name}=${radii[name as keyof typeof radii]}`).toBe(
        `${name}=${Number(value.replace('px', ''))}`,
      );
    }
  });
});
