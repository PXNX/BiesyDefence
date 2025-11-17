/**
 * TranslationService - Basic i18n structure for future localization support
 * Provides foundation for multilingual support with RTL language preparation
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'ru' | 'pt' | 'it'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  rtl: boolean // Right-to-left language support
  region: string
  dateFormat: string
  numberFormat: string
  fontFamily?: string
}

export interface TranslationContext {
  [key: string]: string | number | boolean
}

export interface TranslationOptions {
  fallback?: string
  context?: TranslationContext
  plural?: 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
  count?: number
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
    region: 'US',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    rtl: false,
    region: 'ES',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'es-ES',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    rtl: false,
    region: 'FR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    rtl: false,
    region: 'DE',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-DE',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    rtl: false,
    region: 'CN',
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: 'zh-CN',
    fontFamily: 'Noto Sans SC, sans-serif',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    rtl: false,
    region: 'JP',
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: 'ja-JP',
    fontFamily: 'Noto Sans JP, sans-serif',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    region: 'SA',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ar-SA',
    fontFamily: 'Noto Sans Arabic, sans-serif',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    rtl: false,
    region: 'RU',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'ru-RU',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    rtl: false,
    region: 'BR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-BR',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    rtl: false,
    region: 'IT',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'it-IT',
  },
}

/**
 * Theme alternatives for different cultural markets
 */
export interface ThemeAlternative {
  id: string
  name: string
  description: string
  culturalNotes: string
  appropriateFor: Language[]
}

export const THEME_ALTERNATIVES: Record<string, ThemeAlternative> = {
  herbs: {
    id: 'herbs',
    name: 'Herb Garden',
    description: 'Focus on aromatic herbs and natural wellness',
    culturalNotes: 'Universal appeal, suitable for all regions',
    appropriateFor: Object.keys(SUPPORTED_LANGUAGES) as Language[],
  },
  laboratory: {
    id: 'laboratory',
    name: 'Research Facility',
    description: 'Futuristic laboratory with scientific theme',
    culturalNotes: 'Tech-focused, avoids controversial themes',
    appropriateFor: Object.keys(SUPPORTED_LANGUAGES) as Language[],
  },
  garden: {
    id: 'garden',
    name: 'Peaceful Garden',
    description: 'Zen garden with natural elements',
    culturalNotes: 'Eastern-friendly, meditation focus',
    appropriateFor: ['en', 'zh', 'ja', 'ko'], // Asian markets primarily
  },
  farm: {
    id: 'farm',
    name: 'Organic Farm',
    description: 'Agricultural farm with sustainable theme',
    culturalNotes: 'Agricultural focus, suitable for rural communities',
    appropriateFor: Object.keys(SUPPORTED_LANGUAGES) as Language[],
  },
}

export class TranslationService {
  private static instance: TranslationService | null = null
  private currentLanguage: Language = 'en'
  private translations: Record<Language, Record<string, string>> = {
    en: {},
    es: {},
    fr: {},
    de: {},
    zh: {},
    ja: {},
    ar: {},
    ru: {},
    pt: {},
    it: {},
  }
  private missingKeys: Set<string> = new Set()
  private subscribers: Set<(language: Language) => void> = new Set()

