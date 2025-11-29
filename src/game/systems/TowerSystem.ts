import type { GameState, Enemy, Tower, DamageType } from '@/game/core/types'
import { distanceBetween } from '@/game/utils/math'
import {
  createImpactParticles,
  createImpactSparkSprite,
  createMuzzleParticles,
  createRingEffect,
  createSparkBurst,
  createNapalmPuddle,
  createFireTrail,
  createCryoRing,
  createToxinCloud,
} from '@/game/entities/particles'
import { acquireProjectile } from '@/game/utils/enhancedPool'
import { findOptimalTargets, findTargetsInRange } from '@/game/utils/spatialGrid'
import { logger } from '@/game/utils/logger'
import {
  applyDamageToEnemy,
  applyDotToEnemy,
  applySlowToEnemy,
  applyTowerBonusesToDamage,
  applyVulnerability,
  applyStunToEnemy,
} from '@/game/utils/combat'
import type { TelemetryCollector } from '@/game/systems/telemetry/TelemetryCollector'

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

const recordDamageEvent = (
  telemetry: TelemetryCollector | undefined,
  tower: Tower,
  enemy: Enemy,
  dealt: number,
  beforeHealth: number,
  damageType: DamageType,
  isDot = false
) => {
  const actualDamage = Math.min(dealt, beforeHealth)
  const overkill = Math.max(0, dealt - actualDamage)
  enemy.lastHitBy = { towerId: tower.id, towerType: tower.type }
  telemetry?.recordDamage({
    tower,
    enemyType: enemy.type,
    damageType: damageType as any,
    amount: actualDamage,
    overkill,
    isDot,
  })
}

const getProjectileSprite = (towerType: Tower['type'], damageType: DamageType, hasPerk: (s: string) => boolean) => {
  if (towerType === 'support') {
    if (hasPerk('cryo')) return { key: 'projectile-ice', size: 30, trailColor: '#9cd7ff', trailWidth: 6 }
    if (hasPerk('toxin')) return { key: 'projectile-toxin', size: 30, trailColor: '#9bffb0', trailWidth: 6 }
    return { key: 'projectile-support', size: 30, trailColor: '#6be8ff', trailWidth: 6 }
  }
  if (towerType === 'sativa' || damageType === 'volley') {
    if (hasPerk('shrapnel')) return { key: 'projectile-shrapnel', size: 30, trailColor: '#fff7b2', trailWidth: 5 }
    return { key: 'projectile-volley', size: 26, trailColor: '#fdf1a2', trailWidth: 4 }
  }
  if (towerType === 'flamethrower') {
    return { key: 'projectile-flame', size: 46, trailColor: '#ffbb7a', trailWidth: 10 }
  }
  if (towerType === 'chain') {
    return hasPerk('arc') ? { key: 'projectile-chain-arc', size: 34, trailColor: '#bcdcff', trailWidth: 6 } : { key: 'projectile-chain', size: 32, trailColor: '#bcdcff', trailWidth: 6 }
  }
  if (towerType === 'sniper' || damageType === 'pierce') {
    return hasPerk('pierce') || hasPerk('weak')
      ? { key: 'projectile-pierce', size: 30, trailColor: '#ffdbb0', trailWidth: 4 }
      : { key: 'projectile-heavy', size: 30, trailColor: '#e0e0e0', trailWidth: 4 }
  }
  if (towerType === 'indica') {
    return hasPerk('pen') ? { key: 'projectile-pierce', size: 30, trailColor: '#f8e0c0', trailWidth: 4 } : { key: 'projectile-heavy', size: 30, trailColor: '#d6f5d6', trailWidth: 4 }
  }
  return { key: 'projectile-impact', size: 28, trailColor: undefined, trailWidth: 4 }
}

