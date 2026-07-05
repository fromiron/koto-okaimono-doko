import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { primaryButtonShadow, surfaceShadow } from '@/src/theme/tokens';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ActionTileProps = Omit<PressableProps, 'style'> & {
  icon: ReactNode;
  label: string;
  variant?: 'primary' | 'surface';
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A square-ish icon + label tap target. Store detail uses a row of these for its
 * primary actions (route / call / official) instead of stacked pill buttons — it
 * reads as a compact toolbar and keeps the long store name uncrowded.
 */
export function ActionTile({
  className = '',
  icon,
  label,
  style,
  variant = 'surface',
  ...props
}: ActionTileProps) {
  const filled = variant === 'primary';

  return (
    <PressableScale
      className={`min-h-20 flex-1 items-center justify-center gap-2 rounded-card px-2 py-3 ${
        filled ? 'bg-primary active:opacity-90' : 'border border-line bg-surface active:bg-neutral-soft'
      } ${className}`}
      pressedScale={0.95}
      style={[filled ? primaryButtonShadow : surfaceShadow, style]}
      {...props}
    >
      {icon}
      <Text tone={filled ? 'inverse' : 'default'} variant="label">
        {label}
      </Text>
    </PressableScale>
  );
}
