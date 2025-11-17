/**
 * Game configuration and balancing constants
 * Centralized values for easy tuning and balancing
 */

// Game Constants
export const GAME_CONFIG = {
  // Core mechanics
  INITIAL_CURRENCY: 100,
  INITIAL_LIVES: 20,
  WAVE_COOLDOWN: 10, // seconds between waves
  
  // Tower costs
  TOWER_COSTS: {
    BASIC_TOWER: 50,
    ARTILLERY_TOWER: 100,
    SLOW_TOWER: 75,
    SUPPORT_TOWER: 120
  },
  
  // Tower stats
  TOWER_STATS: {
    BASIC_TOWER: {
      DAMAGE: 10,
      RANGE: 10,
      ATTACK_RATE: 1.0, // attacks per second
      PROJECTILE_SPEED: 20
    },
    ARTILLERY_TOWER: {
      DAMAGE: 25,
      RANGE: 15,
      ATTACK_RATE: 0.5,
      PROJECTILE_SPEED: 15,
      AOE_RADIUS: 3
    },
    SLOW_TOWER: {
      DAMAGE: 5,
      RANGE: 8,
      ATTACK_RATE: 1.5,
      SLOW_AMOUNT: 0.5, // 50% slow
      SLOW_DURATION: 3.0,
      PROJECTILE_SPEED: 25
    }
  },
  
  // Enemy stats
  ENEMY_STATS: {
    BASIC_ENEMY: {
      HEALTH: 50,
      SPEED: 2.0,
      REWARD: 10,
      ARMOR: 0
    },
    ARMORED_ENEMY: {
      HEALTH: 120,
      SPEED: 1.5,
      REWARD: 20,
      ARMOR: 20
    },
    FAST_ENEMY: {
      HEALTH: 30,
      SPEED: 4.0,
      REWARD: 15,
      ARMOR: 0
    }
  },
  
  // Wave progression
  WAVE_CONFIG: {
    BASE_ENEMY_COUNT: 10,
    ENEMY_COUNT_INCREMENT: 5,
    DIFFICULTY_MULTIPLIER: 1.1,
    BOSS_WAVE_INTERVAL: 5 // Every 5th wave is a boss wave
  },
  
  // Map configuration
  MAP_CONFIG: {
    TILE_SIZE: 5,
    DEFAULT_MAP_WIDTH: 20,
    DEFAULT_MAP_HEIGHT: 20,
    PATH_WIDTH: 3
  },
  
  // Visual settings
  VISUAL_CONFIG: {
    SHADOW_QUALITY: 'high', // low, medium, high
    PARTICLE_COUNT: 1000,
    BLOOM_STRENGTH: 1.2,
    ANIMATION_QUALITY: 'high'
  }
} as const;

// Type definitions for configuration
export type TowerType = 'basic' | 'artillery' | 'slow' | 'support';
export type EnemyType = 'basic' | 'armored' | 'fast' | 'boss';

// Utility functions
export function getEnemyHealthMultiplier(waveNumber: number): number {
  return Math.pow(GAME_CONFIG.WAVE_CONFIG.DIFFICULTY_MULTIPLIER, (waveNumber - 1) * 0.1);
}

export function getEnemyCountForWave(waveNumber: number): number {
  return Math.floor(
    GAME_CONFIG.WAVE_CONFIG.BASE_ENEMY_COUNT + 
    (waveNumber - 1) * GAME_CONFIG.WAVE_CONFIG.ENEMY_COUNT_INCREMENT
  );
}

export function isBossWave(waveNumber: number): boolean {
  return waveNumber % GAME_CONFIG.WAVE_CONFIG.BOSS_WAVE_INTERVAL === 0;
}

export function getTowerCost(type: TowerType): number {
  switch (type) {
    case 'basic': return GAME_CONFIG.TOWER_COSTS.BASIC_TOWER;
    case 'artillery': return GAME_CONFIG.TOWER_COSTS.ARTILLERY_TOWER;
    case 'slow': return GAME_CONFIG.TOWER_COSTS.SLOW_TOWER;
    case 'support': return GAME_CONFIG.TOWER_COSTS.SUPPORT_TOWER;
    default: return GAME_CONFIG.TOWER_COSTS.BASIC_TOWER;
  }
}