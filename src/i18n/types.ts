// Type definitions para i18n com suporte a type-safe translations
export type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'es-ES';

export interface TranslationResource {
  common: Record<string, any>;
  login: Record<string, any>;
  dashboard: Record<string, any>;
  matches: Record<string, any>;
  profile: Record<string, any>;
  errors: Record<string, any>;
  auth: Record<string, any>;
  settings: Record<string, any>;
  store: Record<string, any>;
  chat: Record<string, any>;
  create: Record<string, any>;
  explore: Record<string, any>;
  agenda: Record<string, any>;
  notifications: Record<string, any>;
  rating: Record<string, any>;
  help: Record<string, any>;
  support: Record<string, any>;
  legal: Record<string, any>;
}

export interface I18nConfig {
  defaultLanguage: Locale;
  fallbackLanguage: Locale;
  supportedLanguages: Locale[];
  namespaces: string[];
}

export const I18N_CONFIG: I18nConfig = {
  defaultLanguage: 'en-US',
  fallbackLanguage: 'pt-BR',
  supportedLanguages: ['pt-BR', 'pt-PT', 'en-US', 'es-ES'],
  namespaces: ['common', 'login', 'dashboard', 'matches', 'profile', 'errors', 'auth', 'settings', 'store', 'chat', 'create', 'explore', 'agenda', 'notifications', 'rating', 'help', 'support', 'legal'],
};
