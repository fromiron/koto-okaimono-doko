import type { ViewStyle } from 'react-native';

/**
 * Canonical design tokens (single source of truth).
 * `src/global.css` mirrors the color + radius tokens for Tailwind/uniwind utilities;
 * `src/theme/tokenParity.test.ts` asserts the two stay in sync.
 */
export const colors = {
  primary: '#0D47A1',
  primarySoft: '#EAF3FF',
  teal: '#2DBE7F',
  tealSoft: '#ECFDF5',
  couponB: '#F5A623',
  purple: '#6D28D9',
  ink: '#333333',
  muted: '#6B7280',
  line: '#E5E7EB',
  surface: '#FFFFFF',
  page: '#F4FAFF',
  neutralSoft: '#F3F4F6',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  facility: '#5F6368',
  overlay: 'rgba(17, 24, 39, 0.38)',
} as const;

/** 4pt spacing scale. Use these everywhere; no off-grid values. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;
export type SpaceToken = keyof typeof space;

/** Semantic spacing roles consumed by layout primitives and screens. */
export const layout = {
  screenGutter: space.xl,
  cardPadding: space.lg,
  sectionGap: space['2xl'],
  stackGap: space.md,
  inlineGap: space.sm,
} as const;

export const radii = {
  thumb: 12,
  card: 16,
  sheet: 28,
  input: 28,
  pill: 999,
} as const;

/** Icon size scale. sm=inline, md=body, lg=nav/header, xl=badges. */
export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;
export type IconSizeToken = keyof typeof iconSizes;

export const surfaceShadow: ViewStyle = {
  elevation: 5,
  shadowColor: '#0D47A1',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
};

export const floatingButtonShadow: ViewStyle = {
  elevation: 7,
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.16,
  shadowRadius: 12,
};

export const bottomSheetShadow: ViewStyle = {
  elevation: 10,
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.1,
  shadowRadius: 18,
};
