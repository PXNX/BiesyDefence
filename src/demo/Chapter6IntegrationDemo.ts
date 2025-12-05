/**
 * Chapter 6 Integration Demo - Shows how systems work together
 */

import { MapManager } from '@/game/maps/MapManager';
import { SaveManager } from '@/game/progression/SaveManager';
import { AchievementSystem } from '@/game/progression/AchievementSystem';
import { TranslationService, LanguageDetector } from '@/localization';
import {
  createInitialState,
  createProgressAwareState,
} from '@/game/core/GameStateFactory';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_MONEY,
  TOWER_PROFILES,
} from '@/game/config/constants';

export class Chapter6IntegrationDemo {
  public static initializeSystems(): void {
    console.log('✅ Initializing Chapter 6 Future Expansion Systems...');

    const mapManager = MapManager.getInstance();
    console.log(`🗺️ Maps available: ${mapManager.getAvailableMaps().length}`);

    const saveManager = SaveManager.getInstance();
    const progress = saveManager.getProgress();
    console.log(`💾 Save system initialized (v${progress.version})`);

    const achievementSystem = AchievementSystem.getInstance();
    achievementSystem.initializeProgress(progress.achievements);
    console.log(
      `🏆 Achievement system ready (${achievementSystem.getUnlockedCount()} unlocked)`
    );

    const translationService = TranslationService.getInstance();
    const languageDetector = LanguageDetector.getInstance();
    const detection = languageDetector.detectUserPreferences();
    translationService.setLanguage(detection.language);

    console.log(
      `🌐 Language set to: ${translationService.getCurrentLanguageConfig().nativeName}`
    );
    console.log(
      `🎨 Recommended theme: ${detection.culturalSensitivity?.recommendedTheme}`
    );
  }

  public static startProgressiveGame(): {
    gameState: any;
    mapInfo: any;
    playerProgress: any;
    languageInfo: any;
  } {
    console.log('🚀 Starting progressive game with Chapter 6 systems...');

    const saveManager = SaveManager.getInstance();
    const playerProgress = saveManager.getProgress();

    const gameState = createProgressAwareState({
      preferredDifficulty: playerProgress?.settings?.preferredDifficulty,
      unlockedMaps: playerProgress?.mapsUnlocked,
    });

    const mapManager = MapManager.getInstance();
    const currentMap = mapManager.getCurrentMap();
    const difficultyConfig = mapManager.getCurrentDifficultyConfig();

    const translationService = TranslationService.getInstance();
    const languageInfo = {
      currentLanguage: translationService.getCurrentLanguage(),
      isRTL: translationService.isRTL(),
      recommendedTheme: translationService.getAppropriateTheme(),
    };

    console.log(`🗺️ Loaded map: ${currentMap?.name}`);
    console.log(`🎚️ Difficulty: ${difficultyConfig.name}`);
    console.log(`🌐 Language: ${languageInfo.currentLanguage}`);
    console.log(`🎨 Theme: ${languageInfo.recommendedTheme}`);

    return {
      gameState,
      mapInfo: {
        map: currentMap,
        difficulty: difficultyConfig,
        difficultyLevel: mapManager.getCurrentDifficulty(),
      },
      playerProgress,
      languageInfo,
    };
  }

  public static backwardCompatibilityTest(): void {
    console.log('🔄 Testing backward compatibility...');
    try {
      console.log(
        `ℹ️ Old constants: ${GRID_WIDTH}x${GRID_HEIGHT}, $${INITIAL_MONEY}`
      );
      const legacyState = createInitialState();
      console.log(
        `ℹ️ Legacy state: ${legacyState.map.width}x${legacyState.map.height}`
      );
      const indicaTower = TOWER_PROFILES.indica;
      console.log(
        `ℹ️ Tower profile: ${indicaTower.name} - ${indicaTower.description}`
      );
      console.log('✅ Backward compatibility tests PASSED');
    } catch (error) {
      console.error('❌ Backward compatibility test FAILED:', error);
    }
  }
}

export default Chapter6IntegrationDemo;

if (typeof window !== 'undefined') {
  (window as any).Chapter6Demo = Chapter6IntegrationDemo;
  console.log(
    'ℹ️ Chapter 6 Demo available: run Chapter6IntegrationDemo.startProgressiveGame()'
  );
}
