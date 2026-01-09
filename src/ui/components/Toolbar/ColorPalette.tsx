import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, shadows } from '../../theme';
import { DEFAULT_COLORS } from '../../../features/drawing/store/drawingStore';

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  customColors?: string[];
}

function ColorPaletteComponent({
  selectedColor,
  onColorSelect,
  customColors,
}: ColorPaletteProps) {
  const paletteColors = customColors ?? DEFAULT_COLORS;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {paletteColors.map((color) => {
          const isSelected = color === selectedColor;
          const isWhite = color === '#FFFFFF';

          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                isWhite && styles.whiteColor,
                isSelected && styles.selectedColor,
              ]}
              onPress={() => onColorSelect(color)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Color ${color}`}
              accessibilityState={{ selected: isSelected }}
            >
              {isSelected && (
                <View style={[styles.checkmark, isWhite && styles.checkmarkDark]}>
                  <View style={styles.checkmarkInner} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.sm,
    ...shadows.small,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  whiteColor: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedColor: {
    transform: [{ scale: 1.1 }],
    borderWidth: 3,
    borderColor: colors.text,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  checkmarkInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});

export const ColorPalette = memo(ColorPaletteComponent);

