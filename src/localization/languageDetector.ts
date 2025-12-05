/**
 * Language Detection Utilities
 * Detects user preferences and determines appropriate language/theme settings
 */

import type { Language } from './TranslationService';

export interface UserPreferences {
  language: Language;
  region: string;
  theme: 'cannabis' | 'herbs' | 'laboratory' | 'garden' | 'farm';
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}

export interface DetectionResult {
  language: Language;
  confidence: number;
  source: 'browser' | 'storage' | 'default' | 'geoip';
  region?: string;
  culturalSensitivity?: {
    level: 'low' | 'medium' | 'high';
    reasons: string[];
    recommendedTheme: string;
  };
}

export class LanguageDetector {
  private static instance: LanguageDetector | null = null;

  public static getInstance(): LanguageDetector {
    if (!LanguageDetector.instance) {
      LanguageDetector.instance = new LanguageDetector();
    }
    return LanguageDetector.instance;
  }

  /**
   * Detect user's preferred language and cultural preferences
   */
  public detectUserPreferences(): DetectionResult {
    const browserLang = this.detectBrowserLanguage();
    const storedPrefs = this.getStoredPreferences();
    const region = this.detectRegion();
    const culturalSensitivity = this.assessCulturalSensitivity(region);

    // Priority: Stored preferences > Browser settings > Geographic detection
    if (storedPrefs && storedPrefs.language) {
      return {
        language: storedPrefs.language,
        confidence: 1.0,
        source: 'storage',
        region,
        culturalSensitivity,
      };
    }

    return {
      language: browserLang,
      confidence: 0.8,
      source: 'browser',
      region,
      culturalSensitivity,
    };
  }

  /**
   * Detect language from browser settings
   */
  private detectBrowserLanguage(): Language {
    const browserLanguages = navigator.languages || [navigator.language];

    // Common language mappings
    const languageMap: Record<string, Language> = {
      en: 'en',
      'en-US': 'en',
      'en-GB': 'en',
      es: 'es',
      'es-ES': 'es',
      'es-MX': 'es',
      fr: 'fr',
      'fr-FR': 'fr',
      'fr-CA': 'fr',
      de: 'de',
      'de-DE': 'de',
      'de-AT': 'de',
      zh: 'zh',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
      ja: 'ja',
      'ja-JP': 'ja',
      ar: 'ar',
      'ar-SA': 'ar',
      'ar-AE': 'ar',
      ru: 'ru',
      'ru-RU': 'ru',
      pt: 'pt',
      'pt-BR': 'pt',
      'pt-PT': 'pt',
      it: 'it',
      'it-IT': 'it',
    };

    // Try to match browser languages with supported languages
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      if (languageMap[browserLang] || languageMap[langCode]) {
        return languageMap[browserLang] || languageMap[langCode] || 'en';
      }
    }

