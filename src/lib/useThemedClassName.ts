import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export function useThemedClassName(lightClass: string, darkClass: string): string {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'light' ? lightClass : darkClass;
}
