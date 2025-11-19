import type { GameState, EnemyType } from '@/game/core/types'

const hasActiveEnemies = (state: GameState): boolean => {
  return state.enemies.some((enemy) => !enemy.isDead && !enemy.reachedGoal)
}

export interface WaveSpawnRequest {
  type: EnemyType
  spawnPosition: { x: number; y: number }
}

export interface WaveSystemCallbacks {
  onEnemySpawn: (request: WaveSpawnRequest) => void
  onWaveCompleted: (waveIndex: number) => void
  onAllWavesCompleted: () => void
}

export const updateWaves = (
  state: GameState,
  deltaSeconds: number,
  callbacks?: WaveSystemCallbacks
): void => {
  if (state.status !== 'running' || state.wavePhase !== 'active') {
    return
  }

  const wave = state.waves[state.currentWaveIndex]
  if (!wave) {
    state.wavePhase = 'finalized'
    // Note: Victory/defeat status is now handled by GameController.checkVictoryCondition()
    callbacks?.onAllWavesCompleted()
    return
  }

  wave.timer += deltaSeconds
  let spawn = wave.spawnQueue[wave.nextIndex]
  while (spawn && wave.timer >= spawn.delay) {
    wave.timer -= spawn.delay
    const gridOrigin = state.map.pathNodes[0]
    if (!gridOrigin) {
      console.warn('WaveSystem: cannot spawn enemies because path nodes are missing')
      break
    }

    const worldOrigin =
      state.path[0] ?? {
        x: gridOrigin.x * state.map.cellSize + state.map.cellSize / 2,
        y: gridOrigin.y * state.map.cellSize + state.map.cellSize / 2,
      }

    const jitterRadius = Math.max(2, state.map.cellSize * 0.15)
    const spawnPosition = {
      x: worldOrigin.x + (Math.random() - 0.5) * jitterRadius * 2,
      y: worldOrigin.y + (Math.random() - 0.5) * jitterRadius * 2,
    }
    
    callbacks?.onEnemySpawn({
      type: spawn.type,
      spawnPosition
    })
    
    wave.nextIndex += 1
    spawn = wave.spawnQueue[wave.nextIndex]
  }

  if (!spawn) {
    wave.finished = true
  }

  const enemiesCleared = wave.finished && !hasActiveEnemies(state)
  if (!enemiesCleared) {
    return
  }

  if (state.currentWaveIndex >= state.waves.length - 1) {
    state.wavePhase = 'finalized'
    // Note: Victory/defeat status is now handled by GameController.checkVictoryCondition()
    callbacks?.onAllWavesCompleted()
    return
  }

  state.wavePhase = 'completed'
  callbacks?.onWaveCompleted(state.currentWaveIndex)
}

/**
 * Get wave status information for UI integration
 */
export const getWaveStatus = (state: GameState) => {
  const currentWave = state.waves[state.currentWaveIndex]
  if (!currentWave) {
    return {
      currentWave: state.currentWaveIndex + 1,
      totalWaves: state.waves.length,
      enemiesRemaining: 0,
      enemiesInCurrentWave: 0,
      isWaveActive: false,
      isWaveCompleted: state.wavePhase === 'completed',
      isAllWavesCompleted: state.wavePhase === 'finalized'
    }
  }

  const enemiesInCurrentWave = currentWave.spawnQueue.length
  const enemiesSpawned = currentWave.nextIndex
  const enemiesRemaining = enemiesInCurrentWave - enemiesSpawned
  const activeEnemies = state.enemies.filter(e => !e.isDead && !e.reachedGoal).length

  return {
    currentWave: state.currentWaveIndex + 1,
    totalWaves: state.waves.length,
    enemiesRemaining: enemiesRemaining + activeEnemies,
    enemiesInCurrentWave,
    enemiesSpawned,
    activeEnemies,
    isWaveActive: state.wavePhase === 'active',
    isWaveCompleted: state.wavePhase === 'completed',
    isAllWavesCompleted: state.wavePhase === 'finalized',
    nextSpawnDelay: currentWave.spawnQueue[currentWave.nextIndex]?.delay || null
  }
}
