import { describe, expect, it } from 'vitest';

import { getStoreMarkerDescriptor } from './markerDescriptor';

describe('getStoreMarkerDescriptor', () => {
  it('labels A/B coupon stores with A・B', () => {
    expect(getStoreMarkerDescriptor([{ couponType: 'ab' }]).label).toBe('A・B');
  });

  it('labels B-only coupon stores with B', () => {
    expect(getStoreMarkerDescriptor([{ couponType: 'b_only' }]).label).toBe('B');
  });

  it('labels same-coordinate Location Groups with M', () => {
    expect(getStoreMarkerDescriptor([{ couponType: 'ab' }, { couponType: 'b_only' }])).toMatchObject({
      kind: 'facility',
      label: 'M',
    });
  });
});
