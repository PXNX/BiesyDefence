import type { TowerType } from '@/game/core/types'

// Chapter 6 Future Expansion: Map Configuration Integration
// These constants now work with the MapManager system for forward compatibility
import { MapManager } from '@/game/maps/MapManager'

export const GRID_WIDTH = 12
export const GRID_HEIGHT = 8
export const CELL_SIZE = 70

// Chapter 2 Balance: ECONOMY REBALANCING
// Reduced starting money from 200 to 150 to create economic pressure
// This forces players to make strategic early-game decisions about tower placement
export const INITIAL_MONEY = 150
export const INITIAL_LIVES = 20
export const INITIAL_SCORE = 0

export const PATH_GRID_NODES = [
  { x: 0, y: 3 },
  { x: 4, y: 3 },
  { x: 4, y: 1 },
  { x: 8, y: 1 },
  { x: 8, y: 5 },
  { x: 11, y: 5 },
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
    range: 140,
    fireRate: 1.2,
    damage: 28,
    projectileSpeed: 310,
    cost: 75,
    color: '#9fd8b8',
  },
  sativa: {
    name: 'Sativa Tower',
    description: 'Fast-Shot: Rapid fire with double-shot capability.',
    range: 135,
    fireRate: 0.8,
    damage: 16,
    projectileSpeed: 380,
    cost: 70,
    color: '#f2e881',
  },
  support: {
    name: 'Support Tower',
    description: 'Slow-Support: Slows enemies 30% for 2 seconds, light damage.',
    range: 145,
    fireRate: 1.1,
    damage: 13,
    projectileSpeed: 240,
    cost: 65,
    color: '#6fe2ff',
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
