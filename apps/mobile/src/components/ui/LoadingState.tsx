import { ActivityIndicator, View } from 'react-native';

import { Text } from './Text';

export function LoadingState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-paper-50 px-8">
      <ActivityIndicator color="#176762" />
      <Text tone="muted">{message}</Text>
    </View>
  );
}
