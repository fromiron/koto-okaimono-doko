import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { floatingButtonShadow } from '@/src/theme/tokens';

import { PressableScale } from './PressableScale';

type IconButtonProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  selected?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  shadow?: boolean;
};

export function IconButton({
  children,
  className = '',
  disabled,
  selected,
  shadow = true,
  style,
  ...props
}: IconButtonProps) {
  return (
    <PressableScale
      className={`h-12 w-12 items-center justify-center rounded-full border ${
        selected ? 'border-primary bg-primary' : 'border-line bg-surface active:bg-neutral-soft'
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      pressedScale={0.96}
      style={[shadow ? floatingButtonShadow : null, style]}
      {...props}
    >
      {children}
    </PressableScale>
  );
}
