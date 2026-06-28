import type { ReactNode } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';

import { Text } from './Text';

type ChipProps = PressableProps & {
  children: ReactNode;
  selected?: boolean;
  leftIcon?: ReactNode;
  className?: string;
  tone?: 'primary' | 'orange' | 'teal' | 'purple';
};

const toneClass = {
  primary: {
    selected: 'border-water-700 bg-water-700',
    unselected: 'border-water-700 bg-paper-50',
    text: 'text-water-700',
  },
  orange: {
    selected: 'border-coupon-b bg-coupon-b',
    unselected: 'border-coupon-b bg-paper-50',
    text: 'text-coupon-b',
  },
  teal: {
    selected: 'border-water-500 bg-water-500',
    unselected: 'border-water-500 bg-paper-50',
    text: 'text-water-500',
  },
  purple: {
    selected: 'border-violet-700 bg-violet-700',
    unselected: 'border-violet-700 bg-paper-50',
    text: 'text-violet-700',
  },
};

export function Chip({
  children,
  className = '',
  disabled,
  leftIcon,
  selected,
  tone = 'primary',
  ...props
}: ChipProps) {
  const classes = toneClass[tone];

  return (
    <Pressable
      className={`min-h-10 flex-row items-center gap-2 rounded-full border px-4 ${
        selected ? classes.selected : classes.unselected
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon ? <View>{leftIcon}</View> : null}
      <Text className={selected ? '' : classes.text} variant="label" tone={selected ? 'inverse' : 'default'}>
        {children}
      </Text>
    </Pressable>
  );
}
