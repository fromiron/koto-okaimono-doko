import { View } from 'react-native';

import { Text } from './Text';

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center justify-center px-8 py-10">
      <Text className="text-center" tone="muted">
        {message}
      </Text>
    </View>
  );
}
