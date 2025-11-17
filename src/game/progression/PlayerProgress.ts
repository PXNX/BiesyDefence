/**
 * PlayerProgress - Interface for save data structure
 * Foundation for progression tracking and save/load functionality
 */

export interface PlayerProgress {
  // Version tracking for save format compatibility
  version: string
  saveDate: string
  
  // Game statistics
  totalWavesCleared: number
  highestWaveReached: number
  totalPlayTime: number // in seconds
  totalGamesPlayed: number
  totalGamesWon: number
  
  // Economy progression
  highestMoneyEarned: number
  mostEfficientRun: {
    wave: number
    moneyLeft: number
    efficiency: number // money per wave ratio
  }
  
  // Map and difficulty progression
  mapsUnlocked: string[]
  difficultiesUnlocked: Array<{
    mapId: string
    difficulty: 'easy' | 'normal' | 'hard'
    completed: boolean
    bestWave: number
  }>
  
  // Achievement tracking
  achievements: AchievementProgress[]
  
  // Personal records
  personalRecords: {
    fastestWin: {
      wave: number
      time: number // in seconds
      mapId: string
    }
    highestMoneyEnd: {
      wave: number
      money: number
      mapId: string
    }
    mostTowersPlaced: {
      wave: number
      count: number
      mapId: string
    }
  }
  
  // Settings and preferences
  settings: {
    preferredDifficulty: 'easy' | 'normal' | 'hard'
    showTutorials: boolean
    soundEnabled: boolean
    musicEnabled: boolean
    language: string
    theme: 'cannabis' | 'herbs' | 'laboratory' | 'auto'
  }
  
  // Future expansion data
  customContent?: {
    customMaps: string[]
    customTowers?: any[] // Reserved for future tower customization
    customEnemies?: any[] // Reserved for future enemy customization
  }
}

export interface AchievementProgress {
  id: string
  name: string
  description: string
  category: AchievementCategory
  progress: number
  target: number
  unlocked: boolean
  unlockDate?: string
  rewards?: AchievementReward[]
}

export type AchievementCategory = 
  | 'progression' // Waves cleared, games won, etc.
  | 'efficiency' // Money management, tower usage, etc.
  | 'skill' // Perfect games, no damage, etc.
  | 'exploration' // Maps unlocked, difficulties beaten, etc.
  | 'collection' // Tower combinations, enemy types, etc.
  | 'special' // Hidden achievements, easter eggs, etc.

export interface AchievementReward {
  type: 'money' | 'unlock' | 'cosmetic' | 'title'
  value: string | number
  description: string
}

export interface SaveDataMetadata {
  version: string
  saveDate: string
  playerId: string
  totalPlayTime: number
  achievementCount: number
  gameVersion: string // Current game version for compatibility
  checksum?: string // For data integrity verification
}

/**
 * Achievement definitions - Template for future achievement system
 */
export interface AchievementDefinition {
  id: string
  name: string
  description: string
  category: AchievementCategory
  target: number
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  rewards: AchievementReward[]
  hidden?: boolean // Hidden until unlocked
  requirements?: {
    previousAchievements?: string[]
    minGameVersion?: string
  }
}

/**
 * Save file format with version compatibility
 */
export interface SaveFile {
  metadata: SaveDataMetadata
  progress: PlayerProgress
  // Future expansion fields
  futureExpansion?: {
    data: any // Reserved for future save data
  }
}