// Custom hook para acessar traduções de forma type-safe
// Uso: const { t, currentLanguage, changeLanguage } = useTranslation('matches');

import { useCallback, useMemo } from 'react';
import { useI18nContext } from '@/src/contexts/I18nContext';
import {
  getNamespace,
  getTranslation,
  SUPPORTED_LANGUAGES,
  I18N_CONFIG,
  isSupportedLanguage
} from '../index';
import type { Locale, TranslationResource } from '../types';

interface UseTranslationReturn {
  // Função para traduzir com interpolação
  t: (key: string, defaultValue?: string, interpolation?: Record<string, any>) => string;
  // Idioma atual
  currentLanguage: Locale;
  // Mudar idioma
  changeLanguage: (language: Locale) => Promise<void>;
  // Namespace completo
  namespace: Record<string, any>;
  // Todos os idiomas suportados
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

/**
 * Hook customizado para traduções
 * Integra com ThemeContext para persistir idioma
 *
 * @param namespace - Namespace da tradução (ex: 'matches', 'login', 'common')
 */
export function useTranslation(
  namespace: keyof TranslationResource = 'common'
): UseTranslationReturn {
  const { language, setLanguage } = useI18nContext();
  const currentLanguage: Locale = useMemo(() => language, [language]);

  const namespaceData = useMemo(() => {
    return getNamespace(currentLanguage, namespace);
  }, [currentLanguage, namespace]);

  // Função de tradução com suporte a interpolação
  const t = useCallback(
    (key: string, defaultValue?: string, interpolation?: Record<string, any>): string => {
      const localKey = `${namespace}.${key}`;
      let value = getTranslation(currentLanguage, localKey);

      if (value === localKey) {
        const startsWithNamespace = I18N_CONFIG.namespaces.some((ns) => key.startsWith(`${ns}.`));
        const fallbackKey = startsWithNamespace ? key : localKey;
        value = getTranslation(currentLanguage, fallbackKey, defaultValue || key);
      }

      // Suporte a interpolação simples {{varName}}
      if (interpolation) {
        Object.entries(interpolation).forEach(([varName, varValue]) => {
          value = value.replace(new RegExp(`{{\\s*${varName}\\s*}}`, 'g'), String(varValue));
        });
      }

      return value;
    },
    [currentLanguage, namespace]
  );

  // Mudar idioma (persiste em AsyncStorage ou Context)
  const changeLanguage = useCallback(async (language: Locale) => {
    if (!isSupportedLanguage(language)) {
      console.warn(`Idioma ${language} não é suportado`);
      return;
    }

    await setLanguage(language);
  }, [setLanguage]);

  return {
    t,
    currentLanguage,
    changeLanguage,
    namespace: namespaceData,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

/**
 * Hook para obter a função de tradução sem namespace específico
 * Útil para traduções comuns que podem vir de qualquer namespace
 */
export function useGlobalTranslation() {
  const { currentLanguage, changeLanguage } = useTranslation('common');

  const t = useCallback(
    (key: string, defaultValue?: string, interpolation?: Record<string, any>): string => {
      // Tentar traduzir em vários namespaces
      const namespaces = ['common', 'matches', 'login', 'dashboard', 'profile', 'errors'];
      for (const ns of namespaces) {
        const fullKey = `${ns}.${key}`;
        const value = getTranslation(currentLanguage, fullKey);
        if (value !== fullKey) {
          // Se encontrou tradução, fazer interpolação
          if (interpolation) {
            let result = value;
            Object.entries(interpolation).forEach(([varName, varValue]) => {
              result = result.replace(
                new RegExp(`{{\\s*${varName}\\s*}}`, 'g'),
                String(varValue)
              );
            });
            return result;
          }
          return value;
        }
      }
      return defaultValue || key;
    },
    [currentLanguage]
  );

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
}

/**
 * Hook para traduzir arrays de itens
 * Útil para listas de opções ou enumerações
 */
export function useTranslationList(
  namespace: keyof TranslationResource,
  prefix: string
) {
  const { t } = useTranslation(namespace);

  return useCallback((key: string) => t(`${prefix}.${key}`), [t, prefix]);
}
