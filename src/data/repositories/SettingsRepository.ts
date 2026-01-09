import { DatabaseService } from '../database/DatabaseService';

export interface AppSettings {
  language: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'tr',
};

class SettingsRepositoryClass {
  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K] | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return row ? (row.value as AppSettings[K]) : null;
  }

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    await db.runAsync(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
      [key, String(value), now, String(value), now]
    );
  }

  async getAll(): Promise<AppSettings> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');

    const settings: AppSettings = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      if (row.key in DEFAULT_SETTINGS) {
        (settings as Record<string, string>)[row.key] = row.value;
      }
    }

    return settings;
  }

  async setLanguage(language: string): Promise<void> {
    await this.set('language', language);
  }

  async getLanguage(): Promise<string> {
    const language = await this.get('language');
    return language ?? DEFAULT_SETTINGS.language;
  }

  async reset(): Promise<void> {
    const db = await DatabaseService.getDatabase();
    await db.runAsync('DELETE FROM settings');

    // Re-insert defaults
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await this.set(key as keyof AppSettings, value);
    }
  }
}

export const SettingsRepository = new SettingsRepositoryClass();

