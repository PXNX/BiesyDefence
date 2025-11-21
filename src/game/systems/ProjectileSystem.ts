import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'
import { createHitMarker, createImpactParticles } from '@/game/entities/particles'
import { applyDamageToEnemy, findSplashTargets } from '@/game/utils/combat'

export const updateProjectiles = (state: GameState, deltaSeconds: number): void => {
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
      const dealt = applyDamageToEnemy(target, projectile.damage, dmgType)
      const splashTargets =
        projectile.splashRadius && projectile.splashRadius > 0
          ? findSplashTargets(target.position, state.enemies, projectile.splashRadius, target.id)
          : []
      if (splashTargets.length > 0) {
        const splashFactor = projectile.splashFactor ?? 0.5
        splashTargets.forEach((enemy) => {
          applyDamageToEnemy(enemy, projectile.damage * splashFactor, dmgType)
        })
      }
      projectile.isExpired = true
      state.particles.push(createHitMarker(target.position, projectile.color, Math.round(dealt)))
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
