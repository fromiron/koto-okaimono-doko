/// <reference types="node" />

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('Uniwind native setup', () => {
  it('imports the global stylesheet from the root layout', () => {
    const layout = readFileSync(path.join(mobileRoot, 'app/_layout.tsx'), 'utf8');

    expect(layout).toContain("import '@/src/global.css';");
  });
});
