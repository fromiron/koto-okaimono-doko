import type { ReactNode } from 'react';
import { Check } from 'lucide-react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { colors } from '@/src/theme/tokens';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ChipProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  selected?: boolean;
  leftIcon?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'primary' | 'orange' | 'neutral';
};

// Selection uses fill plus a checkmark so it does not rely on color alone.
const toneClass = {
  primary: {
    selected: 'border-primary-strong bg-primary-strong',
    selectedTone: 'inverse' as const,
    tone: 'accent' as const,
    check: colors.surface,
  },
  orange: {
    selected: 'border-coupon-b bg-coupon-b',
    selectedTone: 'default' as const,
    tone: 'default' as const,
    check: colors.ink,
  },
  neutral: {
    selected: 'border-control-line bg-neutral-soft',
    selectedTone: 'default' as const,
    tone: 'default' as const,
    check: colors.ink,
  },
};

export function Chip({
  children,
  className = '',
  disabled,
  leftIcon,
  selected,
  style,
  tone = 'primary',
  ...props
}: ChipProps) {
  const classes = toneClass[tone];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      className={`min-h-11 flex-row items-center gap-2 rounded-full border px-4 ${
        selected
          ? classes.selected
          : 'border-control-line bg-surface active:bg-neutral-soft'
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      pressedScale={0.96}
      style={style}
      {...props}
    >
      {selected ? (
        <Check color={classes.check} size={16} strokeWidth={2.5} />
      ) : null}
      {leftIcon ? <View>{leftIcon}</View> : null}
      <Text
        variant="label"
        tone={selected ? classes.selectedTone : classes.tone}
      >
        {children}
      </Text>
    </PressableScale>
  );
}
