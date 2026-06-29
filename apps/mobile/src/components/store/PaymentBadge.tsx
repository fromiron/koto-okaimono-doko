import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

/** Neutral outline chip for the payment medium (紙 / デジタル) — no coupon hue. */
export function PaymentBadge({ label }: { label: string }) {
  return (
    <View className="rounded-thumb border border-line px-3 py-1">
      <Text variant="label">{label}</Text>
    </View>
  );
}
