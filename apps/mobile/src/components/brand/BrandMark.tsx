import { Plus, ShoppingBag } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors, surfaceShadow } from '@/src/theme/tokens';

type BrandMarkProps = {
  compact?: boolean;
  centered?: boolean;
};

/**
 * The Koto Marché mark: a vermillion app-tile carrying a shopping bag with a
 * marigold plus pip (echoing the splash artwork's bag-with-plus), set beside
 * the JP wordmark. The pip is deliberately NOT a heart — a heart on the map
 * deck reads as a favourites button, and there is no favourites feature.
 */
export function BrandMark({ centered = false, compact = false }: BrandMarkProps) {
  return (
    <View className={`flex-row items-center gap-3 ${centered ? 'justify-center' : ''}`}>
      <View
        className="relative h-12 w-12 items-center justify-center rounded-card bg-primary"
        style={surfaceShadow}
      >
        <ShoppingBag color={colors.surface} size={26} strokeWidth={2.4} />
        <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full border-2 border-page bg-coupon-b">
          <Plus color={colors.surface} size={11} strokeWidth={3.4} />
        </View>
      </View>
      {!compact ? (
        <View className="min-w-0">
          <Text className="text-ink" variant="subtitle">
            こうとうお買い物どこ
          </Text>
          <Text tone="muted" variant="caption">
            KOTO OKAIMONO DOKO
          </Text>
        </View>
      ) : null}
    </View>
  );
}
