import type { GameState, Enemy, Tower } from '@/game/core/types'
import { distanceBetween } from '@/game/utils/math'
import { createMuzzleParticles } from '@/game/entities/particles'
import { acquireProjectile } from '@/game/utils/enhancedPool'
import { findOptimalTargets, findTargetsInRange } from '@/game/utils/spatialGrid'
import { logger } from '@/game/utils/logger'
import { applyDamageToEnemy, applyDotToEnemy, applySlowToEnemy, applyVulnerability } from '@/game/utils/combat'

// Chapter 5 Performance: Optimized tower targeting with spatial partitioning
// Prioritizes enemies closer to the goal (higher pathIndex) using efficient spatial queries
const selectTarget = (tower: Tower, enemies: Enemy[]): Enemy | null => {
  const startTime = performance.now()
  
  // Use spatial grid for O(n log n) targeting instead of O(n×m)
  const targets = findOptimalTargets(tower, enemies)
  let target = targets.length > 0 ? targets[0] : null
  
  // Fallback: direct scan if grid misses candidates (safety net)
  if (!target) {
    const inRange = enemies
      .filter((enemy) => !enemy.isDead && !enemy.reachedGoal && distanceBetween(tower.position, enemy.position) <= tower.range)
      .sort((a, b) => {
        if (a.pathIndex !== b.pathIndex) return b.pathIndex - a.pathIndex
        const distA = distanceBetween(a.position, tower.position)
        const distB = distanceBetween(b.position, tower.position)
        return distA - distB
      })
    target = inRange[0] ?? null
  }
  
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
    const towerDamageType = tower.damageType ?? 'impact'
    tower.cooldown = Math.max(tower.cooldown - deltaSeconds, 0)
    
    // CHAPTER 2: Support towers apply slow effects instead of shooting projectiles
    if (tower.type === 'support') {
      if (tower.cooldown <= 0) {
        const enemiesInRange = findTargetsInRange(tower, state.enemies)
        
        // Apply slow + DoT + vulnerability
        enemiesInRange.forEach(enemy => {
          const slowCfg = tower.slow ?? { multiplier: 0.7, duration: 2.0 }
          applySlowToEnemy(enemy, slowCfg.multiplier, slowCfg.duration, tower.id)

          if (tower.dot) {
            const dotType = tower.dot.damageType ?? 'dot'
            applyDotToEnemy(enemy, tower.dot.dps, tower.dot.duration, dotType, tower.id)
          }

          if (tower.vulnerabilityDebuff) {
            applyVulnerability(enemy, tower.vulnerabilityDebuff.amount, tower.vulnerabilityDebuff.duration)
          }
        })
        
        // Support towers deal light damage to enemies in range
        enemiesInRange.forEach(enemy => {
          applyDamageToEnemy(enemy, tower.damage, towerDamageType)
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
      damageType: towerDamageType,
      splashRadius: tower.splashRadius,
      splashFactor: tower.splashFactor ?? 0.5,
    })
      state.projectiles.push(projectile)
    }

    state.particles.push(...createMuzzleParticles(tower.position, target.position, tower.color))

    tower.cooldown = tower.fireRate
  })
}
