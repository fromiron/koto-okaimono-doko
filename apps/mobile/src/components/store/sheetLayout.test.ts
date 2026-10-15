import { describe, expect, it } from 'vitest';

import {
  getMapCameraLatitude,
  getSheetHeightAtIndex,
  SHEET_MID_RATIO,
  SHEET_PEEK_HEIGHT,
} from './sheetLayout';

describe('sheet layout', () => {
  it('resolves snap heights from the real peek size and mid/full ratios', () => {
    expect(getSheetHeightAtIndex(0, 1000, 34)).toBe(SHEET_PEEK_HEIGHT + 34);
    expect(getSheetHeightAtIndex(1, 800, 34)).toBe(
      Math.round(800 * SHEET_MID_RATIO),
    );
  });

  it('keeps snap points ordered on short landscape screens', () => {
    for (const height of [320, 400, 600, 800]) {
      const peek = getSheetHeightAtIndex(0, height, 34);
      const middle = getSheetHeightAtIndex(1, height, 34);
      const full = getSheetHeightAtIndex(2, height, 34);
      expect(peek).toBeLessThan(middle);
      expect(middle).toBeLessThan(full);
    }
  });

  it('centres a selected marker in the map area left between deck and sheet', () => {
    expect(getMapCameraLatitude(35.68, 0.008, 800, 140, 464)).toBeCloseTo(
      35.67838,
    );
    expect(getMapCameraLatitude(35.68, 0.008, 0, 140, 464)).toBe(35.68);
  });
});
