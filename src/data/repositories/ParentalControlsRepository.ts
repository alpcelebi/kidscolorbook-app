import { DatabaseService } from '../database/DatabaseService';

export interface ParentalControls {
  dailyLimitMinutes: number | null;
  breakReminderMinutes: number | null;
  sleepTimeStart: string | null; // HH:MM format
  sleepTimeEnd: string | null; // HH:MM format
  soundsEnabled: boolean;
}

interface ParentalControlsRow {
  id: string;
  daily_limit_minutes: number | null;
  break_reminder_minutes: number | null;
  sleep_time_start: string | null;
  sleep_time_end: string | null;
  sounds_enabled: number;
}

function mapRowToParentalControls(row: ParentalControlsRow): ParentalControls {
  return {
    dailyLimitMinutes: row.daily_limit_minutes,
    breakReminderMinutes: row.break_reminder_minutes,
    sleepTimeStart: row.sleep_time_start,
    sleepTimeEnd: row.sleep_time_end,
    soundsEnabled: row.sounds_enabled === 1,
  };
}

class ParentalControlsRepositoryClass {
  async get(): Promise<ParentalControls> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<ParentalControlsRow>(
      'SELECT * FROM parental_controls WHERE id = ?',
      ['default']
    );

    if (row) {
      return mapRowToParentalControls(row);
    }

    // Return defaults if not found
    return {
      dailyLimitMinutes: null,
      breakReminderMinutes: null,
      sleepTimeStart: null,
      sleepTimeEnd: null,
      soundsEnabled: true,
    };
  }

  async update(controls: Partial<ParentalControls>): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    const current = await this.get();
    const updated = { ...current, ...controls };

    await db.runAsync(
      `UPDATE parental_controls SET 
        daily_limit_minutes = ?,
        break_reminder_minutes = ?,
        sleep_time_start = ?,
        sleep_time_end = ?,
        sounds_enabled = ?,
        updated_at = ?
       WHERE id = 'default'`,
      [
        updated.dailyLimitMinutes,
        updated.breakReminderMinutes,
        updated.sleepTimeStart,
        updated.sleepTimeEnd,
        updated.soundsEnabled ? 1 : 0,
        now,
      ]
    );
  }

  async setDailyLimit(minutes: number | null): Promise<void> {
    await this.update({ dailyLimitMinutes: minutes });
  }

  async setBreakReminder(minutes: number | null): Promise<void> {
    await this.update({ breakReminderMinutes: minutes });
  }

  async setSleepTime(start: string | null, end: string | null): Promise<void> {
    await this.update({ sleepTimeStart: start, sleepTimeEnd: end });
  }

  async setSoundsEnabled(enabled: boolean): Promise<void> {
    await this.update({ soundsEnabled: enabled });
  }

  async reset(): Promise<void> {
    await this.update({
      dailyLimitMinutes: null,
      breakReminderMinutes: null,
      sleepTimeStart: null,
      sleepTimeEnd: null,
      soundsEnabled: true,
    });
  }

  // Check if app should be locked based on parental controls
  async checkLockStatus(todayUsageSeconds: number): Promise<{
    isLocked: boolean;
    reason: 'daily_limit' | 'sleep_time' | null;
    message: string | null;
  }> {
    const controls = await this.get();

    // Check daily limit
    if (controls.dailyLimitMinutes !== null) {
      const usedMinutes = Math.floor(todayUsageSeconds / 60);
      if (usedMinutes >= controls.dailyLimitMinutes) {
        return {
          isLocked: true,
          reason: 'daily_limit',
          message: 'limitReached',
        };
      }
    }

    // Check sleep time
    if (controls.sleepTimeStart && controls.sleepTimeEnd) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Simple time range check (doesn't handle overnight ranges perfectly)
      if (currentTime >= controls.sleepTimeStart || currentTime < controls.sleepTimeEnd) {
        // Check if we're in the sleep time window
        const startHour = parseInt(controls.sleepTimeStart.split(':')[0]);
        const endHour = parseInt(controls.sleepTimeEnd.split(':')[0]);
        const currentHour = now.getHours();

        // Handle overnight sleep times (e.g., 21:00 - 07:00)
        if (startHour > endHour) {
          if (currentHour >= startHour || currentHour < endHour) {
            return {
              isLocked: true,
              reason: 'sleep_time',
              message: 'sleepTimeLocked',
            };
          }
        } else {
          if (currentHour >= startHour && currentHour < endHour) {
            return {
              isLocked: true,
              reason: 'sleep_time',
              message: 'sleepTimeLocked',
            };
          }
        }
      }
    }

    return {
      isLocked: false,
      reason: null,
      message: null,
    };
  }

  // Check if break reminder should show
  async shouldShowBreakReminder(sessionDurationSeconds: number): Promise<boolean> {
    const controls = await this.get();

    if (controls.breakReminderMinutes === null) {
      return false;
    }

    const sessionMinutes = Math.floor(sessionDurationSeconds / 60);
    return sessionMinutes > 0 && sessionMinutes % controls.breakReminderMinutes === 0;
  }

  // Get remaining time for today
  async getRemainingTime(todayUsageSeconds: number): Promise<number | null> {
    const controls = await this.get();

    if (controls.dailyLimitMinutes === null) {
      return null;
    }

    const limitSeconds = controls.dailyLimitMinutes * 60;
    return Math.max(0, limitSeconds - todayUsageSeconds);
  }
}

export const ParentalControlsRepository = new ParentalControlsRepositoryClass();

