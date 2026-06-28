import type { ReactNode } from 'react';
import type { FlexAlignType } from 'react-native';
import { View, type ViewProps } from 'react-native';

import { space, type SpaceToken } from '@/src/theme/tokens';

type RowAlign = 'center' | 'start' | 'end' | 'stretch';

type RowProps = ViewProps & {
  children: ReactNode;
  gap?: SpaceToken;
  align?: RowAlign;
  className?: string;
};

const alignMap: Record<RowAlign, FlexAlignType> = {
  center: 'center',
  start: 'flex-start',
  end: 'flex-end',
  stretch: 'stretch',
};

/** Horizontal row. Alignment via `align`, spacing via token `gap`. */
export function Row({ align = 'center', children, className = '', gap = 'sm', style, ...props }: RowProps) {
  return (
    <View
      className={`flex-row ${className}`}
      style={[{ alignItems: alignMap[align], gap: space[gap] }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
