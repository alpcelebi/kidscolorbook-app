export interface Sticker {
  id: string;
  category: StickerCategory;
  emoji: string;
  name: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export type StickerCategory = 'stars' | 'hearts' | 'animals' | 'emojis' | 'nature';

export const STICKER_CATEGORIES: StickerCategory[] = ['stars', 'hearts', 'animals', 'emojis', 'nature'];

export const STICKERS: Sticker[] = [
  // Stars
  { id: 'star-1', category: 'stars', emoji: '⭐', name: 'Star' },
  { id: 'star-2', category: 'stars', emoji: '🌟', name: 'Glowing Star' },
  { id: 'star-3', category: 'stars', emoji: '✨', name: 'Sparkles' },
  { id: 'star-4', category: 'stars', emoji: '💫', name: 'Dizzy Star' },
  { id: 'star-5', category: 'stars', emoji: '🌠', name: 'Shooting Star' },

  // Hearts
  { id: 'heart-1', category: 'hearts', emoji: '❤️', name: 'Red Heart' },
  { id: 'heart-2', category: 'hearts', emoji: '💖', name: 'Sparkling Heart' },
  { id: 'heart-3', category: 'hearts', emoji: '💕', name: 'Two Hearts' },
  { id: 'heart-4', category: 'hearts', emoji: '💝', name: 'Heart with Ribbon' },
  { id: 'heart-5', category: 'hearts', emoji: '💜', name: 'Purple Heart' },
  { id: 'heart-6', category: 'hearts', emoji: '💛', name: 'Yellow Heart' },
  { id: 'heart-7', category: 'hearts', emoji: '💚', name: 'Green Heart' },

  // Animals
  { id: 'animal-1', category: 'animals', emoji: '🐱', name: 'Cat' },
  { id: 'animal-2', category: 'animals', emoji: '🐶', name: 'Dog' },
  { id: 'animal-3', category: 'animals', emoji: '🐰', name: 'Rabbit' },
  { id: 'animal-4', category: 'animals', emoji: '🦋', name: 'Butterfly' },
  { id: 'animal-5', category: 'animals', emoji: '🐦', name: 'Bird' },
  { id: 'animal-6', category: 'animals', emoji: '🐠', name: 'Fish' },
  { id: 'animal-7', category: 'animals', emoji: '🦄', name: 'Unicorn' },
  { id: 'animal-8', category: 'animals', emoji: '🐻', name: 'Bear' },

  // Emojis
  { id: 'emoji-1', category: 'emojis', emoji: '😊', name: 'Smiling' },
  { id: 'emoji-2', category: 'emojis', emoji: '😍', name: 'Heart Eyes' },
  { id: 'emoji-3', category: 'emojis', emoji: '🥳', name: 'Party' },
  { id: 'emoji-4', category: 'emojis', emoji: '😎', name: 'Cool' },
  { id: 'emoji-5', category: 'emojis', emoji: '🤩', name: 'Star Struck' },
  { id: 'emoji-6', category: 'emojis', emoji: '😂', name: 'Laughing' },
  { id: 'emoji-7', category: 'emojis', emoji: '🥰', name: 'Loving' },

  // Nature
  { id: 'nature-1', category: 'nature', emoji: '🌸', name: 'Cherry Blossom' },
  { id: 'nature-2', category: 'nature', emoji: '🌺', name: 'Hibiscus' },
  { id: 'nature-3', category: 'nature', emoji: '🌻', name: 'Sunflower' },
  { id: 'nature-4', category: 'nature', emoji: '🌈', name: 'Rainbow' },
  { id: 'nature-5', category: 'nature', emoji: '☀️', name: 'Sun' },
  { id: 'nature-6', category: 'nature', emoji: '🌙', name: 'Moon' },
  { id: 'nature-7', category: 'nature', emoji: '🍀', name: 'Clover' },
  { id: 'nature-8', category: 'nature', emoji: '🌴', name: 'Palm Tree' },
];

export function getStickersByCategory(category: StickerCategory): Sticker[] {
  return STICKERS.filter((s) => s.category === category);
}

export function getStickerById(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}

