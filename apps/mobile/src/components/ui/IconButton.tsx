import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

type IconButtonProps = PressableProps & {
  children: ReactNode;
  selected?: boolean;
  className?: string;
};

export function IconButton({ children, className = '', disabled, selected, ...props }: IconButtonProps) {
  return (
    <Pressable
      className={`h-12 w-12 items-center justify-center rounded-full border ${
        selected ? 'border-water-700 bg-water-700' : 'border-line-200 bg-paper-50'
      } ${disabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
}
