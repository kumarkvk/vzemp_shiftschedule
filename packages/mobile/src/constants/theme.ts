export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  primary: '#2563EB',
  primaryMuted: '#DBEAFE',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  border: '#E2E8F0',
  tabInactive: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  h1: 30,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  micro: 12,
} as const;
