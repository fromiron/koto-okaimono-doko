import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { floatingButtonShadow } from '@/src/theme/tokens';

type IconButtonProps = PressableProps & {
  children: ReactNode;
  selected?: boolean;
  className?: string;
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
  const mergedStyle =
    typeof style === 'function'
      ? (state: Parameters<NonNullable<typeof style>>[0]) => [
          shadow ? floatingButtonShadow : null,
          style(state),
        ]
      : [shadow ? floatingButtonShadow : null, style];

  return (
    <Pressable
      className={`h-12 w-12 items-center justify-center rounded-full border ${
        selected ? 'border-water-700 bg-water-700' : 'border-line-200 bg-paper-50'
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      style={mergedStyle}
      {...props}
    >
      {children}
    </Pressable>
  );
}
