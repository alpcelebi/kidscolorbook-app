export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  isEraser: boolean;
  timestamp: number;
}

export interface DrawingState {
  paths: DrawingPath[];
  currentPathIndex: number; // For undo/redo tracking
  canvasWidth: number;
  canvasHeight: number;
}

export interface SerializedDrawingState {
  version: number;
  paths: DrawingPath[];
  currentPathIndex: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const DRAWING_STATE_VERSION = 1;

export const createEmptyDrawingState = (
  canvasWidth: number,
  canvasHeight: number
): DrawingState => ({
  paths: [],
  currentPathIndex: -1,
  canvasWidth,
  canvasHeight,
});

