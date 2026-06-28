import { View } from 'react-native';

import { Text } from '../ui/Text';

export function PaymentBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-paper-100 px-3 py-1">
      <Text variant="caption">{label}</Text>
    </View>
  );
}
