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
  }
}
