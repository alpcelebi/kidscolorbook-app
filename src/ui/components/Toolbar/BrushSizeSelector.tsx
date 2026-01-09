import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, shadows, typography } from '../../theme';
import { BRUSH_SIZES, type BrushSize } from '../../../features/drawing/store/drawingStore';

interface BrushSizeSelectorProps {
  selectedSize: BrushSize;
  onSizeSelect: (size: BrushSize) => void;
  currentColor: string;
}

const SIZES: BrushSize[] = ['small', 'medium', 'large'];

function BrushSizeSelectorComponent({
  selectedSize,
  onSizeSelect,
  currentColor,
}: BrushSizeSelectorProps) {
  const { t } = useTranslation();

  const sizeLabels: Record<BrushSize, string> = {
    small: t('tools.small'),
    medium: t('tools.medium'),
    large: t('tools.large'),
  };

  return (
    <View style={styles.container}>
      {SIZES.map((size) => {
        const isSelected = size === selectedSize;
        const brushWidth = BRUSH_SIZES[size];

        return (
          <TouchableOpacity
            key={size}
            style={[styles.sizeButton, isSelected && styles.selectedButton]}
            onPress={() => onSizeSelect(size)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={sizeLabels[size]}
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.previewContainer}>
              <View
                style={[
                  styles.brushPreview,
                  {
                    width: brushWidth,
                    height: brushWidth,
                    backgroundColor: isSelected ? currentColor : colors.textSecondary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {sizeLabels[size]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.small,
  },
  sizeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.radiusSmall,
    backgroundColor: colors.backgroundLight,
  },
  selectedButton: {
    backgroundColor: colors.primaryLight,
  },
  previewContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brushPreview: {
    borderRadius: 999,
  },
  label: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  labelSelected: {
    color: colors.text,
    fontWeight: typography.fontWeightBold,
  },
});

export const BrushSizeSelector = memo(BrushSizeSelectorComponent);

