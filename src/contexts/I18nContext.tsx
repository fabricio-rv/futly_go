import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { I18N_CONFIG, isSupportedLanguage, type Locale } from '@/src/i18n';

type I18nContextType = {
  language: Locale;
  setLanguage: (language: Locale) => Promise<void>;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'futly_go_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>(I18N_CONFIG.defaultLanguage);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((stored) => {
        if (stored && isSupportedLanguage(stored)) {
          setLanguageState(stored);
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoaded(true));
  }, []);

  async function setLanguage(languageToSet: Locale) {
    setLanguageState(languageToSet);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageToSet);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  );

  if (!isLoaded) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}

