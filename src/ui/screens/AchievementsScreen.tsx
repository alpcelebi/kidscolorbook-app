import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, shadows } from '../theme';
import { BannerAd } from '../components';
import { useAchievementsStore } from '../../features/achievements/store/achievementsStore';
import type { Achievement } from '../../data/repositories/AchievementsRepository';
import type { RootStackParamList } from '../../navigation/types';

type AchievementsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Achievements'>;

const ACHIEVEMENT_ICONS: Record<string, string> = {
  firstDrawing: '🎨',
  colorMaster: '🌈',
  dailyArtist: '📅',
  pageComplete: '✅',
  tenPages: '🔟',
  categoryMaster: '👑',
  stickerFan: '⭐',
  creativeSoul: '💫',
};

export function AchievementsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AchievementsNavigationProp>();

  const { achievements, isLoading, loadAchievements } = useAchievementsStore();

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderAchievement = (achievement: Achievement) => {
    const icon = ACHIEVEMENT_ICONS[achievement.achievementKey] ?? '🏆';
    const progress = Math.min((achievement.progress / achievement.target) * 100, 100);

    return (
      <View
        key={achievement.id}
        style={[
          styles.achievementCard,
          achievement.unlocked && styles.achievementCardUnlocked,
        ]}
      >
        <View style={[styles.iconContainer, achievement.unlocked && styles.iconContainerUnlocked]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.achievementContent}>
          <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
            {t(`achievements.${achievement.achievementKey}`)}
          </Text>
          <Text style={styles.achievementDesc}>
            {t(`achievements.${achievement.achievementKey}Desc`)}
          </Text>

          {!achievement.unlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress}/{achievement.target}
              </Text>
            </View>
          )}

          {achievement.unlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedText}>{t('achievements.unlocked')} ✓</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('achievements.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryIcon}>🏆</Text>
        <Text style={styles.summaryText}>
          {unlockedCount} / {achievements.length}
        </Text>
      </View>

      {/* Achievements List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {achievements.map(renderAchievement)}
      </ScrollView>

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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  summaryIcon: {
    fontSize: 32,
  },
  summaryText: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    marginBottom: spacing.md,
    opacity: 0.7,
    ...shadows.small,
  },
  achievementCardUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainerUnlocked: {
    backgroundColor: colors.accentLight,
  },
  icon: {
    fontSize: 28,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: 2,
  },
  lockedText: {
    color: colors.textSecondary,
  },
  achievementDesc: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  unlockedBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusSmall,
    alignSelf: 'flex-start',
  },
  unlockedText: {
    fontSize: typography.fontSizeXs,
    color: colors.success,
    fontWeight: typography.fontWeightBold,
  },
});

