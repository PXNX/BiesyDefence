import * as fs from 'fs'
import * as path from 'path'
jest.mock('@/game/rendering/CanvasRenderer', () => {
  return {
    CanvasRenderer: class {
      render() {
        return { scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0 }
      }
    },
  }
})

jest.mock('@/game/utils/enhancedPool', () => {
  const makeProjectile = (template: any) => ({
    id: `proj-${Math.random().toString(16).slice(2)}`,
    ...template,
  })
  return {
    acquireProjectile: makeProjectile,
    releaseProjectile: () => {},
    acquireProjectiles: (templates: any[]) => templates.map(makeProjectile),
    releaseProjectiles: () => {},
    acquireParticles: () => [],
    releaseParticles: () => {},
  }
})

jest.mock('@/game/utils/logger', () => {
  const noop = () => {}
  const logger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    setLevel: noop,
    addCategory: noop,
    removeCategory: noop,
    snapshotMemory: noop,
    getAverageFrameTime: () => 0,
    getCurrentFps: () => 0,
    getMemoryStats: () => null,
    getLogs: () => [],
    clearLogs: noop,
    exportLogs: () => '',
  }
  return { logger, createLogger: () => logger, default: logger }
})

import { GameController } from '@/game/core/GameController'
import { createInitialState } from '@/game/core/GameStateFactory'
import type { GameSnapshot } from '@/game/core/types'
import { MapManager } from '@/game/maps/MapManager'
import { createMulberry32 } from '../utils/seededRandom'
import { resetIdSeed } from '@/game/utils/id'
import { resetProjectilePool } from '@/game/utils/pool'
import { stableSerialize } from '../utils/serialize'

type SimulationResult = {
  mapId: string
  difficulty: string
  seed: number
  wavesRun: number
  waves: {
    wave: number
    leaks: number
    reward: number
    score: number
    dps: number
    dpsPerDollar: number
    overkillPercent: number
  }[]
}

const ARTIFACT_PATH = path.join(process.cwd(), 'tests', 'artifacts', 'simulation-metrics.json')

const ensureArtifactDir = () => {
  const dir = path.dirname(ARTIFACT_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const advanceTime = (milliseconds: number, update: () => void, perf: jest.SpyInstance<number>) => {
  const start = perf.mock.results.length > 0 ? perf.mock.results.at(-1)?.value ?? 0 : 0
  let current = start
  const step = 50
  let elapsed = 0
  while (elapsed < milliseconds) {
    current += step
    perf.mockReturnValue(current)
    update()
    elapsed += step
  }
}

const runHeadlessSimulation = (
  mapId: string,
  difficulty: 'easy' | 'normal' | 'hard',
  seed: number,
  wavesToRun = 20
): SimulationResult => {
  const perfSpy = jest.spyOn(performance, 'now')
  perfSpy.mockReturnValue(0)

  const originalCrypto = (globalThis as any).crypto
  ;(globalThis as any).crypto = undefined
  MapManager.resetForTests()
  resetIdSeed()
  resetProjectilePool()
  const controller = new GameController()
  const mapManager = MapManager.getInstance()
  mapManager.setDifficulty(difficulty)

  const state = createInitialState({ mapId, difficulty })
  ;(controller as any).state = state
  ;(controller as any).autoWaveEnabled = false
  ;(controller as any).telemetry.reset()
  ;(controller as any).telemetry.registerTowers(state.towers)
  state.status = 'running'

  const waves: SimulationResult['waves'] = []
  const maxWaves = Math.min(wavesToRun, state.waves.length)

  for (let i = 0; i < maxWaves; i += 1) {
    const started = controller.beginNextWave()
    expect(started).toBe(true)

    let safety = 0
    const maxSteps = 20000
    while (safety < maxSteps) {
      advanceTime(50, () => (controller as any).fixedUpdate(50), perfSpy)
      const wavePhase = (controller as any).state.wavePhase
      if (wavePhase === 'completed' || wavePhase === 'finalized') {
        break
      }
      safety += 1
    }

    const snapshot = (controller as any).createSnapshot() as GameSnapshot
    const waveSummary = snapshot.lastWaveSummary
    const telemetry = snapshot.telemetry!
    waves.push({
      wave: waveSummary?.waveNumber ?? i + 1,
      leaks: waveSummary?.leaks ?? 0,
      reward: waveSummary?.reward ?? 0,
      score: waveSummary?.score ?? 0,
      dps: telemetry.dps,
      dpsPerDollar: telemetry.dpsPerDollar,
      overkillPercent: telemetry.overkillPercent,
    })

    if (snapshot.status === 'lost' || snapshot.status === 'won') {
      break
    }
  }

  perfSpy.mockRestore()
  ;(globalThis as any).crypto = originalCrypto
  return {
    mapId,
    difficulty,
    seed,
    wavesRun: waves.length,
    waves,
  }
}

describe('Headless simulation harness', () => {
  it('runs deterministically across maps and writes artifact', () => {
    const mapIds = MapManager.getInstance()
      .getAvailableMaps()
      .map((map) => map.id)

    const seed = 1337
    const difficulty: 'easy' | 'normal' | 'hard' = 'normal'

    const originalRandom = Math.random
    const rngA = createMulberry32(seed)
    Math.random = rngA
    const firstRun = mapIds.map((mapId) => runHeadlessSimulation(mapId, difficulty, seed))
    Math.random = originalRandom

    ensureArtifactDir()
    const serialized = stableSerialize(firstRun)
    if (fs.existsSync(ARTIFACT_PATH)) {
      const existing = fs.readFileSync(ARTIFACT_PATH, 'utf-8')
      expect(serialized).toEqual(existing)
    } else {
      fs.writeFileSync(ARTIFACT_PATH, serialized, 'utf-8')
    }
  })
})
