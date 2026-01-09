import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sharing from 'expo-sharing';

import { colors, spacing, typography, shadows } from '../theme';
import { ArtworkCard, Button, ParentalGateModal, BannerAd } from '../components';
import { useGalleryStore } from '../../features/gallery/store/galleryStore';
import { useParentalGate } from '../../features/parental-gate/hooks/useParentalGate';
import { FileStorageService } from '../../data/storage/FileStorageService';
import type { Artwork, ArtworkType } from '../../domain/entities/Artwork';
import type { RootStackParamList } from '../../navigation/types';

type GalleryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Gallery'>;
type FilterType = 'all' | ArtworkType;

export function GalleryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<GalleryNavigationProp>();

  const { artworks, filter, isLoading, loadArtworks, setFilter, deleteArtwork, updateArtwork } =
    useGalleryStore();

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState('');
  const [pendingAction, setPendingAction] = useState<'share' | 'delete' | null>(null);

  const parentalGate = useParentalGate({
    onSuccess: () => {
      if (pendingAction === 'share' && selectedArtwork) {
        handleShare(selectedArtwork);
      } else if (pendingAction === 'delete' && selectedArtwork) {
        confirmDelete(selectedArtwork);
      }
      setPendingAction(null);
    },
    onCancel: () => {
      setPendingAction(null);
    },
  });

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleArtworkPress = (artwork: Artwork) => {
    if (artwork.type === 'freedraw') {
      navigation.navigate('FreeDraw', { artworkId: artwork.id });
    } else {
      navigation.navigate('ColoringPage', { pageId: artwork.pageId! });
    }
  };

  const handleArtworkLongPress = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setShowActions(true);
  };

  const handleShare = async (artwork: Artwork) => {
    try {
      if (artwork.imagePath) {
        const uri = FileStorageService.getImageUri(artwork.imagePath);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      } else {
        Alert.alert(t('gallery.export'), t('errors.exportFailed'));
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
    setShowActions(false);
  };

  const confirmDelete = (artwork: Artwork) => {
    Alert.alert(t('gallery.delete'), t('gallery.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteArtwork(artwork.id);
          setShowActions(false);
        },
      },
    ]);
  };

  const handleDeletePress = () => {
    if (selectedArtwork) {
      setPendingAction('delete');
      parentalGate.show();
    }
  };

  const handleSharePress = () => {
    if (selectedArtwork) {
      setPendingAction('share');
      parentalGate.show();
    }
  };

  const handleRename = async () => {
    if (selectedArtwork && newName.trim()) {
      await updateArtwork(selectedArtwork.id, newName.trim());
      setShowRename(false);
      setShowActions(false);
      setNewName('');
    }
  };

  const filteredArtworks =
    filter === 'all' ? artworks : artworks.filter((a) => a.type === filter);

  const renderArtwork = ({ item }: { item: Artwork }) => (
    <ArtworkCard
      artwork={item}
      onPress={() => handleArtworkPress(item)}
      onLongPress={() => handleArtworkLongPress(item)}
    />
  );

  const FilterButton = ({ type, label }: { type: FilterType; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.filterButtonActive]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('gallery.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <FilterButton type="all" label={t('gallery.all')} />
        <FilterButton type="coloring" label={t('gallery.coloringArt')} />
        <FilterButton type="freedraw" label={t('gallery.freeDrawArt')} />
      </View>

      {/* Gallery grid */}
      <FlatList
        data={filteredArtworks}
        renderItem={renderArtwork}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>{t('gallery.empty')}</Text>
            <Text style={styles.emptyHint}>{t('gallery.emptyHint')}</Text>
          </View>
        }
      />

      {/* Actions modal */}
      <Modal visible={showActions} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsContent}>
            <Text style={styles.actionsTitle}>{selectedArtwork?.name}</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setNewName(selectedArtwork?.name ?? '');
                setShowRename(true);
              }}
            >
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionText}>{t('gallery.rename')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSharePress}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>{t('gallery.share')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteAction]}
              onPress={handleDeletePress}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={[styles.actionText, styles.deleteText]}>{t('gallery.delete')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename modal */}
      <Modal visible={showRename} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.renameContent}>
            <Text style={styles.renameTitle}>{t('gallery.rename')}</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.renameButtons}>
              <Button
                title={t('common.cancel')}
                onPress={() => setShowRename(false)}
                variant="outline"
              />
              <Button title={t('common.save')} onPress={handleRename} variant="primary" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Parental gate */}
      <ParentalGateModal
        visible={parentalGate.isVisible}
        question={parentalGate.question}
        userAnswer={parentalGate.userAnswer}
        isWrong={parentalGate.isWrong}
        holdProgress={parentalGate.holdProgress}
        isHolding={parentalGate.isHolding}
        onAnswerChange={parentalGate.setAnswer}
        onSubmit={parentalGate.submitAnswer}
        onHoldStart={parentalGate.startHold}
        onHoldEnd={parentalGate.endHold}
        onClose={parentalGate.hide}
      />

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
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    lineHeight: 28,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusRound,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  filterTextActive: {
    color: colors.textOnPrimary,
  },
  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  actionsContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radiusXLarge,
    borderTopRightRadius: spacing.radiusXLarge,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  actionsTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.radiusMedium,
    backgroundColor: colors.backgroundLight,
    marginBottom: spacing.sm,
  },
  deleteAction: {
    backgroundColor: colors.errorLight,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  actionText: {
    fontSize: typography.fontSizeMd,
    color: colors.text,
    fontWeight: typography.fontWeightMedium,
  },
  deleteText: {
    color: colors.error,
  },
  renameContent: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    padding: spacing.lg,
    marginTop: 'auto',
    marginBottom: 'auto',
    ...shadows.large,
  },
  renameTitle: {
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
  renameButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
});

