import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

type SurfaceCardProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({
  children,
  className = '',
  style,
  ...props
}: SurfaceCardProps) {
  return (
    <View
      className={`rounded-card border border-line bg-surface ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
