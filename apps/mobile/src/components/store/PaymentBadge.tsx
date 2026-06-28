import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

export function PaymentBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-water-500 px-3 py-1">
      <Text className="text-water-500" variant="label">
        {label}
      </Text>
    </View>
  );
}
