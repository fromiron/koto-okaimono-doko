import { Heart, ShoppingBag } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

type BrandMarkProps = {
  compact?: boolean;
  centered?: boolean;
};

export function BrandMark({ centered = false, compact = false }: BrandMarkProps) {
  return (
    <View className={`flex-row items-center gap-2 ${centered ? 'justify-center' : ''}`}>
      <View className="relative h-12 w-12 items-center justify-center">
        <ShoppingBag color={colors.teal} size={42} strokeWidth={2.6} />
        <Heart color={colors.teal} fill={colors.teal} size={13} style={{ position: 'absolute', top: 24 }} />
      </View>
      {!compact ? (
        <View className="min-w-0">
          <Text className="text-water-700" variant="label">
            こうとうお買い物どこ
          </Text>
          <Text className="text-water-500" variant="caption">
            koto okaimono doko
          </Text>
        </View>
      ) : null}
    </View>
  );
}
