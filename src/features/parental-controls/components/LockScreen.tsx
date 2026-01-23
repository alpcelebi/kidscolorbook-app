import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../../ui/theme';
import { useParentalGate } from '../../parental-gate/hooks/useParentalGate';
import { ParentalGateModal } from '../../../ui/components/ParentalGate/ParentalGateModal';

interface LockScreenProps {
    visible: boolean;
    reason: 'daily_limit' | 'sleep_time' | null;
    remainingTime: string | null;
    onUnlockAttempt: () => void;
}

export function LockScreen({ visible, reason, remainingTime, onUnlockAttempt }: LockScreenProps) {
    const { t } = useTranslation();

    const parentalGate = useParentalGate({
        onSuccess: onUnlockAttempt,
    });

    if (!visible) return null;

    return (
        <View style={styles.fullscreenContainer}>
            <View style={styles.content}>
                <Text style={styles.icon}>
                    {reason === 'sleep_time' ? '🌙' : '⏳'}
                </Text>

                <Text style={styles.title}>
                    {reason === 'sleep_time'
                        ? t('parentDashboard.sleepTimeLockTitle', 'Sleep Time!')
                        : t('parentDashboard.timeLimitLockTitle', 'Time\'s Up!')}
                </Text>

                <Text style={styles.message}>
                    {reason === 'sleep_time'
                        ? t('parentDashboard.sleepTimeLockMessage', 'It\'s time to rest now. Come back tomorrow!')
                        : t('parentDashboard.timeLimitLockMessage', 'You have reached your daily limit for today.')}
                </Text>

                {reason === 'sleep_time' && remainingTime && (
                    <Text style={styles.timer}>
                        {t('parentDashboard.unlocksIn', 'Unlocks in')}: {remainingTime}
                    </Text>
                )}

                <TouchableOpacity style={styles.parentButton} onPress={parentalGate.show}>
                    <Text style={styles.parentButtonText}>
                        {t('parentDashboard.parentUnlock', 'Parent Unlock')} 🔓
                    </Text>
                </TouchableOpacity>
            </View>

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
        </View>
    );
}

const styles = StyleSheet.create({
    fullscreenContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99999,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    content: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: spacing.radiusLarge,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        ...shadows.large,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSizeXl,
        fontWeight: typography.fontWeightBold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    message: {
        fontSize: typography.fontSizeMd,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    timer: {
        fontSize: typography.fontSizeMd,
        fontWeight: typography.fontWeightBold,
        color: colors.primary,
        marginBottom: spacing.xl,
    },
    parentButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.background,
        borderRadius: spacing.radiusMedium,
        borderWidth: 2,
        borderColor: colors.border,
    },
    parentButtonText: {
        fontSize: typography.fontSizeMd,
        fontWeight: typography.fontWeightSemibold,
        color: colors.textSecondary,
    },
});
