import type { ReactNode } from 'react';
import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';
type TextTone = 'default' | 'muted' | 'danger' | 'inverse' | 'teal';

type TextProps = NativeTextProps & {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

const variantClass: Record<TextVariant, string> = {
  title: 'text-3xl font-bold leading-tight',
  subtitle: 'text-xl font-bold leading-snug',
  body: 'text-base leading-relaxed',
  caption: 'text-xs leading-normal',
  label: 'text-sm font-bold leading-tight',
};

const toneClass: Record<TextTone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  danger: 'text-danger',
  inverse: 'text-white',
  teal: 'text-teal',
};

export function Text({
  children,
  className = '',
  tone = 'default',
  variant = 'body',
  ...props
}: TextProps) {
  return (
    <NativeText className={`${variantClass[variant]} ${toneClass[tone]} ${className}`} {...props}>
      {children}
    </NativeText>
  );
}
