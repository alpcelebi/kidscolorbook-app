import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { colors, spacing, typography, shadows } from '../theme';
import {
  DrawingCanvas,
  Toolbar,
  Button,
  StickerPanel,
  PlacedStickers,
  BannerAd,
  type DrawingCanvasRef,
} from '../components';
import { useDrawing } from '../../features/drawing/hooks/useDrawing';
import { useGalleryStore } from '../../features/gallery/store/galleryStore';
import { useStickersStore } from '../../features/stickers/store/stickersStore';
import {
  serializeDrawingState,
  deserializeDrawingState,
} from '../../features/drawing/utils/pathSerializer';
import { ArtworkRepository } from '../../data/repositories/ArtworkRepository';
import type { Artwork } from '../../domain/entities/Artwork';
import type { RootStackParamList } from '../../navigation/types';

type FreeDrawNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FreeDraw'>;
type FreeDrawRouteProp = RouteProp<RootStackParamList, 'FreeDraw'>;

export function FreeDrawScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<FreeDrawNavigationProp>();
  const route = useRoute<FreeDrawRouteProp>();
  const artworkId = route.params?.artworkId;

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingName, setDrawingName] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const drawing = useDrawing();
  const createArtwork = useGalleryStore((state) => state.createArtwork);
  const updateArtworkDrawing = useGalleryStore((state) => state.updateArtworkDrawing);

  // Stickers
  const {
    openPanel: openStickerPanel,
    selectedSticker,
    placeSticker,
    selectSticker,
    reset: resetStickers,
  } = useStickersStore();

  // Handle sticker placement on canvas tap
  const handleStickerPlacement = useCallback(
    (event: GestureResponderEvent) => {
      if (selectedSticker) {
        const { locationX, locationY } = event.nativeEvent;
        console.log('Placing sticker at:', locationX, locationY);
        placeSticker(selectedSticker.id, locationX, locationY);
        selectSticker(null); // Clear selection after placing
      }
    },
    [selectedSticker, placeSticker, selectSticker]
  );

  // Cancel sticker placement
  const cancelStickerPlacement = useCallback(() => {
    selectSticker(null);
  }, [selectSticker]);

  // Load existing artwork if editing
  useEffect(() => {
    if (artworkId) {
      const loadArtwork = async () => {
        try {
          const data = await ArtworkRepository.getById(artworkId);
          if (data) {
            setArtwork(data);
            setDrawingName(data.name);
            const state = deserializeDrawingState(data.drawingData);
            drawing.loadState(state);
          }
        } catch (error) {
          console.error('Failed to load artwork:', error);
        }
      };
      loadArtwork();
    } else {
      drawing.reset();
      resetStickers();
    }
  }, [artworkId]);

  const handleBackPress = useCallback(() => {
    if (drawing.paths.length > 0 && !artwork) {
      Alert.alert(t('freeDraw.saveName'), t('freeDraw.enterName'), [
        {
          text: t('common.no'),
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: t('common.yes'),
          onPress: () => setShowSaveDialog(true),
        },
      ]);
    } else {
      navigation.goBack();
    }
  }, [drawing.paths.length, artwork, navigation, t]);

  const handleSave = useCallback(async () => {
    const state = drawing.getState();
    const drawingData = serializeDrawingState(state);

    try {
      if (artwork) {
        // Update existing
        await updateArtworkDrawing(artwork.id, drawingData);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1500);
      } else {
        // Show save dialog
        setShowSaveDialog(true);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      Alert.alert(t('errors.saveFailed'));
    }
  }, [artwork, drawing, updateArtworkDrawing, t]);

  const handleSaveNew = useCallback(async () => {
    const name = drawingName.trim() || t('freeDraw.untitled');
    const state = drawing.getState();
    const drawingData = serializeDrawingState(state);

    try {
      const newArtwork = await createArtwork({
        type: 'freedraw',
        name,
        drawingData,
      });
      setArtwork(newArtwork);
      setShowSaveDialog(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1500);
    } catch (error) {
      console.error('Failed to save new artwork:', error);
      Alert.alert(t('errors.saveFailed'));
    }
  }, [drawingName, drawing, createArtwork, t]);

  const handleClear = useCallback(() => {
    Alert.alert(t('freeDraw.clear'), t('freeDraw.clearConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.yes'),
        style: 'destructive',
        onPress: () => {
          drawing.clear();
          resetStickers();
        },
      },
    ]);
  }, [t, drawing, resetStickers]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {artwork?.name || t('freeDraw.title')}
        </Text>

        <View style={styles.headerRight}>
          {showSaved && <Text style={styles.savedText}>{t('coloring.saved')}</Text>}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveIcon}>💾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <DrawingCanvas
          ref={canvasRef}
          paths={drawing.paths}
          currentPath={drawing.currentPath}
          onTouchStart={drawing.handleTouchStart}
          onTouchMove={drawing.handleTouchMove}
          onTouchEnd={drawing.handleTouchEnd}
          onLayout={drawing.setCanvasDimensions}
        />
        {/* Placed stickers layer */}
        <PlacedStickers editable={!selectedSticker} />

        {/* Sticker placement overlay - captures touches when a sticker is selected */}
        {selectedSticker && (
          <View style={styles.stickerPlacementOverlay}>
            {/* Touch capture area */}
            <TouchableWithoutFeedback onPress={handleStickerPlacement}>
              <View style={styles.touchCaptureArea}>
                {/* Preview sticker */}
                <Text style={styles.previewSticker}>{selectedSticker.emoji}</Text>
              </View>
            </TouchableWithoutFeedback>

            {/* Selected sticker indicator - positioned above touch area */}
            <View style={styles.stickerHint} pointerEvents="box-none">
              <Text style={styles.stickerHintText}>
                {selectedSticker.emoji} Tuvale dokun
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelStickerPlacement}
              >
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Toolbar */}
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

      {/* Sticker panel */}
      <StickerPanel />

      {/* Save dialog */}
      <Modal visible={showSaveDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('freeDraw.saveName')}</Text>
            <TextInput
              style={styles.input}
              value={drawingName}
              onChangeText={setDrawingName}
              placeholder={t('freeDraw.untitled')}
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowSaveDialog(false)}
                variant="outline"
              />
              <Button title={t('common.save')} onPress={handleSaveNew} variant="primary" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Banner Ad */}
      <BannerAd />
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
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    fontSize: 20,
  },
  canvasContainer: {
    flex: 1,
    margin: spacing.md,
    position: 'relative',
  },
  toolbarContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    padding: spacing.lg,
    ...shadows.large,
  },
  modalTitle: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSizeMd,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
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
