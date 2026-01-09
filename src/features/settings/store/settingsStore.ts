import { create } from 'zustand';
import { SettingsRepository, type AppSettings } from '../../../data/repositories/SettingsRepository';
import { changeLanguage, type SupportedLanguage } from '../../../i18n';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<AppSettings | null>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await SettingsRepository.getAll();
      set({ settings, isLoading: false });
      return settings;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  setLanguage: async (language: SupportedLanguage) => {
    set({ isLoading: true, error: null });
    try {
      await SettingsRepository.setLanguage(language);
      await changeLanguage(language);

      const currentSettings = get().settings;
      set({
        settings: currentSettings ? { ...currentSettings, language } : { language },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save language';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  resetSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      await SettingsRepository.reset();
      const settings = await SettingsRepository.getAll();
      await changeLanguage(settings.language as SupportedLanguage);
      set({ settings, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset settings';
      set({ error: message, isLoading: false });
    }
  },
}));

