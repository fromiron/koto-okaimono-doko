import type { ReactNode } from 'react';
import { View } from 'react-native';

import { space, type SpaceToken } from '@/src/theme/tokens';

import { Text } from './Text';

type SectionProps = {
  children: ReactNode;
  title?: string;
  gap?: SpaceToken;
  className?: string;
};

/** A titled content block: section label + token-spaced content. */
export function Section({ children, className = '', gap = 'md', title }: SectionProps) {
  return (
    <View className={className}>
      {title ? (
        <Text className="mb-3" variant="subtitle">
          {title}
        </Text>
      ) : null}
      <View style={{ gap: space[gap] }}>{children}</View>
    </View>
  );
}
