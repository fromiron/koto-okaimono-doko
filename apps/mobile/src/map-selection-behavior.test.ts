/// <reference types="node" />

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('map selection behavior', () => {
  it('does not clear the selected store from the region-change handler', () => {
    const mapScreen = readFileSync(path.join(mobileRoot, 'app/index.tsx'), 'utf8');
    const handlerStart = mapScreen.indexOf('const handleRegionChange = useCallback');
    const handlerEnd = mapScreen.indexOf('return (', handlerStart);
    const handlerSource = mapScreen.slice(handlerStart, handlerEnd);

    expect(handlerSource).toContain('setRegion(nextRegion);');
    expect(handlerSource).not.toContain('clearSelectedStore');
  });

  it('clears the selected store on empty-map tap, not while panning the map', () => {
    const mapScreen = readFileSync(path.join(mobileRoot, 'app/index.tsx'), 'utf8');
    const storeMap = readFileSync(path.join(mobileRoot, 'src/components/map/StoreMap.tsx'), 'utf8');

    expect(mapScreen).toContain('onMapPress={clearSelectedStore}');
    expect(storeMap).toContain('onPress={onMapPress}');
    expect(storeMap).not.toContain('onPanDrag');
  });
});
