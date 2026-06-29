import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, iconSizes } from '@/src/theme/tokens';

import { IconButton } from './IconButton';
import { Text } from './Text';

type ScreenHeaderProps = {
  title: string;
  /** Optional trailing action; a balancing spacer is rendered when omitted. */
  right?: ReactNode;
};

/**
 * The shared sub-page header: a flat back button, a centered title, and an
 * optional trailing action. One header treatment across detail screens keeps
 * navigation predictable instead of each screen inventing its own chrome.
 */
export function ScreenHeader({ right, title }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="mb-6 min-h-12 flex-row items-center justify-between gap-3">
      <IconButton shadow={false} onPress={() => router.back()}>
        <ChevronLeft color={colors.ink} size={iconSizes.lg} />
      </IconButton>
      <Text className="min-w-0 flex-1 text-center" numberOfLines={1} variant="title">
        {title}
      </Text>
      {right ?? <View className="h-12 w-12" />}
    </View>
  );
}
