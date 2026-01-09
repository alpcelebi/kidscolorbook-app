import React, { useCallback, useRef, forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { StyleSheet, View, LayoutChangeEvent, Image, ImageSourcePropType } from 'react-native';
import Svg, { Path, G, Rect } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { colors } from '../../theme';
import type { DrawingPath, Point } from '../../../domain/entities/DrawingPath';
import { pathToSvgString } from '../../../features/drawing/utils/pathSerializer';

const AnimatedView = Animated.View;

export interface DrawingCanvasRef {
  getSvgContent: () => string;
}

interface DrawingCanvasProps {
  paths: DrawingPath[];
  currentPath: DrawingPath | null;
  backgroundSvg?: React.ReactNode;
  backgroundImage?: ImageSourcePropType; // PNG image source
  onTouchStart: (point: Point) => void;
  onTouchMove: (point: Point) => void;
  onTouchEnd: () => void;
  onLayout?: (width: number, height: number) => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    { paths, currentPath, backgroundSvg, backgroundImage, onTouchStart, onTouchMove, onTouchEnd, onLayout },
    ref
  ) => {
    const [dimensions, setDimensions] = useState({ width: 300, height: 400 });
    const dimensionsRef = useRef({ width: 300, height: 400 });

    useImperativeHandle(ref, () => ({
      getSvgContent: () => {
        const { width, height } = dimensionsRef.current;
        const allPaths = currentPath ? [...paths, currentPath] : paths;

        const pathElements = allPaths
          .map((p) => {
            const d = pathToSvgString(p);
            if (!d) return '';
            return `<path d="${d}" stroke="${p.isEraser ? '#FFFFFF' : p.color}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
          })
          .join('\n');

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="100%" height="100%" fill="${colors.canvasBackground}"/>
          ${pathElements}
        </svg>`;
      },
    }));

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        dimensionsRef.current = { width, height };
        setDimensions({ width, height });
        onLayout?.(width, height);
      },
      [onLayout]
    );

    // Worklet-optimized gesture handler
    const panGesture = useMemo(() => {
      const start = onTouchStart;
      const move = onTouchMove;
      const end = onTouchEnd;

      return Gesture.Pan()
        .onBegin((event) => {
          'worklet';
          runOnJS(start)({ x: event.x, y: event.y });
        })
        .onUpdate((event) => {
          'worklet';
          runOnJS(move)({ x: event.x, y: event.y });
        })
        .onEnd(() => {
          'worklet';
          runOnJS(end)();
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(end)();
        })
        .minDistance(0)
        .minPointers(1)
        .maxPointers(1)
        .shouldCancelWhenOutside(false)
        .activeOffsetX([-1, 1])
        .activeOffsetY([-1, 1]);
    }, [onTouchStart, onTouchMove, onTouchEnd]);

    const renderPath = (drawingPath: DrawingPath) => {
      const d = pathToSvgString(drawingPath);
      if (!d) return null;

      return (
        <Path
          key={drawingPath.id}
          d={d}
          stroke={drawingPath.isEraser ? colors.canvasBackground : drawingPath.color}
          strokeWidth={drawingPath.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    };

    const allPaths = currentPath ? [...paths, currentPath] : paths;

    return (
      <View style={styles.container} onLayout={handleLayout}>
        <GestureDetector gesture={panGesture}>
          <AnimatedView style={styles.canvasWrapper}>
            {/* Drawing layer - BEHIND the line art so colors fill inside */}
            <View style={styles.drawingLayer}>
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* White background */}
                <Rect
                  x="0"
                  y="0"
                  width={dimensions.width}
                  height={dimensions.height}
                  fill={colors.canvasBackground}
                />

                {/* Drawing paths */}
                <G>{allPaths.map(renderPath)}</G>
              </Svg>
            </View>

            {/* PNG Image layer - ON TOP so outlines are always visible */}
            {backgroundImage && (
              <View style={styles.imageLayer} pointerEvents="none">
                <Image
                  source={backgroundImage}
                  style={styles.backgroundImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* SVG Line art layer - ON TOP so outlines are always visible */}
            {backgroundSvg && (
              <View style={styles.backgroundLayer} pointerEvents="none">
                {backgroundSvg}
              </View>
            )}
          </AnimatedView>
        </GestureDetector>
      </View>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvasBackground,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.canvasBorder,
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  drawingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    padding: 8,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    zIndex: 2,
  },
});
