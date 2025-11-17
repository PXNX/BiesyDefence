import type { Enemy, EnemyStats, EnemyType, Vector2 } from '@/game/core/types'
import { createEntityId } from '@/game/utils/id'

export const ENEMY_PROFILES: Record<EnemyType, EnemyStats> = {
  pest: {
    speed: 95,
    health: 40,
    reward: 12,
    damageToLives: 1,
    color: '#ffc45c',
    radius: 9,
  },
  runner: {
    speed: 150,
    health: 28,
    reward: 18,
    damageToLives: 1,
    color: '#ff7bd4',
    radius: 8,
  },
}

// TODO: Chapter 2 Balance - Future enemy types for extended gameplay
// armored_pest: High health (80), low speed (70), resistant to Sativa towers
// swift_runner: Very high speed (200), medium health (25), resistant to Support slow
export const FUTURE_ENEMY_PROFILES: Record<Exclude<FutureEnemyType, EnemyType>, EnemyStats> = {
  // TODO: Implement armored_pest profile
  armored_pest: {
    speed: 70,
    health: 80,
    reward: 20,
    damageToLives: 1,
    color: '#8b5a2b', // Brown
    radius: 10,
  },
  // TODO: Implement swift_runner profile
  swift_runner: {
    speed: 200,
    health: 25,
    reward: 22,
    damageToLives: 1,
    color: '#00bfff', // Deep sky blue
    radius: 7,
  },
}

export const createEnemy = (type: EnemyType, spawnPosition: Vector2): Enemy => {
  const stats = ENEMY_PROFILES[type]
  return {
    id: createEntityId('enemy'),
    type,
    stats,
    position: { ...spawnPosition },
    pathIndex: 0,
    health: stats.health,
    maxHealth: stats.health,
    isDead: false,
    reachedGoal: false,
    rewardClaimed: false,
    speedMultiplier: 1,
    // Chapter 2 Balance: Initialize support tower slow effects array
    slowEffects: [],
  }
}
