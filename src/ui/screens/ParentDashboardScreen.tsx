import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, shadows } from '../theme';
import { BannerAd } from '../components';
import { useParentalControlsStore } from '../../features/parental-controls/store/parentalControlsStore';
import type { RootStackParamList } from '../../navigation/types';

type ParentDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ParentDashboard'>;

const TIME_LIMIT_OPTIONS = [null, 15, 30, 45, 60, 90, 120];
const BREAK_REMINDER_OPTIONS = [null, 15, 20, 30, 45, 60];

export function ParentDashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ParentDashboardNavigationProp>();

  const {
    controls,
    stats,
    isLoading,
    loadControls,
    loadStats,
    updateDailyLimit,
    updateBreakReminder,
    updateSleepTime,
    updateSoundsEnabled,
  } = useParentalControlsStore();

  useEffect(() => {
    loadControls();
    loadStats();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}${t('common.hours')} ${minutes}${t('common.minutes')}`;
    }
    return `${minutes} ${t('common.minutes')}`;
  };

  const formatMinutes = (minutes: number | null): string => {
    if (minutes === null) return t('parentDashboard.noLimit');
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('parentDashboard.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Usage Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('parentDashboard.usageStats')}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>
                {stats ? formatTime(stats.todayUsage?.totalTimeSeconds ?? 0) : '0m'}
              </Text>
              <Text style={styles.statLabel}>{t('parentDashboard.todayUsage')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>
                {stats ? formatTime(stats.weekUsage.reduce((sum, s) => sum + s.totalTimeSeconds, 0)) : '0m'}
              </Text>
              <Text style={styles.statLabel}>{t('parentDashboard.weekUsage')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎨</Text>
              <Text style={styles.statValue}>{stats?.totalDrawings ?? 0}</Text>
              <Text style={styles.statLabel}>{t('parentDashboard.totalDrawings')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📄</Text>
              <Text style={styles.statValue}>{stats?.totalPagesCompleted ?? 0}</Text>
              <Text style={styles.statLabel}>{t('parentDashboard.pagesCompleted')}</Text>
            </View>
          </View>
        </View>

        {/* Favorite Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('parentDashboard.favoriteColors')}</Text>
          <View style={styles.colorsRow}>
            {stats?.favoriteColors.map((colorUsage, index) => (
              <View key={colorUsage.color} style={styles.colorItem}>
                <View style={[styles.colorCircle, { backgroundColor: colorUsage.color }]} />
                <Text style={styles.colorCount}>{colorUsage.usageCount}×</Text>
              </View>
            ))}
            {(!stats?.favoriteColors || stats.favoriteColors.length === 0) && (
              <Text style={styles.emptyText}>-</Text>
            )}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('parentDashboard.achievements')}</Text>
          <View style={styles.achievementSummary}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <Text style={styles.achievementCount}>
              {stats?.unlockedAchievements ?? 0} / {stats?.achievements.length ?? 0}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('parentDashboard.progress')}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>{t('parentDashboard.avgSession')}</Text>
              <Text style={styles.progressValue}>
                {stats ? formatTime(stats.averageSessionDuration) : '-'}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>{t('parentDashboard.lastActivity')}</Text>
              <Text style={styles.progressValue}>
                {stats?.lastActivityDate ?? '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Time Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('parentDashboard.timeControls')}</Text>

          {/* Daily Limit */}
          <View style={styles.controlCard}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlTitle}>{t('parentDashboard.dailyLimit')}</Text>
              <Text style={styles.controlHint}>{t('parentDashboard.dailyLimitHint')}</Text>
            </View>
            <View style={styles.optionsRow}>
              {TIME_LIMIT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option?.toString() ?? 'none'}
                  style={[
                    styles.optionButton,
                    controls?.dailyLimitMinutes === option && styles.optionButtonActive,
                  ]}
                  onPress={() => updateDailyLimit(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      controls?.dailyLimitMinutes === option && styles.optionTextActive,
                    ]}
                  >
                    {formatMinutes(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Break Reminder */}
          <View style={styles.controlCard}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlTitle}>{t('parentDashboard.breakReminder')}</Text>
              <Text style={styles.controlHint}>{t('parentDashboard.breakReminderHint')}</Text>
            </View>
            <View style={styles.optionsRow}>
              {BREAK_REMINDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option?.toString() ?? 'none'}
                  style={[
                    styles.optionButton,
                    controls?.breakReminderMinutes === option && styles.optionButtonActive,
                  ]}
                  onPress={() => updateBreakReminder(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      controls?.breakReminderMinutes === option && styles.optionTextActive,
                    ]}
                  >
                    {formatMinutes(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep Time */}
          <View style={styles.controlCard}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlTitle}>{t('parentDashboard.sleepTime')}</Text>
              <Text style={styles.controlHint}>{t('parentDashboard.sleepTimeHint')}</Text>
            </View>
            <View style={styles.sleepTimeRow}>
              <TouchableOpacity
                style={[
                  styles.sleepTimeButton,
                  controls?.sleepTimeStart && styles.sleepTimeButtonActive,
                ]}
                onPress={() => {
                  if (controls?.sleepTimeStart) {
                    updateSleepTime(null, null);
                  } else {
                    updateSleepTime('21:00', '07:00');
                  }
                }}
              >
                <Text style={styles.sleepTimeIcon}>🌙</Text>
                <Text style={styles.sleepTimeText}>
                  {controls?.sleepTimeStart
                    ? `${controls.sleepTimeStart} - ${controls.sleepTimeEnd}`
                    : t('parentDashboard.noLimit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sounds */}
          <View style={styles.controlCard}>
            <View style={styles.soundsRow}>
              <View>
                <Text style={styles.controlTitle}>{t('settings.sounds')}</Text>
                <Text style={styles.controlHint}>{t('settings.soundsHint')}</Text>
              </View>
              <Switch
                value={controls?.soundsEnabled ?? true}
                onValueChange={updateSoundsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={controls?.soundsEnabled ? colors.primary : colors.textLight}
              />
            </View>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    ...shadows.small,
  },
  colorItem: {
    alignItems: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorCount: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSizeMd,
    color: colors.textLight,
  },
  achievementSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    ...shadows.small,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  achievementCount: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    ...shadows.small,
  },
  progressLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressValue: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  controlCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  controlHeader: {
    marginBottom: spacing.sm,
  },
  controlTitle: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
  },
  controlHint: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusSmall,
    backgroundColor: colors.backgroundLight,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  optionTextActive: {
    color: colors.textOnPrimary,
  },
  sleepTimeRow: {
    marginTop: spacing.sm,
  },
  sleepTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: spacing.radiusMedium,
  },
  sleepTimeButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  sleepTimeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  sleepTimeText: {
    fontSize: typography.fontSizeMd,
    color: colors.text,
  },
  soundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

