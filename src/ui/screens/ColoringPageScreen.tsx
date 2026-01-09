import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  Canvas,
  Path,
  Skia,
  Image as SkiaImage,
  Rect,
  useImage,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { colors, spacing, typography } from '../theme';
import {
  Toolbar,
  StickerPanel,
  PlacedStickers,
  BannerAd,
} from '../components';
import { useDrawing } from '../../features/drawing/hooks/useDrawing';
import { useAutosave } from '../../features/drawing/hooks/useAutosave';
import { useStickersStore } from '../../features/stickers/store/stickersStore';
import { deserializeDrawingState, pathToSvgString } from '../../features/drawing/utils/pathSerializer';
import { PagesRepository } from '../../data/repositories/PagesRepository';
import type { PageWithProgress } from '../../domain/entities/Page';
import type { RootStackParamList } from '../../navigation/types';
import { hasPng, getPng } from '../../assets/pngRegistry';

type ColoringPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ColoringPage'>;
type ColoringPageRouteProp = RouteProp<RootStackParamList, 'ColoringPage'>;

export function ColoringPageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ColoringPageNavigationProp>();
  const route = useRoute<ColoringPageRouteProp>();
  const { pageId } = route.params;

  const [page, setPage] = useState<PageWithProgress | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  const drawing = useDrawing();

  const {
    openPanel: openStickerPanel,
    selectedSticker,
    placeSticker,
    selectSticker,
    reset: resetStickers,
  } = useStickersStore();

  const handleStickerPlacement = useCallback(
    (event: GestureResponderEvent) => {
      if (selectedSticker) {
        const { locationX, locationY } = event.nativeEvent;
        placeSticker(selectedSticker.id, locationX, locationY);
        selectSticker(null);
      }
    },
    [selectedSticker, placeSticker, selectSticker]
  );

  const cancelStickerPlacement = useCallback(() => {
    selectSticker(null);
  }, [selectSticker]);

  const { forceSave } = useAutosave({
    onSave: async (drawingData) => {
      await PagesRepository.saveProgress(pageId, drawingData, false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1500);
    },
    enabled: true,
    debounceMs: 2000,
  });

  useEffect(() => {
    drawing.reset();
    resetStickers();
    setIsLoading(true);

    const loadPage = async () => {
      try {
        const pageData = await PagesRepository.getByIdWithProgress(pageId);
        if (pageData) {
          setPage(pageData);
          setIsFavorite(pageData.isFavorite);
          if (pageData.progress?.drawingData) {
            const state = deserializeDrawingState(pageData.progress.drawingData);
            drawing.loadState(state);
          }
        }
      } catch (error) {
        console.error('Failed to load page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId]);

  const pngSource = useMemo(() => {
    if (!page?.svgPath) return null;
    return hasPng(page.svgPath) ? getPng(page.svgPath) : null;
  }, [page?.svgPath]);

  const backgroundImage = useImage(pngSource);

  const handleBackPress = useCallback(async () => {
    await forceSave();
    navigation.goBack();
  }, [forceSave, navigation]);

  const handleFavoriteToggle = useCallback(async () => {
    try {
      const newValue = await PagesRepository.toggleFavorite(pageId);
      setIsFavorite(newValue);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [pageId]);

  const handleClear = useCallback(() => {
    Alert.alert(t('coloring.reset'), t('coloring.resetConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: async () => {
          drawing.clear();
          resetStickers();
          await PagesRepository.clearProgress(pageId);
        },
      },
    ]);
  }, [t, pageId, drawing, resetStickers]);

  // Worklet-optimized gesture handler
  const panGesture = useMemo(() => {
    // Create stable callback refs for worklet usage
    const onStart = drawing.handleTouchStart;
    const onMove = drawing.handleTouchMove;
    const onEnd = drawing.handleTouchEnd;

    return Gesture.Pan()
      .onBegin((event) => {
        'worklet';
        runOnJS(onStart)({ x: event.x, y: event.y });
      })
      .onUpdate((event) => {
        'worklet';
        runOnJS(onMove)({ x: event.x, y: event.y });
      })
      .onEnd(() => {
        'worklet';
        runOnJS(onEnd)();
      })
      .onFinalize(() => {
        'worklet';
        runOnJS(onEnd)();
      })
      .minDistance(0)
      .minPointers(1)
      .maxPointers(1)
      .shouldCancelWhenOutside(false)
      .activeOffsetX([-1, 1])
      .activeOffsetY([-1, 1]);
  }, [drawing.handleTouchStart, drawing.handleTouchMove, drawing.handleTouchEnd]);

  const handleCanvasLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasSize({ width, height });
      drawing.setCanvasDimensions(width, height);
    }
  }, [drawing.setCanvasDimensions]);

  const hasNoPng = page && !hasPng(page.svgPath);

  const completedPathsSkia = useMemo(() => {
    return drawing.paths.map((drawingPath) => {
      const svgString = pathToSvgString(drawingPath);
      if (!svgString) return null;
      const skiaPath = Skia.Path.MakeFromSVGString(svgString);
      if (!skiaPath) return null;
      return { path: skiaPath, drawingPath };
    }).filter(Boolean);
  }, [drawing.paths]);

  const currentPathSkia = useMemo(() => {
    if (!drawing.currentPath) return null;
    const svgString = pathToSvgString(drawing.currentPath);
    if (!svgString) return null;
    const skiaPath = Skia.Path.MakeFromSVGString(svgString);
    if (!skiaPath) return null;
    return { path: skiaPath, drawingPath: drawing.currentPath };
  }, [drawing.currentPath]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {page ? t(page.nameKey) : ''}
        </Text>

        <View style={styles.headerRight}>
          {showSaved && <Text style={styles.savedText}>{t('coloring.saved')}</Text>}
          <TouchableOpacity style={styles.headerButton} onPress={handleFavoriteToggle}>
            <Text style={styles.headerIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : hasNoPng ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>🖼️</Text>
            <Text style={styles.errorText}>Bu görsel henüz hazır değil</Text>
            <Text style={styles.errorSubtext}>Yakında eklenecek!</Text>
          </View>
        ) : (
          <View style={styles.canvasWrapper} onLayout={handleCanvasLayout}>
            <GestureDetector gesture={panGesture}>
              <Canvas style={styles.canvas}>
                <Rect x={0} y={0} width={canvasSize.width} height={canvasSize.height} color="#FFFFFF" />

                {completedPathsSkia.map((item: any) => (
                  <Path
                    key={item.drawingPath.id}
                    path={item.path}
                    color={item.drawingPath.isEraser ? '#FFFFFF' : item.drawingPath.color}
                    style="stroke"
                    strokeWidth={item.drawingPath.strokeWidth}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                ))}

                {currentPathSkia && (
                  <Path
                    path={currentPathSkia.path}
                    color={currentPathSkia.drawingPath.isEraser ? '#FFFFFF' : currentPathSkia.drawingPath.color}
                    style="stroke"
                    strokeWidth={currentPathSkia.drawingPath.strokeWidth}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                )}

                {backgroundImage && (
                  <SkiaImage
                    image={backgroundImage}
                    x={0}
                    y={0}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    fit="contain"
                    blendMode="multiply"
                  />
                )}
              </Canvas>
            </GestureDetector>
          </View>
        )}

        {!hasNoPng && !isLoading && <PlacedStickers editable={!selectedSticker} />}

        {selectedSticker && (
          <View style={styles.stickerPlacementOverlay}>
            <TouchableWithoutFeedback onPress={handleStickerPlacement}>
              <View style={styles.touchCaptureArea}>
                <Text style={styles.previewSticker}>{selectedSticker.emoji}</Text>
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.stickerHint} pointerEvents="box-none">
              <Text style={styles.stickerHintText}>{selectedSticker.emoji} Tuvale dokun</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelStickerPlacement}>
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Toolbar */}
      {!hasNoPng && !isLoading && (
        <View style={styles.toolbarContainer}>
          <Toolbar
            selectedColor={drawing.selectedColor}
            brushSize={drawing.brushSize}
            currentTool={drawing.currentTool}
            canUndo={drawing.canUndo}
            canRedo={drawing.canRedo}
            showFillTool={true}
            showStickerButton={true}
            onColorSelect={drawing.setColor}
            onBrushSizeSelect={drawing.setBrushSize}
            onToolSelect={drawing.setTool}
            onUndo={drawing.undo}
            onRedo={drawing.redo}
            onClear={handleClear}
            onStickerPress={openStickerPanel}
          />
        </View>
      )}

      {/* Banner Ad */}
      <BannerAd />

      {/* Sticker panel */}
      <StickerPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 26,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedText: {
    fontSize: typography.fontSizeSm,
    color: colors.success,
    fontWeight: typography.fontWeightMedium,
  },
  canvasContainer: {
    flex: 1,
    margin: spacing.sm,
    position: 'relative',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.canvasBorder,
  },
  canvas: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorSubtext: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
  },
  toolbarContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  stickerPlacementOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  touchCaptureArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerHint: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 20,
  },
  stickerHintText: {
    backgroundColor: colors.primary,
    color: colors.textOnPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusRound,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    overflow: 'hidden',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: typography.fontWeightBold,
  },
  previewSticker: {
    fontSize: 80,
    opacity: 0.5,
  },
});
