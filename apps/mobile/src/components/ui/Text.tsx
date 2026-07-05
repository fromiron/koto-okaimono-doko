import type { ReactNode } from 'react';
import { Text as NativeText, type TextProps as NativeTextProps, type TextStyle } from 'react-native';

import { typography, type TypographyToken } from '@/src/theme/tokens';

type TextVariant = TypographyToken;
type TextTone = 'default' | 'muted' | 'danger' | 'inverse';

type TextProps = NativeTextProps & {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
  tabularNums?: boolean;
};

const variantStyle: Record<TextVariant, TextStyle> = {
  display: typography.display,
  title: typography.title,
  subtitle: typography.subtitle,
  body: typography.body,
  label: typography.label,
  caption: typography.caption,
  micro: typography.micro,
};

const toneClass: Record<TextTone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  danger: 'text-danger',
  inverse: 'text-white',
};

export function Text({
  children,
  className = '',
  style,
  tabularNums,
  tone = 'default',
  variant = 'body',
  ...props
}: TextProps) {
  return (
    <NativeText
      className={`${toneClass[tone]} ${className}`}
      style={[
        variantStyle[variant],
        tabularNums ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
      {...props}
    >
      {children}
    </NativeText>
  );
}
