import type { TowerType } from '@/game/core/types'

// Chapter 6 Future Expansion: Map Configuration Integration
// These constants now work with the MapManager system for forward compatibility
import { MapManager } from '@/game/maps/MapManager'

export const GRID_WIDTH = 45
export const GRID_HEIGHT = 30
export const CELL_SIZE = 48

// Chapter 2 Balance: ECONOMY REBALANCING
// Reduced starting money from 200 to 150 to create economic pressure
// This forces players to make strategic early-game decisions about tower placement
export const INITIAL_MONEY = 150
export const INITIAL_LIVES = 20
export const INITIAL_SCORE = 0

export const PATH_GRID_NODES = [
  { x: 0, y: 14 },
  { x: 10, y: 14 },
  { x: 10, y: 6 },
  { x: 20, y: 6 },
  { x: 20, y: 20 },
  { x: 30, y: 20 },
  { x: 30, y: 10 },
  { x: 38, y: 10 },
  { x: 38, y: 24 },
  { x: 44, y: 24 },
]

export interface TowerProfile {
  name: string
  description: string
  range: number
  fireRate: number
  damage: number
  projectileSpeed: number
  cost: number
  color: string
  damageType: 'impact' | 'volley' | 'control'
  splashRadius?: number
  splashFactor?: number
  slow?: {
    multiplier: number
    duration: number
  }
  dot?: {
    dps: number
    duration: number
    damageType?: 'dot' | 'control'
  }
  vulnerabilityDebuff?: {
    amount: number
    duration: number
  }
}

// Chapter 2 Balance: TOWER-ROLE & ROLE DIFFERENTIATION
// Implemented clear strategic advantages for each tower type:
// - Indica: Single-Target-Hard-Hit (0.60 DPS/$) - Focused elimination
// - Sativa: Fast-Shot (0.23 DPS/$) with double-shot capability - Area control
// - Support: Slow-Support (0.25 DPS/$) with timed slow effects - Enemy management

export const TOWER_PROFILES: Record<TowerType, TowerProfile> = {
  indica: {
    name: 'Indica Tower',
    description: 'Single-Target-Hard-Hit: Heavy rounds for focused elimination.',
    range: 142,
    fireRate: 1.25,
    damage: 32,
    projectileSpeed: 315,
    cost: 75,
    color: '#9fd8b8',
    damageType: 'impact',
    vulnerabilityDebuff: {
      amount: 0.05,
      duration: 2,
    },
  },
  sativa: {
    name: 'Sativa Tower',
    description: 'Fast-Shot: Rapid fire with double-shot capability.',
    range: 138,
    fireRate: 0.8,
    damage: 12,
    projectileSpeed: 380,
    cost: 70,
    color: '#f2e881',
    damageType: 'volley',
    splashRadius: 22, // light splash for crowd control
    splashFactor: 0.5,
  },
  support: {
    name: 'Support Tower',
    description: 'Slow-Support: Slows enemies 30% for 2 seconds, light damage.',
    range: 150,
    fireRate: 1.05,
    damage: 10,
    projectileSpeed: 240,
    cost: 65,
    color: '#6fe2ff',
    damageType: 'control',
    slow: {
      multiplier: 0.7,
      duration: 2.0,
    },
    dot: {
      dps: 3,
      duration: 2.0,
      damageType: 'dot',
    },
    vulnerabilityDebuff: {
      amount: 0.15,
      duration: 2.5,
    },
  },
}

// Chapter 6 Future Expansion: Backward Compatibility Functions
// These functions ensure existing code continues to work while integrating new systems

/**
 * Get current map configuration (backward compatibility)
 * @deprecated Use MapManager.getInstance().getCurrentMap() for new code
 */
export function getCurrentMapConfig() {
  return {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    cellSize: CELL_SIZE,
    pathNodes: PATH_GRID_NODES,
    initialMoney: INITIAL_MONEY,
    initialLives: INITIAL_LIVES,
  }
}

/**
 * Apply difficulty modifiers (forward compatibility)
 */
export function applyDifficultyModifications(
  initialMoney: number = INITIAL_MONEY,
  initialLives: number = INITIAL_LIVES
) {
  const mapManager = MapManager.getInstance()
  return mapManager.applyDifficultyModifiers({ initialMoney, initialLives })
}

/**
 * Legacy function for getting map dimensions
 * @deprecated Use MapManager for new implementations
 */
export function getMapDimensions() {
  return {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    cellSize: CELL_SIZE,
    worldWidth: GRID_WIDTH * CELL_SIZE,
    worldHeight: GRID_HEIGHT * CELL_SIZE,
  }
}

// Export MapManager for direct access if needed
export { MapManager }
