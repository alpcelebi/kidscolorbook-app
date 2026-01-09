import type {
  DrawingState,
  SerializedDrawingState,
  DrawingPath,
} from '../../../domain/entities/DrawingPath';
import { DRAWING_STATE_VERSION, createEmptyDrawingState } from '../../../domain/entities/DrawingPath';

/**
 * Serialize drawing state to JSON string for storage
 */
export function serializeDrawingState(state: DrawingState): string {
  const serialized: SerializedDrawingState = {
    version: DRAWING_STATE_VERSION,
    paths: state.paths,
    currentPathIndex: state.currentPathIndex,
    canvasWidth: state.canvasWidth,
    canvasHeight: state.canvasHeight,
  };

  return JSON.stringify(serialized);
}

/**
 * Deserialize JSON string to drawing state
 */
export function deserializeDrawingState(
  json: string,
  defaultWidth: number = 0,
  defaultHeight: number = 0
): DrawingState {
  try {
    const parsed = JSON.parse(json) as SerializedDrawingState;

    // Handle version migrations if needed in the future
    if (parsed.version !== DRAWING_STATE_VERSION) {
      // For now, just return empty state for incompatible versions
      return createEmptyDrawingState(defaultWidth, defaultHeight);
    }

    // Validate paths
    const validPaths = parsed.paths.filter(isValidPath);

    return {
      paths: validPaths,
      currentPathIndex: Math.min(parsed.currentPathIndex, validPaths.length - 1),
      canvasWidth: parsed.canvasWidth || defaultWidth,
      canvasHeight: parsed.canvasHeight || defaultHeight,
    };
  } catch (error) {
    console.error('Failed to deserialize drawing state:', error);
    return createEmptyDrawingState(defaultWidth, defaultHeight);
  }
}

/**
 * Validate a drawing path
 */
function isValidPath(path: unknown): path is DrawingPath {
  if (!path || typeof path !== 'object') return false;

  const p = path as Record<string, unknown>;

  return (
    typeof p.id === 'string' &&
    Array.isArray(p.points) &&
    p.points.length > 0 &&
    typeof p.color === 'string' &&
    typeof p.strokeWidth === 'number' &&
    typeof p.isEraser === 'boolean'
  );
}

/**
 * Convert path points to SVG path string
 */
export function pathToSvgString(path: DrawingPath): string {
  if (path.points.length === 0) return '';

  const [first, ...rest] = path.points;
  let d = `M ${first.x} ${first.y}`;

  if (rest.length === 0) {
    // Single point - draw a small circle
    d += ` L ${first.x + 0.1} ${first.y + 0.1}`;
  } else if (rest.length === 1) {
    // Two points - simple line
    d += ` L ${rest[0].x} ${rest[0].y}`;
  } else {
    // Multiple points - use quadratic curves for smooth lines
    for (let i = 0; i < rest.length - 1; i++) {
      const current = rest[i];
      const next = rest[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      d += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
    }
    // Final point
    const last = rest[rest.length - 1];
    d += ` L ${last.x} ${last.y}`;
  }

  return d;
}

/**
 * Calculate bounds of all paths
 */
export function calculatePathsBounds(paths: DrawingPath[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const path of paths) {
    for (const point of path.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  if (!isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

