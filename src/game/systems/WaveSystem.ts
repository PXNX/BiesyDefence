import type { GameState } from '@/game/core/types'
import { createEnemy } from '@/game/entities/enemies'

const hasActiveEnemies = (state: GameState): boolean => {
  return state.enemies.some((enemy) => !enemy.isDead && !enemy.reachedGoal)
}

export const updateWaves = (state: GameState, deltaSeconds: number): void => {
  if (state.status !== 'running' || state.wavePhase !== 'active') {
    return
  }

  const wave = state.waves[state.currentWaveIndex]
  if (!wave) {
    state.status = 'won'
    state.wavePhase = 'finalized'
    return
  }

  wave.timer += deltaSeconds
  while (true) {
    const spawn = wave.spawnQueue[wave.nextIndex]
    if (!spawn) {
      wave.finished = true
      break
    }

    if (wave.timer >= spawn.delay) {
      wave.timer -= spawn.delay
      const origin = state.map.pathNodes[0]
      state.enemies.push(createEnemy(spawn.type, origin))
      wave.nextIndex += 1
      continue
    }

    break
  }

  const enemiesCleared = wave.finished && !hasActiveEnemies(state)
  if (!enemiesCleared) {
    return
  }

  if (state.currentWaveIndex >= state.waves.length - 1) {
    state.wavePhase = 'finalized'
    state.status = state.resources.lives > 0 ? 'won' : 'lost'
    return
  }

  state.wavePhase = 'completed'
}
