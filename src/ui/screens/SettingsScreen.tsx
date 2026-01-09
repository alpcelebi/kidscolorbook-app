import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, shadows } from '../theme';
import { Button, ParentalGateModal, BannerAd } from '../components';
import { useSettingsStore } from '../../features/settings/store/settingsStore';
import { useGalleryStore } from '../../features/gallery/store/galleryStore';
import { useParentalGate } from '../../features/parental-gate/hooks/useParentalGate';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS, type SupportedLanguage } from '../../i18n';
import type { RootStackParamList } from '../../navigation/types';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsNavigationProp>();

  const { settings, setLanguage } = useSettingsStore();
  const { deleteAllArtworks } = useGalleryStore();

  const deleteGate = useParentalGate({
    onSuccess: () => {
      confirmDeleteAll();
    },
  });

  const dashboardGate = useParentalGate({
    onSuccess: () => {
      navigation.navigate('ParentDashboard');
    },
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLanguageSelect = async (language: SupportedLanguage) => {
    try {
      await setLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleDeleteAllPress = () => {
    deleteGate.show();
  };

  const handleParentDashboardPress = () => {
    dashboardGate.show();
  };

  const handleAchievementsPress = () => {
    navigation.navigate('Achievements');
  };

  const confirmDeleteAll = () => {
    Alert.alert(t('settings.deleteAll'), t('settings.deleteAllConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAllArtworks();
          Alert.alert(t('common.success'), t('settings.deleteAllSuccess'));
        },
      },
    ]);
  };

  const currentLanguage = settings?.language || 'tr';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Language section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <Text style={styles.sectionHint}>{t('settings.languageHint')}</Text>

          <View style={styles.languageOptions}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.languageButton, isSelected && styles.languageButtonSelected]}
                  onPress={() => handleLanguageSelect(lang)}
                >
                  <Text style={styles.languageFlag}>{LANGUAGE_FLAGS[lang]}</Text>
                  <Text
                    style={[styles.languageText, isSelected && styles.languageTextSelected]}
                  >
                    {LANGUAGE_NAMES[lang]}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleAchievementsPress}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🏆</Text>
              <Text style={styles.menuItemText}>{t('achievements.title')}</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Parental Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.parentalControls')}</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleParentDashboardPress}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>👨‍👩‍👧</Text>
              <Text style={styles.menuItemText}>{t('settings.parentDashboard')}</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>KidsColorBook</Text>
            <Text style={styles.version}>{t('settings.version')} 2.0.0</Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>⚠️</Text>
            <Button
              title={t('settings.deleteAll')}
              onPress={handleDeleteAllPress}
              variant="outline"
              fullWidth
              textStyle={styles.deleteButtonText}
              style={styles.deleteButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Parental gates */}
      <ParentalGateModal
        visible={deleteGate.isVisible}
        question={deleteGate.question}
        userAnswer={deleteGate.userAnswer}
        isWrong={deleteGate.isWrong}
        holdProgress={deleteGate.holdProgress}
        isHolding={deleteGate.isHolding}
        onAnswerChange={deleteGate.setAnswer}
        onSubmit={deleteGate.submitAnswer}
        onHoldStart={deleteGate.startHold}
        onHoldEnd={deleteGate.endHold}
        onClose={deleteGate.hide}
      />

      <ParentalGateModal
        visible={dashboardGate.isVisible}
        question={dashboardGate.question}
        userAnswer={dashboardGate.userAnswer}
        isWrong={dashboardGate.isWrong}
        holdProgress={dashboardGate.holdProgress}
        isHolding={dashboardGate.isHolding}
        onAnswerChange={dashboardGate.setAnswer}
        onSubmit={dashboardGate.submitAnswer}
        onHoldStart={dashboardGate.startHold}
        onHoldEnd={dashboardGate.endHold}
        onClose={dashboardGate.hide}
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
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  languageOptions: {
    gap: spacing.sm,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  languageButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  languageText: {
    flex: 1,
    fontSize: typography.fontSizeMd,
    color: colors.text,
    fontWeight: typography.fontWeightMedium,
  },
  languageTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    ...shadows.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  menuItemText: {
    fontSize: typography.fontSizeMd,
    color: colors.text,
    fontWeight: typography.fontWeightMedium,
  },
  menuItemArrow: {
    fontSize: 24,
    color: colors.textLight,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  appName: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  dangerZone: {
    backgroundColor: colors.errorLight,
    borderRadius: spacing.radiusMedium,
    padding: spacing.lg,
    alignItems: 'center',
  },
  dangerTitle: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
});
