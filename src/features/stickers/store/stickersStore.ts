import { create } from 'zustand';
import {
  STICKER_CATEGORIES,
  getStickersByCategory,
  type Sticker,
  type StickerCategory,
  type PlacedSticker,
} from '../../../domain/entities/Sticker';
import { generateUUID } from '../../../utils/uuid';

interface StickersState {
  // Panel state
  isPanelOpen: boolean;
  selectedCategory: StickerCategory;
  selectedSticker: Sticker | null;

  // Placed stickers
  placedStickers: PlacedSticker[];

  // Currently dragging
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;

  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  cancelSelection: () => void;
  selectCategory: (category: StickerCategory) => void;
  selectSticker: (sticker: Sticker | null) => void;

  // Sticker placement
  placeSticker: (stickerId: string, x: number, y: number) => void;
  updateStickerPosition: (id: string, x: number, y: number) => void;
  updateStickerScale: (id: string, scale: number) => void;
  updateStickerRotation: (id: string, rotation: number) => void;
  removeSticker: (id: string) => void;
  clearAllStickers: () => void;

  // Drag handling
  startDragging: (x: number, y: number) => void;
  updateDragPosition: (x: number, y: number) => void;
  endDragging: () => void;

  // State management
  loadStickers: (stickers: PlacedSticker[]) => void;
  getStickers: () => PlacedSticker[];
  reset: () => void;
}

export const useStickersStore = create<StickersState>((set, get) => ({
  isPanelOpen: false,
  selectedCategory: 'stars',
  selectedSticker: null,
  placedStickers: [],
  isDragging: false,
  dragPosition: null,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }), // Don't clear selectedSticker on close
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  // New action to cancel selection
  cancelSelection: () => set({ isPanelOpen: false, selectedSticker: null }),

  selectCategory: (category) => set({ selectedCategory: category }),

  selectSticker: (sticker) => set({ selectedSticker: sticker }),

  placeSticker: (stickerId, x, y) => {
    const newSticker: PlacedSticker = {
      id: generateUUID(),
      stickerId,
      x,
      y,
      scale: 1,
      rotation: 0,
    };
    set((state) => ({
      placedStickers: [...state.placedStickers, newSticker],
      selectedSticker: null,
    }));
  },

  updateStickerPosition: (id, x, y) => {
    set((state) => ({
      placedStickers: state.placedStickers.map((s) =>
        s.id === id ? { ...s, x, y } : s
      ),
    }));
  },

  updateStickerScale: (id, scale) => {
    set((state) => ({
      placedStickers: state.placedStickers.map((s) =>
        s.id === id ? { ...s, scale: Math.max(0.5, Math.min(3, scale)) } : s
      ),
    }));
  },

  updateStickerRotation: (id, rotation) => {
    set((state) => ({
      placedStickers: state.placedStickers.map((s) =>
        s.id === id ? { ...s, rotation } : s
      ),
    }));
  },

  removeSticker: (id) => {
    set((state) => ({
      placedStickers: state.placedStickers.filter((s) => s.id !== id),
    }));
  },

  clearAllStickers: () => set({ placedStickers: [] }),

  startDragging: (x, y) => set({ isDragging: true, dragPosition: { x, y } }),

  updateDragPosition: (x, y) => set({ dragPosition: { x, y } }),

  endDragging: () => {
    const { selectedSticker, dragPosition } = get();
    if (selectedSticker && dragPosition) {
      get().placeSticker(selectedSticker.id, dragPosition.x, dragPosition.y);
    }
    set({ isDragging: false, dragPosition: null });
  },

  loadStickers: (stickers) => set({ placedStickers: stickers }),

  getStickers: () => get().placedStickers,

  reset: () =>
    set({
      isPanelOpen: false,
      selectedCategory: 'stars',
      selectedSticker: null,
      placedStickers: [],
      isDragging: false,
      dragPosition: null,
    }),
}));

