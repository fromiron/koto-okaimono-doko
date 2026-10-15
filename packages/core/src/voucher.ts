import type { Store, VoucherIntent } from '@koto/schema';

export type VoucherStore = Pick<
  Store,
  'couponType' | 'acceptsPaper' | 'acceptsDigital'
>;

export function getVoucherConditions(intent: Partial<VoucherIntent>) {
  return {
    couponType: intent.voucher === 'A' ? ('ab' as const) : null,
    medium:
      intent.medium === 'paper' || intent.medium === 'digital'
        ? intent.medium
        : null,
  };
}

/** Unspecified media remain browsable; this does not assert acceptance. */
export function matchesVoucherIntent(
  store: VoucherStore,
  intent: Partial<VoucherIntent>,
): boolean {
  const { couponType, medium } = getVoucherConditions(intent);
  return (
    (couponType === null || store.couponType === couponType) &&
    (medium === null ||
      (medium === 'paper' ? store.acceptsPaper : store.acceptsDigital))
  );
}

export function getVoucherSeasonStatus(
  datasetId: string | null | undefined,
  now = new Date(),
): 'active' | 'expired' | 'upcoming' | 'unknown' {
  // Only the verified season is valid: https://www.city.koto.lg.jp/102030/shohinken_plus.html
  if (
    datasetId !== 'koto-premium-coupon-2026' ||
    !Number.isFinite(now.getTime())
  ) {
    return 'unknown';
  }
  const japanDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  if (japanDate < '2026-07-01') return 'upcoming';
  if (japanDate > '2026-12-31') return 'expired';
  return 'active';
}

export function getVoucherCompatibility(
  store: VoucherStore,
  intent: VoucherIntent,
  datasetId: string | null | undefined,
  now = new Date(),
): 'compatible' | 'incompatible' | 'unknown' | 'expired' | 'upcoming' {
  const season = getVoucherSeasonStatus(datasetId, now);
  if (season !== 'active') return season;
  if (!store.acceptsPaper && !store.acceptsDigital) return 'unknown';
  return matchesVoucherIntent(store, intent) ? 'compatible' : 'incompatible';
}
