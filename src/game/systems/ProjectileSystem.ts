import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'
import { createHitMarker, createImpactParticles, createImpactSparkSprite, createSplashIndicatorParticle } from '@/game/entities/particles'
import { applyDamageToEnemy, findSplashTargets } from '@/game/utils/combat'
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
      if (projectile.splashRadius && projectile.splashRadius > 0) {
        state.particles.push(createSplashIndicatorParticle(target.position, projectile.splashRadius))
      }
      if (target.health === 0) {
        target.isDead = true
        state.particles.push(...createImpactParticles(target.position, projectile.color))
      } else {
        state.particles.push(...createImpactParticles(target.position, '#fdf1a2'))
      }
      return
    }

    const direction = normalize(toTarget)
    projectile.position.x += direction.x * travelDistance
    projectile.position.y += direction.y * travelDistance
  })
}
