import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
    BannerAd as GoogleBannerAd,
    BannerAdSize
} from 'react-native-google-mobile-ads';
import { colors, spacing, typography } from '../theme';
import { BANNER_AD_UNIT_ID, AD_CONFIG } from '../../config';

interface BannerAdProps {
    // Özel reklam birimi ID'si (opsiyonel - varsayılan test ID'si kullanılır)
    adUnitId?: string;
    // Reklam boyutu (opsiyonel - varsayılan ANCHORED_ADAPTIVE_BANNER)
    size?: BannerAdSize;
}

/**
 * Banner Reklam Komponenti
 * 
 * Google AdMob banner reklamlarını gösterir.
 * Test modunda Google'ın test reklamlarını gösterir.
 * 
 * Üretim için:
 * 1. AdMob hesabından gerçek Ad Unit ID alın
 * 2. adUnitId prop'u ile geçirin veya yukarıdaki AD_UNIT_ID'yi değiştirin
 */
export function BannerAd({ adUnitId, size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: BannerAdProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleAdLoaded = () => {
        setIsLoaded(true);
        setHasError(false);
        console.log('Banner reklam yüklendi');
    };

    const handleAdFailed = (error: Error) => {
        setHasError(true);
        setIsLoaded(false);
        console.log('Banner reklam yüklenemedi:', error.message);
    };

    // Hata durumunda placeholder göster
    if (hasError) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>📢</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!isLoaded && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Reklam yükleniyor...</Text>
                </View>
            )}
            <GoogleBannerAd
                unitId={adUnitId ?? BANNER_AD_UNIT_ID}
                size={size}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: AD_CONFIG.requestNonPersonalizedAdsOnly,
                    keywords: AD_CONFIG.keywords,
                }}
                onAdLoaded={handleAdLoaded}
                onAdFailedToLoad={handleAdFailed}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 60,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: typography.fontSizeSm,
        color: colors.textSecondary,
    },
    placeholder: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 24,
    },
});
