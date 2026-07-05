import type { ViewStyle } from 'react-native';

/**
 * Canonical design tokens (single source of truth).
 * `src/global.css` mirrors the color + radius tokens for Tailwind/uniwind utilities;
 * `src/theme/tokenParity.test.ts` asserts the two stay in sync.
 */
export const colors = {
  primary: '#EA5F3F',
  primarySoft: '#FDECE6',
  couponB: '#F5A31C',
  couponBSoft: '#FEF2D9',
  teal: '#3D9E83',
  tealSoft: '#E4F3ED',
  purple: '#6C4CB0',
  ink: '#33302B',
  muted: '#6E6459',
  line: '#EEE3D3',
  surface: '#FFFFFF',
  page: '#FBF6EF',
  neutralSoft: '#F4ECDF',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  facility: '#6F6862',
  overlay: 'rgba(51, 48, 43, 0.42)',
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
  sheet: 32,
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
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.4 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700', letterSpacing: 0.1 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  micro: { fontSize: 12, lineHeight: 14, fontWeight: '700', letterSpacing: 0.3 },
} as const;
export type TypographyToken = keyof typeof typography;

// Shadows use a warm-ink tone (never a colored glow) with a soft, wide blur so
// surfaces read as gently lifted off the washi paper — quiet, not AI-halo.
export const surfaceShadow: ViewStyle = {
  elevation: 3,
  shadowColor: '#241C12',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
};

export const floatingButtonShadow: ViewStyle = {
  elevation: 5,
  shadowColor: '#241C12',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.14,
  shadowRadius: 12,
};

// A soft, coloured lift for filled primary CTAs so the main action reads as the
// warmest, most tappable thing on screen.
export const primaryButtonShadow: ViewStyle = {
  elevation: 6,
  shadowColor: '#EA5F3F',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.26,
  shadowRadius: 14,
};

export const bottomSheetShadow: ViewStyle = {
  elevation: 14,
  shadowColor: '#241C12',
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.12,
  shadowRadius: 22,
};
