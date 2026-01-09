import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../theme';

interface LockScreenModalProps {
  visible: boolean;
  reason: 'daily_limit' | 'sleep_time' | null;
}

export function LockScreenModal({ visible, reason }: LockScreenModalProps) {
  const { t } = useTranslation();

  const getContent = () => {
    switch (reason) {
      case 'daily_limit':
        return {
          icon: '⏰',
          title: t('parentDashboard.limitReached'),
          message: t('parentDashboard.limitReachedMsg'),
        };
      case 'sleep_time':
        return {
          icon: '🌙',
          title: t('parentDashboard.sleepTimeLocked'),
          message: t('parentDashboard.sleepTimeLockedMsg'),
        };
      default:
        return {
          icon: '🔒',
          title: 'Locked',
          message: '',
        };
    }
  };

  const content = getContent();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>{content.icon}</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>

          {reason === 'sleep_time' && (
            <View style={styles.starsContainer}>
              <Text style={styles.stars}>⭐ 🌟 ✨ 🌟 ⭐</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 112, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusXLarge,
    padding: spacing.xxl,
    margin: spacing.lg,
    alignItems: 'center',
    ...shadows.large,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  starsContainer: {
    marginTop: spacing.xl,
  },
  stars: {
    fontSize: 24,
    letterSpacing: 8,
  },
});

