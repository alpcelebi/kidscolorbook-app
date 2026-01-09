import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '../../../utils/debounce';
import { useDrawingStore } from '../store/drawingStore';
import { serializeDrawingState } from '../utils/pathSerializer';

interface AutosaveOptions {
  onSave: (drawingData: string) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Hook for autosaving drawing state with debouncing
 */
export function useAutosave({ onSave, debounceMs = 2000, enabled = true }: AutosaveOptions) {
  const { paths, currentPathIndex, canvasWidth, canvasHeight } = useDrawingStore();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const saveDrawing = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    const state = {
      paths: paths.slice(0, currentPathIndex + 1),
      currentPathIndex,
      canvasWidth,
      canvasHeight,
    };

    const serialized = serializeDrawingState(state);

    // Skip if no changes
    if (serialized === lastSavedRef.current) return;

    isSavingRef.current = true;
    try {
      await onSave(serialized);
      lastSavedRef.current = serialized;
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, paths, currentPathIndex, canvasWidth, canvasHeight, onSave]);

  // Create debounced save function
  const debouncedSaveRef = useRef(
    debounce(async () => {
      await saveDrawing();
    }, debounceMs)
  );

  // Update debounced function when saveDrawing changes
  useEffect(() => {
    debouncedSaveRef.current = debounce(async () => {
      await saveDrawing();
    }, debounceMs);

    return () => {
      debouncedSaveRef.current.cancel();
    };
  }, [saveDrawing, debounceMs]);

  // Trigger autosave when paths change
  useEffect(() => {
    if (enabled && paths.length > 0) {
      debouncedSaveRef.current();
    }
  }, [enabled, paths, currentPathIndex]);

  // Force save (for manual saves)
  const forceSave = useCallback(async () => {
    debouncedSaveRef.current.cancel();
    await saveDrawing();
  }, [saveDrawing]);

  // Flush pending save
  const flush = useCallback(() => {
    debouncedSaveRef.current.flush();
  }, []);

  return {
    forceSave,
    flush,
    isSaving: isSavingRef.current,
  };
}

