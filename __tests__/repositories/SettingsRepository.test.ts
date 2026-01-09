/**
 * Unit tests for SettingsRepository
 * 
 * Note: These tests mock the SQLite database since we can't run actual
 * SQLite in a Jest environment without additional setup.
 * 
 * In a full testing environment, you would:
 * 1. Use an in-memory SQLite database for testing
 * 2. Or mock expo-sqlite module completely
 */

import { SettingsRepository } from '../../src/data/repositories/SettingsRepository';

// Mock the DatabaseService
jest.mock('../../src/data/database/DatabaseService', () => ({
  DatabaseService: {
    getDatabase: jest.fn().mockResolvedValue({
      getFirstAsync: jest.fn().mockResolvedValue({ value: 'tr' }),
      getAllAsync: jest.fn().mockResolvedValue([
        { key: 'language', value: 'tr' },
      ]),
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    }),
  },
}));

describe('SettingsRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve a setting value', async () => {
      const language = await SettingsRepository.get('language');
      expect(language).toBe('tr');
    });
  });

  describe('getAll', () => {
    it('should return settings object with language', async () => {
      const settings = await SettingsRepository.getAll();
      expect(settings).toHaveProperty('language');
      expect(settings.language).toBe('tr');
    });
  });

  describe('getLanguage', () => {
    it('should return the current language setting', async () => {
      const language = await SettingsRepository.getLanguage();
      expect(typeof language).toBe('string');
      expect(['tr', 'en']).toContain(language);
    });
  });
});

