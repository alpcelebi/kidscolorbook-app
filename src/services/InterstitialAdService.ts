import {
    InterstitialAd,
    AdEventType
} from 'react-native-google-mobile-ads';
import { INTERSTITIAL_AD_UNIT_ID, AD_CONFIG } from '../config';

/**
 * Interstitial Reklam Servisi
 * 
 * Tam ekran reklamları yönetir.
 * Reklam önceden yüklenir ve uygun zamanda gösterilir.
 */
class InterstitialAdService {
    private interstitialAd: InterstitialAd | null = null;
    private isLoaded = false;
    private isLoading = false;
    private showCount = 0;

    // Kaç işlem sonra reklam gösterileceği
    private readonly SHOW_AFTER_COUNT = AD_CONFIG.interstitialShowAfterCount;

    constructor() {
        this.loadAd();
    }

    /**
     * Reklamı önceden yükle
     */
    loadAd(): void {
        if (this.isLoading || this.isLoaded) {
            return;
        }

        this.isLoading = true;

        this.interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
            requestNonPersonalizedAdsOnly: AD_CONFIG.requestNonPersonalizedAdsOnly,
            keywords: AD_CONFIG.keywords,
        });

        // Reklam yüklendiğinde
        this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            console.log('Interstitial reklam yüklendi');
            this.isLoaded = true;
            this.isLoading = false;
        });

        // Reklam kapatıldığında yeni reklam yükle
        this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            console.log('Interstitial reklam kapatıldı');
            this.isLoaded = false;
            this.loadAd(); // Sonraki gösterim için yeni reklam yükle
        });

        // Hata durumunda
        this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.log('Interstitial reklam hatası:', error);
            this.isLoaded = false;
            this.isLoading = false;
            // 30 saniye sonra tekrar dene
            setTimeout(() => this.loadAd(), 30000);
        });

        this.interstitialAd.load();
    }

    /**
     * Sayacı artır ve gerekirse reklam göster
     * Her SHOW_AFTER_COUNT işlem sonunda reklam gösterir
     */
    incrementAndShowIfReady(): void {
        this.showCount++;

        if (this.showCount >= this.SHOW_AFTER_COUNT) {
            this.show();
            this.showCount = 0;
        }
    }

    /**
     * Reklamı hemen göster (yüklüyse)
     * @returns Reklam gösterildiyse true, gösterilemezse false
     */
    show(): boolean {
        if (this.isLoaded && this.interstitialAd) {
            this.interstitialAd.show();
            this.isLoaded = false;
            return true;
        }

        console.log('Interstitial reklam henüz yüklenmedi');
        // Reklam yüklü değilse yükle
        if (!this.isLoading) {
            this.loadAd();
        }
        return false;
    }

    /**
     * Reklam yüklü mü kontrol et
     */
    isAdLoaded(): boolean {
        return this.isLoaded;
    }

    /**
     * Sayacı sıfırla
     */
    resetCount(): void {
        this.showCount = 0;
    }
}

// Singleton instance
export const interstitialAdService = new InterstitialAdService();
