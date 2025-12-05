import type {
  PlayerProgress,
  SaveFile,
  AchievementProgress,
} from './PlayerProgress';
import { AchievementSystem } from './AchievementSystem';
import { createLogger } from '@/game/utils/logger';

/**
 * SaveManager - Handles save/load system with versioning support
 * Provides foundation for progression tracking and data persistence
 */

const logger = createLogger('SaveManager');

export class SaveManager {
  private static instance: SaveManager | null = null;
  private readonly STORAGE_KEY = 'biesydefence_save';
  private readonly SAVE_VERSION = '1.1.0';
  private readonly GAME_VERSION = '0.1.0';

  private currentProgress?: PlayerProgress;
  private savePending = false;
  private saveQueue: Array<() => void> = [];
  private autosaveTimer?: number;

  private constructor() {
    this.initializeSaveSystem();
    this.startAutosaveTimer();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public static resetForTests(): void {
    if (SaveManager.instance?.autosaveTimer) {
      clearInterval(SaveManager.instance.autosaveTimer);
    }
    SaveManager.instance = null;
  }

  /**
   * Initialize the save system and attempt to load existing progress
   */
  private initializeSaveSystem(): void {
    try {
      const savedProgress = this.loadSaveData();
      if (savedProgress) {
        // Migrate save data if necessary
        this.currentProgress = this.migrateSaveData(savedProgress);
        logger.info('Loaded existing save data', {
          version: this.currentProgress.version,
          wavesCleared: this.currentProgress.totalWavesCleared,
        });
      } else {
        // Create new progress
        this.currentProgress = this.createNewProgress();
        logger.info('Created new save data');
      }
    } catch (error) {
      logger.error('Failed to initialize save system:', error);
      this.currentProgress = this.createNewProgress();
    }
  }

  /**
   * Create new player progress
   */
  private createNewProgress(): PlayerProgress {
    return {
      version: this.SAVE_VERSION,
      saveDate: new Date().toISOString(),
      totalWavesCleared: 0,
      highestWaveReached: 0,
      totalPlayTime: 0,
      totalGamesPlayed: 0,
      totalGamesWon: 0,
      highestMoneyEarned: 0,
      mostEfficientRun: {
        wave: 0,
        moneyLeft: 0,
        efficiency: 0,
      },
      mapsUnlocked: ['default'],
      difficultiesUnlocked: [
        {
          mapId: 'default',
          difficulty: 'easy',
          completed: false,
          bestWave: 0,
        },
        {
          mapId: 'default',
          difficulty: 'normal',
          completed: false,
          bestWave: 0,
        },
      ],
      achievements: this.initializeDefaultAchievements(),
      personalRecords: {
        fastestWin: {
          wave: 0,
          time: 0,
          mapId: '',
        },
        highestMoneyEnd: {
          wave: 0,
          money: 0,
          mapId: '',
        },
        mostTowersPlaced: {
          wave: 0,
          count: 0,
          mapId: '',
        },
      },
      settings: {
        preferredDifficulty: 'normal',
        showTutorials: true,
        soundEnabled: true,
        musicEnabled: true,
        language: 'en',
        theme: 'cannabis',
      },
    };
  }

  /**
   * Initialize default achievement system
   */
  private initializeDefaultAchievements(): AchievementProgress[] {
    const achievementSystem = AchievementSystem.getInstance();
    return achievementSystem.getAchievementDefinitions().map(def => ({
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      progress: 0,
      target: def.target,
      unlocked: false,
      rewards: def.rewards ? [...def.rewards] : undefined,
      rarity: def.rarity,
      icon: def.icon,
    }));
  }

  /**
   * Load save data from LocalStorage
   */
  private loadSaveData(): PlayerProgress | null {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) {
        return null;
      }

      const parsedData = JSON.parse(savedData) as SaveFile;
      if (!this.validateSaveFile(parsedData)) {
        logger.warn('Corrupted save detected, resetting to defaults');
        return null;
      }
      return parsedData.progress;
    } catch (error) {
      logger.error('Failed to load save data:', error);
      return null;
    }
  }

  /**
   * Migrate save data to current version
   */
  private migrateSaveData(progress: PlayerProgress): PlayerProgress {
    // Basic migration logic - can be extended for future versions
    if (progress.version !== this.SAVE_VERSION) {
      logger.info(
        `Migrating save data from version ${progress.version} to ${this.SAVE_VERSION}`
      );

      // Add default fields if missing
      progress.version = this.SAVE_VERSION;
      progress.saveDate = new Date().toISOString();

      if (!progress.customContent) {
        progress.customContent = { customMaps: [] };
      }

      if (!progress.personalRecords) {
        progress.personalRecords = {
          fastestWin: { wave: 0, time: 0, mapId: '' },
          highestMoneyEnd: { wave: 0, money: 0, mapId: '' },
          mostTowersPlaced: { wave: 0, count: 0, mapId: '' },
        };
      }
    }

    return progress;
  }

  /**
   * Get current player progress
   */
  public getProgress(): PlayerProgress {
    if (!this.currentProgress) {
      throw new Error('Save system not initialized');
    }
    return { ...this.currentProgress }; // Return copy to prevent external modification
  }

  /**
   * Update player progress
   */
  public updateProgress(updates: Partial<PlayerProgress>): void {
    if (!this.currentProgress) {
      throw new Error('Save system not initialized');
    }

    // Deep merge for nested objects
    this.currentProgress = this.deepMerge(this.currentProgress, updates);
    this.queueSave();
  }

  /**
   * Update specific progress metrics
   */
  public updateWaveProgress(
    waveCleared: number,
    gameWon: boolean,
    moneyEarned: number
  ): void {
    if (!this.currentProgress) return;

    const progress = this.currentProgress;
    progress.totalWavesCleared += waveCleared;
    progress.highestWaveReached = Math.max(
      progress.highestWaveReached,
      waveCleared
    );
    progress.totalGamesPlayed += 1;

    if (gameWon) {
      progress.totalGamesWon += 1;
    }

    progress.highestMoneyEarned = Math.max(
      progress.highestMoneyEarned,
      moneyEarned
    );

    // Update efficiency record
    const efficiency = moneyEarned / waveCleared;
    if (efficiency > progress.mostEfficientRun.efficiency) {
      progress.mostEfficientRun = {
        wave: waveCleared,
        moneyLeft: moneyEarned,
        efficiency,
      };
    }

    // Check for achievement progress
    this.checkAchievementProgress('wave_5', progress.totalWavesCleared);
    this.checkAchievementProgress('wave_10', progress.totalWavesCleared);

    if (gameWon && moneyEarned > 100) {
      this.checkAchievementProgress('efficient_defender', 1);
    }

    this.queueSave();
  }

  /**
   * Update map unlock status
   */
  public unlockMap(mapId: string): void {
    if (!this.currentProgress) return;

    if (!this.currentProgress.mapsUnlocked.includes(mapId)) {
      this.currentProgress.mapsUnlocked.push(mapId);
      this.queueSave();
    }
  }

  /**
   * Update difficulty completion
   */
  public updateDifficultyCompletion(
    mapId: string,
    difficulty: 'easy' | 'normal' | 'hard',
    waveReached: number,
    completed: boolean
  ): void {
    if (!this.currentProgress) return;

    let difficultyEntry = this.currentProgress.difficultiesUnlocked.find(
      d => d.mapId === mapId && d.difficulty === difficulty
    );

    if (!difficultyEntry) {
      difficultyEntry = {
        mapId,
        difficulty,
        completed: false,
        bestWave: 0,
      };
      this.currentProgress.difficultiesUnlocked.push(difficultyEntry);
    }

    difficultyEntry.bestWave = Math.max(difficultyEntry.bestWave, waveReached);
    if (completed && !difficultyEntry.completed) {
      difficultyEntry.completed = true;

      // Unlock next difficulty if applicable
      if (difficulty === 'easy') {
        this.unlockDifficulty(mapId, 'normal');
      } else if (difficulty === 'normal') {
        this.unlockDifficulty(mapId, 'hard');
      }
    }

    this.queueSave();
  }

  /**
   * Unlock difficulty level
   */
  private unlockDifficulty(
    mapId: string,
    difficulty: 'easy' | 'normal' | 'hard'
  ): void {
    if (!this.currentProgress) return;

    const exists = this.currentProgress.difficultiesUnlocked.some(
      d => d.mapId === mapId && d.difficulty === difficulty
    );

    if (!exists) {
      this.currentProgress.difficultiesUnlocked.push({
        mapId,
        difficulty,
        completed: false,
        bestWave: 0,
      });
    }
  }

  /**
   * Check and update achievement progress
   */
  private checkAchievementProgress(
    achievementId: string,
    currentValue: number
  ): void {
    if (!this.currentProgress) return;

    const achievement = this.currentProgress.achievements.find(
      a => a.id === achievementId
    );
    if (!achievement || achievement.unlocked) return;

    achievement.progress = currentValue;
    if (currentValue >= achievement.target) {
      achievement.unlocked = true;
      achievement.unlockDate = new Date().toISOString();

      logger.info(`Achievement unlocked: ${achievement.name}`);

      // Apply rewards
      this.applyAchievementRewards(achievement);
    }
  }

  /**
   * Apply achievement rewards
   */
  private applyAchievementRewards(achievement: AchievementProgress): void {
    if (!achievement.rewards || !this.currentProgress) return;

    achievement.rewards.forEach(reward => {
      switch (reward.type) {
        case 'money':
          // Could trigger a bonus money popup
          logger.info(`Achievement reward: +${reward.value} money`);
          break;
        case 'unlock':
          this.unlockMap(reward.value as string);
          logger.info(`Achievement reward: unlocked ${reward.value}`);
          break;
        case 'title':
          // Store title for display
          logger.info(`Achievement reward: ${reward.value} title`);
          break;
      }
    });
  }

  /**
   * Queue a save operation (debounced)
   */
  private queueSave(): void {
    if (this.savePending) return;

    this.savePending = true;
    setTimeout(() => {
      this.performSave();
      this.savePending = false;
    }, 1000); // 1 second debounce
  }

  /**
   * Start autosave timer every 60s
   */
  private startAutosaveTimer(): void {
    const timer = setInterval(() => this.performSave(), 60000);
    // store timer id for cleanup if needed
    this.autosaveTimer = timer as unknown as number;
  }

  /**
   * Trigger an immediate autosave (e.g., after run end)
   */
  public autosaveNow(): void {
    this.performSave();
  }

  /**
   * Perform the actual save operation
   */
  private performSave(): void {
    if (!this.currentProgress) return;

    try {
      const saveFile: SaveFile = {
        metadata: {
          version: this.SAVE_VERSION,
          saveDate: new Date().toISOString(),
          playerId: this.generatePlayerId(),
          totalPlayTime: this.currentProgress.totalPlayTime,
          achievementCount: this.currentProgress.achievements.filter(
            a => a.unlocked
          ).length,
          gameVersion: this.GAME_VERSION,
        },
        progress: this.currentProgress,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveFile));
      logger.debug('Save completed successfully');
    } catch (error) {
      logger.error('Failed to save progress:', error);
    }
  }

  /**
   * Generate player ID for save file identification
   */
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Deep merge utility for progress updates
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Validate integrity of a parsed save file
   */
  private validateSaveFile(file: SaveFile | null): file is SaveFile {
    if (!file || typeof file !== 'object') return false;
    if (!file.metadata || !file.progress) return false;
    if (typeof file.metadata.version !== 'string') return false;
    if (typeof file.progress !== 'object') return false;
    return true;
  }

  /**
   * Export save data for backup
   */
  public exportSaveData(): string {
    if (!this.currentProgress) {
      throw new Error('No save data available');
    }

    const saveFile: SaveFile = {
      metadata: {
        version: this.SAVE_VERSION,
        saveDate: new Date().toISOString(),
        playerId: this.generatePlayerId(),
        totalPlayTime: this.currentProgress.totalPlayTime,
        achievementCount: this.currentProgress.achievements.filter(
          a => a.unlocked
        ).length,
        gameVersion: this.GAME_VERSION,
      },
      progress: this.currentProgress,
    };

    return btoa(JSON.stringify(saveFile)); // Base64 encode for safe transfer
  }

  /**
   * Import save data from backup
   */
  public importSaveData(encodedData: string): boolean {
    try {
      const decodedData = atob(encodedData);
      const saveFile = JSON.parse(decodedData) as SaveFile;

      this.currentProgress = this.migrateSaveData(saveFile.progress);
      this.performSave();

      logger.info('Save data imported successfully');
      return true;
    } catch (error) {
      logger.error('Failed to import save data:', error);
      return false;
    }
  }

  /**
   * Reset all progress (with confirmation)
   */
  public resetProgress(): void {
    // eslint-disable-next-line no-alert
    if (
      !confirm(
        'Are you sure you want to reset all progress? This cannot be undone.'
      )
    ) {
      return;
    }

    this.currentProgress = this.createNewProgress();
    localStorage.removeItem(this.STORAGE_KEY);

    logger.info('All progress reset');
  }
}
