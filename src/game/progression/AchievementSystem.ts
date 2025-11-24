import type { AchievementProgress, AchievementDefinition, AchievementCategory } from './PlayerProgress'
import type { TowerType } from '@/game/core/types'
import { createLogger } from '@/game/utils/logger'

/**
 * AchievementSystem - central manager for definitions, progress, notifications and rewards.
 * Definitions are static, progress is provided by SaveManager or initialized here.
 */

const logger = createLogger('AchievementSystem')

type ProgressSeed = Partial<AchievementProgress> & { id: string }

export class AchievementSystem {
  private static instance: AchievementSystem | null = null
  private achievements: Map<string, AchievementDefinition> = new Map()
  private activeProgress: AchievementProgress[] = []
  private notificationQueue: AchievementProgress[] = []
  private subscribers: Set<(achievement: AchievementProgress) => void> = new Set()

  private constructor() {
    this.initializeAchievements()
  }

  public static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem()
    }
    return AchievementSystem.instance
  }

  /**
   * Initialize default achievement definitions
   */
  private initializeAchievements(): void {
    const defaultAchievements: AchievementDefinition[] = [
      {
        id: 'first_wave',
        name: 'First Steps',
        description: 'Clear your first wave',
        category: 'progression',
        target: 1,
        icon: 'icon_seedling',
        rarity: 'common',
        rewards: [{ type: 'money', value: 50, description: '50 bonus money' }],
      },
      {
        id: 'wave_5',
        name: 'Getting Started',
        description: 'Clear 5 waves',
        category: 'progression',
        target: 5,
        icon: 'icon_leaf',
        rarity: 'common',
        rewards: [{ type: 'money', value: 100, description: '100 bonus money' }],
      },
      {
        id: 'wave_10',
        name: 'Growing Strong',
        description: 'Clear 10 waves',
        category: 'progression',
        target: 10,
        icon: 'icon_blossom',
        rarity: 'rare',
        rewards: [{ type: 'money', value: 200, description: '200 bonus money' }],
      },
      {
        id: 'wave_20',
        name: 'Master Cultivator',
        description: 'Clear 20 waves',
        category: 'progression',
        target: 20,
        icon: 'icon_trophy_gold',
        rarity: 'epic',
        rewards: [
          { type: 'money', value: 500, description: '500 bonus money' },
          { type: 'title', value: 'Master Cultivator', description: 'Master Cultivator title' },
        ],
      },
      {
        id: 'tower_builder',
        name: 'Builder at Heart',
        description: 'Place 10 towers',
        category: 'progression',
        target: 10,
        icon: 'icon_grid',
        rarity: 'common',
        rewards: [{ type: 'money', value: 120, description: '120 bonus money' }],
      },
      {
        id: 'efficient_defender',
        name: 'Efficient Defender',
        description: 'Complete a game with over 100 money remaining',
        category: 'efficiency',
        target: 1,
        icon: 'icon_coin_stack',
        rarity: 'rare',
        rewards: [{ type: 'unlock', value: 'tight_terraces', description: 'Unlock Tight Terraces map' }],
      },
      {
        id: 'money_hoarder',
        name: 'Money Hoarder',
        description: 'End a game with over 500 money',
        category: 'efficiency',
        target: 1,
        icon: 'icon_vault',
        rarity: 'epic',
        rewards: [
          { type: 'money', value: 1000, description: '1000 bonus money' },
          { type: 'title', value: 'Hoarder', description: 'Hoarder title' },
        ],
      },
      {
        id: 'peak_income',
        name: 'Rainy Season',
        description: 'Earn 300 money in a single wave',
        category: 'efficiency',
        target: 1,
        icon: 'icon_rain',
        rarity: 'rare',
        rewards: [{ type: 'money', value: 250, description: '250 bonus money' }],
      },
      {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Clear wave 15 in under 5 minutes',
        category: 'skill',
        target: 1,
        icon: 'icon_lightning',
        rarity: 'rare',
        rewards: [{ type: 'title', value: 'Speed Runner', description: 'Speed Runner title' }],
      },
      {
        id: 'perfect_game',
        name: 'Perfect Defense',
        description: 'Complete a game without losing any lives',
        category: 'skill',
        target: 1,
        icon: 'icon_shield',
        rarity: 'epic',
        rewards: [
          { type: 'money', value: 750, description: '750 bonus money' },
          { type: 'title', value: 'Perfect Defender', description: 'Perfect Defender title' },
        ],
      },
      {
        id: 'perfect_waves_three',
        name: 'Spotless',
        description: 'Finish 3 waves without leaks',
        category: 'skill',
        target: 3,
        icon: 'icon_clean',
        rarity: 'rare',
        rewards: [{ type: 'money', value: 180, description: '180 bonus money' }],
      },
      {
        id: 'map_explorer',
        name: 'Map Explorer',
        description: 'Unlock all three difficulty levels on the default map',
        category: 'exploration',
        target: 3,
        icon: 'icon_map',
        rarity: 'common',
        rewards: [{ type: 'money', value: 300, description: '300 bonus money' }],
      },
      {
        id: 'difficulty_master',
        name: 'Difficulty Master',
        description: 'Complete all difficulty levels on any map',
        category: 'exploration',
        target: 3,
        icon: 'icon_compass',
        rarity: 'legendary',
        rewards: [
          { type: 'unlock', value: 'circular_garden', description: 'Unlock Circular Garden map' },
          { type: 'title', value: 'Master', description: 'Master title' },
        ],
      },
      {
        id: 'sniper_elite',
        name: 'Sniper Elite',
        description: 'Eliminate 50 enemies with Sniper towers',
        category: 'special',
        target: 50,
        icon: 'icon_crosshair',
        rarity: 'rare',
        rewards: [{ type: 'title', value: 'Eagle Eye', description: 'Eagle Eye title' }],
      },
      {
        id: 'chain_reaction',
        name: 'Chain Reaction',
        description: 'Eliminate 50 enemies with Chain towers',
        category: 'special',
        target: 50,
        icon: 'icon_chain',
        rarity: 'rare',
        rewards: [{ type: 'money', value: 320, description: '320 bonus money' }],
      },
      {
        id: 'support_finisher',
        name: 'Slow and Steady',
        description: 'Score 20 kills with Support towers',
        category: 'special',
        target: 20,
        icon: 'icon_support',
        rarity: 'common',
        rewards: [{ type: 'money', value: 150, description: '150 bonus money' }],
      },
    ]

    this.achievements.clear()
    defaultAchievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  /**
   * Initialize progress tracking for a player
   */
  public initializeProgress(progress: AchievementProgress[]): void {
    const seed = progress ?? []
    this.activeProgress = Array.from(this.achievements.values()).map((def) =>
      this.createProgressRecord(def, seed.find((p) => p.id === def.id))
    )
  }

  /**
   * Get all achievement definitions
   */
  public getAchievementDefinitions(): AchievementDefinition[] {
    return Array.from(this.achievements.values())
  }

  /**
   * Get achievement by ID
   */
  public getAchievement(id: string): AchievementDefinition | undefined {
    return this.achievements.get(id)
  }

  /**
   * Get current achievement progress
   */
  public getProgress(): AchievementProgress[] {
    return this.activeProgress.map((p) => ({ ...p, rewards: p.rewards ? [...p.rewards] : undefined }))
  }

  /**
   * Check and update achievement progress with a numeric value
   */
  public updateProgress(achievementId: string, currentValue: number): void {
    const achievement = this.achievements.get(achievementId)
    if (!achievement) {
      logger.warn(`Unknown achievement ID: ${achievementId}`)
      return
    }

    const progress = this.ensureProgress(achievement)
    const oldProgress = progress.progress
    progress.progress = Math.min(currentValue, achievement.target)

    if (!progress.unlocked && progress.progress >= achievement.target && oldProgress < achievement.target) {
      progress.unlocked = true
      progress.unlockDate = new Date().toISOString()
      logger.info(`Achievement unlocked: ${achievement.name}`)
      this.notificationQueue.push({ ...progress })
      this.applyRewards(progress)
      this.notifySubscribers(progress)
    }
  }

  /**
   * Track waves cleared aggregate
   */
  public trackWavesCleared(totalWavesCleared: number): void {
    this.updateProgress('first_wave', totalWavesCleared >= 1 ? 1 : 0)
    this.updateProgress('wave_5', Math.min(totalWavesCleared, 5))
    this.updateProgress('wave_10', Math.min(totalWavesCleared, 10))
    this.updateProgress('wave_20', Math.min(totalWavesCleared, 20))
  }

  public trackPerfectWaves(perfectWaves: number): void {
    this.updateProgress('perfect_waves_three', perfectWaves)
  }

  public trackMoneyRemaining(moneyRemaining: number): void {
    if (moneyRemaining >= 100) {
      this.updateProgress('efficient_defender', 1)
    }
    if (moneyRemaining >= 500) {
      this.updateProgress('money_hoarder', 1)
    }
  }

  public trackPeakIncome(income: number): void {
    if (income >= 300) {
      this.updateProgress('peak_income', 1)
    }
  }

  public trackSpeedrun(waveReached: number, playTimeSeconds: number): void {
    if (waveReached >= 15 && playTimeSeconds <= 300) {
      this.updateProgress('speed_runner', 1)
    }
  }

  public trackPerfectGame(livesLost: number): void {
    if (livesLost === 0) {
      this.updateProgress('perfect_game', 1)
    }
  }

  public trackTowerPlacements(totalPlaced: number): void {
    this.updateProgress('tower_builder', totalPlaced)
  }

  public trackTowerKills(towerType: TowerType, totalKills: number): void {
    if (towerType === 'sniper') {
      this.updateProgress('sniper_elite', totalKills)
    }
    if (towerType === 'chain') {
      this.updateProgress('chain_reaction', totalKills)
    }
    if (towerType === 'support') {
      this.updateProgress('support_finisher', totalKills)
    }
  }

  /**
   * Get next achievement to unlock
   */
  public getNextAchievement(): AchievementProgress | null {
    const lockedAchievements = this.activeProgress.filter((a) => !a.unlocked)
    if (lockedAchievements.length === 0) return null

    return lockedAchievements
      .map((progress) => ({
        ...progress,
        ratio: progress.target === 0 ? 0 : progress.progress / progress.target,
      }))
      .sort((a, b) => b.ratio - a.ratio)[0]
  }

  public getNotifications(): AchievementProgress[] {
    return [...this.notificationQueue]
  }

  public drainNotifications(): AchievementProgress[] {
    const copy = [...this.notificationQueue]
    this.notificationQueue = []
    return copy
  }

  public clearNotifications(): void {
    this.notificationQueue = []
  }

  /**
   * Subscribe to achievement notifications
   */
  public subscribe(callback: (achievement: AchievementProgress) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Get achievements by category
   */
  public getAchievementsByCategory(category: AchievementCategory): AchievementProgress[] {
    return this.activeProgress.filter((a) => a.category === category)
  }

  public getUnlockedCount(): number {
    return this.activeProgress.filter((a) => a.unlocked).length
  }

  public getTotalProgress(): number {
    if (this.activeProgress.length === 0) return 0
    const totalProgress = this.activeProgress.reduce((sum, achievement) => {
      return sum + achievement.progress / achievement.target
    }, 0)
    return totalProgress / this.activeProgress.length
  }

  public resetProgress(): void {
    this.notificationQueue = []
    this.activeProgress = Array.from(this.achievements.values()).map((def) =>
      this.createProgressRecord(def)
    )
    logger.info('Achievement progress reset')
  }

  /**
   * Export achievement data for save file
   */
  public exportData(): AchievementProgress[] {
    return this.getProgress()
  }

  /**
   * Internal helpers
   */
  private applyRewards(achievement: AchievementProgress): void {
    if (!achievement.rewards) return

    achievement.rewards.forEach((reward) => {
      switch (reward.type) {
        case 'money':
          logger.info(`Achievement reward: +${reward.value} money`)
          break
        case 'unlock':
          logger.info(`Achievement reward: unlocked ${reward.value}`)
          break
        case 'title':
          logger.info(`Achievement reward: ${reward.value} title`)
          break
        case 'cosmetic':
          logger.info(`Achievement reward: cosmetic ${reward.value}`)
          break
      }
    })
  }

  private notifySubscribers(achievement: AchievementProgress): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(achievement)
      } catch (error) {
        logger.error('Error in achievement notification subscriber:', error)
      }
    })
  }

  private ensureProgress(def: AchievementDefinition): AchievementProgress {
    let progress = this.activeProgress.find((p) => p.id === def.id)
    if (!progress) {
      progress = this.createProgressRecord(def)
      this.activeProgress.push(progress)
    }
    return progress
  }

  private createProgressRecord(def: AchievementDefinition, seed?: ProgressSeed): AchievementProgress {
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      progress: seed?.progress ?? 0,
      target: def.target,
      unlocked: seed?.unlocked ?? false,
      unlockDate: seed?.unlockDate,
      rewards: def.rewards ? [...def.rewards] : undefined,
      rarity: def.rarity,
      icon: def.icon,
    }
  }

  /**
   * Testing helper to reset singleton
   */
  public static resetForTests(): void {
    AchievementSystem.instance = null
  }
}
