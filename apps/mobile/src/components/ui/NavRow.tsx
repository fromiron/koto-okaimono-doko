import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import type { AccessibilityRole } from 'react-native';

import { colors } from '@/src/theme/tokens';

import { Text } from './Text';

type NavRowProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  labelVariant?: 'body' | 'subtitle';
  divider?: boolean;
  role?: AccessibilityRole;
};

/**
 * Icon badge + label + chevron tap target shared by the Settings app-info list
 * and the About link cards.
 */
export function NavRow({
  divider = true,
  icon,
  label,
  labelVariant = 'body',
  onPress,
  role = 'button',
}: NavRowProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole={role}
      className={`min-h-14 flex-row items-center gap-3 py-3 active:bg-neutral-soft ${divider ? 'border-b border-line' : ''}`}
      onPress={onPress}
    >
      <View className="w-8 items-center">{icon}</View>
      <Text className="min-w-0 flex-1" variant={labelVariant}>
        {label}
      </Text>
      <ChevronRight color={colors.muted} size={22} />
    </Pressable>
  );
}
