import React, { memo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, shadows, typography } from '../../theme';
import { ColorPalette } from './ColorPalette';
import type { BrushSize, DrawingTool } from '../../../features/drawing/store/drawingStore';

// Quick color palette - most used colors readily available
const QUICK_COLORS = [
  '#FF0000', // Red
  '#FF6B00', // Orange
  '#FFD700', // Yellow
  '#00C853', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#795548', // Brown
  '#000000', // Black
  '#FFFFFF', // White
];

interface ToolbarProps {
  selectedColor: string;
  brushSize: BrushSize;
  currentTool: DrawingTool;
  canUndo: boolean;
  canRedo: boolean;
  showFillTool?: boolean;
  showStickerButton?: boolean;
  onColorSelect: (color: string) => void;
  onBrushSizeSelect: (size: BrushSize) => void;
  onToolSelect: (tool: DrawingTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onStickerPress?: () => void;
}

function ToolbarComponent({
  selectedColor,
  brushSize,
  currentTool,
  canUndo,
  canRedo,
  showFillTool = true,
  showStickerButton = true,
  onColorSelect,
  onBrushSizeSelect,
  onToolSelect,
  onUndo,
  onRedo,
  onClear,
  onStickerPress,
}: ToolbarProps) {
  const { t } = useTranslation();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSlider, setShowBrushSlider] = useState(false);

  const isBrush = currentTool === 'brush';
  const isEraser = currentTool === 'eraser';
  const isFill = currentTool === 'fill';

  // Convert brush size to number for slider
  const brushSizeValue = { small: 4, medium: 12, large: 24 }[brushSize];

  const handleSliderChange = (value: number) => {
    if (value <= 8) {
      onBrushSizeSelect('small');
    } else if (value <= 18) {
      onBrushSizeSelect('medium');
    } else {
      onBrushSizeSelect('large');
    }
  };

