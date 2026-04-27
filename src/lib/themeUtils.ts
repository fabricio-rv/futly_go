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
  screenBg: 'bg-[#F4F6F9]',
  cardBg: 'bg-[#FAFBFC]',
  cardBorder: 'border-[rgba(0,0,0,0.08)]',
  text: 'text-[#111827]',
  textSecondary: 'text-[#4B5563]',
  textTertiary: 'text-[#6B7280]',
};

export const darkModeClasses = {
  screenBg: 'bg-ink-0',
  cardBg: 'bg-[#0C111E]',
  cardBorder: 'border-line2',
  text: 'text-white',
  textSecondary: 'text-fg3',
  textTertiary: 'text-fg4',
};
