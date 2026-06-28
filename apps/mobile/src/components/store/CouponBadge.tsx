import type { CouponType } from '@koto/schema';
import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

export function CouponBadge({ couponType }: { couponType: CouponType }) {
  const isAb = couponType === 'ab';

  return (
    <View
      className={`rounded-full border px-3 py-1 ${isAb ? 'border-coupon-ab' : 'border-coupon-b'}`}
    >
      <Text className={isAb ? 'text-water-700' : 'text-coupon-b'} variant="label">
        {isAb ? 'A・B券' : 'B券のみ'}
      </Text>
    </View>
  );
}
