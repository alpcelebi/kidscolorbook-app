import { create } from 'zustand';
import { ArtworkRepository } from '../../../data/repositories/ArtworkRepository';
import { FileStorageService } from '../../../data/storage/FileStorageService';
import type { Artwork, ArtworkCreateInput, ArtworkType } from '../../../domain/entities/Artwork';

type FilterType = 'all' | ArtworkType;

interface GalleryState {
  artworks: Artwork[];
  filter: FilterType;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadArtworks: () => Promise<void>;
  setFilter: (filter: FilterType) => void;
  createArtwork: (input: ArtworkCreateInput, thumbnailBase64?: string) => Promise<Artwork>;
  updateArtwork: (id: string, name: string) => Promise<void>;
  updateArtworkDrawing: (id: string, drawingData: string, thumbnailBase64?: string) => Promise<void>;
  deleteArtwork: (id: string) => Promise<void>;
  deleteAllArtworks: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  exportArtwork: (id: string, imageBase64: string) => Promise<string>;
  getFilteredArtworks: () => Artwork[];
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  artworks: [],
  filter: 'all',
  isLoading: false,
  error: null,

  loadArtworks: async () => {
    set({ isLoading: true, error: null });
    try {
      const artworks = await ArtworkRepository.getAll();
      set({ artworks, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load artworks';
      set({ error: message, isLoading: false });
    }
  },

  setFilter: (filter: FilterType) => {
    set({ filter });
  },

  createArtwork: async (input: ArtworkCreateInput, thumbnailBase64?: string) => {
    try {
      let thumbnailPath: string | undefined;

      if (thumbnailBase64) {
        thumbnailPath = await FileStorageService.saveThumbnail(thumbnailBase64);
      }

      const artwork = await ArtworkRepository.create(input);

      if (thumbnailPath) {
        await ArtworkRepository.update(artwork.id, { thumbnailPath });
        artwork.thumbnailPath = thumbnailPath;
      }

      set((state) => ({
        artworks: [artwork, ...state.artworks],
      }));

      return artwork;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create artwork';
      set({ error: message });
      throw error;
    }
  },

  updateArtwork: async (id: string, name: string) => {
    try {
      await ArtworkRepository.update(id, { name });
      set((state) => ({
        artworks: state.artworks.map((a) => (a.id === id ? { ...a, name } : a)),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update artwork';
      set({ error: message });
      throw error;
    }
  },

  updateArtworkDrawing: async (id: string, drawingData: string, thumbnailBase64?: string) => {
    try {
      let thumbnailPath: string | undefined;

      if (thumbnailBase64) {
        thumbnailPath = await FileStorageService.saveThumbnail(thumbnailBase64);
      }

      await ArtworkRepository.update(id, { drawingData, thumbnailPath });

      set((state) => ({
        artworks: state.artworks.map((a) =>
          a.id === id
            ? { ...a, drawingData, thumbnailPath: thumbnailPath ?? a.thumbnailPath, updatedAt: Date.now() }
            : a
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update artwork';
      set({ error: message });
      throw error;
    }
  },

  deleteArtwork: async (id: string) => {
    try {
      const artwork = get().artworks.find((a) => a.id === id);

      if (artwork?.thumbnailPath) {
        await FileStorageService.deleteImage(artwork.thumbnailPath);
      }
      if (artwork?.imagePath) {
        await FileStorageService.deleteImage(artwork.imagePath);
      }

      await ArtworkRepository.delete(id);

      set((state) => ({
        artworks: state.artworks.filter((a) => a.id !== id),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete artwork';
      set({ error: message });
      throw error;
    }
  },

  deleteAllArtworks: async () => {
    try {
      const artworks = get().artworks;

      // Delete all files
      for (const artwork of artworks) {
        if (artwork.thumbnailPath) {
          await FileStorageService.deleteImage(artwork.thumbnailPath);
        }
        if (artwork.imagePath) {
          await FileStorageService.deleteImage(artwork.imagePath);
        }
      }

      await ArtworkRepository.deleteAll();
      set({ artworks: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete all artworks';
      set({ error: message });
      throw error;
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      const newValue = await ArtworkRepository.toggleFavorite(id);
      set((state) => ({
        artworks: state.artworks.map((a) => (a.id === id ? { ...a, isFavorite: newValue } : a)),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle favorite';
      set({ error: message });
      throw error;
    }
  },

  exportArtwork: async (id: string, imageBase64: string) => {
    try {
      const imagePath = await FileStorageService.saveImage(imageBase64);
      await ArtworkRepository.update(id, { imagePath });

      set((state) => ({
        artworks: state.artworks.map((a) => (a.id === id ? { ...a, imagePath } : a)),
      }));

      return FileStorageService.getImageUri(imagePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export artwork';
      set({ error: message });
      throw error;
    }
  },

  getFilteredArtworks: () => {
    const { artworks, filter } = get();
    if (filter === 'all') {
      return artworks;
    }
    return artworks.filter((a) => a.type === filter);
  },
}));

