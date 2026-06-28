import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, space } from '@/src/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, space.lg);

  if (!scroll) {
    return (
      <View
        className="flex-1 bg-page"
        style={{ paddingHorizontal: layout.screenGutter, paddingTop }}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      contentContainerStyle={{
        paddingBottom: space['4xl'],
        paddingHorizontal: layout.screenGutter,
        paddingTop,
      }}
    >
      {children}
    </ScrollView>
  );
}
