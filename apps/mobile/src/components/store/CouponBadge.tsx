import type { CouponType } from '@koto/schema';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';

/** Coupon badge keeps the A/B text as the non-color state cue. */
export function CouponBadge({ couponType }: { couponType: CouponType }) {
  const { t } = useTranslation();
  const isAb = couponType === 'ab';

  return (
    <View
      className={`rounded-thumb px-3 py-1 ${isAb ? 'bg-primary-strong' : 'bg-coupon-b'}`}
    >
      <Text tone={isAb ? 'inverse' : 'default'} variant="label">
        {isAb ? t('filters.ab') : t('filters.bOnly')}
      </Text>
    </View>
  );
}
