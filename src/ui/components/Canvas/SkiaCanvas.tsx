import React, { useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent, Image } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  SkPath,
  BlendMode,
  Image as SkiaImage,
  Rect,
  SkImage,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors } from '../../theme';
import type { DrawingPath, Point } from '../../../domain/entities/DrawingPath';
import { pathToSvgString } from '../../../features/drawing/utils/pathSerializer';

export interface SkiaCanvasRef {
  makeImageSnapshot: () => string | null;
}

interface SkiaCanvasProps {
  paths: DrawingPath[];
  currentPath: DrawingPath | null;
  backgroundSvg?: string;
  backgroundImage?: SkImage | null;
  onTouchStart: (point: Point) => void;
  onTouchMove: (point: Point) => void;
  onTouchEnd: () => void;
  onLayout?: (width: number, height: number) => void;
}

export const SkiaCanvas = forwardRef<SkiaCanvasRef, SkiaCanvasProps>(
  ({ paths, currentPath, backgroundImage, onTouchStart, onTouchMove, onTouchEnd, onLayout }, ref) => {
    const canvasRef = useCanvasRef();
    const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

    useImperativeHandle(ref, () => ({
      makeImageSnapshot: () => {
        try {
          const image = canvasRef.current?.makeImageSnapshot();
          if (image) {
            const base64 = image.encodeToBase64();
            return `data:image/png;base64,${base64}`;
          }
          return null;
        } catch (error) {
          console.error('Failed to make image snapshot:', error);
          return null;
        }
      },
    }));

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          onLayout?.(width, height);
        }
      },
      [onLayout]
    );

    const panGesture = Gesture.Pan()
      .onStart((event) => {
        onTouchStart({ x: event.x, y: event.y });
      })
      .onUpdate((event) => {
        onTouchMove({ x: event.x, y: event.y });
      })
      .onEnd(() => {
        onTouchEnd();
      })
      .minDistance(0)
      .minPointers(1)
      .maxPointers(1)
      .runOnJS(true);

    // Convert DrawingPath to Skia Path
    const createSkiaPath = useCallback((drawingPath: DrawingPath): SkPath => {
      const path = Skia.Path.Make();
      const svgString = pathToSvgString(drawingPath);
      if (svgString) {
        const parsedPath = Skia.Path.MakeFromSVGString(svgString);
        if (parsedPath) {
          path.addPath(parsedPath);
        }
      }
      return path;
    }, []);

    // Render all paths
    const allPaths = currentPath ? [...paths, currentPath] : paths;

    return (
      <View style={styles.container} onLayout={handleLayout}>
        <GestureDetector gesture={panGesture}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {/* White Background Layer */}
            <Rect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              color={colors.canvasBackground}
            />

            {/* Coloring (User Drawing) Layer */}
            {allPaths.map((drawingPath) => {
              const skiaPath = createSkiaPath(drawingPath);
              return (
                <Path
                  key={drawingPath.id}
                  path={skiaPath}
                  color={drawingPath.isEraser ? colors.canvasBackground : drawingPath.color}
                  style="stroke"
                  strokeWidth={drawingPath.strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode={drawingPath.isEraser ? BlendMode.Clear : BlendMode.SrcOver}
                />
              );
            })}

            {/* Line Art Layer (Background Image) - ON TOP with Multiply blend */}
            {backgroundImage && dimensions.width > 0 && (
              <SkiaImage
                image={backgroundImage}
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                fit="contain"
                blendMode={BlendMode.Multiply}
              />
            )}
          </Canvas>
        </GestureDetector>
      </View>
    );
  }
);

SkiaCanvas.displayName = 'SkiaCanvas';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvasBackground,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});