// Chapter 2 Balance: IMPLEMENTED TOWER ROLE DIFFERENTIATION
// - Support: Applies timed slow effects (30% reduction, 2 seconds) + light damage
// - Sativa: Shoots double projectiles with 60% damage per shot (maintains DPS balance)
// - Indica: Single powerful shots for focused elimination
export const updateTowers = (
  state: GameState,
  deltaSeconds: number,
  telemetry?: TelemetryCollector
): void => {
  state.towers.forEach((tower) => {
    const hasPerk = (needle: string) => Boolean(tower.upgradeState?.perks?.some((id) => id.includes(needle)))
    const towerDamageType = tower.damageType ?? 'impact'
    tower.cooldown = Math.max(tower.cooldown - deltaSeconds, 0)
    
    // CHAPTER 2: Support towers apply slow effects instead of shooting projectiles
    if (tower.type === 'support') {
      if (tower.cooldown <= 0) {
        telemetry?.recordShot(tower)
        let enemiesInRange = findTargetsInRange(tower, state.enemies)
        if (enemiesInRange.length === 0) {
          // Safety fallback if grid desyncs
          enemiesInRange = state.enemies
            .filter((enemy) => !enemy.isDead && !enemy.reachedGoal && distanceBetween(tower.position, enemy.position) <= tower.range)
            .sort((a, b) => b.pathIndex - a.pathIndex)
        }
        
        // Apply slow + DoT + vulnerability
        enemiesInRange.forEach(enemy => {
          const slowCfg = tower.slow ?? { multiplier: 0.7, duration: 2.0 }
          // Cryo-Perk verstärkt Slow
          const extraSlow = hasPerk('cryo-1') ? 0.1 : 0
          const extraDuration = hasPerk('cryo-1') ? 0.5 : 0
          applySlowToEnemy(
            enemy,
            Math.max(0.3, slowCfg.multiplier - extraSlow),
            slowCfg.duration + extraDuration,
            tower.id
          )

          if (tower.dot) {
            const dotType = tower.dot.damageType ?? 'dot'
            applyDotToEnemy(
              enemy,
              applyTowerBonusesToDamage(tower, enemy, tower.dot.dps),
              tower.dot.duration,
              dotType,
              tower.id,
              tower.type
            )
          }

          if (tower.vulnerabilityDebuff) {
            applyVulnerability(enemy, tower.vulnerabilityDebuff.amount, tower.vulnerabilityDebuff.duration)
          }

          if (hasPerk('cryo')) {
            state.particles.push(createCryoRing(enemy.position, 36))
          }
          if (hasPerk('cryo-2') && Math.random() < (tower.stunChance ?? 0.1)) {
            applyStunToEnemy(enemy, tower.stunDuration ?? 0.6, tower.id)
          }
        })

        // Support towers deal light damage to enemies in range
        enemiesInRange.forEach(enemy => {
          const before = enemy.health
          const dealt = applyDamageToEnemy(
            enemy,
            applyTowerBonusesToDamage(tower, enemy, tower.damage),
            towerDamageType
          )
          recordDamageEvent(telemetry, tower, enemy, dealt, before, towerDamageType)

          // Toxin virulent puff on kill
          if (enemy.health <= 0 && hasPerk('toxin-2')) {
            state.particles.push(...createSparkBurst(enemy.position, 'rgba(110, 255, 150, 0.8)', 12))
            state.particles.push(createToxinCloud(enemy.position, 42))
            const spreadTargets = findTargetsInRange(
              { ...tower, range: Math.max(28, tower.range * 0.5) } as Tower,
              state.enemies
            ).filter((e) => e.id !== enemy.id && !e.isDead && !e.reachedGoal)
            spreadTargets.forEach((e) =>
              applyDotToEnemy(e, tower.dot ? tower.dot.dps * 0.6 : 4, tower.dot ? tower.dot.duration * 0.6 : 2, 'dot', tower.id, tower.type)
            )
          }
        })

        // Visual cue for support pulse
        if (enemiesInRange[0]) {
          state.particles.push(...createMuzzleParticles(tower.position, enemiesInRange[0].position, tower.color))
        }
        
        tower.cooldown = tower.fireRate
      }
      return
    }

    // CHAIN tower: direct chaining damage, no projectile
    if (tower.type === 'chain') {
      if (tower.cooldown <= 0) {
        let candidates = findTargetsInRange(tower, state.enemies).filter(
          (e) => !e.isDead && !e.reachedGoal
        )
        if (candidates.length === 0) {
          candidates = state.enemies
            .filter((e) => !e.isDead && !e.reachedGoal && distanceBetween(tower.position, e.position) <= tower.range)
            .sort((a, b) => b.pathIndex - a.pathIndex)
        }
        if (candidates.length > 0) {
          telemetry?.recordShot(tower)
          const chainJumps = tower.chainJumps ?? 2
          const falloff = tower.chainFalloff ?? 0.75
          let damage = tower.damage
          let target = candidates[0]
          const hitIds = new Set<string>()
          state.particles.push(...createMuzzleParticles(tower.position, target.position, tower.color))
          for (let i = 0; i <= chainJumps && target; i += 1) {
            if (hitIds.has(target.id)) break
            hitIds.add(target.id)
            const before = target.health
            const dealt = applyDamageToEnemy(
              target,
              applyTowerBonusesToDamage(tower, target, damage),
              towerDamageType
            )
            recordDamageEvent(telemetry, tower, target, dealt, before, towerDamageType)
            state.particles.push(createImpactSparkSprite(target.position))
            if (hasPerk('storm')) {
              state.particles.push(...createSparkBurst(target.position, 'rgba(126, 214, 255, 0.9)', 10))
              if (tower.stunChance && Math.random() < tower.stunChance) {
                applyStunToEnemy(target, tower.stunDuration ?? 0.6, tower.id)
              }
            }
            if (hasPerk('arc')) {
              const splash = Math.max(24, tower.splashRadius ?? 30)
              state.particles.push(createRingEffect(target.position, splash, 'rgba(180, 150, 255, 0.65)', 0.5, 0.7))
              const splashFactor = Math.max(0.3, tower.splashFactor ?? 0.5)
              const splashTargets = findTargetsInRange(
                { ...tower, range: splash } as Tower,
                state.enemies
              ).filter((e) => !hitIds.has(e.id) && !e.isDead && !e.reachedGoal)
              splashTargets.forEach((e) => {
                const b = e.health
                const d = applyDamageToEnemy(
                  e,
                  applyTowerBonusesToDamage(tower, e, damage * splashFactor),
                  towerDamageType
                )
                recordDamageEvent(telemetry, tower, e, d, b, towerDamageType)
              })
            }
            // find next closest not hit
            const next = candidates
              .filter((c) => !hitIds.has(c.id))
              .sort(
                (a, b) =>
                  distanceBetween(target.position, a.position) -
                  distanceBetween(target.position, b.position)
              )[0]
            damage = Math.max(1, damage * falloff)
            target = next
          }
        }
        tower.cooldown = tower.fireRate
      }
      return
    }

    // FLAMETHROWER: cone DoT approximation (apply to all in range)
    if (tower.type === 'flamethrower') {
      if (tower.cooldown <= 0) {
        let targets = findTargetsInRange(tower, state.enemies)
        if (targets.length === 0) {
          targets = state.enemies
            .filter((enemy) => !enemy.isDead && !enemy.reachedGoal && distanceBetween(tower.position, enemy.position) <= tower.range)
            .sort((a, b) => b.pathIndex - a.pathIndex)
        }
        telemetry?.recordShot(tower)
        if (targets[0]) {
          state.particles.push(...createMuzzleParticles(tower.position, targets[0].position, tower.color))
        }
        targets.forEach((enemy) => {
          const before = enemy.health
          const dealt = applyDamageToEnemy(
            enemy,
            applyTowerBonusesToDamage(tower, enemy, tower.damage),
            'burn'
          )
          recordDamageEvent(telemetry, tower, enemy, dealt, before, 'burn')
          state.particles.push(...createImpactParticles(enemy.position, '#fb923c'))
          if (tower.dot) {
            applyDotToEnemy(
              enemy,
              applyTowerBonusesToDamage(tower, enemy, tower.dot.dps),
              tower.dot.duration,
              'burn',
              tower.id,
              tower.type
            )
          }
          if (hasPerk('napalm')) {
            state.particles.push(...createNapalmPuddle(enemy.position, 44))
          }
          if (hasPerk('pressure')) {
            state.particles.push(...createFireTrail(enemy.position, 28))
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
    const baseDamage = tower.type === 'sativa' ? Math.floor(tower.damage * 0.6) : tower.damage
    telemetry?.recordShot(tower)
    const spriteMeta = getProjectileSprite(tower.type, towerDamageType, hasPerk)
    for (let i = 0; i < projectileCount; i++) {
      const isCrit = tower.critChance ? Math.random() < tower.critChance : false
      const critMult = isCrit ? tower.critMultiplier ?? 1.5 : 1
      const damagePerProjectile = Math.max(1, Math.floor(baseDamage * critMult))
      const projectile = acquireProjectile({
        position: { ...tower.position },
        origin: { ...tower.position },
        targetId: target.id,
        sourceId: tower.id,
        sourceType: tower.type,
        speed: tower.projectileSpeed,
        damage: damagePerProjectile,
        color: tower.color,
        isExpired: false,
        damageType: towerDamageType,
        splashRadius: tower.splashRadius,
        splashFactor: tower.splashFactor ?? 0.5,
        spriteKey: spriteMeta?.key,
        spriteSize: spriteMeta?.size,
        trailColor: spriteMeta?.trailColor,
        trailWidth: spriteMeta?.trailWidth,
      })
      state.projectiles.push(projectile)
    }

    state.particles.push(...createMuzzleParticles(tower.position, target.position, tower.color))

    tower.cooldown = tower.fireRate
  })
}
