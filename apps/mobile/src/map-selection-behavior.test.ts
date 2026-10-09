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
  it('clears the selected store on empty-map tap, not while panning the map', () => {
    const mapScreen = readFileSync(
      path.join(mobileRoot, 'app/index.tsx'),
      'utf8',
    );
    const storeMap = readFileSync(
      path.join(mobileRoot, 'src/components/map/StoreMap.tsx'),
      'utf8',
    );

    expect(mapScreen).toContain('onMapPress={clearSelectedStore}');
    expect(storeMap).toContain('onPress={onMapPress}');
    expect(storeMap).not.toContain('onPanDrag');
  });

  it('hides the current-location control while the search field owns the keyboard', () => {
    const mapScreen = readFileSync(
      path.join(mobileRoot, 'app/index.tsx'),
      'utf8',
    );
    const controlStart = mapScreen.indexOf('{selectedStoreIds.length === 0 &&');
    const controlEnd = mapScreen.indexOf('<StoreBottomSheet', controlStart);
    const controlSource = mapScreen.slice(controlStart, controlEnd);

    expect(controlStart).toBeGreaterThan(-1);
    expect(controlSource).toContain('<UserLocationButton');
    expect(controlSource).toContain('!keyboardVisible');
    expect(controlSource).not.toContain('visibleStoreCount > 0');
  });

  it('offsets selection cameras without Android native map padding', () => {
    const mapScreen = readFileSync(
      path.join(mobileRoot, 'app/index.tsx'),
      'utf8',
    );
    const storeMap = readFileSync(
      path.join(mobileRoot, 'src/components/map/StoreMap.tsx'),
      'utf8',
    );

    expect(storeMap).not.toContain('mapPadding');
    expect(mapScreen).toContain('getMapCameraLatitude');
    expect(mapScreen).toContain('getSheetHeightAtIndex');
    expect(mapScreen).not.toContain('latitude: store.lat - 0.002');
    expect(mapScreen).toContain('if (sheetIndex !== 1) return;');
  });

  it('dismisses the search keyboard before opening store detail', () => {
    const mapScreen = readFileSync(
      path.join(mobileRoot, 'app/index.tsx'),
      'utf8',
    );
    const bottomSheet = readFileSync(
      path.join(mobileRoot, 'src/components/store/StoreBottomSheet.tsx'),
      'utf8',
    );

    expect(mapScreen).toContain('Keyboard.dismiss();');
    expect(bottomSheet).toContain('keyboardShouldPersistTaps="handled"');
  });

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
