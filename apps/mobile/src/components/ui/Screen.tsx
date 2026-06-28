import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, 16);

  if (!scroll) {
    return (
      <View className="flex-1 bg-paper-100 px-5" style={{ paddingTop }}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-paper-100"
      contentContainerStyle={{ paddingTop, paddingBottom: 40, paddingHorizontal: 20 }}
    >
      {children}
    </ScrollView>
  );
}
