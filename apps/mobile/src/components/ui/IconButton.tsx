import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { floatingButtonShadow } from '@/src/theme/tokens';

import { PressableScale } from './PressableScale';

type IconButtonProps = Omit<PressableProps, 'style' | 'accessibilityLabel'> & {
  children: ReactNode;
  accessibilityLabel: string;
  selected?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  shadow?: boolean;
};

export function IconButton({
  accessibilityLabel,
  children,
  className = '',
  disabled,
  selected,
  shadow = false,
  style,
  ...props
}: IconButtonProps) {
  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{
        disabled: !!disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      className={`h-12 w-12 items-center justify-center rounded-full border ${
        selected
          ? 'border-primary-strong bg-primary-strong'
          : 'border-control-line bg-surface active:bg-neutral-soft'
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
