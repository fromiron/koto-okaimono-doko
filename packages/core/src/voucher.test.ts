import { describe, expect, it } from 'vitest';
import type { VoucherIntent } from '@koto/schema';

import {
  getVoucherCompatibility,
  getVoucherSeasonStatus,
  matchesVoucherIntent,
} from './voucher';

const media = ['any', 'paper', 'digital'] as const;
const vouchers = ['any', 'A', 'B'] as const;
const storeTypes = ['ab', 'b_only'] as const;
const mediaFlags = [
  { acceptsPaper: true, acceptsDigital: false },
  { acceptsPaper: false, acceptsDigital: true },
  { acceptsPaper: true, acceptsDigital: true },
  { acceptsPaper: false, acceptsDigital: false },
];
const activeDate = new Date('2026-10-15T00:00:00Z');
const datasetId = 'koto-premium-coupon-2026';

describe('voucher intent matching', () => {
  for (const medium of media) {
    for (const voucher of vouchers) {
      for (const couponType of storeTypes) {
        it(`${medium} ${voucher} matches ${couponType} only with the requested media`, () => {
          for (const flags of mediaFlags) {
            const store = { couponType, ...flags };
            const intent: VoucherIntent = { medium, voucher };
            const expected =
              (voucher !== 'A' || couponType === 'ab') &&
              (medium === 'any' ||
                (medium === 'paper'
                  ? flags.acceptsPaper
                  : flags.acceptsDigital));
            expect(matchesVoucherIntent(store, intent)).toBe(expected);
            expect(
              getVoucherCompatibility(store, intent, datasetId, activeDate),
            ).toBe(
              !flags.acceptsPaper && !flags.acceptsDigital
                ? 'unknown'
                : expected
                  ? 'compatible'
                  : 'incompatible',
            );
          }
        });
      }
    }
  }
});

describe('verified 2026 season', () => {
  it.each([
    ['2026-06-30T14:59:59.999Z', 'upcoming'],
    ['2026-06-30T15:00:00.000Z', 'active'],
    ['2026-12-31T14:59:59.999Z', 'active'],
    ['2026-12-31T15:00:00.000Z', 'expired'],
    ['2027-07-01T00:00:00.000Z', 'expired'],
  ] as const)('uses the Japan date at %s', (timestamp, expected) => {
    expect(getVoucherSeasonStatus(datasetId, new Date(timestamp))).toBe(
      expected,
    );
  });

  it.each([undefined, null, 'koto-premium-coupon-2027'])(
    'does not infer a season for %s',
    (id) => {
      expect(getVoucherSeasonStatus(id, activeDate)).toBe('unknown');
    },
  );

  it('does not claim current compatibility outside a verified season', () => {
    const store = {
      couponType: 'ab' as const,
      acceptsPaper: true,
      acceptsDigital: true,
    };
    const intent = { medium: 'paper', voucher: 'A' } as const;
    expect(
      getVoucherCompatibility(store, intent, datasetId, new Date('2027-01-01')),
    ).toBe('expired');
    expect(getVoucherCompatibility(store, intent, undefined, activeDate)).toBe(
      'unknown',
    );
    expect(getVoucherSeasonStatus(datasetId, new Date('invalid'))).toBe(
      'unknown',
    );
  });
});
