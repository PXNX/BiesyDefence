import type {
  AchievementProgress,
  AchievementDefinition,
  AchievementCategory,
  AchievementReward,
} from './PlayerProgress'
import { createLogger } from '@/game/utils/logger'

/**
 * AchievementSystem - Manages achievement tracking and notifications
 * Provides foundation for player engagement and progression features
 */

const logger = createLogger('AchievementSystem')

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
      // Progression Achievements
      {
        id: 'first_wave',
        name: 'First Steps',
        description: 'Clear your first wave',
        category: 'progression',
        target: 1,
        icon: '🎯',
        rarity: 'common',
        rewards: [
          { type: 'money', value: 50, description: '50 bonus money' }
        ],
      },
      {
        id: 'wave_5',
        name: 'Getting Started',
        description: 'Clear 5 waves',
        category: 'progression',
        target: 5,
        icon: '🌱',
        rarity: 'common',
        rewards: [
          { type: 'money', value: 100, description: '100 bonus money' }
        ],
      },
      {
        id: 'wave_10',
        name: 'Growing Strong',
        description: 'Clear 10 waves',
        category: 'progression',
        target: 10,
        icon: '🌿',
        rarity: 'common',
        rewards: [
          { type: 'money', value: 200, description: '200 bonus money' }
        ],
      },
      {
        id: 'wave_25',
        name: 'Master Cultivator',
        description: 'Clear 25 waves',
        category: 'progression',
        target: 25,
        icon: '🌳',
        rarity: 'rare',
        rewards: [
          { type: 'money', value: 500, description: '500 bonus money' },
          { type: 'title', value: 'Master Cultivator', description: 'Master Cultivator title' }
        ],
      },

      // Efficiency Achievements
      {
        id: 'efficient_defender',
        name: 'Efficient Defender',
        description: 'Complete a game with over 100 money remaining',
        category: 'efficiency',
        target: 1,
        icon: '💰',
        rarity: 'rare',
        rewards: [
          { type: 'unlock', value: 'tight_terraces', description: 'Unlock Tight Terraces map' }
        ],
      },
      {
        id: 'money_hoarder',
        name: 'Money Hoarder',
        description: 'End a game with over 500 money',
        category: 'efficiency',
        target: 1,
        icon: '💎',
        rarity: 'epic',
        rewards: [
          { type: 'money', value: 1000, description: '1000 bonus money' },
          { type: 'title', value: 'Hoarder', description: 'Hoarder title' }
        ],
      },

      // Skill Achievements
      {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Clear wave 15 in under 5 minutes',
        category: 'skill',
        target: 1,
        icon: '⚡',
        rarity: 'rare',
        rewards: [
          { type: 'title', value: 'Speed Runner', description: 'Speed Runner title' }
        ],
      },
      {
        id: 'perfect_game',
        name: 'Perfect Defense',
        description: 'Complete a game without losing any lives',
        category: 'skill',
        target: 1,
        icon: '🛡️',
        rarity: 'epic',
        rewards: [
          { type: 'money', value: 750, description: '750 bonus money' },
          { type: 'title', value: 'Perfect Defender', description: 'Perfect Defender title' }
        ],
      },

      // Exploration Achievements
      {
        id: 'map_explorer',
        name: 'Map Explorer',
        description: 'Unlock all three difficulty levels on the default map',
        category: 'exploration',
        target: 3,
        icon: '🗺️',
        rarity: 'common',
        rewards: [
          { type: 'money', value: 300, description: '300 bonus money' }
        ],
      },
      {
        id: 'difficulty_master',
        name: 'Difficulty Master',
        description: 'Complete all difficulty levels on any map',
        category: 'exploration',
        target: 3,
        icon: '🏆',
        rarity: 'epic',
        rewards: [
          { type: 'unlock', value: 'circular_garden', description: 'Unlock Circular Garden map' },
          { type: 'title', value: 'Master', description: 'Master title' }
        ],
      },

      // Special/Hidden Achievements
      {
        id: 'tower_lover',
        name: 'Tower Lover',
        description: 'Place 50 towers in a single game',
        category: 'special',
        target: 1,
        icon: '🏗️',
        rarity: 'rare',
        rewards: [
          { type: 'money', value: 400, description: '400 bonus money' }
        ],
        hidden: true,
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Play your first game before 9 AM',
        category: 'special',
        target: 1,
        icon: '🐦',
        rarity: 'rare',
        rewards: [
          { type: 'money', value: 200, description: '200 bonus money' }
        ],
        hidden: true,
      },
    ]

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  /**
   * Initialize progress tracking for a player
   */
  public initializeProgress(progress: AchievementProgress[]): void {
    this.activeProgress = progress.map(p => ({ ...p })) // Create copies
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
    return [...this.activeProgress]
  }

  /**
   * Check and update achievement progress
   */
  public updateProgress(achievementId: string, currentValue: number): void {
    const achievement = this.achievements.get(achievementId)
    if (!achievement) {
      logger.warn(`Unknown achievement ID: ${achievementId}`)
      return
    }

    let progress = this.activeProgress.find(p => p.id === achievementId)
    
    // Initialize progress if not exists
    if (!progress) {
      progress = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        progress: 0,
        target: achievement.target,
        unlocked: false,
        rewards: [...achievement.rewards],
      }
      this.activeProgress.push(progress)
    }

    // Update progress
    const oldProgress = progress.progress
    progress.progress = Math.min(currentValue, achievement.target)
    
    // Check if achievement just unlocked
    if (!progress.unlocked && progress.progress >= achievement.target && oldProgress < achievement.target) {
      progress.unlocked = true
      progress.unlockDate = new Date().toISOString()
      
      logger.info(`Achievement unlocked: ${achievement.name}`)
      
      // Add to notification queue
      this.notificationQueue.push({ ...progress })
      
      // Apply rewards
      this.applyRewards(progress)
      
      // Notify subscribers
      this.notifySubscribers(progress)
    }
  }

  /**
   * Check specific achievement conditions
   */
  public checkWavesCleared(wavesCleared: number): void {
    this.updateProgress('first_wave', wavesCleared >= 1 ? 1 : 0)
    this.updateProgress('wave_5', Math.min(wavesCleared, 5))
    this.updateProgress('wave_10', Math.min(wavesCleared, 10))
    this.updateProgress('wave_25', Math.min(wavesCleared, 25))
  }

  public checkMoneyRemaining(moneyRemaining: number): void {
    if (moneyRemaining >= 100) {
      this.updateProgress('efficient_defender', 1)
    }
    if (moneyRemaining >= 500) {
      this.updateProgress('money_hoarder', 1)
    }
  }

  public checkGameSpeed(waveReached: number, playTimeSeconds: number): void {
    if (waveReached >= 15 && playTimeSeconds <= 300) { // 5 minutes
      this.updateProgress('speed_runner', 1)
    }
  }

  public checkPerfectGame(livesLost: number): void {
    if (livesLost === 0) {
      this.updateProgress('perfect_game', 1)
    }
  }

  public checkTowerCount(towersPlaced: number): void {
    if (towersPlaced >= 50) {
      this.updateProgress('tower_lover', 1)
    }
  }

  public checkPlayTime(): void {
    const hour = new Date().getHours()
    if (hour < 9) { // Before 9 AM
      this.updateProgress('early_bird', 1)
    }
  }

  /**
   * Apply achievement rewards
   */
  private applyRewards(achievement: AchievementProgress): void {
    if (!achievement.rewards) return

    achievement.rewards.forEach(reward => {
      switch (reward.type) {
        case 'money':
          logger.info(`Achievement reward: +${reward.value} money`)
          // This would trigger UI notification for bonus money
          break
        case 'unlock':
          logger.info(`Achievement reward: unlocked ${reward.value}`)
          // This would trigger map/content unlock
          break
        case 'title':
          logger.info(`Achievement reward: ${reward.value} title`)
          // This would store title for player display
          break
      }
    })
  }

  /**
   * Get next achievement to unlock
   */
  public getNextAchievement(): AchievementProgress | null {
    const lockedAchievements = this.activeProgress.filter(a => !a.unlocked)
    if (lockedAchievements.length === 0) return null

    // Sort by progress percentage descending
    return lockedAchievements.sort((a, b) => {
      const aProgress = a.progress / a.target
      const bProgress = b.progress / b.target
      return bProgress - aProgress
    })[0]
  }

  /**
   * Get achievement notification queue
   */
  public getNotifications(): AchievementProgress[] {
    return [...this.notificationQueue]
  }

  /**
   * Clear notification queue
   */
  public clearNotifications(): void {
    this.notificationQueue = []
  }

  /**
   * Subscribe to achievement notifications
   */
  public subscribe(callback: (achievement: AchievementProgress) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(achievement: AchievementProgress): void {
    this.subscribers.forEach(callback => {
      try {
        callback(achievement)
      } catch (error) {
        logger.error('Error in achievement notification subscriber:', error)
      }
    })
  }

  /**
   * Get achievements by category
   */
  public getAchievementsByCategory(category: AchievementCategory): AchievementProgress[] {
    return this.activeProgress.filter(a => a.category === category)
  }

  /**
   * Get unlocked achievements count
   */
  public getUnlockedCount(): number {
    return this.activeProgress.filter(a => a.unlocked).length
  }

  /**
   * Get total progress percentage
   */
  public getTotalProgress(): number {
    if (this.activeProgress.length === 0) return 0

    const totalProgress = this.activeProgress.reduce((sum, achievement) => {
      return sum + (achievement.progress / achievement.target)
    }, 0)

    return totalProgress / this.activeProgress.length
  }

  /**
   * Reset all progress (for testing or new player)
   */
  public resetProgress(): void {
    this.activeProgress = []
    this.notificationQueue = []
    
    // Reinitialize with base achievements
    this.initializeAchievements()
    
    logger.info('Achievement progress reset')
  }

  /**
   * Export achievement data for save file
   */
  public exportData(): AchievementProgress[] {
    return this.activeProgress.map(a => ({ ...a }))
  }
}