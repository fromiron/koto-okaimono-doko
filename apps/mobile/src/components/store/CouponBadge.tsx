import type { CouponType } from '@koto/schema';
import { View } from 'react-native';

import { Text } from '../ui/Text';

export function CouponBadge({ couponType }: { couponType: CouponType }) {
  const isAb = couponType === 'ab';
  return (
    <View className={`rounded-full px-3 py-1 ${isAb ? 'bg-coupon-ab' : 'bg-coupon-b'}`}>
      <Text variant="caption" tone="inverse">
        {isAb ? 'A・B' : 'B'}
      </Text>
    </View>
  );
}
