import { create } from 'zustand';
import {
  ParentalControlsRepository,
  type ParentalControls,
} from '../../../data/repositories/ParentalControlsRepository';
import {
  UsageStatsRepository,
  type UsageStats,
  type ColorUsage,
} from '../../../data/repositories/UsageStatsRepository';
import {
  AchievementsRepository,
  type Achievement,
} from '../../../data/repositories/AchievementsRepository';

interface ParentDashboardStats {
  todayUsage: UsageStats | null;
  weekUsage: UsageStats[];
  totalTimeSpent: number;
  totalDrawings: number;
  totalPagesCompleted: number;
  favoriteColors: ColorUsage[];
  achievements: Achievement[];
  unlockedAchievements: number;
  averageSessionDuration: number;
  consecutiveDays: number;
  lastActivityDate: string | null;
}

interface ParentalControlsState {
  controls: ParentalControls | null;
  stats: ParentDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  isLocked: boolean;
  lockReason: 'daily_limit' | 'sleep_time' | null;
  showBreakReminder: boolean;
  remainingTime: number | null;
  currentSessionId: string | null;
  sessionStartTime: number | null;

  // Actions
  loadControls: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateDailyLimit: (minutes: number | null) => Promise<void>;
  updateBreakReminder: (minutes: number | null) => Promise<void>;
  updateSleepTime: (start: string | null, end: string | null) => Promise<void>;
  updateSoundsEnabled: (enabled: boolean) => Promise<void>;
  resetControls: () => Promise<void>;
  checkLockStatus: () => Promise<void>;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  checkBreakReminder: () => Promise<void>;
  dismissBreakReminder: () => void;
}

export const useParentalControlsStore = create<ParentalControlsState>((set, get) => ({
  controls: null,
  stats: null,
  isLoading: false,
  error: null,
  isLocked: false,
  lockReason: null,
  showBreakReminder: false,
  remainingTime: null,
  currentSessionId: null,
  sessionStartTime: null,

  loadControls: async () => {
    set({ isLoading: true, error: null });
    try {
      const controls = await ParentalControlsRepository.get();
      set({ controls, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load controls';
      set({ error: message, isLoading: false });
    }
  },

  loadStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const [
        todayUsage,
        weekUsage,
        totalTimeSpent,
        totalDrawings,
        totalPagesCompleted,
        favoriteColors,
        achievements,
        unlockedAchievements,
        averageSessionDuration,
        consecutiveDays,
        lastActivityDate,
      ] = await Promise.all([
        UsageStatsRepository.getTodayStats(),
        UsageStatsRepository.getWeekStats(),
        UsageStatsRepository.getTotalTimeSpent(),
        UsageStatsRepository.getTotalDrawings(),
        UsageStatsRepository.getTotalPagesCompleted(),
        UsageStatsRepository.getTopColors(5),
        AchievementsRepository.getAll(),
        AchievementsRepository.getUnlockedCount(),
        UsageStatsRepository.getAverageSessionDuration(),
        UsageStatsRepository.getConsecutiveDays(),
        UsageStatsRepository.getLastActivityDate(),
      ]);

      set({
        stats: {
          todayUsage,
          weekUsage,
          totalTimeSpent,
          totalDrawings,
          totalPagesCompleted,
          favoriteColors,
          achievements,
          unlockedAchievements,
          averageSessionDuration,
          consecutiveDays,
          lastActivityDate,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load stats';
      set({ error: message, isLoading: false });
    }
  },

  updateDailyLimit: async (minutes: number | null) => {
    try {
      await ParentalControlsRepository.setDailyLimit(minutes);
      const controls = await ParentalControlsRepository.get();
      set({ controls });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update limit';
      set({ error: message });
    }
  },

  updateBreakReminder: async (minutes: number | null) => {
    try {
      await ParentalControlsRepository.setBreakReminder(minutes);
      const controls = await ParentalControlsRepository.get();
      set({ controls });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update reminder';
      set({ error: message });
    }
  },

  updateSleepTime: async (start: string | null, end: string | null) => {
    try {
      await ParentalControlsRepository.setSleepTime(start, end);
      const controls = await ParentalControlsRepository.get();
      set({ controls });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update sleep time';
      set({ error: message });
    }
  },

  updateSoundsEnabled: async (enabled: boolean) => {
    try {
      await ParentalControlsRepository.setSoundsEnabled(enabled);
      const controls = await ParentalControlsRepository.get();
      set({ controls });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update sounds';
      set({ error: message });
    }
  },

  resetControls: async () => {
    try {
      await ParentalControlsRepository.reset();
      const controls = await ParentalControlsRepository.get();
      set({ controls });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset controls';
      set({ error: message });
    }
  },

  checkLockStatus: async () => {
    try {
      const todayStats = await UsageStatsRepository.getTodayStats();
      const todayUsageSeconds = todayStats?.totalTimeSeconds ?? 0;

      const status = await ParentalControlsRepository.checkLockStatus(todayUsageSeconds);
      const remainingTime = await ParentalControlsRepository.getRemainingTime(todayUsageSeconds);

      set({
        isLocked: status.isLocked,
        lockReason: status.reason,
        remainingTime,
      });
    } catch (error) {
      console.error('Failed to check lock status:', error);
    }
  },

  startSession: async () => {
    try {
      const sessionId = await UsageStatsRepository.startSession();
      set({
        currentSessionId: sessionId,
        sessionStartTime: Date.now(),
      });
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  },

  endSession: async () => {
    const { currentSessionId } = get();
    if (currentSessionId) {
      try {
        await UsageStatsRepository.endSession(currentSessionId);
        set({
          currentSessionId: null,
          sessionStartTime: null,
        });
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  },

  checkBreakReminder: async () => {
    const { sessionStartTime, controls } = get();
    if (!sessionStartTime || !controls?.breakReminderMinutes) {
      return;
    }

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const shouldShow = await ParentalControlsRepository.shouldShowBreakReminder(sessionDuration);

    if (shouldShow) {
      set({ showBreakReminder: true });
    }
  },

  dismissBreakReminder: () => {
    set({ showBreakReminder: false });
  },
}));

