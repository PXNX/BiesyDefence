import type { Enemy, EnemyStats, EnemyType, FutureEnemyType, Vector2 } from '@/game/core/types'
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


/**
 * Enemy class with path movement functionality for Canvas 2D rendering
 * This class provides the core enemy behavior including movement along predefined paths
 */
export class EnemyEntity {
  public readonly id: string
  public readonly type: EnemyType
  public readonly stats: EnemyStats
  public position: Vector2
  public pathIndex: number
  public health: number
  public readonly maxHealth: number
  public isDead: boolean
  public reachedGoal: boolean
  public rewardClaimed: boolean
  public speedMultiplier: number
  public slowEffects: {
    duration: number
    remainingTime: number
    multiplier: number
    appliedBy: string // tower id
  }[]

  constructor(type: EnemyType, spawnPosition: Vector2) {
    const stats = ENEMY_PROFILES[type]
    this.id = createEntityId('enemy')
    this.type = type
    this.stats = stats
    this.position = { ...spawnPosition }
    this.pathIndex = 0
    this.health = stats.health
    this.maxHealth = stats.health
    this.isDead = false
    this.reachedGoal = false
    this.rewardClaimed = false
    this.speedMultiplier = 1
    this.slowEffects = []
  }

  /**
   * Update enemy movement along the path
   * @param path - Array of path waypoints in world coordinates
   * @param deltaTime - Time elapsed since last update in seconds
   * @returns boolean - true if enemy reached the end of the path
   */
  public update(path: Vector2[], deltaTime: number): boolean {
    if (this.isDead || this.reachedGoal) {
      return false
    }

    // Update slow effects
    this.slowEffects = this.slowEffects.filter(effect => {
      effect.remainingTime -= deltaTime
      return effect.remainingTime > 0
    })
    
    // Calculate effective speed multiplier from active slow effects
    const activeSlowEffect = this.slowEffects.find(effect => effect.remainingTime > 0)
    this.speedMultiplier = activeSlowEffect ? activeSlowEffect.multiplier : 1

    // Check if we've reached the end of the path
    if (this.pathIndex >= path.length - 1) {
      if (!this.reachedGoal) {
        this.reachedGoal = true
        this.isDead = true
        this.rewardClaimed = true
        return true // Signal that enemy reached the goal
      }
      return false
    }

    const targetNode = path[this.pathIndex + 1]
    if (!targetNode) {
      return false
    }

    // Calculate movement towards next waypoint
    const toTarget = {
      x: targetNode.x - this.position.x,
      y: targetNode.y - this.position.y,
    }

    const travelDistance = this.stats.speed * this.speedMultiplier * deltaTime
    const distToTarget = Math.hypot(toTarget.x, toTarget.y)
    
    if (distToTarget <= travelDistance) {
      // Reached the waypoint
      this.position.x = targetNode.x
      this.position.y = targetNode.y
      this.pathIndex = Math.min(this.pathIndex + 1, path.length - 1)
      
      // Check if this was the final waypoint
      if (this.pathIndex >= path.length - 1) {
        this.reachedGoal = true
        this.isDead = true
        this.rewardClaimed = true
        return true // Signal that enemy reached the goal
      }
    } else {
      // Move towards the waypoint
      const movement = {
        x: (toTarget.x / distToTarget) * travelDistance,
        y: (toTarget.y / distToTarget) * travelDistance,
      }
      this.position.x += movement.x
      this.position.y += movement.y
    }

    return false
  }

  /**
   * Apply damage to the enemy
   * @param damage - Amount of damage to apply
   * @returns boolean - true if enemy was killed by this damage
   */
  public takeDamage(damage: number): boolean {
    if (this.isDead) {
      return false
    }

    this.health = Math.max(0, this.health - damage)
    if (this.health <= 0) {
      this.isDead = true
      return true
    }
    return false
  }

  /**
   * Apply slow effect to the enemy
   * @param multiplier - Speed multiplier (e.g., 0.7 for 30% slow)
   * @param duration - Duration of the slow effect in seconds
   * @param towerId - ID of the tower that applied the slow
   */
  public applySlow(multiplier: number, duration: number, towerId: string): void {
    this.slowEffects.push({
      duration,
      remainingTime: duration,
      multiplier,
      appliedBy: towerId,
    })
  }

  /**
   * Get the current effective speed considering all slow effects
   * @returns number - Current speed in pixels per second
   */
  public getEffectiveSpeed(): number {
    return this.stats.speed * this.speedMultiplier
  }

  /**
   * Get the reward value for defeating this enemy
   * @returns number - Money reward
   */
  public getReward(): number {
    return this.stats.reward
  }

  /**
   * Get the damage this enemy would deal to player lives
   * @returns number - Lives damage
   */
  public getDamageToLives(): number {
    return this.stats.damageToLives
  }

  /**
   * Convert to plain Enemy interface for compatibility with existing systems
   * @returns Enemy - Plain enemy object
   */
  public toEnemy(): Enemy {
    return {
      id: this.id,
      type: this.type,
      stats: this.stats,
      position: { ...this.position },
      pathIndex: this.pathIndex,
      health: this.health,
      maxHealth: this.maxHealth,
      isDead: this.isDead,
      reachedGoal: this.reachedGoal,
      rewardClaimed: this.rewardClaimed,
      speedMultiplier: this.speedMultiplier,
      slowEffects: [...this.slowEffects],
    }
  }
}
