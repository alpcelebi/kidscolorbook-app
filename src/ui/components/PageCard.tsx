import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../theme';
import type { PageWithProgress } from '../../domain/entities/Page';
import { hasPng, getPng } from '../../assets/pngRegistry';

interface PageCardProps {
  page: PageWithProgress;
  onPress: () => void;
  size?: 'small' | 'large';
}

// Fallback emoji icons for pages that don't have PNG images
const pageIcons: Record<string, string> = {
  'page-cat': '🐱',
  'page-dog': '🐕',
  'page-elephant': '🐘',
  'page-lion': '🦁',
  'page-rabbit': '🐰',
  'page-butterfly': '🦋',
  'page-bird': '🐦',
  'page-bear': '🐻',
  'page-monkey': '🐵',
  'page-giraffe': '🦒',
  'page-zebra': '🦓',
  'page-horse': '🐴',
  'page-pig': '🐷',
  'page-cow': '🐄',
  'page-sheep': '🐑',
  'page-duck': '🦆',
  'page-fox': '🦊',
  'page-owl': '🦉',
  'page-penguin': '🐧',
  'page-koala': '🐨',
  'page-car': '🚗',
  'page-airplane': '✈️',
  'page-boat': '⛵',
  'page-rocket': '🚀',
  'page-train': '🚂',
  'page-helicopter': '🚁',
  'page-bus': '🚌',
  'page-truck': '🚚',
  'page-bicycle': '🚲',
  'page-motorcycle': '🏍️',
  'page-tractor': '🚜',
  'page-submarine': '🚢',
  'page-hotairballoon': '🎈',
  'page-firetruck': '🚒',
  'page-ambulance': '🚑',
  'page-policecar': '🚓',
  'page-sailboat': '⛵',
  'page-scooter': '🛵',
  'page-excavator': '🚧',
  'page-spaceship': '🛸',
  'page-tree': '🌲',
  'page-flower': '🌸',
  'page-sun': '☀️',
  'page-rainbow': '🌈',
  'page-cloud': '☁️',
  'page-mountain': '🏔️',
  'page-mushroom': '🍄',
  'page-leaf': '🍃',
  'page-rose': '🌹',
  'page-tulip': '🌷',
  'page-sunflower': '🌻',
  'page-moon': '🌙',
  'page-planet': '🪐',
  'page-astronaut': '👨‍🚀',
  'page-alien': '👽',
  'page-satellite': '🛰️',
  'page-star': '⭐',
  'page-heart': '❤️',
  'page-house': '🏠',
  'page-castle': '🏰',
  'page-balloon': '🎈',
  'page-trex': '🦖',
  'page-stego': '🦕',
  'page-bronto': '🦕',
  'page-ptero': '🦅',
  'page-tricera': '🦏',
  'page-fish': '🐟',
  'page-whale': '🐋',
  'page-octopus': '🐙',
  'page-shark': '🦈',
  'page-dolphin': '🐬',
  'page-turtle': '🐢',
  'page-apple': '🍎',
  'page-banana': '🍌',
  'page-strawberry': '🍓',
  'page-orange': '🍊',
  'page-watermelon': '🍉',
  'page-icecream': '🍦',
  'page-cake': '🎂',
  'page-pizza': '🍕',
  'page-burger': '🍔',
  'page-donut': '🍩',
  'page-dragon': '🐉',
  'page-unicorn': '🦄',
  'page-mermaid': '🧜‍♀️',
};

function PageCardComponent({ page, onPress, size = 'large' }: PageCardProps) {
  const { t } = useTranslation();

  const isSmall = size === 'small';
  const hasProgress = !!page.progress;
  const isCompleted = page.progress?.completed ?? false;

  // Check if PNG exists for this page
  const hasPngImage = hasPng(page.svgPath);
  const pngSource = hasPngImage ? getPng(page.svgPath) : null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSmall && styles.containerSmall,
        hasProgress && styles.containerWithProgress,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t(page.nameKey)}
    >
      <View style={[styles.preview, isSmall && styles.previewSmall]}>
        {pngSource ? (
          <Image
            source={pngSource}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={[styles.previewIcon, isSmall && styles.previewIconSmall]}>
            {pageIcons[page.id] || '📄'}
          </Text>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedIcon}>✓</Text>
          </View>
        )}
        {page.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteIcon}>❤️</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, isSmall && styles.titleSmall]} numberOfLines={1}>
        {t(page.nameKey)}
      </Text>

      {hasProgress && !isSmall && (
        <View style={styles.progressIndicator}>
          <View
            style={[
              styles.progressBar,
              { width: isCompleted ? '100%' : '50%' },
              isCompleted && styles.progressBarComplete,
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    padding: spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  containerSmall: {
    width: 100,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
  },
  containerWithProgress: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  previewSmall: {
    marginBottom: spacing.xs,
  },
  previewImage: {
    width: '90%',
    height: '90%',
  },
  previewIcon: {
    fontSize: 48,
  },
  previewIconSmall: {
    fontSize: 32,
  },
  completedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: typography.fontWeightBold,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: typography.fontSizeXs,
  },
  progressIndicator: {
    width: '100%',
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  progressBarComplete: {
    backgroundColor: colors.success,
  },
});

export const PageCard = memo(PageCardComponent);
