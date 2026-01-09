import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * AdMob Reklam Konfigürasyonu
 * 
 * TEST MODUNDA: Google'ın test ID'leri kullanılıyor
 * 
 * ÜRETIM İÇİN:
 * 1. AdMob hesabından gerçek Ad Unit ID'lerinizi alın
 * 2. Aşağıdaki PRODUCTION_AD_UNITS objesindeki ID'leri değiştirin
 * 3. __DEV__ kontrolü sayesinde development'ta test ID'ler kullanılmaya devam eder
 */

// Üretim için gerçek Ad Unit ID'leri buraya ekleyin
const PRODUCTION_AD_UNITS = {
    android: {
        banner: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Buraya gerçek Android Banner ID
        interstitial: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Buraya gerçek Android Interstitial ID
        rewarded: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Buraya gerçek Android Rewarded ID
    },
    ios: {
        banner: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Buraya gerçek iOS Banner ID
        interstitial: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Buraya gerçek iOS Interstitial ID
        rewarded: 'ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX', // Buraya gerçek iOS Rewarded ID
    },
};

// Banner Reklam ID
export const BANNER_AD_UNIT_ID = __DEV__
    ? TestIds.BANNER // Test ID
    : Platform.select({
        android: PRODUCTION_AD_UNITS.android.banner,
        ios: PRODUCTION_AD_UNITS.ios.banner,
    }) ?? TestIds.BANNER;

// Interstitial (Tam Ekran) Reklam ID
export const INTERSTITIAL_AD_UNIT_ID = __DEV__
    ? TestIds.INTERSTITIAL // Test ID
    : Platform.select({
        android: PRODUCTION_AD_UNITS.android.interstitial,
        ios: PRODUCTION_AD_UNITS.ios.interstitial,
    }) ?? TestIds.INTERSTITIAL;

// Rewarded (Ödüllü) Reklam ID
export const REWARDED_AD_UNIT_ID = __DEV__
    ? TestIds.REWARDED // Test ID
    : Platform.select({
        android: PRODUCTION_AD_UNITS.android.rewarded,
        ios: PRODUCTION_AD_UNITS.ios.rewarded,
    }) ?? TestIds.REWARDED;

// Reklam ayarları
export const AD_CONFIG = {
    // Kaç boyama tamamlandıktan sonra interstitial gösterilecek
    interstitialShowAfterCount: 3,
    // Reklam anahtar kelimeleri (çocuk uygulaması için uygun)
    keywords: ['kids', 'children', 'coloring', 'art', 'drawing', 'games', 'education'],
    // Kişiselleştirilmemiş reklamlar
    requestNonPersonalizedAdsOnly: true,
};
