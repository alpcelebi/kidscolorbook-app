import { DatabaseService } from '../database/DatabaseService';

export interface Achievement {
  id: string;
  achievementKey: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
}

interface AchievementRow {
  id: string;
  achievement_key: string;
  unlocked: number;
  unlocked_at: number | null;
  progress: number;
  target: number;
}

function mapRowToAchievement(row: AchievementRow): Achievement {
  return {
    id: row.id,
    achievementKey: row.achievement_key,
    unlocked: row.unlocked === 1,
    unlockedAt: row.unlocked_at,
    progress: row.progress,
    target: row.target,
  };
}

class AchievementsRepositoryClass {
  async getAll(): Promise<Achievement[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<AchievementRow>('SELECT * FROM achievements');
    return rows.map(mapRowToAchievement);
  }

  async getByKey(key: string): Promise<Achievement | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<AchievementRow>(
      'SELECT * FROM achievements WHERE achievement_key = ?',
      [key]
    );
    return row ? mapRowToAchievement(row) : null;
  }

  async getUnlocked(): Promise<Achievement[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<AchievementRow>(
      'SELECT * FROM achievements WHERE unlocked = 1 ORDER BY unlocked_at DESC'
    );
    return rows.map(mapRowToAchievement);
  }

  async updateProgress(key: string, progress: number): Promise<Achievement | null> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    const achievement = await this.getByKey(key);
    if (!achievement) return null;

    const newProgress = Math.min(progress, achievement.target);
    const shouldUnlock = newProgress >= achievement.target && !achievement.unlocked;

    if (shouldUnlock) {
      await db.runAsync(
        'UPDATE achievements SET progress = ?, unlocked = 1, unlocked_at = ? WHERE achievement_key = ?',
        [newProgress, now, key]
      );
    } else {
      await db.runAsync(
        'UPDATE achievements SET progress = ? WHERE achievement_key = ?',
        [newProgress, key]
      );
    }

    return this.getByKey(key);
  }

  async incrementProgress(key: string, amount: number = 1): Promise<Achievement | null> {
    const achievement = await this.getByKey(key);
    if (!achievement) return null;

    return this.updateProgress(key, achievement.progress + amount);
  }

  async unlock(key: string): Promise<Achievement | null> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    await db.runAsync(
      'UPDATE achievements SET unlocked = 1, unlocked_at = ? WHERE achievement_key = ?',
      [now, key]
    );

    return this.getByKey(key);
  }

  async getUnlockedCount(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM achievements WHERE unlocked = 1'
    );
    return result?.count ?? 0;
  }

  async resetAll(): Promise<void> {
    const db = await DatabaseService.getDatabase();
    await db.runAsync('UPDATE achievements SET unlocked = 0, unlocked_at = NULL, progress = 0');
  }

  // Check and potentially unlock achievements based on current stats
  async checkAchievements(stats: {
    totalDrawings?: number;
    uniqueColors?: number;
    consecutiveDays?: number;
    pagesCompleted?: number;
    stickersUsed?: number;
    freeDrawings?: number;
    categoriesCompleted?: number;
  }): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    // First Drawing
    if (stats.totalDrawings && stats.totalDrawings >= 1) {
      const result = await this.updateProgress('firstDrawing', 1);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Color Master - use 10 different colors
    if (stats.uniqueColors) {
      const result = await this.updateProgress('colorMaster', stats.uniqueColors);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Daily Artist - draw 7 days in a row
    if (stats.consecutiveDays) {
      const result = await this.updateProgress('dailyArtist', stats.consecutiveDays);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Page Complete
    if (stats.pagesCompleted && stats.pagesCompleted >= 1) {
      const result = await this.updateProgress('pageComplete', 1);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Ten Pages
    if (stats.pagesCompleted) {
      const result = await this.updateProgress('tenPages', stats.pagesCompleted);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Category Master
    if (stats.categoriesCompleted && stats.categoriesCompleted >= 1) {
      const result = await this.updateProgress('categoryMaster', 1);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Sticker Fan
    if (stats.stickersUsed) {
      const result = await this.updateProgress('stickerFan', stats.stickersUsed);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    // Creative Soul - 20 free drawings
    if (stats.freeDrawings) {
      const result = await this.updateProgress('creativeSoul', stats.freeDrawings);
      if (result?.unlocked && result.unlockedAt && Date.now() - result.unlockedAt < 1000) {
        newlyUnlocked.push(result);
      }
    }

    return newlyUnlocked;
  }
}

export const AchievementsRepository = new AchievementsRepositoryClass();

