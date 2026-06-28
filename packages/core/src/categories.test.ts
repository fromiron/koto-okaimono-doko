import { describe, expect, it } from 'vitest';

import { parseOfficialCategory } from './categories';

describe('parseOfficialCategory', () => {
  it('keeps stable ids for official category labels', () => {
    expect(parseOfficialCategory('《買う》菓子・パン')).toEqual({
      majorId: 'shopping',
      majorLabel: '買う',
      minorId: 'sweets_bread',
      minorLabel: '菓子・パン',
    });
  });

  it('handles a major category without a minor label', () => {
    expect(parseOfficialCategory('《暮らし・住まい》')).toEqual({
      majorId: 'life_home',
      majorLabel: '暮らし・住まい',
      minorId: null,
      minorLabel: null,
    });
  });
});
