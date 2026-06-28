import type { CouponType } from '@koto/schema';
import { Ticket } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

export function CouponBadge({ couponType }: { couponType: CouponType }) {
  const isAb = couponType === 'ab';
  const color = isAb ? colors.primary : colors.couponB;

  return (
    <View
      className={`flex-row items-center gap-1 rounded-full border bg-paper-50 px-3 py-1 ${
        isAb ? 'border-coupon-ab' : 'border-coupon-b'
      }`}
    >
      <Ticket color={color} size={14} />
      <Text className={isAb ? 'text-water-700' : 'text-coupon-b'} variant="label">
        {isAb ? 'A・B券' : 'B券のみ'}
      </Text>
    </View>
  );
}
