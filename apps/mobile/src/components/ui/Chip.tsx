import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { surfaceShadow } from '@/src/theme/tokens';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ChipProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  selected?: boolean;
  leftIcon?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'primary' | 'orange' | 'purple' | 'neutral';
};

// Unselected chips are crisp white pills with a warm hairline and tone-tinted
// text (a quiet hint of the category colour); selecting fills the pill with the
// tone and lifts it, so the active filter is unmistakable on the cream header.
const toneClass = {
  primary: { selected: 'border-primary bg-primary', text: 'text-primary' },
  orange: { selected: 'border-coupon-b bg-coupon-b', text: 'text-coupon-b' },
  purple: { selected: 'border-purple bg-purple', text: 'text-purple' },
  neutral: { selected: 'border-ink bg-ink', text: 'text-ink' },
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
      className={`min-h-11 flex-row items-center gap-2 rounded-full border px-4 ${
        selected ? classes.selected : 'border-line bg-surface active:bg-neutral-soft'
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      pressedScale={0.96}
      style={[selected && !disabled ? surfaceShadow : null, style]}
      {...props}
    >
      {leftIcon ? <View>{leftIcon}</View> : null}
      <Text className={selected ? '' : classes.text} variant="label" tone={selected ? 'inverse' : 'default'}>
        {children}
      </Text>
    </PressableScale>
  );
}
