import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import tr from './locales/tr.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import ru from './locales/ru.json';

export const SUPPORTED_LANGUAGES = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'tr';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  ru: '🇷🇺',
};

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  ru: { translation: ru },
};

export const initializeI18n = async (language: string = DEFAULT_LANGUAGE): Promise<void> => {
  const validLanguage = SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
    ? language
    : DEFAULT_LANGUAGE;

  await i18n.use(initReactI18next).init({
    resources,
    lng: validLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(language);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || DEFAULT_LANGUAGE;
};

export const isValidLanguage = (language: string): language is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
};

export { i18n };
