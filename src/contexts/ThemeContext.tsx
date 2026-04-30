import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'futly_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    // Forca dark imediatamente para evitar qualquer flicker para light.
    setColorScheme('dark');
    void AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
  }, [setColorScheme]);

  async function setTheme(newTheme: Theme) {
    try {
      // API mantida por compatibilidade; tema permanece fixo em dark neste release.
      void newTheme;
      setColorScheme('dark');
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
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
