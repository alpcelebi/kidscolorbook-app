import { create } from 'zustand';
import {
  AchievementsRepository,
  type Achievement,
} from '../../../data/repositories/AchievementsRepository';
import { UsageStatsRepository } from '../../../data/repositories/UsageStatsRepository';
import { ArtworkRepository } from '../../../data/repositories/ArtworkRepository';

interface AchievementsState {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAchievements: () => Promise<void>;
  checkAndUpdateAchievements: () => Promise<void>;
  clearNewlyUnlocked: () => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  achievements: [],
  newlyUnlocked: [],
  isLoading: false,
  error: null,

  loadAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const achievements = await AchievementsRepository.getAll();
      set({ achievements, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load achievements';
      set({ error: message, isLoading: false });
    }
  },

  checkAndUpdateAchievements: async () => {
    try {
      // Gather current stats
      const [
        totalDrawings,
        consecutiveDays,
        totalPagesCompleted,
        topColors,
        freeDrawings,
      ] = await Promise.all([
        UsageStatsRepository.getTotalDrawings(),
        UsageStatsRepository.getConsecutiveDays(),
        UsageStatsRepository.getTotalPagesCompleted(),
        UsageStatsRepository.getTopColors(100),
        ArtworkRepository.getByType('freedraw').then(arr => arr.length),
      ]);

      // Check achievements
      const newlyUnlocked = await AchievementsRepository.checkAchievements({
        totalDrawings,
        consecutiveDays,
        pagesCompleted: totalPagesCompleted,
        uniqueColors: topColors.length,
        freeDrawings,
      });

      if (newlyUnlocked.length > 0) {
        set((state) => ({
          newlyUnlocked: [...state.newlyUnlocked, ...newlyUnlocked],
        }));
      }

      // Reload all achievements
      const achievements = await AchievementsRepository.getAll();
      set({ achievements });
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  },

  clearNewlyUnlocked: () => {
    set({ newlyUnlocked: [] });
  },
}));

