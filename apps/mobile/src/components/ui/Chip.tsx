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
    selected: 'border-primary bg-primary',
    unselected: 'border-primary bg-surface',
    text: 'text-primary',
  },
  orange: {
    selected: 'border-coupon-b bg-coupon-b',
    unselected: 'border-coupon-b bg-surface',
    text: 'text-coupon-b',
  },
  teal: {
    selected: 'border-teal bg-teal',
    unselected: 'border-teal bg-surface',
    text: 'text-teal',
  },
  purple: {
    selected: 'border-purple bg-purple',
    unselected: 'border-purple bg-surface',
    text: 'text-purple',
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
      className={`min-h-11 flex-row items-center gap-2 rounded-full border px-4 ${
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
