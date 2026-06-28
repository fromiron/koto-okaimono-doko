import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { space, type SpaceToken } from '@/src/theme/tokens';

type StackProps = ViewProps & {
  children: ReactNode;
  gap?: SpaceToken;
  className?: string;
};

/** Vertical rhythm container. Spacing comes from the token scale, never ad-hoc margins. */
export function Stack({ children, className = '', gap = 'md', style, ...props }: StackProps) {
  return (
    <View className={className} style={[{ gap: space[gap] }, style]} {...props}>
      {children}
    </View>
  );
}
