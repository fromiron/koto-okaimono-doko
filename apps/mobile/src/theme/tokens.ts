import type { ViewStyle } from 'react-native';

export const colors = {
  primary: '#0D47A1',
  primarySoft: '#EAF3FF',
  couponB: '#F5A623',
  teal: '#2DBE7F',
  ink: '#333333',
  inkMuted: '#6B7280',
  line: '#E5E7EB',
  surface: '#FFFFFF',
  page: '#F4FAFF',
  danger: '#B91C1C',
  facility: '#5F6368',
  overlay: 'rgba(17, 24, 39, 0.38)',
} as const;

export const radii = {
  pill: 999,
  card: 18,
  sheet: 28,
  input: 28,
  iconButton: 999,
  marker: 24,
} as const;

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
