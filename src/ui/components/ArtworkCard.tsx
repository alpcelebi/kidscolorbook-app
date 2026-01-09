import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { colors, spacing, typography, shadows } from '../theme';
import { FileStorageService } from '../../data/storage/FileStorageService';
import type { Artwork } from '../../domain/entities/Artwork';

interface ArtworkCardProps {
  artwork: Artwork;
  onPress: () => void;
  onLongPress?: () => void;
}

function ArtworkCardComponent({ artwork, onPress, onLongPress }: ArtworkCardProps) {
  const thumbnailUri = artwork.thumbnailPath
    ? FileStorageService.getImageUri(artwork.thumbnailPath)
    : null;

  const typeIcons: Record<string, string> = {
    coloring: '🎨',
    freedraw: '✏️',
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={artwork.name}
    >
      <View style={styles.preview}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholderIcon}>{typeIcons[artwork.type] || '🖼️'}</Text>
        )}
        {artwork.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteIcon}>❤️</Text>
          </View>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{typeIcons[artwork.type]}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {artwork.name}
        </Text>
        <Text style={styles.date}>{formatDate(artwork.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    overflow: 'hidden',
    width: '48%',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.overlay,
    borderRadius: spacing.radiusSmall,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeIcon: {
    fontSize: 14,
  },
  info: {
    padding: spacing.sm,
  },
  name: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
    marginBottom: 2,
  },
  date: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
});

export const ArtworkCard = memo(ArtworkCardComponent);

