import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../theme';

interface BreakReminderModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function BreakReminderModal({ visible, onDismiss }: BreakReminderModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>🏃‍♂️</Text>
          <Text style={styles.title}>{t('parentDashboard.breakTime')}</Text>
          <Text style={styles.message}>{t('parentDashboard.breakTimeMsg')}</Text>

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
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: spacing.radiusRound,
  },
  buttonText: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.textOnPrimary,
  },
});

