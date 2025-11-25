import type { Vector2, TileType } from '@/game/core/types'

/**
 * MapConfiguration - Interface for defining configurable map parameters
 * This enables multiple maps with different layouts, difficulties, and parameters
 */

export interface MapPathNode {
  x: number
  y: number
}

export interface MapTileConfig {
  grid: Vector2
  center: Vector2
  type: TileType
  key: string
}

export interface MapDifficultyConfig {
  name: string
  enemyHealthMultiplier: number
  enemySpeedMultiplier: number
  enemyRewardMultiplier: number
  initialMoney: number
  initialLives: number
  waveStrengthMultiplier: number
}

export type DifficultyLevel = 'easy' | 'normal' | 'hard'

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, MapDifficultyConfig> = {
  easy: {
    name: 'Easy',
    enemyHealthMultiplier: 0.8,
    enemySpeedMultiplier: 0.9,
    enemyRewardMultiplier: 1.2,
    initialMoney: 200,
    initialLives: 25,
    waveStrengthMultiplier: 0.85,
  },
  normal: {
    name: 'Normal',
    enemyHealthMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyRewardMultiplier: 1.0,
    initialMoney: 150,
    initialLives: 20,
    waveStrengthMultiplier: 1.0,
  },
  hard: {
    name: 'Hard',
    enemyHealthMultiplier: 1.3,
    enemySpeedMultiplier: 1.1,
    enemyRewardMultiplier: 0.9,
    initialMoney: 120,
    initialLives: 15,
    waveStrengthMultiplier: 1.25,
  },
}

export interface MapConfiguration {
  id: string
  name: string
  description: string
  width: number
  height: number
  cellSize: number
  /**
   * Legacy single path definition (grid coordinates). If `paths` is provided, use that instead.
   */
  pathNodes: MapPathNode[]
  /**
   * Optional multiple routes (each array is a path in grid coords).
   */
  paths?: MapPathNode[][]
  /**
   * Optional explicit spawn/exit points (grid coords). If omitted, derived from path start/end.
   */
  spawnPoints?: MapPathNode[]
  exitPoints?: MapPathNode[]
  randomPath?: boolean
  theme: string
  backgroundColor: string
  pathColor: string
  grassColor: string
  unlockRequirement?: {
    type: 'waves_cleared' | 'achievement'
    value: string
  }
  metadata: {
    version: string
    author: string
    created: string
    estimatedDuration: string // e.g., "15-20 minutes"
    difficulty: DifficultyLevel[]
    tags: string[] // e.g., ['beginner', 'challenge', 'custom']
  }
}

/**
 * Future expansion interface for advanced map features
 */
export interface AdvancedMapFeatures {
  specialTiles?: {
    bonus?: { grid: Vector2; effect: 'money' | 'lives' | 'speed' }[]
    obstacle?: { grid: Vector2; effect: 'slow' | 'block' }[]
    spawn?: { grid: Vector2; effect: 'extra_enemies' }[]
  }
  environmentalEffects?: {
    type: 'wind' | 'fog' | 'rain' | 'night'
    intensity: number
    affectedAreas?: Vector2[]
  }
  pathVariations?: {
    branchPoints: Vector2[]
    alternativeRoutes: MapPathNode[][]
  }
}
