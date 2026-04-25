import { useMemo } from 'react';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export function useThemedStyle<T extends Record<string, any>>(
  lightStyles: T,
  darkStyles: T
): T {
  const theme = useAppColorScheme();
  return useMemo(() => (theme === 'light' ? lightStyles : darkStyles), [theme, lightStyles, darkStyles]);
}

export const commonStyles = {
  light: {
    screenBg: '#FFFFFF',
    cardBg: '#F8FAFB',
    cardBorder: '#E5E7EB',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    borderDivider: '#F3F4F6',
  },
  dark: {
    screenBg: '#05070B',
    cardBg: '#0C111E',
    cardBorder: 'rgba(255,255,255,0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.70)',
    textTertiary: 'rgba(255,255,255,0.45)',
    borderDivider: 'rgba(255,255,255,0.06)',
  },
};
