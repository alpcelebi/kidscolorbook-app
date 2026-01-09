import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, shadows } from '../theme';
import { CategoryCard, BannerAd } from '../components';
import { CategoriesRepository } from '../../data/repositories/CategoriesRepository';
import { useParentalGate } from '../../features/parental-gate/hooks/useParentalGate';
import { ParentalGateModal } from '../components/ParentalGate/ParentalGateModal';
import type { CategoryWithPages } from '../../domain/entities/Category';
import type { RootStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [categories, setCategories] = useState<CategoryWithPages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const parentalGate = useParentalGate({
    onSuccess: () => {
      navigation.navigate('Settings');
    },
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await CategoriesRepository.getAllWithPageCounts();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCategories();
  }, [loadCategories]);

  const handleCategoryPress = (category: CategoryWithPages) => {
    navigation.navigate('Category', { categoryId: category.id });
  };

  const handleFreeDrawPress = () => {
    navigation.navigate('FreeDraw', {});
  };

  const handleGalleryPress = () => {
    navigation.navigate('Gallery');
  };

  const handleSettingsPress = () => {
    parentalGate.show();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleFreeDrawPress}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
              <Text style={styles.quickActionEmoji}>✏️</Text>
            </View>
            <Text style={styles.quickActionText}>{t('home.freeDraw')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={handleGalleryPress}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.accent }]}>
              <Text style={styles.quickActionEmoji}>🖼️</Text>
            </View>
            <Text style={styles.quickActionText}>{t('home.gallery')}</Text>
          </TouchableOpacity>
        </View>

        {/* Categories section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.selectCategory')}</Text>

          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Banner Ad */}
      <BannerAd />

      {/* Parental gate modal */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizeTitle,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  settingsIcon: {
    fontSize: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionEmoji: {
    fontSize: 32,
  },
  quickActionText: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
});

