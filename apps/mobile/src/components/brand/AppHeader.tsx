import { ChevronLeft, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { IconButton } from '@/src/components/ui/IconButton';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

import { BrandMark } from './BrandMark';

type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  centeredBrand?: boolean;
};

export function AppHeader({
  centeredBrand = false,
  showBack = false,
  showSettings = false,
  title,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <View className="mb-6">
      <View className="min-h-14 flex-row items-center justify-between gap-3">
        {showBack ? (
          <IconButton onPress={() => router.back()}>
            <ChevronLeft color={colors.ink} size={26} />
          </IconButton>
        ) : centeredBrand ? (
          <View className="h-12 w-12" />
        ) : null}

        {centeredBrand ? (
          <View className="flex-1 items-center">
            <BrandMark />
          </View>
        ) : (
          <View className="min-w-0 flex-1">
            <BrandMark />
          </View>
        )}

        {showSettings ? (
          <IconButton onPress={() => router.push('/settings')}>
            <Settings color={colors.inkMuted} size={26} />
          </IconButton>
        ) : showBack || centeredBrand ? (
          <View className="h-12 w-12" />
        ) : null}
      </View>
      {title ? (
        <Text className="mt-4 text-center" variant="title">
          {title}
        </Text>
      ) : null}
    </View>
  );
}
