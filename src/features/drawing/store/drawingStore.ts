import { create } from 'zustand';
import type { DrawingPath, DrawingState, Point } from '../../../domain/entities/DrawingPath';
import { generateUUID } from '../../../utils/uuid';
import { createFillStroke } from '../utils/fillTool';

export type BrushSize = 'small' | 'medium' | 'large';
export type DrawingTool = 'brush' | 'eraser' | 'fill';

export const BRUSH_SIZES: Record<BrushSize, number> = {
  small: 4,
  medium: 12,
  large: 24,
};

export const DEFAULT_COLORS = [
  '#FF0000', // Red
  '#FF6B00', // Orange
  '#FFD700', // Yellow
  '#00C853', // Green
  '#00BCD4', // Cyan
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#795548', // Brown
  '#000000', // Black
  '#9E9E9E', // Gray
  '#FFFFFF', // White
];

export const EXTENDED_COLORS = [
  ...DEFAULT_COLORS,
  '#FF5252', // Light Red
  '#FFAB40', // Light Orange
  '#FFFF00', // Bright Yellow
  '#69F0AE', // Light Green
  '#40C4FF', // Light Blue
  '#7C4DFF', // Light Purple
  '#FF80AB', // Light Pink
  '#8D6E63', // Light Brown
  '#B0BEC5', // Blue Gray
  '#F5F5F5', // Off White
];

interface DrawingStoreState {
  // Drawing state
  paths: DrawingPath[];
  currentPathIndex: number;
  currentPath: DrawingPath | null;
  pendingPoints: Point[]; // Buffer for batching points

  // Tool state
  selectedColor: string;
  brushSize: BrushSize;
  currentTool: DrawingTool;

  // Canvas dimensions
  canvasWidth: number;
  canvasHeight: number;

  // Actions
  setCanvasDimensions: (width: number, height: number) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: BrushSize) => void;
  setTool: (tool: DrawingTool) => void;

  // Drawing actions
  startPath: (point: Point) => void;
  addPoint: (point: Point) => void;
  endPath: () => void;

  // Fill action
  fill: (point: Point) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // State management
  clear: () => void;
  loadState: (state: DrawingState) => void;
  getState: () => DrawingState;
  reset: () => void;
}

export const useDrawingStore = create<DrawingStoreState>((set, get) => ({
  // Initial state
  paths: [],
  currentPathIndex: -1,
  currentPath: null,
  pendingPoints: [],
  selectedColor: DEFAULT_COLORS[0],
  brushSize: 'medium',
  currentTool: 'brush',
  canvasWidth: 0,
  canvasHeight: 0,

  setCanvasDimensions: (width: number, height: number) => {
    set({ canvasWidth: width, canvasHeight: height });
  },

  setColor: (color: string) => {
    set({ selectedColor: color, currentTool: 'brush' });
  },

  setBrushSize: (size: BrushSize) => {
    set({ brushSize: size });
  },

  setTool: (tool: DrawingTool) => {
    set({ currentTool: tool });
  },

  startPath: (point: Point) => {
    const { selectedColor, brushSize, currentTool } = get();

    if (currentTool === 'fill') {
      get().fill(point);
      return;
    }

    const newPath: DrawingPath = {
      id: generateUUID(),
      points: [point],
      color: selectedColor,
      strokeWidth: BRUSH_SIZES[brushSize],
      isEraser: currentTool === 'eraser',
      timestamp: Date.now(),
    };

    set({ currentPath: newPath });
  },

  addPoint: (point: Point) => {
    const { currentPath, currentTool, pendingPoints } = get();
    if (!currentPath || currentTool === 'fill') return;

    // Distance threshold - skip points that are too close (performance optimization)
    const lastPoint = currentPath.points[currentPath.points.length - 1] || pendingPoints[pendingPoints.length - 1];
    if (lastPoint) {
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 2) return; // Skip if less than 2 pixels apart
    }

    // Add to pending buffer
    const newPending = [...pendingPoints, point];

    // Batch update: flush every 4 points for smoother performance
    if (newPending.length >= 4) {
      set({
        currentPath: {
          ...currentPath,
          points: [...currentPath.points, ...newPending],
        },
        pendingPoints: [],
      });
    } else {
      set({ pendingPoints: newPending });
    }
  },

  endPath: () => {
    const { currentPath, paths, currentPathIndex, currentTool, pendingPoints } = get();
    if (!currentPath || currentTool === 'fill') {
      set({ currentPath: null, pendingPoints: [] });
      return;
    }

    // Flush any pending points
    const finalPoints = [...currentPath.points, ...pendingPoints];
    if (finalPoints.length < 2) {
      set({ currentPath: null, pendingPoints: [] });
      return;
    }

    const finalPath = { ...currentPath, points: finalPoints };

    // Remove any paths after currentPathIndex (for redo history)
    const newPaths = [...paths.slice(0, currentPathIndex + 1), finalPath];
    const newIndex = newPaths.length - 1;

    set({
      paths: newPaths,
      currentPathIndex: newIndex,
      currentPath: null,
      pendingPoints: [],
    });
  },

  fill: (point: Point) => {
    const { selectedColor, paths, currentPathIndex, brushSize } = get();

    // Create use dynamic size based on brush size: small=20, medium=60, large=120
    const baseSize = BRUSH_SIZES[brushSize];
    const fillSize = baseSize * 5;

    // Create a fill stroke at the tap location
    const fillPath = createFillStroke(point.x, point.y, selectedColor, fillSize);

    // Add to paths
    const newPaths = [...paths.slice(0, currentPathIndex + 1), fillPath];
    const newIndex = newPaths.length - 1;

    set({
      paths: newPaths,
      currentPathIndex: newIndex,
    });
  },

  undo: () => {
    const { currentPathIndex } = get();
    if (currentPathIndex >= 0) {
      set({ currentPathIndex: currentPathIndex - 1 });
    }
  },

  redo: () => {
    const { currentPathIndex, paths } = get();
    if (currentPathIndex < paths.length - 1) {
      set({ currentPathIndex: currentPathIndex + 1 });
    }
  },

  canUndo: () => {
    return get().currentPathIndex >= 0;
  },

  canRedo: () => {
    const { currentPathIndex, paths } = get();
    return currentPathIndex < paths.length - 1;
  },

  clear: () => {
    set({
      paths: [],
      currentPathIndex: -1,
      currentPath: null,
    });
  },

  loadState: (state: DrawingState) => {
    set({
      paths: state.paths,
      currentPathIndex: state.currentPathIndex,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      currentPath: null,
    });
  },

  getState: () => {
    const { paths, currentPathIndex, canvasWidth, canvasHeight } = get();
    return {
      paths: paths.slice(0, currentPathIndex + 1), // Only include visible paths
      currentPathIndex,
      canvasWidth,
      canvasHeight,
    };
  },

  reset: () => {
    set({
      paths: [],
      currentPathIndex: -1,
      currentPath: null,
      selectedColor: DEFAULT_COLORS[0],
      brushSize: 'medium',
      currentTool: 'brush',
    });
  },
}));
