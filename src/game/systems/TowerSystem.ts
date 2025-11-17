import type { GameState, Enemy, Tower } from '@/game/core/types'
import { distanceBetween } from '@/game/utils/math'
import { createMuzzleParticles } from '@/game/entities/particles'
import { acquireProjectile } from '@/game/utils/enhancedPool'
import { audioManager } from '@/game/audio/AudioManager'
import { findOptimalTargets, updateEnemySpatialGrid } from '@/game/utils/spatialGrid'
import { logger } from '@/game/utils/logger'

// Chapter 5 Performance: Optimized tower targeting with spatial partitioning
// Prioritizes enemies closer to the goal (higher pathIndex) using efficient spatial queries
const selectTarget = (tower: Tower, enemies: Enemy[]): Enemy | null => {
  const startTime = performance.now()
  
  // Use spatial grid for O(n log n) targeting instead of O(n×m)
  const targets = findOptimalTargets(tower, enemies)
  const target = targets.length > 0 ? targets[0] : null
  
  const targetingTime = performance.now() - startTime
  if (targetingTime > 0.5) { // Log slow targeting operations
    logger.warn('Slow targeting detected', {
      towerType: tower.type,
      targetCount: targets.length,
      targetingTime: targetingTime.toFixed(2)
    }, 'performance')
  }
  
  return target
}

// Chapter 2 Balance: IMPLEMENTED TOWER ROLE DIFFERENTIATION
// - Support: Applies timed slow effects (30% reduction, 2 seconds) + light damage
// - Sativa: Shoots double projectiles with 60% damage per shot (maintains DPS balance)
// - Indica: Single powerful shots for focused elimination
export const updateTowers = (state: GameState, deltaSeconds: number): void => {
  state.towers.forEach((tower) => {
    tower.cooldown = Math.max(tower.cooldown - deltaSeconds, 0)
    
    // CHAPTER 2: Support towers apply slow effects instead of shooting projectiles
    if (tower.type === 'support') {
      if (tower.cooldown <= 0) {
        const enemiesInRange = state.enemies.filter(enemy => {
          if (enemy.isDead || enemy.reachedGoal) return false
          const dist = distanceBetween(tower.position, enemy.position)
          return dist <= tower.range
        })
        
        // Apply 30% slow for 2 seconds to all enemies in range
        enemiesInRange.forEach(enemy => {
          enemy.slowEffects.push({
            duration: 2.0,
            remainingTime: 2.0,
            multiplier: 0.7, // 30% speed reduction
            appliedBy: tower.id
          })
        })
        
        // Support towers deal light damage to enemies in range
        enemiesInRange.forEach(enemy => {
          enemy.health = Math.max(0, enemy.health - tower.damage)
          if (enemy.health <= 0) {
            enemy.isDead = true
          }
        })
        
        tower.cooldown = tower.fireRate
      }
      return
    }

    // Non-support towers shoot projectiles
    if (tower.cooldown > 0) {
      return
    }

    const target = selectTarget(tower, state.enemies)
    if (!target) {
      return
    }

    // CHAPTER 2: Sativa towers shoot double projectiles with reduced damage
    const projectileCount = tower.type === 'sativa' ? 2 : 1
    const damagePerProjectile = tower.type === 'sativa' ? Math.floor(tower.damage * 0.6) : tower.damage
    
    for (let i = 0; i < projectileCount; i++) {
      const projectile = acquireProjectile({
        position: { ...tower.position },
        origin: { ...tower.position },
        targetId: target.id,
        speed: tower.projectileSpeed,
        damage: damagePerProjectile,
        color: tower.color,
        isExpired: false,
      })
      state.projectiles.push(projectile)
    }

    state.particles.push(...createMuzzleParticles(tower.position, target.position, tower.color))

    tower.cooldown = tower.fireRate
  })
}
