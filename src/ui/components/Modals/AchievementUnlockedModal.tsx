import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../theme';
import type { Achievement } from '../../../data/repositories/AchievementsRepository';

interface AchievementUnlockedModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onDismiss: () => void;
}

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

export function AchievementUnlockedModal({
  visible,
  achievement,
  onDismiss,
}: AchievementUnlockedModalProps) {
  const { t } = useTranslation();

  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      rotate.value = withSequence(
        withSpring(-10),
        withSpring(10),
        withSpring(-5),
        withSpring(5),
        withSpring(0)
      );
      opacity.value = withDelay(200, withSpring(1));
    } else {
      scale.value = 0;
      rotate.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!achievement) return null;

  const icon = ACHIEVEMENT_ICONS[achievement.achievementKey] ?? '🏆';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.celebrationTop}>🎉 🎊 🎉</Text>

          <Animated.View style={iconStyle}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          </Animated.View>

          <Animated.View style={contentStyle}>
            <Text style={styles.unlocked}>{t('achievements.unlocked')}!</Text>
            <Text style={styles.title}>
              {t(`achievements.${achievement.achievementKey}`)}
            </Text>
            <Text style={styles.description}>
              {t(`achievements.${achievement.achievementKey}Desc`)}
            </Text>
          </Animated.View>

          <Text style={styles.celebrationBottom}>✨ 🌟 ✨</Text>

          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>{t('common.ok')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusXLarge,
    padding: spacing.xl,
    margin: spacing.lg,
    alignItems: 'center',
    ...shadows.large,
  },
  celebrationTop: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 52,
  },
  unlocked: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightBold,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  celebrationBottom: {
    fontSize: 24,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: spacing.radiusRound,
  },
  buttonText: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
});

