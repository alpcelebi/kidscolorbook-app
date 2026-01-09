/**
 * Fill Tool - Flood fill algorithm for coloring areas
 * 
 * This is a simplified implementation that works with the canvas coordinate system.
 * For a full implementation with actual pixel manipulation, you would need to:
 * 1. Convert the canvas to an image
 * 2. Get pixel data
 * 3. Apply flood fill algorithm
 * 4. Convert back to paths or overlay
 */

import type { Point, DrawingPath } from '../../../domain/entities/DrawingPath';
import { generateUUID } from '../../../utils/uuid';

interface FillArea {
  id: string;
  center: Point;
  color: string;
  timestamp: number;
}

/**
 * Simple fill implementation using canvas position
 * Creates a fill marker at the tap location
 */
export function createFillArea(x: number, y: number, color: string): FillArea {
  return {
    id: generateUUID(),
    center: { x, y },
    color,
    timestamp: Date.now(),
  };
}

/**
 * Check if a point is inside a closed path
 * Uses ray casting algorithm
 */
export function isPointInPath(point: Point, pathPoints: Point[]): boolean {
  if (pathPoints.length < 3) return false;

  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = pathPoints.length - 1; i < pathPoints.length; j = i++) {
    const xi = pathPoints[i].x;
    const yi = pathPoints[i].y;
    const xj = pathPoints[j].x;
    const yj = pathPoints[j].y;

    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Find a closed region at the given point
 * Looks through all paths to find one that encloses the point
 */
export function findEnclosingPath(
  point: Point,
  paths: DrawingPath[]
): DrawingPath | null {
  // Check paths in reverse order (most recent first)
  for (let i = paths.length - 1; i >= 0; i--) {
    const path = paths[i];
    if (!path.isEraser && isPointInPath(point, path.points)) {
      return path;
    }
  }
  return null;
}

/**
 * Create a circular fill path centered at a point
 * Used as a fallback when no enclosing path is found
 */
export function createCircularFillPath(
  center: Point,
  radius: number,
  color: string
): DrawingPath {
  const points: Point[] = [];
  const segments = 36;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }

  return {
    id: generateUUID(),
    points,
    color,
    strokeWidth: radius * 2,
    isEraser: false,
    timestamp: Date.now(),
  };
}

/**
 * SVG-based flood fill simulation
 * Creates a large brush stroke at the tap location
 */
export function createFillStroke(
  x: number,
  y: number,
  color: string,
  size: number = 50
): DrawingPath {
  // Create a spiral pattern to fill the area
  const points: Point[] = [];
  const spiralTurns = 3;
  const pointsPerTurn = 20;
  
  for (let i = 0; i <= spiralTurns * pointsPerTurn; i++) {
    const angle = (i / pointsPerTurn) * Math.PI * 2;
    const radius = (i / (spiralTurns * pointsPerTurn)) * size;
    points.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
    });
  }

  return {
    id: generateUUID(),
    points,
    color,
    strokeWidth: size / 2,
    isEraser: false,
    timestamp: Date.now(),
  };
}

export type { FillArea };

