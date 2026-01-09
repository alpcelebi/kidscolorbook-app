import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../theme';
import { Button } from '../Button';
import type { MathQuestion } from '../../../features/parental-gate/utils/mathQuestion';

interface ParentalGateModalProps {
  visible: boolean;
  question: MathQuestion;
  userAnswer: string;
  isWrong: boolean;
  holdProgress: number;
  isHolding: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  onClose: () => void;
}

function ParentalGateModalComponent({
  visible,
  question,
  userAnswer,
  isWrong,
  holdProgress,
  isHolding,
  onAnswerChange,
  onSubmit,
  onHoldStart,
  onHoldEnd,
  onClose,
}: ParentalGateModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>{t('parentalGate.title')}</Text>
                  <Text style={styles.description}>{t('parentalGate.description')}</Text>
                </View>

                {/* Math question */}
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{question.display}</Text>
                  <TextInput
                    style={[styles.input, isWrong && styles.inputError]}
                    value={userAnswer}
                    onChangeText={onAnswerChange}
                    keyboardType="number-pad"
                    placeholder={t('parentalGate.placeholder')}
                    placeholderTextColor={colors.textLight}
                    autoFocus
                    maxLength={4}
                  />
                  {isWrong && <Text style={styles.errorText}>{t('parentalGate.wrongAnswer')}</Text>}
                  <Button
                    title={t('common.ok')}
                    onPress={onSubmit}
                    variant="primary"
                    fullWidth
                    disabled={!userAnswer.trim()}
                  />
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('parentalGate.or')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Hold button */}
                <View style={styles.holdContainer}>
                  <TouchableOpacity
                    style={styles.holdButton}
                    onPressIn={onHoldStart}
                    onPressOut={onHoldEnd}
                    activeOpacity={0.9}
                  >
                    <View style={styles.holdButtonInner}>
                      <View
                        style={[
                          styles.holdProgress,
                          { width: `${holdProgress * 100}%` },
                        ]}
                      />
                      <Text style={styles.holdButtonText}>
                        {isHolding
                          ? t('parentalGate.holding')
                          : t('parentalGate.holdButton')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusXLarge,
    padding: spacing.lg,
    ...shadows.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  questionContainer: {
    alignItems: 'center',
  },
  questionText: {
    fontSize: typography.fontSizeTitle,
    fontWeight: typography.fontWeightBold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSizeXl,
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.backgroundLight,
    marginBottom: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    fontSize: typography.fontSizeSm,
    color: colors.error,
    marginBottom: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  holdContainer: {
    alignItems: 'center',
  },
  holdButton: {
    width: '100%',
    height: 60,
    borderRadius: spacing.radiusMedium,
    overflow: 'hidden',
    backgroundColor: colors.secondary,
  },
  holdButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  holdProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.success,
  },
  holdButtonText: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.textOnSecondary,
    zIndex: 1,
  },
  closeButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
  },
});

export const ParentalGateModal = memo(ParentalGateModalComponent);

