import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { colors } from '@/src/theme/tokens';

import { IconBadge } from './IconBadge';
import { PressableScale } from './PressableScale';
import { SurfaceCard } from './SurfaceCard';
import { Text } from './Text';

type NavRowProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  iconTone?: 'primary' | 'teal' | 'coupon' | 'neutral';
  labelVariant?: 'body' | 'subtitle';
  /** Render the row inside its own elevated card instead of a divided list row. */
  surface?: boolean;
  divider?: boolean;
};

/**
 * Icon badge + label + chevron tap target shared by the Settings app-info list
 * and the About link cards.
 */
export function NavRow({
  divider = true,
  icon,
  iconTone = 'primary',
  label,
  labelVariant = 'body',
  onPress,
  surface = false,
}: NavRowProps) {
  const content = (
    <>
      <IconBadge tone={iconTone}>{icon}</IconBadge>
      <Text className="min-w-0 flex-1" variant={labelVariant}>
        {label}
      </Text>
      <ChevronRight color={colors.muted} size={28} />
    </>
  );

  if (surface) {
    return (
      <PressableScale onPress={onPress} pressedScale={0.96}>
        <SurfaceCard className="flex-row items-center gap-4 px-4 py-4">{content}</SurfaceCard>
      </PressableScale>
    );
  }

  return (
    <Pressable
      className={`flex-row items-center gap-4 py-5 active:bg-neutral-soft ${divider ? 'border-b border-line' : ''}`}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
