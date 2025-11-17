import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'

const SUPPORT_SLOW_FACTOR = 0.62

const getSupportSlowMultiplier = (state: GameState, enemyPosition: GameState['enemies'][number]['position']): number => {
  return state.towers.some(
    (tower) =>
      tower.type === 'support' &&
      distanceBetween(tower.position, enemyPosition) <= tower.range
  )
    ? SUPPORT_SLOW_FACTOR
    : 1
}

export const updateEnemies = (state: GameState, deltaSeconds: number): void => {
  const path = state.path
  state.enemies.forEach((enemy) => {
    if (enemy.isDead) {
      return
    }

    const nextIndex = Math.min(enemy.pathIndex + 1, path.length - 1)
    const targetNode = path[nextIndex]
    if (!targetNode) {
      return
    }

    const supportModifier = getSupportSlowMultiplier(state, enemy.position)
    enemy.speedMultiplier = supportModifier

    if (enemy.pathIndex >= path.length - 1) {
      if (!enemy.reachedGoal) {
        enemy.reachedGoal = true
        enemy.isDead = true
        enemy.rewardClaimed = true
        const damage = enemy.stats.damageToLives
        state.resources.lives = Math.max(state.resources.lives - damage, 0)
      }
      return
    }

    const toTarget = {
      x: targetNode.x - enemy.position.x,
      y: targetNode.y - enemy.position.y,
    }

    const travelDistance = enemy.stats.speed * supportModifier * deltaSeconds
    const distToTarget = distanceBetween(enemy.position, targetNode)
    if (distToTarget <= travelDistance) {
      enemy.position.x = targetNode.x
      enemy.position.y = targetNode.y
      enemy.pathIndex = Math.min(nextIndex, path.length - 1)
      if (enemy.pathIndex >= path.length - 1 && !enemy.reachedGoal) {
        enemy.reachedGoal = true
        enemy.isDead = true
        enemy.rewardClaimed = true
        const damage = enemy.stats.damageToLives
        state.resources.lives = Math.max(state.resources.lives - damage, 0)
      }
      return
    }

    const movement = normalize(toTarget)
    enemy.position.x += movement.x * travelDistance
    enemy.position.y += movement.y * travelDistance
  })
}
