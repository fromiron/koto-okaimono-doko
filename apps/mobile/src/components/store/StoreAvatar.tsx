import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { surfaceShadow } from '@/src/theme/tokens';

/** First visible grapheme of the store name, used as a monogram. */
function monogram(name: string): string {
  return Array.from(name.trim())[0] ?? '店';
}

type StoreAvatarProps = {
  name: string;
  size?: number;
};

/**
 * A monogram badge on a white disc — every store reads as a distinct place
 * rather than generic stock art, and the white ground keeps it legible whether
 * it sits on a plain card or on the tinted place-card hero.
 */
export function StoreAvatar({ name, size = 88 }: StoreAvatarProps) {
  return (
    <View
      className="items-center justify-center rounded-full border border-line bg-surface"
      style={{ height: size, width: size, ...surfaceShadow }}
    >
      <Text style={{ fontSize: Math.round(size * 0.42), lineHeight: Math.round(size * 0.5) }} tone="default" variant="title" className="text-primary">
        {monogram(name)}
      </Text>
    </View>
  );
}
