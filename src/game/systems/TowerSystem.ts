import type { GameState, Enemy, Tower } from '@/game/core/types'
import { distanceBetween } from '@/game/utils/math'
import { createMuzzleParticles } from '@/game/entities/particles'
import { acquireProjectile } from '@/game/utils/pool'

const selectTarget = (tower: Tower, enemies: Enemy[]): Enemy | null => {
  let candidate: Enemy | null = null
  enemies.forEach((enemy) => {
    if (enemy.isDead || enemy.reachedGoal) {
      return
    }

    const dist = distanceBetween(enemy.position, tower.position)
    if (dist > tower.range) {
      return
    }

    if (!candidate) {
      candidate = enemy
      return
    }

    if (
      enemy.pathIndex > candidate.pathIndex ||
      (enemy.pathIndex === candidate.pathIndex &&
        dist < distanceBetween(candidate.position, tower.position))
    ) {
      candidate = enemy
    }
  })

  return candidate
}

export const updateTowers = (state: GameState, deltaSeconds: number): void => {
  state.towers.forEach((tower) => {
    tower.cooldown = Math.max(tower.cooldown - deltaSeconds, 0)
    if (tower.cooldown > 0) {
      return
    }

    if (tower.type === 'support') {
      return
    }

    const target = selectTarget(tower, state.enemies)
    if (!target) {
      return
    }

    const projectile = acquireProjectile({
      position: { ...tower.position },
      origin: { ...tower.position },
      targetId: target.id,
      speed: tower.projectileSpeed,
      damage: tower.damage,
      color: tower.color,
      isExpired: false,
    })
    state.projectiles.push(projectile)

    state.particles.push(...createMuzzleParticles(tower.position, target.position, tower.color))

    tower.cooldown = tower.fireRate
  })
}
