import type { GameState } from '@/game/core/types'

export const updateEconomy = (state: GameState): void => {
  let scoreGainedThisFrame = 0
  
  state.enemies.forEach((enemy) => {
    if (enemy.isDead && !enemy.rewardClaimed) {
      if (!enemy.reachedGoal) {
        // Add money reward for killing enemy
        state.resources.money += enemy.stats.reward
        
        // Add score for killing enemy (base score + enemy-specific bonus)
        const enemyScore = 10 + Math.floor(enemy.stats.reward * 0.5)
        scoreGainedThisFrame += enemyScore
      }
      enemy.rewardClaimed = true
    }
  })

  // Update score if enemies were killed
  if (scoreGainedThisFrame > 0) {
    state.resources.score += scoreGainedThisFrame
    console.log(`EconomySystem: Enemies killed, Score gained: ${scoreGainedThisFrame}`)
  }

  // Note: Game over condition is now handled in GameController.loseLife()
  // This ensures proper state management and prevents duplicate state changes
}
