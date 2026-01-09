import { DatabaseService } from '../database/DatabaseService';
import { generateUUID } from '../../utils/uuid';

export interface UsageStats {
  id: string;
  date: string;
  totalTimeSeconds: number;
  sessionCount: number;
  pagesCompleted: number;
  drawingsCreated: number;
  colorsUsed: string[];
  stickersUsed: number;
}

export interface Session {
  id: string;
  startTime: number;
  endTime: number | null;
  durationSeconds: number;
  date: string;
}

export interface ColorUsage {
  color: string;
  usageCount: number;
  lastUsed: number;
}

interface UsageStatsRow {
  id: string;
  date: string;
  total_time_seconds: number;
  session_count: number;
  pages_completed: number;
  drawings_created: number;
  colors_used: string;
  stickers_used: number;
}

interface SessionRow {
  id: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  date: string;
}

interface ColorUsageRow {
  color: string;
  usage_count: number;
  last_used: number;
}

function mapRowToUsageStats(row: UsageStatsRow): UsageStats {
  return {
    id: row.id,
    date: row.date,
    totalTimeSeconds: row.total_time_seconds,
    sessionCount: row.session_count,
    pagesCompleted: row.pages_completed,
    drawingsCreated: row.drawings_created,
    colorsUsed: JSON.parse(row.colors_used || '[]'),
    stickersUsed: row.stickers_used,
  };
}

class UsageStatsRepositoryClass {
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async getTodayStats(): Promise<UsageStats | null> {
    const db = await DatabaseService.getDatabase();
    const today = this.getTodayDate();

    const row = await db.getFirstAsync<UsageStatsRow>(
      'SELECT * FROM usage_stats WHERE date = ?',
      [today]
    );

    return row ? mapRowToUsageStats(row) : null;
  }

  async getWeekStats(): Promise<UsageStats[]> {
    const db = await DatabaseService.getDatabase();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const rows = await db.getAllAsync<UsageStatsRow>(
      'SELECT * FROM usage_stats WHERE date >= ? ORDER BY date DESC',
      [weekAgoStr]
    );

    return rows.map(mapRowToUsageStats);
  }

  async getMonthStats(): Promise<UsageStats[]> {
    const db = await DatabaseService.getDatabase();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];

    const rows = await db.getAllAsync<UsageStatsRow>(
      'SELECT * FROM usage_stats WHERE date >= ? ORDER BY date DESC',
      [monthAgoStr]
    );

    return rows.map(mapRowToUsageStats);
  }

  async incrementTimeSpent(seconds: number): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const today = this.getTodayDate();
    const now = Date.now();

    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM usage_stats WHERE date = ?',
      [today]
    );

    if (existing) {
      await db.runAsync(
        `UPDATE usage_stats SET total_time_seconds = total_time_seconds + ?, updated_at = ? WHERE date = ?`,
        [seconds, now, today]
      );
    } else {
      const id = generateUUID();
      await db.runAsync(
        `INSERT INTO usage_stats (id, date, total_time_seconds, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, today, seconds, now, now]
      );
    }
  }

  async incrementPagesCompleted(): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const today = this.getTodayDate();
    const now = Date.now();

    await db.runAsync(
      `UPDATE usage_stats SET pages_completed = pages_completed + 1, updated_at = ? WHERE date = ?`,
      [now, today]
    );
  }

  async incrementDrawingsCreated(): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const today = this.getTodayDate();
    const now = Date.now();

    await db.runAsync(
      `UPDATE usage_stats SET drawings_created = drawings_created + 1, updated_at = ? WHERE date = ?`,
      [now, today]
    );
  }

  async incrementStickersUsed(count: number = 1): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const today = this.getTodayDate();
    const now = Date.now();

    await db.runAsync(
      `UPDATE usage_stats SET stickers_used = stickers_used + ?, updated_at = ? WHERE date = ?`,
      [count, now, today]
    );
  }

  async recordColorUsage(color: string): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    const existing = await db.getFirstAsync<{ id: string; usage_count: number }>(
      'SELECT id, usage_count FROM color_usage WHERE color = ?',
      [color]
    );

    if (existing) {
      await db.runAsync(
        'UPDATE color_usage SET usage_count = usage_count + 1, last_used = ? WHERE color = ?',
        [now, color]
      );
    } else {
      const id = generateUUID();
      await db.runAsync(
        'INSERT INTO color_usage (id, color, usage_count, last_used) VALUES (?, ?, 1, ?)',
        [id, color, now]
      );
    }
  }

  async getTopColors(limit: number = 5): Promise<ColorUsage[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<ColorUsageRow>(
      'SELECT color, usage_count, last_used FROM color_usage ORDER BY usage_count DESC LIMIT ?',
      [limit]
    );

    return rows.map((row) => ({
      color: row.color,
      usageCount: row.usage_count,
      lastUsed: row.last_used,
    }));
  }

  async getTotalTimeSpent(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT SUM(total_time_seconds) as total FROM usage_stats'
    );
    return result?.total ?? 0;
  }

  async getTotalDrawings(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT SUM(drawings_created) as total FROM usage_stats'
    );
    return result?.total ?? 0;
  }

  async getTotalPagesCompleted(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT SUM(pages_completed) as total FROM usage_stats'
    );
    return result?.total ?? 0;
  }

  // Session tracking
  async startSession(): Promise<string> {
    const db = await DatabaseService.getDatabase();
    const id = generateUUID();
    const now = Date.now();
    const today = this.getTodayDate();

    await db.runAsync(
      'INSERT INTO sessions (id, start_time, date) VALUES (?, ?, ?)',
      [id, now, today]
    );

    // Increment session count for today
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM usage_stats WHERE date = ?',
      [today]
    );

    if (existing) {
      await db.runAsync(
        'UPDATE usage_stats SET session_count = session_count + 1, updated_at = ? WHERE date = ?',
        [now, today]
      );
    } else {
      const statsId = generateUUID();
      await db.runAsync(
        `INSERT INTO usage_stats (id, date, session_count, created_at, updated_at)
         VALUES (?, ?, 1, ?, ?)`,
        [statsId, today, now, now]
      );
    }

    return id;
  }

  async endSession(sessionId: string): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    const session = await db.getFirstAsync<SessionRow>(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );

    if (session) {
      const duration = Math.floor((now - session.start_time) / 1000);
      await db.runAsync(
        'UPDATE sessions SET end_time = ?, duration_seconds = ? WHERE id = ?',
        [now, duration, sessionId]
      );

      // Update total time for the day
      await this.incrementTimeSpent(duration);
    }
  }

  async getAverageSessionDuration(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ avg: number }>(
      'SELECT AVG(duration_seconds) as avg FROM sessions WHERE duration_seconds > 0'
    );
    return Math.round(result?.avg ?? 0);
  }

  async getLastActivityDate(): Promise<string | null> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ date: string }>(
      'SELECT date FROM usage_stats ORDER BY date DESC LIMIT 1'
    );
    return result?.date ?? null;
  }

  async getConsecutiveDays(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<{ date: string }>(
      'SELECT date FROM usage_stats WHERE total_time_seconds > 0 ORDER BY date DESC'
    );

    if (rows.length === 0) return 0;

    let consecutiveDays = 0;
    let expectedDate = new Date();

    for (const row of rows) {
      const rowDate = new Date(row.date);
      const expected = expectedDate.toISOString().split('T')[0];

      if (row.date === expected) {
        consecutiveDays++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consecutiveDays;
  }
}

export const UsageStatsRepository = new UsageStatsRepositoryClass();

