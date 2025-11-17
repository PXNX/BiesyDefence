import type { GameState } from '@/game/core/types'

export const updateEconomy = (state: GameState): void => {
  state.enemies.forEach((enemy) => {
    if (enemy.isDead && !enemy.rewardClaimed) {
      if (!enemy.reachedGoal) {
        state.resources.money += enemy.stats.reward
      }
      enemy.rewardClaimed = true
    }
  })

  if (state.resources.lives <= 0) {
    state.resources.lives = 0
    state.status = 'lost'
    state.wavePhase = 'finalized'
  }
}
