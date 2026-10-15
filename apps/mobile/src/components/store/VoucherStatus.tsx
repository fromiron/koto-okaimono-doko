import { getVoucherCompatibility, type VoucherStore } from '@koto/core';
import type { VoucherIntent } from '@koto/schema';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { useVoucherIntentStore } from '@/src/features/preferences/voucherIntentStore';

export function VoucherStatus({
  store,
  datasetId,
  intent,
}: {
  store: VoucherStore;
  datasetId: string | null | undefined;
  intent?: VoucherIntent;
}) {
  const { t } = useTranslation();
  const savedIntent = useVoucherIntentStore((state) => state.intent);
  const selectedIntent = intent ?? savedIntent;
  const now = useVoucherIntentStore((state) => state.now);

  const status = getVoucherCompatibility(store, selectedIntent, datasetId, now);
  let label: string;
  if (status === 'compatible') {
    const medium =
      selectedIntent.medium === 'any'
        ? [
            store.acceptsPaper ? t('voucher.paper') : null,
            store.acceptsDigital ? t('voucher.digital') : null,
          ]
            .filter(Boolean)
            .join(' / ')
        : t(`voucher.${selectedIntent.medium}`);
    const voucher =
      selectedIntent.voucher === 'any'
        ? t(store.couponType === 'ab' ? 'voucher.AB' : 'voucher.B')
        : t(`voucher.${selectedIntent.voucher}`);
    label = t('voucher.compatible', { medium, voucher });
  } else {
    label = t(
      status === 'expired'
        ? 'voucher.seasonExpired'
        : status === 'upcoming'
          ? 'voucher.seasonUpcoming'
          : status === 'unknown'
            ? 'voucher.unknown'
            : 'voucher.incompatible',
    );
  }

  return (
    <Text
      accessibilityLiveRegion="polite"
      tone={status === 'compatible' ? 'accent' : 'muted'}
      variant="caption"
    >
      {label}
    </Text>
  );
}
