import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { surfaceShadow } from '@/src/theme/tokens';

type SurfaceCardProps = ViewProps & {
  children: ReactNode;
  className?: string;
  shadow?: boolean;
};

export function SurfaceCard({
  children,
  className = '',
  shadow = true,
  style,
  ...props
}: SurfaceCardProps) {
  return (
    <View
      className={`rounded-[18px] border border-line-200 bg-paper-50 ${className}`}
      style={[shadow ? surfaceShadow : null, style]}
      {...props}
    >
      {children}
    </View>
  );
}
