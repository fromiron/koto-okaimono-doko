import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

/** First visible grapheme of the store name, used as a monogram. */
function monogram(name: string): string {
  return Array.from(name.trim())[0] ?? '店';
}

type StoreAvatarProps = {
  name: string;
  size?: number;
};

/**
 * A brand-tinted monogram badge. Replaces the previous single shared
 * illustration so every store reads as a distinct place rather than generic
 * stock art, with no bundled imagery.
 */
export function StoreAvatar({ name, size = 88 }: StoreAvatarProps) {
  return (
    <View
      className="items-center justify-center rounded-full border border-line bg-primary-soft"
      style={{ height: size, width: size }}
    >
      <Text style={{ fontSize: Math.round(size * 0.42), lineHeight: Math.round(size * 0.5) }} tone="default" variant="title" className="text-primary">
        {monogram(name)}
      </Text>
    </View>
  );
}
