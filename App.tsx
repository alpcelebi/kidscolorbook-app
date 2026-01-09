import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

import { RootNavigator } from './src/navigation/RootNavigator';
import { initializeI18n } from './src/i18n';
import { DatabaseService } from './src/data/database/DatabaseService';
import { useSettingsStore } from './src/features/settings/store/settingsStore';
import { colors } from './src/ui/theme/colors';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize AdMob SDK
        await mobileAds().setRequestConfiguration({
          // Çocuk uygulaması için uygun içerik derecelendirmesi
          maxAdContentRating: MaxAdContentRating.G,
          // Çocuklara yönelik reklam işleme
          tagForChildDirectedTreatment: true,
          // Kişiselleştirilmemiş reklamlar
          tagForUnderAgeOfConsent: true,
        });
        await mobileAds().initialize();
        console.log('AdMob SDK initialized');

        // Initialize database
        await DatabaseService.initialize();

        // Load settings and initialize i18n
        const settings = await loadSettings();
        await initializeI18n(settings?.language || 'tr');

        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still allow app to load with defaults
        await initializeI18n('tr');
        setIsReady(true);
      }
    };

    initialize();
  }, [loadSettings]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

