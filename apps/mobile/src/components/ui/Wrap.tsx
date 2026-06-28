import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { space, type SpaceToken } from '@/src/theme/tokens';

type WrapProps = ViewProps & {
  children: ReactNode;
  gap?: SpaceToken;
  className?: string;
};

/** Wrapping row for chip clusters and tag groups. */
export function Wrap({ children, className = '', gap = 'sm', style, ...props }: WrapProps) {
  return (
    <View className={`flex-row flex-wrap ${className}`} style={[{ gap: space[gap] }, style]} {...props}>
      {children}
    </View>
  );
}
