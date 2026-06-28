import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

import { Text } from './Text';

export function LoadingState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-page px-8">
      <ActivityIndicator color={colors.primary} />
      <Text tone="muted">{message}</Text>
    </View>
  );
}
