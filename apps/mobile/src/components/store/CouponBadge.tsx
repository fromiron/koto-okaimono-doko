import type { CouponType } from '@koto/schema';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';

export function CouponBadge({ couponType }: { couponType: CouponType }) {
  const { t } = useTranslation();
  const isAb = couponType === 'ab';

  return (
    <View
      className={`rounded-full border px-3 py-1 ${isAb ? 'border-primary' : 'border-coupon-b'}`}
    >
      <Text className={isAb ? 'text-primary' : 'text-coupon-b'} variant="label">
        {isAb ? t('filters.ab') : t('filters.bOnly')}
      </Text>
    </View>
  );
}
