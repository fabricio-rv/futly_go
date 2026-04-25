import { useAppColorScheme } from '@/src/contexts/ThemeContext';

/**
 * Applies conditional classes based on theme
 * Usage: cn(lightClasses, darkClasses)
 * The returned string can be used directly in className
 */
export function useThemedClasses(lightClasses: string, darkClasses: string): string {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'light' ? lightClasses : darkClasses;
}

/**
 * Helper to create themed class objects for different components
 */
export const lightModeClasses = {
  screenBg: 'bg-white',
  cardBg: 'bg-gray-50',
  cardBorder: 'border-gray-200',
  text: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textTertiary: 'text-gray-500',
};

export const darkModeClasses = {
  screenBg: 'bg-ink-0',
  cardBg: 'bg-[#0C111E]',
  cardBorder: 'border-line2',
  text: 'text-white',
  textSecondary: 'text-fg3',
  textTertiary: 'text-fg4',
};
