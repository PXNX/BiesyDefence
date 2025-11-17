import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'
import { createImpactParticles } from '@/game/entities/particles'

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
      target.health = Math.max(target.health - projectile.damage, 0)
      projectile.isExpired = true
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
