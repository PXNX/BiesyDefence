import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'

export const updateEnemies = (state: GameState, deltaSeconds: number): void => {
  const path = state.path
  state.enemies.forEach((enemy) => {
    if (enemy.isDead) {
      return
    }

    // Chapter 2 Balance: Update and manage timed slow effects
    enemy.slowEffects = enemy.slowEffects.filter(effect => {
      effect.remainingTime -= deltaSeconds
      return effect.remainingTime > 0
    })
    
    // Calculate effective speed multiplier from active slow effects
    const activeSlowEffect = enemy.slowEffects.find(effect => effect.remainingTime > 0)
    enemy.speedMultiplier = activeSlowEffect ? activeSlowEffect.multiplier : 1

    const nextIndex = Math.min(enemy.pathIndex + 1, path.length - 1)
    const targetNode = path[nextIndex]
    if (!targetNode) {
      return
    }

    if (enemy.pathIndex >= path.length - 1) {
      if (!enemy.reachedGoal) {
        enemy.reachedGoal = true
        enemy.isDead = true
        enemy.rewardClaimed = true
        // Note: Life loss is now handled in GameController.cleanupEntities()
        // This prevents duplicate life loss and ensures proper state management
      }
      return
    }

    const toTarget = {
      x: targetNode.x - enemy.position.x,
      y: targetNode.y - enemy.position.y,
    }

    const travelDistance = enemy.stats.speed * enemy.speedMultiplier * deltaSeconds
    const distToTarget = distanceBetween(enemy.position, targetNode)
    if (distToTarget <= travelDistance) {
      enemy.position.x = targetNode.x
      enemy.position.y = targetNode.y
      enemy.pathIndex = Math.min(nextIndex, path.length - 1)
      if (enemy.pathIndex >= path.length - 1 && !enemy.reachedGoal) {
        enemy.reachedGoal = true
        enemy.isDead = true
        enemy.rewardClaimed = true
        // Note: Life loss is now handled in GameController.cleanupEntities()
        // This prevents duplicate life loss and ensures proper state management
      }
      return
    }

    const movement = normalize(toTarget)
    enemy.position.x += movement.x * travelDistance
    enemy.position.y += movement.y * travelDistance
  })
}

