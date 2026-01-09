import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows, getCategoryColor } from '../theme';
import type { CategoryWithPages } from '../../domain/entities/Category';

interface CategoryCardProps {
  category: CategoryWithPages;
  onPress: () => void;
}

function CategoryCardComponent({ category, onPress }: CategoryCardProps) {
  const { t } = useTranslation();
  const categoryColor = getCategoryColor(category.id);

  const iconMap: Record<string, string> = {
    paw: '🐾',
    car: '🚗',
    tree: '🌳',
    shapes: '⭐',
    rocket: '🚀',
    dinosaur: '🦖',
    sea: '🐠',
    food: '🍕',
    fruits: '🍎',
    fantasy: '🦄',
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: categoryColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t(category.nameKey)}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
        <Text style={styles.icon}>{iconMap[category.iconName] || '📁'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t(category.nameKey)}</Text>
        <Text style={styles.subtitle}>
          {t('category.pages', { count: category.pageCount })}
        </Text>
        {category.completedCount > 0 && (
          <Text style={styles.progress}>
            {t('category.completed', { count: category.completedCount })}
          </Text>
        )}
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.small,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  progress: {
    fontSize: typography.fontSizeXs,
    color: colors.success,
    marginTop: spacing.xs,
  },
  arrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    color: colors.textLight,
    fontWeight: typography.fontWeightBold,
  },
});

export const CategoryCard = memo(CategoryCardComponent);