  return (
    <View style={styles.container}>
      {/* Quick Color Bar - Scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickColorBar}
        contentContainerStyle={styles.quickColorContent}
      >
        {QUICK_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.quickColorButton,
              { backgroundColor: color },
              color === '#FFFFFF' && styles.whiteColorBorder,
              selectedColor === color && styles.selectedColor,
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
        {/* More colors button */}
        <TouchableOpacity
          style={[styles.quickColorButton, styles.moreColorsButton]}
          onPress={() => setShowColorPicker(!showColorPicker)}
        >
          <Text style={styles.moreColorsText}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main toolbar - Scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mainToolbar}
        contentContainerStyle={styles.mainToolbarContent}
      >
        {/* Brush size indicator with tap to show slider */}
        <TouchableOpacity
          style={[styles.toolButton, styles.brushSizeButton]}
          onPress={() => setShowBrushSlider(!showBrushSlider)}
        >
          <View style={[styles.brushPreview, { width: brushSizeValue, height: brushSizeValue, backgroundColor: selectedColor }]} />
          <Text style={styles.brushSizeLabel}>{brushSizeValue}px</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Brush/Pencil */}
        <TouchableOpacity
          style={[styles.toolButton, isBrush && styles.activeButton]}
          onPress={() => onToolSelect('brush')}
        >
          <Text style={styles.toolIcon}>✏️</Text>
        </TouchableOpacity>

        {/* Eraser */}
        <TouchableOpacity
          style={[styles.toolButton, isEraser && styles.activeButton]}
          onPress={() => onToolSelect('eraser')}
        >
          <Text style={styles.toolIcon}>🧽</Text>
        </TouchableOpacity>

        {/* Fill */}
        {showFillTool && (
          <TouchableOpacity
            style={[styles.toolButton, isFill && styles.activeButton]}
            onPress={() => onToolSelect('fill')}
          >
            <Text style={styles.toolIcon}>🪣</Text>
          </TouchableOpacity>
        )}

        {/* Sticker */}
        {showStickerButton && onStickerPress && (
          <TouchableOpacity
            style={styles.toolButton}
            onPress={onStickerPress}
          >
            <Text style={styles.toolIcon}>⭐</Text>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Undo */}
        <TouchableOpacity
          style={[styles.toolButton, !canUndo && styles.disabledButton]}
          onPress={onUndo}
          disabled={!canUndo}
        >
          <Text style={[styles.toolIcon, !canUndo && styles.disabledIcon]}>↩️</Text>
        </TouchableOpacity>

        {/* Redo */}
        <TouchableOpacity
          style={[styles.toolButton, !canRedo && styles.disabledButton]}
          onPress={onRedo}
          disabled={!canRedo}
        >
          <Text style={[styles.toolIcon, !canRedo && styles.disabledIcon]}>↪️</Text>
        </TouchableOpacity>

        {/* Clear */}
        <TouchableOpacity
          style={[styles.toolButton, styles.clearButton]}
          onPress={onClear}
        >
          <Text style={styles.toolIcon}>🗑️</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Brush size slider - shown when tapped */}
      {showBrushSlider && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Fırça Boyutu: {brushSizeValue}px</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderMinMax}>4</Text>
            <View style={styles.sliderWrapper}>
              <View
                style={[
                  styles.sliderPreview,
                  { width: brushSizeValue, height: brushSizeValue, backgroundColor: selectedColor }
                ]}
              />
            </View>
            <Text style={styles.sliderMinMax}>24</Text>
          </View>
          <View style={styles.brushSizeButtons}>
            <TouchableOpacity
              style={[styles.sizeButton, brushSize === 'small' && styles.activeSizeButton]}
              onPress={() => { onBrushSizeSelect('small'); setShowBrushSlider(false); }}
            >
              <View style={[styles.sizeDot, { width: 8, height: 8 }]} />
              <Text style={styles.sizeButtonText}>İnce</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sizeButton, brushSize === 'medium' && styles.activeSizeButton]}
              onPress={() => { onBrushSizeSelect('medium'); setShowBrushSlider(false); }}
            >
              <View style={[styles.sizeDot, { width: 16, height: 16 }]} />
              <Text style={styles.sizeButtonText}>Orta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sizeButton, brushSize === 'large' && styles.activeSizeButton]}
              onPress={() => { onBrushSizeSelect('large'); setShowBrushSlider(false); }}
            >
              <View style={[styles.sizeDot, { width: 24, height: 24 }]} />
              <Text style={styles.sizeButtonText}>Kalın</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Extended Color picker panel */}
      {showColorPicker && (
        <View style={styles.pickerPanel}>
          <ColorPalette
            selectedColor={selectedColor}
            onColorSelect={(color) => {
              onColorSelect(color);
              setShowColorPicker(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    ...shadows.medium,
    overflow: 'hidden',
  },
  // Quick color bar
  quickColorBar: {
    backgroundColor: colors.backgroundLight,
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickColorContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickColorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: spacing.xs,
  },
  whiteColorBorder: {
    borderColor: colors.border,
  },
  selectedColor: {
    borderColor: colors.primary,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  moreColorsButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreColorsText: {
    fontSize: 20,
    fontWeight: typography.fontWeightBold,
    color: colors.textSecondary,
  },
  // Main toolbar
  mainToolbar: {
    maxHeight: 60,
  },
  mainToolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  // Brush size button
  brushSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: spacing.radiusMedium,
  },
  brushPreview: {
    borderRadius: 50,
    marginRight: spacing.xs,
  },
  brushSizeLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  // Tools
  toolButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusSmall,
  },
  activeButton: {
    backgroundColor: colors.primaryLight,
  },
  toolIcon: {
    fontSize: 24,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  clearButton: {
    backgroundColor: colors.errorLight,
  },
  // Divider
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  // Slider
  sliderContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sliderLabel: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sliderMinMax: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  sliderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  sliderPreview: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brushSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sizeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.radiusMedium,
    backgroundColor: colors.backgroundLight,
  },
  activeSizeButton: {
    backgroundColor: colors.primaryLight,
  },
  sizeDot: {
    backgroundColor: colors.text,
    borderRadius: 50,
    marginBottom: spacing.xs,
  },
  sizeButtonText: {
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
  // Color picker panel
  pickerPanel: {
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export const Toolbar = memo(ToolbarComponent);
