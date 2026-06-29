import type { CouponType } from '@koto/schema';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';

/** Filled ticket-stub badge; the coupon hue is the only color that carries state. */
export function CouponBadge({ couponType }: { couponType: CouponType }) {
  const { t } = useTranslation();
  const isAb = couponType === 'ab';

  return (
    <View className={`rounded-thumb px-3 py-1 ${isAb ? 'bg-primary' : 'bg-coupon-b'}`}>
      <Text tone="inverse" variant="label">
        {isAb ? t('filters.ab') : t('filters.bOnly')}
      </Text>
    </View>
  );
}
