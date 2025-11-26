import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'
import {
  createHitMarker,
  createImpactParticles,
  createImpactSparkSprite,
  createSplashIndicatorParticle,
  createRingEffect,
  createWeakpointMarker,
  createSparkBurst,
  createDamageImpactOverlay,
  createChainArcImpact,
  createStormImpact,
  createNapalmPuddle,
  createFireTrail,
  createShrapnelImpact,
  createCryoRing,
  createToxinCloud,
  createCritMarker,
  createDotMarker,
} from '@/game/entities/particles'
import { applyDamageToEnemy, applyVulnerability, findSplashTargets } from '@/game/utils/combat'
import type { TelemetryCollector } from '@/game/systems/telemetry/TelemetryCollector'

export const updateProjectiles = (
  state: GameState,
  deltaSeconds: number,
  telemetry?: TelemetryCollector
): void => {
  state.projectiles.forEach((projectile) => {
    if (projectile.isExpired) {
      return
    }

    const target = state.enemies.find((enemy) => enemy.id === projectile.targetId)
    if (!target || target.isDead) {
      projectile.isExpired = true
      return
    }

    const toTarget = {
      x: target.position.x - projectile.position.x,
      y: target.position.y - projectile.position.y,
    }
    const distToTarget = distanceBetween(projectile.position, target.position)
    const travelDistance = projectile.speed * deltaSeconds

    if (distToTarget <= travelDistance) {
      const sourceTower = projectile.sourceId
        ? state.towers.find((t) => t.id === projectile.sourceId)
        : undefined
      const hasPerk = (prefix: string) =>
        Boolean(sourceTower?.upgradeState?.perks?.some((id) => id.includes(prefix)))
      const dmgType = projectile.damageType ?? 'impact'
      const before = target.health
      const dealt = applyDamageToEnemy(target, projectile.damage, dmgType)
      const actual = Math.max(0, before - target.health)
      const overkill = Math.max(0, dealt - actual)
      target.lastHitBy = {
        towerId: projectile.sourceId ?? 'unknown',
        towerType: projectile.sourceType,
      }
      telemetry?.recordDamage({
        towerId: projectile.sourceId,
        towerType: projectile.sourceType,
        enemyType: target.type,
        damageType: dmgType,
        amount: actual > 0 ? actual : Math.min(before, dealt),
        overkill,
      })
      const splashTargets =
        projectile.splashRadius && projectile.splashRadius > 0
          ? findSplashTargets(target.position, state.enemies, projectile.splashRadius, target.id)
          : []
      if (splashTargets.length > 0) {
        const splashFactor = projectile.splashFactor ?? 0.5
        splashTargets.forEach((enemy) => {
          const splashBefore = enemy.health
          const splashDealt = applyDamageToEnemy(enemy, projectile.damage * splashFactor, dmgType)
          const splashActual = Math.max(0, splashBefore - enemy.health)
          const splashOverkill = Math.max(0, splashDealt - splashActual)
          enemy.lastHitBy = {
            towerId: projectile.sourceId ?? 'unknown',
            towerType: projectile.sourceType,
          }
          telemetry?.recordDamage({
            towerId: projectile.sourceId,
            towerType: projectile.sourceType,
            enemyType: enemy.type,
            damageType: dmgType,
            amount: splashActual,
            overkill: splashOverkill,
          })
        })
      }
      projectile.isExpired = true
      state.particles.push(createHitMarker(target.position, projectile.color, Math.round(dealt)))
      state.particles.push(createImpactSparkSprite(target.position))
      const overlay = createDamageImpactOverlay(target.position, dmgType)
      if (overlay) state.particles.push(overlay)
      if (projectile.splashRadius && projectile.splashRadius > 0) {
        state.particles.push(createSplashIndicatorParticle(target.position, projectile.splashRadius))
      }
      // Perk-driven visuals
      if (sourceTower?.type === 'sativa' && hasPerk('shrapnel')) {
        state.particles.push(createRingEffect(target.position, 34, 'rgba(255, 248, 180, 0.55)', 0.45, 0.65))
        state.particles.push(...createSparkBurst(target.position, 'rgba(255, 234, 150, 0.9)', 6))
        state.particles.push(...createShrapnelImpact(target.position, projectile.splashRadius ?? 42))
      }
      if (sourceTower?.type === 'sniper' && (hasPerk('weak') || hasPerk('execution'))) {
        state.particles.push(...createWeakpointMarker(target.position))
        state.particles.push(createCritMarker(target.position))
      }
      if (sourceTower?.markDuration && sourceTower.markDuration > 0) {
        applyVulnerability(target, 0.15, sourceTower.markDuration)
        state.particles.push(createDotMarker(target.position))
      }
      if (sourceTower?.type === 'sativa' && hasPerk('shrapnel')) {
        const shrapnelRadius = projectile.splashRadius ?? 28
        const shrapnelTargets = findSplashTargets(target.position, state.enemies, shrapnelRadius, target.id)
        const factor = Math.max(0.25, projectile.splashFactor ?? 0.4)
        shrapnelTargets.forEach((e) => applyDamageToEnemy(e, projectile.damage * factor, dmgType))
      }

      if (target.health === 0) {
        target.isDead = true
        state.particles.push(...createImpactParticles(target.position, projectile.color))
      } else {
        state.particles.push(...createImpactParticles(target.position, '#fdf1a2'))
      }
      // Chain perks visuals on hit
      if (sourceTower?.type === 'chain' && hasPerk('arc')) {
        state.particles.push(createChainArcImpact(target.position))
      }
      if (sourceTower?.type === 'chain' && hasPerk('storm')) {
        state.particles.push(createStormImpact(target.position))
      }
      return
    }

    const direction = normalize(toTarget)
    projectile.position.x += direction.x * travelDistance
    projectile.position.y += direction.y * travelDistance
  })
}
