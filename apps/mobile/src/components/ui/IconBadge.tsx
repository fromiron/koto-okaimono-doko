import type { ReactNode } from 'react';
import { View } from 'react-native';

type IconBadgeProps = {
  children: ReactNode;
  tone?: 'primary' | 'teal' | 'neutral';
  className?: string;
};

const toneClass = {
  primary: 'bg-primary-soft',
  teal: 'bg-teal-soft',
  neutral: 'bg-line',
};

export function IconBadge({ children, className = '', tone = 'primary' }: IconBadgeProps) {
  return (
    <View className={`h-14 w-14 items-center justify-center rounded-full ${toneClass[tone]} ${className}`}>
      {children}
    </View>
  );
}
