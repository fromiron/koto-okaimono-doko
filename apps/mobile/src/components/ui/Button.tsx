import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PressableProps & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  className?: string;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-primary bg-surface',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
  teal: 'border border-teal bg-surface',
};

const textTone: Record<ButtonVariant, 'default' | 'inverse' | 'danger' | 'teal'> = {
  primary: 'inverse',
  secondary: 'default',
  ghost: 'default',
  danger: 'inverse',
  teal: 'teal',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3',
  md: 'min-h-11 px-4',
  lg: 'min-h-14 px-5',
};

export function Button({
  children,
  className = '',
  disabled,
  leftIcon,
  loading = false,
  size = 'md',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`flex-row items-center justify-center gap-2 rounded-full ${sizeClass[size]} ${variantClass[variant]} ${isDisabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary : variant === 'teal' ? colors.teal : '#ffffff'}
        />
      ) : null}
      {!loading && leftIcon ? <View>{leftIcon}</View> : null}
      <Text variant="label" tone={textTone[variant]}>
        {children}
      </Text>
    </Pressable>
  );
}
