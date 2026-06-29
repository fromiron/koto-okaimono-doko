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
  line: '#E7DECE',
  surface: '#FFFFFF',
  page: '#FAF4E8',
  neutralSoft: '#F2ECDE',
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

/**
 * Typography scale — the single source of truth for text size, line-height and
 * weight. The `Text` component maps each variant straight to these values so
 * every heading shares one rhythm instead of ad-hoc per-screen sizes.
 *
 * display  hero wordmark (About)            30 / 36 · 700
 * title    screen titles (設定 etc.)         24 / 30 · 700
 * subtitle section + card + store names     18 / 24 · 700
 * body     default reading text             16 / 24 · 400
 * label    buttons · chips · badges         14 / 20 · 700
 * caption  notes · timestamps               12 / 16 · 400
 * micro    map marker glyphs                12 / 14 · 700
 */
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  micro: { fontSize: 12, lineHeight: 14, fontWeight: '700' },
} as const;
export type TypographyToken = keyof typeof typography;

// Shadows use a neutral slate tone (never a colored glow) and stay tight so cards
// read as quietly lifted, not as AI-style halos.
export const surfaceShadow: ViewStyle = {
  elevation: 3,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 4,
};

export const floatingButtonShadow: ViewStyle = {
  elevation: 4,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
};

export const bottomSheetShadow: ViewStyle = {
  elevation: 12,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
};
