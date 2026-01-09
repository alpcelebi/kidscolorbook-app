import {
  isValidLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
} from '../../src/i18n';

describe('i18n Configuration', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should include Turkish and English', () => {
      expect(SUPPORTED_LANGUAGES).toContain('tr');
      expect(SUPPORTED_LANGUAGES).toContain('en');
    });

    it('should have exactly 2 supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(2);
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should be Turkish', () => {
      expect(DEFAULT_LANGUAGE).toBe('tr');
    });

    it('should be in SUPPORTED_LANGUAGES', () => {
      expect(SUPPORTED_LANGUAGES).toContain(DEFAULT_LANGUAGE);
    });
  });

  describe('LANGUAGE_NAMES', () => {
    it('should have names for all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(LANGUAGE_NAMES[lang]).toBeDefined();
        expect(typeof LANGUAGE_NAMES[lang]).toBe('string');
      });
    });

    it('should have correct names', () => {
      expect(LANGUAGE_NAMES.tr).toBe('Türkçe');
      expect(LANGUAGE_NAMES.en).toBe('English');
    });
  });

  describe('isValidLanguage', () => {
    it('should return true for supported languages', () => {
      expect(isValidLanguage('tr')).toBe(true);
      expect(isValidLanguage('en')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isValidLanguage('fr')).toBe(false);
      expect(isValidLanguage('de')).toBe(false);
      expect(isValidLanguage('es')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage('invalid')).toBe(false);
    });
  });
});

