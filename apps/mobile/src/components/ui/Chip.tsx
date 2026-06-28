import type { ReactNode } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';

import { Text } from './Text';

type ChipProps = PressableProps & {
  children: ReactNode;
  selected?: boolean;
  leftIcon?: ReactNode;
  className?: string;
};

export function Chip({ children, className = '', disabled, leftIcon, selected, ...props }: ChipProps) {
  return (
    <Pressable
      className={`min-h-10 flex-row items-center gap-2 rounded-full border px-4 ${
        selected ? 'border-water-700 bg-water-700' : 'border-line-200 bg-paper-50'
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon ? <View>{leftIcon}</View> : null}
      <Text variant="label" tone={selected ? 'inverse' : 'default'}>
        {children}
      </Text>
    </Pressable>
  );
}
