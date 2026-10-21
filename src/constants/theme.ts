import { Platform } from 'react-native';

export const Colors = {
  // Brand AI colors (Vibrant Electric Violet & Cyber Magenta)
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryDeep: '#6D28D9',
  primaryLight: 'rgba(139, 92, 246, 0.15)',
  primaryMuted: 'rgba(139, 92, 246, 0.35)',
  primaryGradientStart: '#6366F1',
  primaryGradientEnd: '#A855F7',
  primaryGlow: 'rgba(139, 92, 246, 0.4)',
  
  // Surfaces & Backgrounds (Premium Dark Obsidian)
  background: '#090A0F',
  backgroundElevated: '#11141E',
  backgroundElement: '#161A28',
  backgroundSelected: '#21273C',
  card: '#131622',
  cardElevated: '#191E2F',
  cardSubtle: '#0E1119',
  border: '#23293D',
  borderLight: '#1B2030',
  borderSubtle: '#171B29',
  borderActive: '#8B5CF6',

  // Typography (Ultra-crisp dark theme contrast)
  text: '#F8FAFC', // Pure bright white
  textSecondary: '#94A3B8', // Sleek cool gray
  textMuted: '#64748B', // Muted slate
  textInverse: '#090A0F',

  // Status & Accents (Cyber Neon)
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.15)',

  // Creative Accents
  accentPurple: '#A855F7',
  accentPink: '#EC4899',
  accentCyan: '#06B6D4',
  accentAmber: '#F59E0B',

  // Compatibility
  light: {
    text: '#F8FAFC',
    background: '#090A0F',
    backgroundElement: '#161A28',
    backgroundSelected: '#21273C',
    textSecondary: '#94A3B8',
  },
  dark: {
    text: '#F8FAFC',
    background: '#090A0F',
    backgroundElement: '#161A28',
    backgroundSelected: '#21273C',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = 'text' | 'background' | 'backgroundElement' | 'backgroundSelected' | 'textSecondary';

export const Shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  hover: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 7,
  },
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  // Template compat
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const BottomTabHeight = Platform.select({ ios: 88, android: 72 }) ?? 76;
export const MaxContentWidth = 720;
