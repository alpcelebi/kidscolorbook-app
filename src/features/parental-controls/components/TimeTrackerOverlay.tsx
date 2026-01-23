import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows } from '../../../ui/theme';
import { useParentalControlsStore } from '../store/parentalControlsStore';

export function TimeTrackerOverlay() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { controls, remainingTime } = useParentalControlsStore();

    // If we are in Parent Dashboard, maybe we should hide this? 
    // But strictly speaking, it should be visible everywhere "user experience permitting".

    const hasLimit = controls?.dailyLimitMinutes !== null && controls?.dailyLimitMinutes !== undefined;

    const formatTime = (seconds: number | string | null) => {
        if (seconds === null || seconds === undefined) return '00:00';
        // Check if already formatted string (HH:MM) just in case
        if (typeof seconds === 'string' && seconds.includes(':')) return seconds;

        const numSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
        if (isNaN(numSeconds)) return '00:00';

        const m = Math.floor(numSeconds / 60);
        const s = numSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container, { top: insets.top + spacing.xs }]}>
            <View style={styles.badge}>
                <Text style={styles.icon}>⏱️</Text>
                <Text style={styles.text}>
                    {hasLimit
                        ? `${t('parentDashboard.timeRemaining')}: ${formatTime(remainingTime)}`
                        : t('parentDashboard.noTimeLimit')
                    }
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 70,
        zIndex: 9999,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    icon: {
        fontSize: 14,
        marginRight: 4,
    },
    text: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'], // Fixed width numbers
    },
});
