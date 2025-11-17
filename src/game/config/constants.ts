import type { TowerType } from '@/game/core/types'

export const GRID_WIDTH = 12
export const GRID_HEIGHT = 8
export const CELL_SIZE = 70
export const INITIAL_MONEY = 200
export const INITIAL_LIVES = 20

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

export const TOWER_PROFILES: Record<TowerType, TowerProfile> = {
  indica: {
    name: 'Indica Tower',
    description: 'Heavy rounds that trade cadence for punch.',
    range: 150,
    fireRate: 1.45,
    damage: 34,
    projectileSpeed: 310,
    cost: 80,
    color: '#9fd8b8',
  },
  sativa: {
    name: 'Sativa Tower',
    description: 'Light shells with fast follow-up bursts.',
    range: 125,
    fireRate: 0.6,
    damage: 16,
    projectileSpeed: 380,
    cost: 64,
    color: '#f2e881',
  },
  support: {
    name: 'Support Tower',
    description: 'Slows pests so shooters can finish them off.',
    range: 140,
    fireRate: 1.05,
    damage: 10,
    projectileSpeed: 240,
    cost: 58,
    color: '#6fe2ff',
  },
}
