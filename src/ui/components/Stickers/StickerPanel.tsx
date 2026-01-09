import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../theme';
import { useStickersStore } from '../../../features/stickers/store/stickersStore';
import {
  STICKER_CATEGORIES,
  getStickersByCategory,
  type StickerCategory,
  type Sticker,
} from '../../../domain/entities/Sticker';

interface StickerPanelProps {
  onStickerSelect?: (sticker: Sticker) => void;
}

function StickerPanelComponent({ onStickerSelect }: StickerPanelProps) {
  const { t } = useTranslation();

  const {
    isPanelOpen,
    selectedCategory,
    selectedSticker,
    closePanel,
    selectCategory,
    selectSticker,
  } = useStickersStore();

  const stickers = getStickersByCategory(selectedCategory);

  const handleStickerPress = (sticker: Sticker) => {
    selectSticker(sticker);
    onStickerSelect?.(sticker);
    closePanel();
  };

  const categoryLabels: Record<StickerCategory, string> = {
    stars: t('stickers.stars'),
    hearts: t('stickers.hearts'),
    animals: t('stickers.animals'),
    emojis: t('stickers.emojis'),
    nature: t('stickers.nature'),
  };

  const categoryIcons: Record<StickerCategory, string> = {
    stars: '⭐',
    hearts: '❤️',
    animals: '🐱',
    emojis: '😊',
    nature: '🌸',
  };

  return (
    <Modal visible={isPanelOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('stickers.title')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {STICKER_CATEGORIES.map((category) => {
              const isSelected = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
                  onPress={() => selectCategory(category)}
                >
                  <Text style={styles.categoryIcon}>{categoryIcons[category]}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelSelected,
                    ]}
                  >
                    {categoryLabels[category]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Stickers grid */}
          <View style={styles.stickersGrid}>
            {stickers.map((sticker) => {
              const isSelected = selectedSticker?.id === sticker.id;
              return (
                <TouchableOpacity
                  key={sticker.id}
                  style={[styles.stickerButton, isSelected && styles.stickerButtonSelected]}
                  onPress={() => handleStickerPress(sticker)}
                >
                  <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            {t('stickers.title')} - Tap to select, then tap on canvas
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radiusXLarge,
    borderTopRightRadius: spacing.radiusXLarge,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  categoriesContainer: {
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusRound,
    backgroundColor: colors.backgroundLight,
    marginRight: spacing.sm,
  },
  categoryTabSelected: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  categoryLabelSelected: {
    color: colors.textOnPrimary,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  stickerButton: {
    width: 60,
    height: 60,
    borderRadius: spacing.radiusMedium,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  stickerButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stickerEmoji: {
    fontSize: 32,
  },
  instructions: {
    textAlign: 'center',
    fontSize: typography.fontSizeXs,
    color: colors.textLight,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

export const StickerPanel = memo(StickerPanelComponent);