    return 'en'; // Default fallback
  }

  /**
   * Get stored user preferences
   */
  private getStoredPreferences(): UserPreferences | null {
    try {
      const stored = localStorage.getItem('biesydefence_user_preferences');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load stored preferences:', error);
      return null;
    }
  }

  /**
   * Detect user's geographic region
   */
  private detectRegion(): string {
    // This is a simplified implementation
    // In a real application, you might use:
    // - GeoIP services
    // - Browser timezone
    // - User's locale settings

    const browserLang = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Map common timezone regions
    const regionMappings: Record<string, string> = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Seoul': 'KR',
      'Asia/Dubai': 'AE',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU',
      'America/Sao_Paulo': 'BR',
    };

    // Map from browser language if timezone mapping fails
    const languageRegionMap: Record<string, string> = {
      'en-US': 'US',
      'en-GB': 'GB',
      'en-AU': 'AU',
      'en-CA': 'CA',
      'es-ES': 'ES',
      'es-MX': 'MX',
      'fr-FR': 'FR',
      'fr-CA': 'CA',
      'de-DE': 'DE',
      'de-AT': 'AT',
      'zh-CN': 'CN',
      'zh-TW': 'TW',
      'ja-JP': 'JP',
      'ar-SA': 'SA',
      'ar-AE': 'AE',
      'ru-RU': 'RU',
      'pt-BR': 'BR',
      'pt-PT': 'PT',
      'it-IT': 'IT',
    };

    return regionMappings[timezone] || languageRegionMap[browserLang] || 'US';
  }

  /**
   * Assess cultural sensitivity requirements
   */
  private assessCulturalSensitivity(region: string): {
    level: 'low' | 'medium' | 'high';
    reasons: string[];
    recommendedTheme: string;
  } {
    const highSensitivityRegions = [
      'SA',
      'AE',
      'QA',
      'KW',
      'BH',
      'OM',
      'CN',
      'JP',
      'KR',
      'SG',
    ];
    const mediumSensitivityRegions = [
      'MY',
      'TH',
      'VN',
      'ID',
      'PH',
      'IN',
      'PK',
      'BD',
    ];

    if (highSensitivityRegions.includes(region)) {
      return {
        level: 'high',
        reasons: [
          'Cannabis content may be illegal or culturally inappropriate',
          'Local laws and regulations may restrict certain themes',
          'Cultural sensitivities around drug-related content',
        ],
        recommendedTheme: 'herbs', // Use herbs theme as primary alternative
      };
    }

    if (mediumSensitivityRegions.includes(region)) {
      return {
        level: 'medium',
        reasons: [
          'Conservative cultural values may affect reception',
          'Alternative themes may be more widely accepted',
        ],
        recommendedTheme: 'laboratory', // Tech theme as secondary alternative
      };
    }

    return {
      level: 'low',
      reasons: ['Generally permissive attitude toward gaming content'],
      recommendedTheme: 'cannabis', // Original theme is fine
    };
  }

  /**
   * Get recommended theme based on cultural assessment
   */
  public getRecommendedTheme(culturalSensitivity: {
    level: 'low' | 'medium' | 'high';
    recommendedTheme: string;
  }): string {
    if (culturalSensitivity.level === 'high') {
      return culturalSensitivity.recommendedTheme; // 'herbs' for high sensitivity
    }

    if (culturalSensitivity.level === 'medium') {
      return 'laboratory'; // Tech theme for medium sensitivity
    }

    return 'cannabis'; // Original theme for low sensitivity
  }

  /**
   * Check if current theme is appropriate for region
   */
  public isThemeAppropriate(
    theme: string,
    region: string
  ): {
    appropriate: boolean;
    alternative?: string;
    reason?: string;
  } {
    const highSensitivityRegions = [
      'SA',
      'AE',
      'QA',
      'KW',
      'BH',
      'OM',
      'CN',
      'JP',
      'KR',
    ];

    if (theme === 'cannabis' && highSensitivityRegions.includes(region)) {
      return {
        appropriate: false,
        alternative: 'herbs',
        reason: 'Cannabis theme not appropriate for this region',
      };
    }

    // Additional cultural checks
    if (theme === 'laboratory' && region === 'SA') {
      return {
        appropriate: false,
        alternative: 'garden',
        reason: 'Scientific theme may not align with local preferences',
      };
    }

    return { appropriate: true };
  }

  /**
   * Save user preferences
   */
  public savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(
        'biesydefence_user_preferences',
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Get available currencies for region
   */
  public getRegionCurrencies(region: string): string[] {
    const currencyMap: Record<string, string[]> = {
      US: ['USD'],
      GB: ['GBP'],
      DE: ['EUR'],
      FR: ['EUR'],
      ES: ['EUR'],
      IT: ['EUR'],
      JP: ['JPY'],
      CN: ['CNY'],
      KR: ['KRW'],
      SA: ['SAR'],
      AE: ['AED'],
      IN: ['INR'],
      BR: ['BRL'],
      CA: ['CAD'],
      AU: ['AUD'],
      RU: ['RUB'],
    };

    return currencyMap[region] || ['USD']; // Default to USD
  }

  /**
   * Format currency according to region
   */
  public formatCurrency(amount: number, region: string): string {
    const currencies = this.getRegionCurrencies(region);
    const currency = currencies[0] || 'USD';

    try {
      return new Intl.NumberFormat(`en-${region}`, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch (error) {
      // Fallback for unsupported regions
      return `${amount} ${currency}`;
    }
  }

  /**
   * Check if language supports RTL
   */
  public isRTLLanguage(language: Language): boolean {
    const rtlLanguages: Language[] = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(language);
  }

  /**
   * Get font recommendations for language
   */
  public getFontRecommendations(language: Language): {
    primary: string;
    fallback: string[];
    script?: string;
  } {
    const fontRecommendations: Record<string, any> = {
      en: {
        primary: 'Inter, system-ui, sans-serif',
        fallback: ['Arial', 'Helvetica', 'sans-serif'],
      },
      zh: {
        primary: 'Noto Sans SC, system-ui, sans-serif',
        fallback: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        script: 'CJK',
      },
      ja: {
        primary: 'Noto Sans JP, system-ui, sans-serif',
        fallback: ['Hiragino Kaku Gothic Pro', 'Yu Gothic', 'sans-serif'],
        script: 'CJK',
      },
      ar: {
        primary: 'Noto Sans Arabic, system-ui, sans-serif',
        fallback: ['Arial Unicode MS', 'Tahoma', 'sans-serif'],
        script: 'Arabic',
      },
      default: {
        primary: 'Inter, system-ui, sans-serif',
        fallback: ['Arial', 'Helvetica', 'sans-serif'],
      },
    };

    return fontRecommendations[language] || fontRecommendations.default;
  }
}
