import type { GameState } from '@/game/core/types'
import { distanceBetween, normalize } from '@/game/utils/math'
import { applyDamageToEnemy } from '@/game/utils/combat'
import type { TelemetryCollector } from '@/game/systems/telemetry/TelemetryCollector'

export const updateEnemies = (
  state: GameState,
  deltaSeconds: number,
  telemetry?: TelemetryCollector
): void => {
  const path = state.path
  state.enemies.forEach((enemy) => {
    if (enemy.isDead) {
      return
    }

    // Chapter 2 Balance: Update and manage timed status effects
    enemy.effects.slow = enemy.effects.slow.filter(effect => {
      effect.remainingTime -= deltaSeconds
      return effect.remainingTime > 0
    })
    
    const activeSlowEffect = enemy.effects.slow.find(effect => effect.remainingTime > 0)
    enemy.speedMultiplier = activeSlowEffect ? activeSlowEffect.multiplier : 1

    // Update vulnerability decay
    enemy.effects.vulnerability = enemy.effects.vulnerability.filter((effect) => {
      effect.remainingTime -= deltaSeconds
      return effect.remainingTime > 0
    })
    const totalVuln = enemy.effects.vulnerability.reduce((sum, effect) => sum + effect.amount, 0)
    enemy.vulnerability = Math.max(0, totalVuln)

    // Apply damage over time effects
    if (enemy.effects.dot.length > 0) {
      const survivors = []
      for (const effect of enemy.effects.dot) {
        effect.remainingTime -= deltaSeconds
        if (effect.remainingTime > 0) {
          const damage = effect.dps * deltaSeconds
          const before = enemy.health
          if (effect.appliedBy) {
            enemy.lastHitBy = {
              towerId: effect.appliedBy,
              towerType: effect.appliedByType,
            }
          }
          const dealt = applyDamageToEnemy(enemy, damage, effect.damageType)
          const actual = Math.max(0, before - enemy.health)
          const overkill = Math.max(0, dealt - actual)
          telemetry?.recordDamage({
            towerId: effect.appliedBy,
            enemyType: enemy.type,
            damageType: effect.damageType,
            amount: actual > 0 ? actual : Math.min(before, dealt),
            overkill,
            isDot: true,
          })
          survivors.push(effect)
          if (enemy.isDead) {
            break
          }
        }
      }
      enemy.effects.dot = survivors
    }

    // Regeneration for specific enemy types (e.g., regenerator)
    if (!enemy.isDead && enemy.stats.regenPerSecond && enemy.health < enemy.maxHealth) {
      const regenAmount = enemy.stats.regenPerSecond * deltaSeconds
      enemy.health = Math.min(enemy.maxHealth, enemy.health + regenAmount)
    }

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

  telemetry?.trackStatus(state.enemies, deltaSeconds)
}
