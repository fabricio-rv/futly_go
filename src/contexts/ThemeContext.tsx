import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme } from 'react-native';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'futly_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setColorScheme(theme);
  }, [isLoaded, setColorScheme, theme]);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      } else {
        // Default to system color scheme
        const defaultTheme = (systemColorScheme as Theme) || 'dark';
        setThemeState(defaultTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
      setThemeState('dark');
    } finally {
      setIsLoaded(true);
    }
  }

  async function setTheme(newTheme: Theme) {
    try {
      setThemeState(newTheme);
      setColorScheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }

  if (!isLoaded) {
    return null; // or a splash screen
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function useAppColorScheme(): 'light' | 'dark' {
  const { theme } = useTheme();
  return theme;
}

export function useThemedStyle(lightClass: string, darkClass: string): string {
  const theme = useAppColorScheme();
  return theme === 'light' ? lightClass : darkClass;
}
