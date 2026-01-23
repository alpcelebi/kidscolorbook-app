import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useParentalControlsStore } from '../store/parentalControlsStore';
import { LockScreen } from './LockScreen';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import { TimeTrackerOverlay } from './TimeTrackerOverlay';

export function ParentalControlsManager() {
    const appState = useRef(AppState.currentState);
    const navigation = useNavigation<NavigationProp>();

    // ... (rest of the hooks remain same, skipping to render)
    const {
        controls,
        isLocked,
        lockReason,
        remainingTime,
        startSession,
        endSession,
        checkLockStatus,
        loadControls,

        checkBreakReminder,
        setParentMode,
    } = useParentalControlsStore();

    // Load controls on mount
    useEffect(() => {
        loadControls();
    }, []);

    // Handle App State (Background/Foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground
                startSession();
                checkLockStatus();
            } else if (
                appState.current === 'active' &&
                nextAppState.match(/inactive|background/)
            ) {
                // App went to background
                endSession();
            }

            appState.current = nextAppState;
        });

        // Start initial session if active
        if (appState.current === 'active') {
            startSession();
            checkLockStatus();
        }

        return () => {
            subscription.remove();
            endSession();
        };
    }, []);

    // Periodic Checks (Every 1 minute)
    useEffect(() => {
        const interval = setInterval(() => {
            if (appState.current === 'active') {
                checkLockStatus();
                checkBreakReminder();
            }
        }, 1000); // 1 second

        return () => clearInterval(interval);
    }, []);

    const handleParentUnlock = () => {
        // Unlock immediately and navigate
        setParentMode(true);
        navigation.navigate('ParentDashboard');
    };

    return (
        <>

            <LockScreen
                visible={isLocked}
                reason={lockReason}
                remainingTime={remainingTime ? remainingTime.toString() : null}
                onUnlockAttempt={handleParentUnlock}
            />
        </>
    );
}
