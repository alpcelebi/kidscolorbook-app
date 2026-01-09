import * as SQLite from 'expo-sqlite';
import { migrations, CURRENT_DB_VERSION } from './migrations';
import { seedInitialData } from './seedData';

const DATABASE_NAME = 'kidscolorbook.db';

class DatabaseServiceClass {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return this.db;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const db = await this.getDatabase();

      // Enable foreign keys
      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Get current version
      const versionResult = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version;'
      );
      const currentVersion = versionResult?.user_version ?? 0;

      // Run migrations
      for (const migration of migrations) {
        if (migration.version > currentVersion) {
          await migration.up(db);
          await db.execAsync(`PRAGMA user_version = ${migration.version};`);
        }
      }

      // Seed initial data (runs every time but uses INSERT OR IGNORE)
      // This ensures new pages are added when app updates
      await seedInitialData(db);

      // FIX: Remove duplicates caused by ID change (page-sun2 -> page-sun-space)
      await db.runAsync("DELETE FROM pages WHERE id = 'page-sun2'");

      this.initialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
    }
  }

  async reset(): Promise<void> {
    await this.close();
    await SQLite.deleteDatabaseAsync(DATABASE_NAME);
    await this.initialize();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getVersion(): number {
    return CURRENT_DB_VERSION;
  }
}

export const DatabaseService = new DatabaseServiceClass();

