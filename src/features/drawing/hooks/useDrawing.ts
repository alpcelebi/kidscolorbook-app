import { useCallback, useRef, useMemo } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import type { Point } from '../../../domain/entities/DrawingPath';

// Minimum distance between points (in pixels) - throttling
const MIN_POINT_DISTANCE = 3;

// Calculate distance between two points
const getDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Optimized drawing hook with path throttling
 * - Skips points that are too close together
 * - Uses refs for stable callbacks
 * - Batches updates for better performance
 */
export function useDrawing() {
  // Get store state and actions
  const paths = useDrawingStore((state) => state.paths);
  const currentPath = useDrawingStore((state) => state.currentPath);
  const currentPathIndex = useDrawingStore((state) => state.currentPathIndex);
  const selectedColor = useDrawingStore((state) => state.selectedColor);
  const brushSize = useDrawingStore((state) => state.brushSize);
  const currentTool = useDrawingStore((state) => state.currentTool);

  // Get stable action references
  const startPath = useDrawingStore((state) => state.startPath);
  const addPoint = useDrawingStore((state) => state.addPoint);
  const endPath = useDrawingStore((state) => state.endPath);
  const fill = useDrawingStore((state) => state.fill);
  const undo = useDrawingStore((state) => state.undo);
  const redo = useDrawingStore((state) => state.redo);
  const canUndo = useDrawingStore((state) => state.canUndo);
  const canRedo = useDrawingStore((state) => state.canRedo);
  const clear = useDrawingStore((state) => state.clear);
  const setColor = useDrawingStore((state) => state.setColor);
  const setBrushSize = useDrawingStore((state) => state.setBrushSize);
  const setTool = useDrawingStore((state) => state.setTool);
  const loadState = useDrawingStore((state) => state.loadState);
  const getState = useDrawingStore((state) => state.getState);
  const reset = useDrawingStore((state) => state.reset);
  const setCanvasDimensions = useDrawingStore((state) => state.setCanvasDimensions);

  // Use refs to keep action references stable for gesture handlers
  const actionsRef = useRef({ startPath, addPoint, endPath });
  actionsRef.current = { startPath, addPoint, endPath };

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const pendingPointsRef = useRef<Point[]>([]);
  const rafIdRef = useRef<number | null>(null);

  // Flush pending points to state
  const flushPoints = useCallback(() => {
    const points = pendingPointsRef.current;
    if (points.length > 0) {
      // Add all pending points at once
      points.forEach(point => {
        actionsRef.current.addPoint(point);
      });
      pendingPointsRef.current = [];
    }
    rafIdRef.current = null;
  }, []);

  // Stable callbacks using refs - these never change reference
  const handleTouchStart = useCallback((point: Point) => {
    isDrawingRef.current = true;
    lastPointRef.current = point;
    pendingPointsRef.current = [];
    actionsRef.current.startPath(point);
  }, []);

  const handleTouchMove = useCallback((point: Point) => {
    if (!isDrawingRef.current) return;

    // Throttle: skip points that are too close
    if (lastPointRef.current) {
      const distance = getDistance(point, lastPointRef.current);
      if (distance < MIN_POINT_DISTANCE) {
        return; // Skip this point
      }
    }

    lastPointRef.current = point;

    // Add point immediately for responsiveness
    actionsRef.current.addPoint(point);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    // Cancel any pending RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Flush any remaining points
    flushPoints();

    actionsRef.current.endPath();
  }, [flushPoints]);

  // Memoize visible paths
  const visiblePaths = useMemo(() => {
    return paths.slice(0, currentPathIndex + 1);
  }, [paths, currentPathIndex]);

  // Legacy compatibility
  const isEraser = currentTool === 'eraser';
  const toggleEraser = useCallback(() => {
    setTool(currentTool === 'eraser' ? 'brush' : 'eraser');
  }, [currentTool, setTool]);

  const setEraser = useCallback(
    (value: boolean) => {
      setTool(value ? 'eraser' : 'brush');
    },
    [setTool]
  );

  return {
    // State
    paths: visiblePaths,
    currentPath,
    selectedColor,
    brushSize,
    currentTool,
    isEraser,
    canUndo: canUndo(),
    canRedo: canRedo(),

    // Gesture handlers - these are now stable references
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Actions
    undo,
    redo,
    clear,
    fill,
    setColor,
    setBrushSize,
    setTool,
    setEraser,
    toggleEraser,
    loadState,
    getState,
    reset,
    setCanvasDimensions,
  };
}
