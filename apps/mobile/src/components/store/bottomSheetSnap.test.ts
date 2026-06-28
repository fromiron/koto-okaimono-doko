import { describe, expect, it } from 'vitest';

import { COLLAPSED_SNAP_INDEX, EXPANDED_SNAP_INDEX, sheetSnapIndex } from './bottomSheetSnap';

describe('sheetSnapIndex', () => {
  it('expands when a store is selected', () => {
    expect(sheetSnapIndex(true)).toBe(EXPANDED_SNAP_INDEX);
  });

  it('collapses to the peek when nothing is selected', () => {
    expect(sheetSnapIndex(false)).toBe(COLLAPSED_SNAP_INDEX);
  });
});
