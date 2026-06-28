import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from './Text';

type InfoRowProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  divider?: boolean;
};

export function InfoRow({ divider = true, icon, label, value }: InfoRowProps) {
  return (
    <View className={`flex-row gap-4 py-4 ${divider ? 'border-b border-line' : ''}`}>
      {icon ? <View className="pt-1">{icon}</View> : null}
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="label">{label}</Text>
        <Text className="min-w-0" tone="muted">
          {value}
        </Text>
      </View>
    </View>
  );
}
