// Configuração central do i18next
// Suporta: PT-BR, PT-PT, EN-US, ES-ES

import { ptBRTranslations } from './locales/pt-BR';
import { ptPTTranslations } from './locales/pt-PT';
import { enUSTranslations } from './locales/en-US';
import { esESTranslations } from './locales/es-ES';
import type { Locale } from './types';
import { I18N_CONFIG } from './types';

// Re-export types
export type { Locale, TranslationResource } from './types';
export { I18N_CONFIG };

// Recursos de tradução disponíveis (4 idiomas)
export const resources = {
  'pt-BR': ptBRTranslations,
  'pt-PT': ptPTTranslations,
  'en-US': enUSTranslations,
  'es-ES': esESTranslations,
} as const;

// Configuração do i18next para uso com React Native
export const i18nConfig = {
  resources,
  defaultNS: 'common',
  ns: I18N_CONFIG.namespaces,
  lng: I18N_CONFIG.defaultLanguage,
  fallbackLng: I18N_CONFIG.fallbackLanguage,
  interpolation: {
    escapeValue: false, // React já protege contra XSS
  },
  react: {
    useSuspense: false, // Para React Native, desabilitar suspense
  },
};

/**
 * Hook customizado para acessar traduções
 * Uso: const { t } = useTranslate('matches');
 */
export function createI18nInstance() {
  // Esta função será chamada no AppProviders para inicializar i18next
  // Retorna uma instância configurada que pode ser usada em todo o app
  return i18nConfig;
}

/**
 * Helper para obter traduções aninhadas de forma type-safe
 * Uso: t('matches.create.title')
 */
export const getTranslation = (
  locale: Locale,
  key: string,
  defaultValue?: string
): string => {
  const keys = key.split('.');
  let value: any = resources[locale];

  for (const k of keys) {
    value = value?.[k];
  }

  return typeof value === 'string' ? value : defaultValue || key;
};

/**
 * Obter todas as traduções de um namespace específico
 */
export const getNamespace = (locale: Locale, namespace: keyof typeof ptBRTranslations) => {
  return resources[locale]?.[namespace] || {};
};

/**
 * Verificar se um idioma é suportado
 */
export const isSupportedLanguage = (lang: string): lang is Locale => {
  return I18N_CONFIG.supportedLanguages.includes(lang as Locale);
};

/**
 * Obter código de idioma do dispositivo e encontrar o mais próximo suportado
 */
export const getBestMatchingLanguage = (deviceLanguages: string[]): Locale => {
  for (const lang of deviceLanguages) {
    // Remover region se existir (ex: 'pt_BR' -> 'pt')
    const baseLang = lang.split(/[-_]/)[0].toLowerCase();

    // Procurar match exato
    const exact = I18N_CONFIG.supportedLanguages.find(
      (l) => l.toLowerCase().startsWith(baseLang)
    );
    if (exact) return exact;
  }

  return I18N_CONFIG.defaultLanguage;
};

/**
 * Lista de idiomas suportados com labels amigáveis
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR' as Locale, name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT' as Locale, name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US' as Locale, name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES' as Locale, name: 'Español (España)', flag: '🇪🇸' },
] as const;
