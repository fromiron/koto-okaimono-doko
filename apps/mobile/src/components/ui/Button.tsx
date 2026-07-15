import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import type { PressableProps } from 'react-native';

import { colors } from '@/src/theme/tokens';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary-strong active:opacity-90',
  secondary: 'border border-control-line bg-surface active:bg-primary-soft',
  ghost: 'bg-transparent active:bg-neutral-soft',
  danger: 'bg-danger active:opacity-90',
};

const textTone: Record<
  ButtonVariant,
  'default' | 'inverse' | 'danger' | 'accent'
> = {
  primary: 'inverse',
  secondary: 'accent',
  ghost: 'default',
  danger: 'inverse',
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
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      className={`flex-row items-center justify-center gap-2 rounded-card ${sizeClass[size]} ${variantClass[variant]} ${isDisabled ? 'opacity-45' : 'opacity-100'} ${className}`}
      disabled={isDisabled}
      pressedScale={0.96}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary' || variant === 'ghost'
              ? colors.primary
              : '#ffffff'
          }
        />
      ) : null}
      {!loading && leftIcon ? <View>{leftIcon}</View> : null}
      <Text variant="label" tone={textTone[variant]}>
        {children}
      </Text>
    </PressableScale>
  );
}
