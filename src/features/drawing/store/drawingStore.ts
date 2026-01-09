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
    const { currentPath, currentTool } = get();
    if (!currentPath || currentTool === 'fill') return;

    set({
      currentPath: {
        ...currentPath,
        points: [...currentPath.points, point],
      },
    });
  },

  endPath: () => {
    const { currentPath, paths, currentPathIndex, currentTool } = get();
    if (!currentPath || currentPath.points.length < 2 || currentTool === 'fill') {
      set({ currentPath: null });
      return;
    }

    // Remove any paths after currentPathIndex (for redo history)
    const newPaths = [...paths.slice(0, currentPathIndex + 1), currentPath];
    const newIndex = newPaths.length - 1;

    set({
      paths: newPaths,
      currentPathIndex: newIndex,
      currentPath: null,
    });
  },

  fill: (point: Point) => {
    const { selectedColor, paths, currentPathIndex } = get();
    
    // Create a fill stroke at the tap location
    const fillPath = createFillStroke(point.x, point.y, selectedColor, 60);

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
