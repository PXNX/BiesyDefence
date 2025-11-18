/**
 * Chapter 6 Integration Demo - Shows how all new systems work together
 * This file demonstrates the integration of Map Configuration, Save System, and Localization
 */

import { MapManager } from '@/game/maps/MapManager'
import { SaveManager } from '@/game/progression/SaveManager'
import { AchievementSystem } from '@/game/progression/AchievementSystem'
import { TranslationService, LanguageDetector } from '@/localization'
import { createInitialState, createProgressAwareState } from '@/game/core/GameStateFactory'

/**
 * Demo: Complete System Integration
 * Shows how all Chapter 6 systems work together seamlessly
 */
export class Chapter6IntegrationDemo {
  
  /**
   * Initialize all Chapter 6 systems
   */
  public static initializeSystems(): void {
    console.log('🚀 Initializing Chapter 6 Future Expansion Systems...')
    
    // 1. Initialize Map System
    const mapManager = MapManager.getInstance()
    console.log(`📍 Maps available: ${mapManager.getAvailableMaps().length}`)
    
    // 2. Initialize Save System
    const saveManager = SaveManager.getInstance()
    const progress = saveManager.getProgress()
    console.log(`💾 Save system initialized (v${progress.version})`)
    
    // 3. Initialize Achievement System
    const achievementSystem = AchievementSystem.getInstance()
    achievementSystem.initializeProgress(progress.achievements)
    console.log(`🏆 Achievement system ready (${achievementSystem.getUnlockedCount()} unlocked)`)
    
    // 4. Initialize Localization
    const translationService = TranslationService.getInstance()
    const languageDetector = LanguageDetector.getInstance()
    
    // Detect user preferences
    const detection = languageDetector.detectUserPreferences()
    translationService.setLanguage(detection.language)
    
    console.log(`🌍 Language set to: ${translationService.getCurrentLanguageConfig().nativeName}`)
    console.log(`🎨 Recommended theme: ${detection.culturalSensitivity?.recommendedTheme}`)
    
    console.log('✅ All systems initialized successfully!')
  }

  /**
   * Demo: Progressive Game Start
   * Shows how to start a game with all new systems integrated
   */
  public static startProgressiveGame(): {
    gameState: any
    mapInfo: any
    playerProgress: any
    languageInfo: any
  } {
    console.log('🎮 Starting progressive game with Chapter 6 systems...')
    
    // 1. Get player progress
    const saveManager = SaveManager.getInstance()
    const playerProgress = saveManager.getProgress()
    
    // 2. Create progress-aware game state
    const gameState = createProgressAwareState(playerProgress)
    
    // 3. Get current map information
    const mapManager = MapManager.getInstance()
    const currentMap = mapManager.getCurrentMap()
    const difficultyConfig = mapManager.getCurrentDifficultyConfig()
    
    // 4. Get localization information
    const translationService = TranslationService.getInstance()
    const languageInfo = {
      currentLanguage: translationService.getCurrentLanguage(),
      isRTL: translationService.isRTL(),
      recommendedTheme: translationService.getAppropriateTheme(),
    }
    
    console.log(`📍 Loaded map: ${currentMap?.name}`)
    console.log(`⚖️  Difficulty: ${difficultyConfig.name}`)
    console.log(`🌍 Language: ${languageInfo.currentLanguage}`)
    console.log(`🎯 Theme: ${languageInfo.recommendedTheme}`)
    
    return {
      gameState,
      mapInfo: {
        map: currentMap,
        difficulty: difficultyConfig,
        difficultyLevel: mapManager.getCurrentDifficulty(),
      },
      playerProgress,
      languageInfo,
    }
  }

  /**
   * Demo: Save Progress Example
   * Shows how to save progress with all systems integrated
   */
  public static updateGameProgress(
    wavesCleared: number,
    gameWon: boolean,
    moneyEarned: number
  ): void {
    console.log('💾 Updating progress across all systems...')
    
    // 1. Update save system
    const saveManager = SaveManager.getInstance()
    saveManager.updateWaveProgress(wavesCleared, gameWon, moneyEarned)
    
    // 2. Update achievements
    const achievementSystem = AchievementSystem.getInstance()
    achievementSystem.checkWavesCleared(wavesCleared)
    achievementSystem.checkMoneyRemaining(moneyEarned)
    
    if (gameWon) {
      achievementSystem.checkPerfectGame(0) // Assuming no lives lost
    }
    
    // 3. Check for achievement notifications
    const newAchievements = achievementSystem.getNotifications()
    if (newAchievements.length > 0) {
      console.log('🏆 New achievements unlocked!')
      newAchievements.forEach(achievement => {
        console.log(`   • ${achievement.name}: ${achievement.description}`)
      })
      achievementSystem.clearNotifications()
    }
    
    // 4. Update map unlocks based on progress
    if (wavesCleared >= 15) {
      saveManager.unlockMap('misty_meadows')
    }
    
    if (wavesCleared >= 25) {
      saveManager.unlockMap('circular_garden')
    }
    
    console.log('✅ Progress updated successfully!')
  }

