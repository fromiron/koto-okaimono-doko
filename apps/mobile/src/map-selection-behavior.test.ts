/// <reference types="node" />

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const mobileRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

describe('map selection behavior', () => {
  it('uses a compact circular marker capture tree without perpetual selected tracking', () => {
    const storeMarker = readFileSync(
      path.join(mobileRoot, 'src/components/map/StoreMarker.tsx'),
      'utf8',
    );
    const capture = readFileSync(
      path.join(mobileRoot, 'src/components/map/useMarkerBitmapCapture.ts'),
      'utf8',
    );
    const clusterMarker = readFileSync(
      path.join(mobileRoot, 'src/components/map/ClusterMarker.tsx'),
      'utf8',
    );

    expect(storeMarker).toContain('CircleMarkerView');
    expect(storeMarker).not.toContain("rotate: '45deg'");
    expect(storeMarker).not.toContain('CANVAS_W');
    expect(storeMarker).not.toContain('Users');
    expect(capture).not.toContain('if (selected)');
    expect(clusterMarker).not.toContain('count >= 100');
  });
});
