import type {
  DamageResistances,
  DamageType,
  Enemy,
  EnemyStats,
  EnemyType,
  EnemyTag,
  Vector2,
} from '@/game/core/types'
import { createEntityId } from '@/game/utils/id'
import { MapManager } from '@/game/maps/MapManager'

export const ENEMY_PROFILES: Record<EnemyType, EnemyStats> = {
  pest: {
    speed: 95,
    health: 40,
    reward: 12,
    damageToLives: 1,
    color: '#ffc45c',
    radius: 9,
    resistances: {},
    tags: [],
  },
  runner: {
    speed: 150,
    health: 28,
    reward: 18,
    damageToLives: 1,
    color: '#ff7bd4',
    radius: 8,
    resistances: { control: 0.3 },
    slowCap: 0.7,
    tags: ['fast'] as EnemyTag[],
  },
  armored_pest: {
    speed: 70,
    health: 80,
    reward: 20,
    damageToLives: 1,
    color: '#8b5a2b',
    radius: 10,
    resistances: { volley: 0.25 },
    tags: ['armored'] as EnemyTag[],
  },
  swift_runner: {
    speed: 200,
    health: 25,
    reward: 22,
    damageToLives: 1,
    color: '#00bfff',
    radius: 7,
    resistances: { control: 0.4 },
    slowCap: 0.8,
    tags: ['fast'] as EnemyTag[],
  },
  swarm: {
    speed: 115,
    health: 18,
    reward: 6,
    damageToLives: 1,
    color: '#d0ff6a',
    radius: 7,
    resistances: { impact: 0.1, volley: -0.2 },
    tags: ['swarm'] as EnemyTag[],
  },
  bulwark: {
    speed: 65,
    health: 160,
    reward: 48,
    damageToLives: 2,
    color: '#c7b2ff',
    radius: 12,
    resistances: { volley: 0.35, dot: 0.5 },
    tags: ['armored', 'shielded'] as EnemyTag[],
  },
  carrier_boss: {
    speed: 85,
    health: 220,
    reward: 80,
    damageToLives: 3,
    color: '#ff9e7f',
    radius: 14,
    resistances: { volley: 0.35, control: 0.25 },
    slowCap: 0.7,
    tags: ['boss'] as EnemyTag[],
    onDeathSpawn: {
      type: 'swarm',
      count: 3,
    },
  },
  stealth: {
    speed: 130,
    health: 48,
    reward: 28,
    damageToLives: 1,
    color: '#7cc5ff',
    radius: 8,
    resistances: { control: 0.5, volley: 0.15 },
    slowCap: 0.75,
    tags: ['fast', 'stealth'] as EnemyTag[],
  },
  regenerator: {
    speed: 90,
    health: 120,
    reward: 36,
    damageToLives: 2,
    color: '#7bff9c',
    radius: 11,
    resistances: { dot: -0.1, impact: 0.1 },
    regenPerSecond: 6,
    tags: ['regenerator', 'armored'] as EnemyTag[],
  },
  splitter: {
    speed: 105,
    health: 70,
    reward: 18,
    damageToLives: 1,
    color: '#ffd17c',
    radius: 9,
    resistances: { volley: 0.2 },
    tags: ['splitter'] as EnemyTag[],
    onDeathSpawn: {
      type: 'swarm',
      count: 2,
    },
  },
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const getWaveScaling = (waveIndex: number) => {
  const hpScale = clamp(1 + 0.07 * waveIndex, 1, 2.2)
  const speedScale = clamp(1 + 0.02 * waveIndex, 1, 1.4)
  const rewardScale = 1 + 0.03 * waveIndex
  const isEliteBoost =
    waveIndex === 9 || waveIndex === 14 ? 1.2 : waveIndex === 19 ? 1.25 : 1
  return {
    hpScale: hpScale * isEliteBoost,
    speedScale: speedScale * isEliteBoost,
    rewardScale: rewardScale * isEliteBoost,
  }
}

export const createEnemy = (
  type: EnemyType,
  spawnPosition: Vector2,
  waveIndex = 0,
  options?: { noReward?: boolean; noLifeDamage?: boolean }
): Enemy => {
  const base = ENEMY_PROFILES[type] ?? ENEMY_PROFILES.pest
  const difficultyConfig = MapManager.getInstance().getCurrentDifficultyConfig()
  const { hpScale, speedScale, rewardScale } = getWaveScaling(waveIndex)

  const stats: EnemyStats = {
    ...base,
    speed: Math.round(base.speed * speedScale * difficultyConfig.enemySpeedMultiplier),
    health: Math.round(base.health * hpScale * difficultyConfig.enemyHealthMultiplier),
    reward: Math.round(base.reward * rewardScale * difficultyConfig.enemyRewardMultiplier),
    damageToLives: base.damageToLives,
  }
  if (options?.noReward) {
    stats.reward = 0
  }
  if (options?.noLifeDamage) {
    stats.damageToLives = 0
  }

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
    effects: {
      slow: [],
      vulnerability: [],
      dot: [],
    },
    resistances: stats.resistances,
    vulnerability: stats.vulnerability ?? 0,
    tags: stats.tags as EnemyTag[] | undefined,
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
  public effects: {
    slow: {
      duration: number
      remainingTime: number
      multiplier: number
      appliedBy: string // tower id
    }[]
    vulnerability: {
      amount: number
      remainingTime: number
    }[]
    dot: {
      duration: number
      remainingTime: number
      dps: number
      damageType: DamageType
      appliedBy: string // tower id
    }[]
  }
  public resistances?: DamageResistances
  public vulnerability?: number
  public tags?: EnemyTag[]

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
    this.effects = { slow: [], vulnerability: [], dot: [] }
    this.resistances = stats.resistances
    this.vulnerability = stats.vulnerability ?? 0
    this.tags = stats.tags as EnemyTag[] | undefined
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
    this.effects.slow = this.effects.slow.filter(effect => {
      effect.remainingTime -= deltaTime
      return effect.remainingTime > 0
    })
    
    // Calculate effective speed multiplier from active slow effects
    const activeSlowEffect = this.effects.slow.find(effect => effect.remainingTime > 0)
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
    this.effects.slow.push({
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
      effects: {
        slow: [...this.effects.slow],
        vulnerability: [...this.effects.vulnerability],
        dot: [...this.effects.dot],
      },
      resistances: this.resistances,
      vulnerability: this.vulnerability,
      tags: this.tags,
    }
  }
}
