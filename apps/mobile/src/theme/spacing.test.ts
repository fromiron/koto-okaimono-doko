import { describe, expect, it } from 'vitest';

import { iconSizes, layout, radii, space } from './tokens';

describe('spacing + size scales', () => {
  it('space is a strict 4pt scale', () => {
    expect(Object.values(space)).toEqual([4, 8, 12, 16, 20, 24, 32, 40]);
    for (const value of Object.values(space)) {
      expect(value % 4).toBe(0);
    }
  });

  it('layout roles map to scale values', () => {
    expect(layout.screenGutter).toBe(space.xl);
    expect(layout.cardPadding).toBe(space.lg);
    expect(layout.sectionGap).toBe(space['2xl']);
    expect(layout.stackGap).toBe(space.md);
    expect(layout.inlineGap).toBe(space.sm);
  });

  it('card radius is unified to 16 and icon scale is 16/20/24/28', () => {
    expect(radii.card).toBe(16);
    expect(Object.values(iconSizes)).toEqual([16, 20, 24, 28]);
  });
});