  private constructor() {
    this.initializeService()
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService()
    }
    return TranslationService.instance
  }

  /**
   * Initialize the translation service
   */
  private initializeService(): void {
    // Set initial language from browser settings or default
    this.setLanguage(this.detectBrowserLanguage())
    this.loadBasicTranslations()
  }

  /**
   * Detect browser language preference
   */
  private detectBrowserLanguage(): Language {
    const browserLang = navigator.language.split('-')[0] as Language
    return SUPPORTED_LANGUAGES[browserLang] ? browserLang : 'en'
  }

  /**
   * Load basic translations (placeholder for future translation files)
   */
  private loadBasicTranslations(): void {
    // Load English translations by default
    this.translations.en = this.getEnglishTranslations()
    
    // Load any available translations (in real implementation, these would be loaded from files)
    this.loadSpanishTranslations()
    this.loadGermanTranslations()
    this.loadChineseTranslations()
    this.loadArabicTranslations()
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): Language {
    return this.currentLanguage
  }

  /**
   * Get current language configuration
   */
  public getCurrentLanguageConfig(): LanguageConfig {
    return SUPPORTED_LANGUAGES[this.currentLanguage]
  }

  /**
   * Set current language
   */
  public setLanguage(language: Language): void {
    if (!SUPPORTED_LANGUAGES[language]) {
      console.warn(`Unsupported language: ${language}, defaulting to English`)
      language = 'en'
    }

    const oldLanguage = this.currentLanguage
    this.currentLanguage = language

    // Notify subscribers of language change
    this.subscribers.forEach(callback => {
      try {
        callback(language)
      } catch (error) {
        console.error('Error in language change subscriber:', error)
      }
    })

    // Apply RTL support if needed
    this.applyLanguageSettings(language)
    
    console.log(`Language changed from ${oldLanguage} to ${language}`)
  }

  /**
   * Apply language-specific settings
   */
  private applyLanguageSettings(language: Language): void {
    const config = SUPPORTED_LANGUAGES[language]
    const root = document.documentElement

    // Apply RTL support
    if (config.rtl) {
      root.setAttribute('dir', 'rtl')
      root.setAttribute('lang', language)
    } else {
      root.setAttribute('dir', 'ltr')
      root.setAttribute('lang', language)
    }

    // Apply font family if specified
    if (config.fontFamily) {
      root.style.setProperty('--app-font-family', config.fontFamily)
    }

    // Apply number/date formatting
    root.style.setProperty('--number-format', config.numberFormat)
    root.style.setProperty('--date-format', config.dateFormat)
  }

  /**
   * Get translated string
   */
  public t(key: string, options?: TranslationOptions): string {
    const translation = this.translations[this.currentLanguage][key]
    
    if (!translation) {
      // Log missing key for translation team
      this.missingKeys.add(key)
      
      // Return fallback or key
      return options?.fallback || key
    }

    // Process interpolation
    return this.interpolate(translation, options?.context || {})
  }

  /**
   * Check if a translation key exists
   */
  public hasKey(key: string): boolean {
    return !!this.translations[this.currentLanguage][key]
  }

  /**
   * Get pluralized string
   */
  public plural(key: string, count: number, options?: TranslationOptions): string {
    const pluralKey = this.getPluralKey(key, count)
    return this.t(pluralKey, { ...options, count })
  }

  /**
   * Get plural key based on language rules
   */
  private getPluralKey(key: string, count: number): string {
    const language = this.currentLanguage
    
    switch (language) {
      case 'ar': // Arabic has 6 plural forms
        if (count === 0) return `${key}_zero`
        if (count === 1) return `${key}_one`
        if (count === 2) return `${key}_two`
        if (count <= 10) return `${key}_few`
        if (count <= 99) return `${key}_many`
        return `${key}_other`
      
      case 'ru': // Russian has 3 plural forms
        const lastDigit = count % 10
        const lastTwoDigits = count % 100
        
        if (lastDigit === 1 && lastTwoDigits !== 11) return `${key}_one`
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) return `${key}_few`
        return `${key}_many`
      
      case 'en':
      default:
        return count === 1 ? `${key}_one` : `${key}_other`
    }
  }

  /**
   * Interpolate variables in translation string
   */
  private interpolate(text: string, context: TranslationContext): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = context[key]
      return value !== undefined ? String(value) : match
    })
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): LanguageConfig[] {
    return Object.values(SUPPORTED_LANGUAGES)
  }

  /**
   * Check if language supports RTL
   */
  public isRTL(language?: Language): boolean {
    const lang = language || this.currentLanguage
    return SUPPORTED_LANGUAGES[lang].rtl
  }

  /**
   * Get appropriate theme for current language/region
   */
  public getAppropriateTheme(): string {
    const currentConfig = SUPPORTED_LANGUAGES[this.currentLanguage]
    
    // Special considerations for different regions
    if (currentConfig.region === 'SA' || currentConfig.region === 'AE') {
      return 'garden' // Use garden theme for Middle Eastern markets
    }
    
    if (['zh', 'ja', 'ko'].includes(this.currentLanguage)) {
      return 'garden' // Use garden theme for Asian markets
    }
    
    return 'laboratory' // Default to laboratory for broader appeal
  }

  /**
   * Get missing translation keys (for development)
   */
  public getMissingKeys(): string[] {
    return Array.from(this.missingKeys)
  }

  /**
   * Clear missing keys (for development)
   */
  public clearMissingKeys(): void {
    this.missingKeys.clear()
  }

  /**
   * Subscribe to language changes
   */
  public subscribe(callback: (language: Language) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Placeholder methods for loading translations from files
  private loadSpanishTranslations(): void {
    // In real implementation, load from /locales/es.json
    this.translations.es = {
      // Basic Spanish translations
      'ui.start': 'Iniciar',
      'ui.pause': 'Pausar',
      'ui.resume': 'Reanudar',
      'ui.restart': 'Reiniciar',
      'ui.settings': 'Configuración',
      'ui.tower.indica': 'Torre Índica',
      'ui.tower.sativa': 'Torre Sativa',
      'ui.tower.support': 'Torre de Apoyo',
    }
  }

  private loadGermanTranslations(): void {
    // In real implementation, load from /locales/de.json
    this.translations.de = {
      // Basic German translations
      'ui.start': 'Start',
      'ui.pause': 'Pausieren',
      'ui.resume': 'Fortsetzen',
      'ui.restart': 'Neustart',
      'ui.settings': 'Einstellungen',
      'ui.tower.indica': 'Indica Turm',
      'ui.tower.sativa': 'Sativa Turm',
      'ui.tower.support': 'Unterstützungs Turm',
    }
  }

  private loadChineseTranslations(): void {
    // In real implementation, load from /locales/zh.json
    this.translations.zh = {
      // Basic Chinese translations
      'ui.start': '开始',
      'ui.pause': '暂停',
      'ui.resume': '继续',
      'ui.restart': '重新开始',
      'ui.settings': '设置',
      'ui.tower.indica': '印度大麻塔',
      'ui.tower.sativa': ' sativa塔',
      'ui.tower.support': '支援塔',
    }
  }

  private loadArabicTranslations(): void {
    // In real implementation, load from /locales/ar.json
    this.translations.ar = {
      // Basic Arabic translations (RTL)
      'ui.start': 'بدء',
      'ui.pause': 'إيقاف مؤقت',
      'ui.resume': 'استئناف',
      'ui.restart': 'إعادة تشغيل',
      'ui.settings': 'الإعدادات',
      'ui.tower.indica': 'برج إنديكا',
      'ui.tower.sativa': 'برج ساتيفا',
      'ui.tower.support': 'برج الدعم',
    }
  }

  /**
   * Get English translations (complete set for reference)
   */
  private getEnglishTranslations(): Record<string, string> {
    return {
      // UI Labels
      'ui.start': 'Start',
      'ui.pause': 'Pause',
      'ui.resume': 'Resume',
      'ui.restart': 'Restart',
      'ui.settings': 'Settings',
      'ui.difficulty.easy': 'Easy',
      'ui.difficulty.normal': 'Normal',
      'ui.difficulty.hard': 'Hard',
      
      // Tower Names
      'ui.tower.indica': 'Indica Tower',
      'ui.tower.sativa': 'Sativa Tower',
      'ui.tower.support': 'Support Tower',
      
      // Tower Descriptions
      'ui.tower.indica.desc': 'Single-Target-Hard-Hit: Heavy rounds for focused elimination.',
      'ui.tower.sativa.desc': 'Fast-Shot: Rapid fire with double-shot capability.',
      'ui.tower.support.desc': 'Slow-Support: Slows enemies 30% for 2 seconds, light damage.',
      
      // Game States
      'ui.game.running': 'Game Running',
      'ui.game.paused': 'Game Paused',
      'ui.game.won': 'Victory!',
      'ui.game.lost': 'Game Over',
      'ui.game.wave': 'Wave',
      'ui.game.money': 'Money',
      'ui.game.lives': 'Lives',
      
      // Maps
      'ui.map.default': 'Greenfield Gardens',
      'ui.map.default.desc': 'The classic BiesyDefence experience.',
      'ui.map.herb_garden': 'Herb Garden',
      'ui.map.laboratory': 'Research Facility',
      
      // Achievements
      'ui.achievement.unlocked': 'Achievement Unlocked!',
      'ui.achievement.first_wave': 'First Steps',
      'ui.achievement.first_wave.desc': 'Clear your first wave',
      
      // Error Messages
      'error.not_enough_money': 'Not enough money',
      'error.invalid_placement': 'Invalid placement location',
      'error.tower_limit_reached': 'Tower limit reached',
    }
  }

  /**
   * Format number according to current language
   */
  public formatNumber(value: number): string {
    const config = SUPPORTED_LANGUAGES[this.currentLanguage]
    return new Intl.NumberFormat(config.numberFormat).format(value)
  }

  /**
   * Format date according to current language
   */
  public formatDate(date: Date): string {
    const config = SUPPORTED_LANGUAGES[this.currentLanguage]
    return new Intl.DateTimeFormat(config.numberFormat, {
      dateStyle: 'medium',
    }).format(date)
  }
}