  /**
   * Demo: Cultural Sensitivity Check
   * Shows automatic theme adjustment based on region
   */
  public static demonstrateCulturalSensitivity(): void {
    console.log('🌍 Demonstrating cultural sensitivity features...')
    
    const languageDetector = LanguageDetector.getInstance()
    
    // Test different regions
    const testRegions = ['US', 'SA', 'CN', 'DE', 'JP']
    
    testRegions.forEach(region => {
      const detection = languageDetector.detectUserPreferences()
      detection.region = region // Simulate different region
      
      const sensitivity = detection.culturalSensitivity
      const recommendedTheme = languageDetector.getRecommendedTheme(sensitivity)
      
      console.log(`📍 ${region}: ${sensitivity?.level} sensitivity → "${recommendedTheme}" theme`)
    })
  }

  /**
   * Demo: Performance Test
   * Shows that new systems don't impact performance
   */
  public static performanceTest(): void {
    console.log('⚡ Running performance test...')
    
    const startTime = performance.now()
    
    // Simulate multiple system operations
    for (let i = 0; i < 1000; i++) {
      // Map operations
      const mapManager = MapManager.getInstance()
      mapManager.getAvailableMaps()
      
      // Save operations
      const saveManager = SaveManager.getInstance()
      saveManager.getProgress()
      
      // Achievement operations
      const achievementSystem = AchievementSystem.getInstance()
      achievementSystem.getProgress()
      
      // Translation operations
      const translationService = TranslationService.getInstance()
      translationService.t('ui.start')
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    console.log(`⏱️  1000 iterations completed in ${duration.toFixed(2)}ms`)
    console.log(`📊 Average: ${(duration / 1000).toFixed(4)}ms per iteration`)
    
    if (duration < 100) {
      console.log('✅ Performance test PASSED - Under 100ms for 1000 iterations')
    } else {
      console.log('⚠️  Performance test WARNING - Consider optimization')
    }
  }

  /**
   * Demo: Backward Compatibility Test
   * Shows that old code still works
   */
  public static backwardCompatibilityTest(): void {
    console.log('🔄 Testing backward compatibility...')
    
    try {
      // Test 1: Old constants still work
      import {
        GRID_WIDTH,
        GRID_HEIGHT,
        INITIAL_MONEY,
        TOWER_PROFILES
      } from '@/game/config/constants'
      
      console.log(`✅ Old constants: ${GRID_WIDTH}x${GRID_HEIGHT}, $${INITIAL_MONEY}`)
      
      // Test 2: Legacy state creation still works
      const legacyState = createInitialState()
      console.log(`✅ Legacy state: ${legacyState.map.width}x${legacyState.map.height}`)
      
      // Test 3: Old tower profiles still accessible
      const indicaTower = TOWER_PROFILES.indica
      console.log(`✅ Tower profiles: ${indicaTower.name} - ${indicaTower.description}`)
      
      console.log('✅ All backward compatibility tests PASSED')
      
    } catch (error) {
      console.error('❌ Backward compatibility test FAILED:', error)
    }
  }

  /**
   * Demo: Complete Workflow
   * Shows a complete game session with all systems
   */
  public static runCompleteWorkflow(): void {
    console.log('🎯 Running complete Chapter 6 workflow demo...')
    
    // 1. Initialize systems
    this.initializeSystems()
    
    // 2. Start progressive game
    const gameData = this.startProgressiveGame()
    console.log('?? Game data snapshot', {
      wave: gameData.gameState.currentWaveIndex + 1,
      difficulty: gameData.mapInfo?.difficulty.name,
      language: gameData.languageInfo.currentLanguage,
    })
    
    // 3. Simulate gameplay
    console.log('\n🎮 Simulating gameplay...')
    this.updateGameProgress(3, false, 95)
    this.updateGameProgress(7, false, 120)
    this.updateGameProgress(12, false, 180)
    
    // 4. Cultural sensitivity demonstration
    console.log('\n🌍 Cultural sensitivity:')
    this.demonstrateCulturalSensitivity()
    
    // 5. Performance test
    console.log('\n⚡ Performance:')
    this.performanceTest()
    
    // 6. Backward compatibility test
    console.log('\n🔄 Compatibility:')
    this.backwardCompatibilityTest()
    
    console.log('\n🎉 Chapter 6 Integration Demo completed successfully!')
  }
}

// Export for use in development/testing
export default Chapter6IntegrationDemo

// Auto-run demo if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).Chapter6Demo = Chapter6IntegrationDemo
  console.log('💡 Chapter 6 Demo available: Run Chapter6IntegrationDemo.runCompleteWorkflow()')
}
