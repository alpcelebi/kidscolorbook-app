import { ParentalControlsRepository } from '../../data/repositories/ParentalControlsRepository';

/**
 * Sound Service - Manages app sound effects
 * 
 * Note: This is a placeholder implementation. In production, you would use
 * expo-av to play actual sound files. For now, we just track whether sounds
 * are enabled and provide the structure for sound playback.
 */

type SoundType = 
  | 'brush_stroke'
  | 'color_select'
  | 'sticker_place'
  | 'undo'
  | 'redo'
  | 'clear'
  | 'save'
  | 'achievement_unlock'
  | 'page_complete'
  | 'button_tap';

class SoundServiceClass {
  private soundsEnabled: boolean = true;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const controls = await ParentalControlsRepository.get();
      this.soundsEnabled = controls.soundsEnabled;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
      this.soundsEnabled = true;
    }
  }

  async setSoundsEnabled(enabled: boolean): Promise<void> {
    this.soundsEnabled = enabled;
    await ParentalControlsRepository.setSoundsEnabled(enabled);
  }

  isSoundsEnabled(): boolean {
    return this.soundsEnabled;
  }

  /**
   * Play a sound effect
   * In production, this would use expo-av to play actual sound files
   */
  async play(type: SoundType): Promise<void> {
    if (!this.soundsEnabled) return;

    // Placeholder - in production you would:
    // 1. Load sound files using expo-av
    // 2. Play the appropriate sound based on type
    // 
    // Example with expo-av:
    // const { sound } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/brush.mp3')
    // );
    // await sound.playAsync();

    // For now, we just log the sound type
    if (__DEV__) {
      // console.log(`[Sound] Playing: ${type}`);
    }
  }

  // Convenience methods for specific sounds
  async playBrushStroke(): Promise<void> {
    await this.play('brush_stroke');
  }

  async playColorSelect(): Promise<void> {
    await this.play('color_select');
  }

  async playStickerPlace(): Promise<void> {
    await this.play('sticker_place');
  }

  async playUndo(): Promise<void> {
    await this.play('undo');
  }

  async playRedo(): Promise<void> {
    await this.play('redo');
  }

  async playClear(): Promise<void> {
    await this.play('clear');
  }

  async playSave(): Promise<void> {
    await this.play('save');
  }

  async playAchievementUnlock(): Promise<void> {
    await this.play('achievement_unlock');
  }

  async playPageComplete(): Promise<void> {
    await this.play('page_complete');
  }

  async playButtonTap(): Promise<void> {
    await this.play('button_tap');
  }

  // Haptic feedback (optional - can be enabled alongside sounds)
  async haptic(type: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    // In production, use expo-haptics
    // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export const SoundService = new SoundServiceClass();

